import { useEffect, useRef, useState } from "react";
import { initRealtimeVoice, RealtimeConnection } from "@/lib/utils";

export function useRealtimeElevenLabs(opts: { agent_id?: string; voice_id?: string; enabled?: boolean } = {}) {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const connRef = useRef<RealtimeConnection | null>(null);
  const micTrackRef = useRef<MediaStreamTrack | null>(null);

  useEffect(() => {
    if (opts.enabled === false) {
      // Realtime explicitly disabled; do nothing
      setConnected(false);
      setError(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const media = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Start with mic muted until user holds Space
        media.getAudioTracks().forEach((t) => {
          t.enabled = false;
          micTrackRef.current = t;
        });

        const conn = await initRealtimeVoice({
          agent_id: opts.agent_id,
          voice_id: opts.voice_id,
          onState: (s) => setConnected(s === "connected"),
          onError: (e: unknown) => {
            if (e && typeof e === 'object' && 'message' in e) {
              const msg = (e as { message?: unknown }).message;
              setError(typeof msg === 'string' ? msg : String(e));
            } else {
              setError(String(e));
            }
          },
        });
        connRef.current = conn;
        // Attach remote audio element to DOM
        document.body.appendChild(conn.remoteAudioEl);
        if (cancelled) {
          conn.close();
        }
      } catch (e: unknown) {
        if (e && typeof e === 'object' && 'message' in e) {
          const msg = (e as { message?: unknown }).message;
          setError(typeof msg === 'string' ? msg : String(e));
        } else {
          setError(String(e));
        }
      }
    })();

    return () => {
      cancelled = true;
      connRef.current?.close();
      connRef.current = null;
    };
  }, [opts.agent_id, opts.voice_id, opts.enabled]);

  const setPushToTalk = (active: boolean) => {
    if (micTrackRef.current) {
      micTrackRef.current.enabled = active;
    }
  };

  return {
    connected,
    error,
    setPushToTalk,
  } as const;
}
