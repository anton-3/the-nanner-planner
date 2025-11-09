import os
from typing import Generator, Optional
import requests

ELEVEN_API_BASE = "https://api.elevenlabs.io"


class ElevenLabsClient:
    def __init__(self, api_key: str,
                 default_voice_id: str = "JBFqnCBsd6RMkjVDRZzb",
                 tts_model_id: str = "eleven_multilingual_v2",
                 output_format: str = "mp3_44100_128",
                 optimize_streaming_latency: int | None = None):
        self.api_key = api_key
        self.default_voice_id = default_voice_id
        self.tts_model_id = tts_model_id
        self.output_format = output_format
        self.optimize_streaming_latency = optimize_streaming_latency

    def _headers(self):
        return {
            "xi-api-key": self.api_key,
            "Content-Type": "application/json",
            # Some clients benefit from being explicit about the audio content type
            "Accept": "audio/mpeg, application/json;q=0.9, */*;q=0.8",
        }

    def tts_generate(self, text: str, voice_id: Optional[str] = None,
                     model_id: Optional[str] = None,
                     output_format: Optional[str] = None) -> requests.Response:
        """
        Calls ElevenLabs Text-to-Speech endpoint and returns a streaming response.
        Caller is responsible for iterating over response.iter_content.
        """
        v_id = voice_id or self.default_voice_id
        model = model_id or self.tts_model_id
        fmt = output_format or self.output_format

        url = f"{ELEVEN_API_BASE}/v1/text-to-speech/{v_id}?output_format={fmt}"
        if self.optimize_streaming_latency is not None:
            url += f"&optimize_streaming_latency={int(self.optimize_streaming_latency)}"
        payload = {
            "text": text,
            "model_id": model,
        }
        resp = requests.post(url, headers=self._headers(), json=payload, stream=True, timeout=60)
        resp.raise_for_status()
        return resp

    def list_voices(self) -> dict:
        url = f"{ELEVEN_API_BASE}/v1/voices"
        resp = requests.get(url, headers={"xi-api-key": self.api_key}, timeout=30)
        resp.raise_for_status()
        return resp.json()

    def create_realtime_session(self, agent_id: Optional[str] = None, voice_id: Optional[str] = None) -> dict:
        """
        Create a short-lived Realtime/WebRTC session with ElevenLabs and return the
        session payload to the frontend. The exact URL is provided via
        ELEVENLABS_REALTIME_SESSION_URL to avoid hardcoding and allow updates per docs/plan.

        Expected response typically includes a client token/secret and optionally
        ICE servers or a WebRTC signaling URL. This method simply proxies the
        request and returns the JSON response.
        """
        session_url = os.getenv("ELEVENLABS_REALTIME_SESSION_URL", "").strip()
        if not session_url:
            raise NotImplementedError("ELEVENLABS_REALTIME_SESSION_URL is not configured.")

        payload = {}
        if agent_id:
            payload["agent_id"] = agent_id
        if voice_id:
            payload["voice_id"] = voice_id

        headers = {"xi-api-key": self.api_key, "Content-Type": "application/json"}
        resp = requests.post(session_url, headers=headers, json=payload, timeout=15)
        resp.raise_for_status()
        return resp.json()
