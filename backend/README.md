# The Nanner Planner Backend (Flask)

Voice-first backend for an AI academic advisor. This stage focuses on low-latency Text-to-Speech (TTS) via ElevenLabs and lays groundwork for push-to-talk WebRTC.

## Why this architecture

- For truly conversational, barge-in capable voice, the best practice is a direct browser ↔ ElevenLabs Realtime (WebRTC) connection, with your backend issuing a short-lived session token. This yields the lowest latency and avoids routing raw audio through your server.
- As a simpler starting point, this backend exposes REST TTS and a placeholder endpoint for Realtime session creation. You can build a push-to-talk UI that sends text (or audio once STT is added) and plays back generated speech.

## Endpoints

- GET `/api/health` – Health check
- GET `/api/elevenlabs/voices` – Lists available voices (requires ELEVENLABS_API_KEY)
- POST `/api/elevenlabs/tts` – Body: `{ "text": string, "voice_id?": string, "model_id?": string, "output_format?": string }`
  - Returns audio stream. Default format: `mp3_44100_128` with mime `audio/mpeg`.
- POST `/api/elevenlabs/session` – Placeholder for issuing ElevenLabs Realtime (WebRTC) session tokens.

## Config

Copy `.env.example` to `.env` and set:

- `ELEVENLABS_API_KEY` – required for TTS/voices endpoints
- Optional: `ELEVENLABS_DEFAULT_VOICE_ID`, `ELEVENLABS_TTS_MODEL_ID`, `ELEVENLABS_OUTPUT_FORMAT`
- Future: `ELEVENLABS_REALTIME_ENABLED`, `ELEVENLABS_REALTIME_AGENT_ID`, `ELEVENLABS_REALTIME_VOICE_ID`

## Install & Run

```bash
# from backend/
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # then edit .env with your API key
python wsgi.py
```

## Recommended push-to-talk path (now vs later)

- Now (simple):
  1) Capture microphone on the frontend (MediaRecorder) and send text (e.g., from a text box) to `/api/elevenlabs/tts`.
  2) Stream the audio response and play in the browser via an `Audio` element or WebAudio.
  3) Add STT later (ElevenLabs or alternative) to turn user speech into text before TTS.

- Later (best):
  - Switch to ElevenLabs Realtime (WebRTC) so the browser streams mic audio directly to ElevenLabs and receives generated speech in near real-time. Your backend should:
    - Authenticate with your ElevenLabs API key
    - Create a short-lived client session token bound to a voice/agent
    - Return that token to the frontend, which establishes a PeerConnection to the ElevenLabs Realtime endpoint

This avoids server-side audio relaying, improves latency and scalability, and supports barge-in/interruptions.

## Notes

- Tests include only a health check to keep things simple.
- The Realtime session creation method is intentionally left unimplemented until the account/docs path is confirmed for your plan. Update `app/services/elevenlabs.py` once enabled.
