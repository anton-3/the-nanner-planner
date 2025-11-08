import os
from pathlib import Path
from dotenv import load_dotenv


def load_config():
    """Load application configuration from environment variables and .env file.
    We explicitly attempt both repo-root /.env and backend/.env so running from
    different working directories still picks up credentials.
    """
    # Try repo root .env
    repo_root = Path(__file__).resolve().parents[2]
    root_env = repo_root / ".env"
    if root_env.exists():
        load_dotenv(dotenv_path=str(root_env), override=False)
    # Try backend/.env as well
    backend_env = Path(__file__).resolve().parents[1] / ".env"
    if backend_env.exists():
        load_dotenv(dotenv_path=str(backend_env), override=False)
    # Fallback search (current working dir)
    load_dotenv(override=False)

    cfg = {
        # Core
        "ENV": os.getenv("FLASK_ENV", "production"),
        "DEBUG": os.getenv("FLASK_DEBUG", "0") == "1",
        # CORS
        "CORS_ORIGINS": os.getenv("CORS_ORIGINS", "*"),
        # ElevenLabs
        "ELEVENLABS_API_KEY": os.getenv("ELEVENLABS_API_KEY", ""),
        "ELEVENLABS_DEFAULT_VOICE_ID": os.getenv("ELEVENLABS_DEFAULT_VOICE_ID", "JBFqnCBsd6RMkjVDRZzb"),
        "ELEVENLABS_TTS_MODEL_ID": os.getenv("ELEVENLABS_TTS_MODEL_ID", "eleven_multilingual_v2"),
        "ELEVENLABS_OUTPUT_FORMAT": os.getenv("ELEVENLABS_OUTPUT_FORMAT", "mp3_44100_128"),
        # Realtime (placeholder for future WebRTC integration)
    "ELEVENLABS_REALTIME_ENABLED": os.getenv("ELEVENLABS_REALTIME_ENABLED", "0") == "1",
    # If ElevenLabs provides a session creation endpoint for WebRTC/Realtime,
    # configure it here (e.g., https://api.elevenlabs.io/v1/convai/sessions).
    # Leaving this empty will keep the endpoint disabled.
    "ELEVENLABS_REALTIME_SESSION_URL": os.getenv("ELEVENLABS_REALTIME_SESSION_URL", ""),
        "ELEVENLABS_REALTIME_VOICE_ID": os.getenv("ELEVENLABS_REALTIME_VOICE_ID"),
        "ELEVENLABS_REALTIME_AGENT_ID": os.getenv("ELEVENLABS_REALTIME_AGENT_ID"),
    }

    if not cfg["ELEVENLABS_API_KEY"]:
        # We don't raise at import time so healthcheck still works without a key
        print("[warn] ELEVENLABS_API_KEY not set. TTS endpoints will return 503 until configured.")

    return cfg
