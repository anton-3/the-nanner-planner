import os
from dotenv import load_dotenv


def load_config():
    """Load application configuration from environment variables and .env file."""
    load_dotenv()

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
        "ELEVENLABS_REALTIME_VOICE_ID": os.getenv("ELEVENLABS_REALTIME_VOICE_ID"),
        "ELEVENLABS_REALTIME_AGENT_ID": os.getenv("ELEVENLABS_REALTIME_AGENT_ID"),
    }

    if not cfg["ELEVENLABS_API_KEY"]:
        # We don't raise at import time so healthcheck still works without a key
        print("[warn] ELEVENLABS_API_KEY not set. TTS endpoints will return 503 until configured.")

    return cfg
