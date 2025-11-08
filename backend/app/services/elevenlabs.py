import os
from typing import Generator, Optional
import requests

ELEVEN_API_BASE = "https://api.elevenlabs.io"


class ElevenLabsClient:
    def __init__(self, api_key: str,
                 default_voice_id: str = "JBFqnCBsd6RMkjVDRZzb",
                 tts_model_id: str = "eleven_multilingual_v2",
                 output_format: str = "mp3_44100_128"):
        self.api_key = api_key
        self.default_voice_id = default_voice_id
        self.tts_model_id = tts_model_id
        self.output_format = output_format

    def _headers(self):
        return {
            "xi-api-key": self.api_key,
            "Content-Type": "application/json",
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

    # Placeholder for realtime session (WebRTC) ephemeral token creation
    def create_realtime_session(self, agent_id: Optional[str] = None, voice_id: Optional[str] = None) -> dict:
        """
        Placeholder: In ElevenLabs Realtime/WebRTC flow, the backend typically
        creates a short-lived client token bound to an agent/voice and returns it
        to the browser which then opens a PeerConnection to ElevenLabs.
        Replace this stub with the official session endpoint once your account
        has Realtime enabled and you confirm the exact API path from docs.
        """
        raise NotImplementedError("Realtime session creation not implemented yet.")
