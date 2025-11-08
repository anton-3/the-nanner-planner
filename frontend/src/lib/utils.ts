import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// ElevenLabs realtime WebRTC utilities
// This module sets up a PeerConnection to ElevenLabs given a session token payload.
// Assumptions: backend returns { token, rtc_config?, url? } where:
// - token/secret identifies the authorized client session
// - rtc_config.iceServers optionally override STUN/TURN
// - url is the ElevenLabs signaling endpoint (wss or https) for SDP exchange
// Adjust to match actual ElevenLabs realtime response when available.

export interface RealtimeSessionPayload {
  token: string;
  url?: string; // signaling endpoint
  rtc_config?: {
    iceServers?: Array<{ urls: string | string[]; username?: string; credential?: string }>;
  };
  voice_id?: string;
  agent_id?: string;
}

export interface RealtimeConnection {
  pc: RTCPeerConnection;
  remoteAudioEl: HTMLAudioElement;
  close: () => void;
}

export async function createRealtimeConnection(
  session: RealtimeSessionPayload,
  localStream: MediaStream,
  onConnectionState?: (state: RTCPeerConnectionState) => void,
  onError?: (err: unknown) => void
): Promise<RealtimeConnection> {
  const config: RTCConfiguration = {
    iceServers: session.rtc_config?.iceServers || [
      { urls: "stun:stun.l.google.com:19302" },
    ],
  };

  const pc = new RTCPeerConnection(config);
  const remoteAudioEl = document.createElement("audio");
  remoteAudioEl.autoplay = true;

  // Add local tracks (microphone) for upstream audio
  localStream.getTracks().forEach((t) => pc.addTrack(t, localStream));

  pc.ontrack = (event) => {
    const [stream] = event.streams;
    if (stream) {
      remoteAudioEl.srcObject = stream;
    }
  };

  pc.onconnectionstatechange = () => {
    onConnectionState?.(pc.connectionState);
    if (["failed", "closed", "disconnected"].includes(pc.connectionState)) {
      // Optionally surface
    }
  };

  // Signaling: support WebSocket (preferred for many providers) and fallback HTTP.
  if (!session.url) {
    throw new Error("Realtime session missing signaling URL");
  }

  try {
    const offer = await pc.createOffer({ offerToReceiveAudio: true });
    await pc.setLocalDescription(offer);

    if (session.url.startsWith("wss://")) {
      // WebSocket signaling path (schema may vary per provider; adjust as needed)
      const ws = new WebSocket(session.url, []);
      let resolved = false;

      const closeWS = () => {
        try {
          ws.close();
        } catch (e) {
          console.warn("Error closing websocket", e);
        }
      };

      await new Promise<void>((resolve, reject) => {
        ws.onopen = () => {
          // Authenticate if required via Authorization header alternative
          // Some providers expect the token in the first message
          ws.send(JSON.stringify({ type: "auth", token: session.token }));
          ws.send(JSON.stringify({ type: "webrtc-offer", sdp: offer.sdp }));
        };
        ws.onmessage = async (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "webrtc-answer" && data.sdp && !resolved) {
              resolved = true;
              await pc.setRemoteDescription(new RTCSessionDescription({ type: "answer", sdp: data.sdp }));
              resolve();
            }
            // Optional: handle ICE candidates from server if protocol supports it
            if (data.type === "ice-candidate" && data.candidate) {
              try {
                await pc.addIceCandidate(data.candidate);
              } catch (e) {
                console.warn("Failed to add remote ICE candidate", e);
              }
            }
          } catch (e) {
            // Non-JSON messages ignored
          }
        };
        ws.onerror = (e) => {
          reject(new Error("WebSocket signaling error"));
        };
        ws.onclose = () => {
          if (!resolved) reject(new Error("WebSocket signaling closed before answer"));
        };
        // Trickle ICE: forward our candidates to server
        pc.onicecandidate = (evt) => {
          if (evt.candidate) {
            try {
              ws.send(JSON.stringify({ type: "ice-candidate", candidate: evt.candidate }));
            } catch (e) {
              console.warn("Failed to send ICE candidate", e);
            }
          }
        };
      });
    } else {
      // HTTP signaling fallback: POST offer, expect JSON { sdp }
      const resp = await fetch(session.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({ sdp: offer.sdp, type: offer.type }),
      });
      if (!resp.ok) {
        throw new Error(`Signaling offer failed ${resp.status}`);
      }
      const answer = await resp.json();
      if (!answer.sdp) {
        throw new Error("Invalid signaling answer payload");
      }
      await pc.setRemoteDescription(new RTCSessionDescription({ type: "answer", sdp: answer.sdp }));
    }
  } catch (err) {
    onError?.(err);
    pc.close();
    throw err;
  }

  return {
    pc,
    remoteAudioEl,
    close: () => {
      pc.getSenders().forEach((s) => s.track && s.track.stop());
      pc.close();
    },
  };
}

export async function requestRealtimeSession(
  opts: { agent_id?: string; voice_id?: string } = {}
): Promise<RealtimeSessionPayload> {
  const resp = await fetch(`/api/elevenlabs/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(opts),
  });
  if (!resp.ok) {
    throw new Error(`Failed to create realtime session (${resp.status})`);
  }
  return resp.json();
}

export async function initRealtimeVoice(
  options: { agent_id?: string; voice_id?: string; onState?: (s: RTCPeerConnectionState) => void; onError?: (e: unknown) => void }
): Promise<RealtimeConnection> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const session = await requestRealtimeSession({ agent_id: options.agent_id, voice_id: options.voice_id });
  return createRealtimeConnection(session, stream, options.onState, options.onError);
}

// Utility used across UI components
// Tailwind + clsx merge helper used across UI components
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
export { cn as classNames }; // optional secondary export to reduce ambiguity
