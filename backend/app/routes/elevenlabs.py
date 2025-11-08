from flask import Blueprint, current_app, jsonify, request, Response
from ..services.elevenlabs import ElevenLabsClient


elevenlabs_bp = Blueprint("elevenlabs", __name__)


def _client() -> ElevenLabsClient:
    cfg = current_app.config
    return ElevenLabsClient(
        api_key=cfg.get("ELEVENLABS_API_KEY", ""),
        default_voice_id=cfg.get("ELEVENLABS_DEFAULT_VOICE_ID"),
        tts_model_id=cfg.get("ELEVENLABS_TTS_MODEL_ID"),
        output_format=cfg.get("ELEVENLABS_OUTPUT_FORMAT"),
    )


@elevenlabs_bp.get("/voices")
def list_voices():
    api_key = current_app.config.get("ELEVENLABS_API_KEY", "")
    if not api_key:
        return jsonify({"error": "ELEVENLABS_API_KEY not configured"}), 503

    try:
        data = _client().list_voices()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@elevenlabs_bp.post("/tts")
def tts():
    api_key = current_app.config.get("ELEVENLABS_API_KEY", "")
    if not api_key:
        return jsonify({"error": "ELEVENLABS_API_KEY not configured"}), 503

    body = request.get_json(silent=True) or {}
    text = body.get("text")
    if not text or not isinstance(text, str):
        return jsonify({"error": "Missing 'text' in body"}), 400

    voice_id = body.get("voice_id")
    model_id = body.get("model_id")
    output_format = body.get("output_format")

    try:
        resp = _client().tts_generate(text=text, voice_id=voice_id, model_id=model_id, output_format=output_format)

        def generate():
            for chunk in resp.iter_content(chunk_size=4096):
                if chunk:
                    yield chunk

        # Map known output formats to mime types
        fmt = (output_format or current_app.config.get("ELEVENLABS_OUTPUT_FORMAT", "mp3_44100_128")).lower()
        if fmt.startswith("mp3"):
            mimetype = "audio/mpeg"
        elif fmt.startswith("pcm"):
            mimetype = "audio/wav"  # browsers expect WAV container; client may need to handle raw PCM
        elif fmt.startswith("ulaw") or fmt.startswith("mulaw") or fmt.startswith("mu_law"):
            mimetype = "audio/basic"
        else:
            mimetype = "application/octet-stream"

        return Response(generate(), mimetype=mimetype)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@elevenlabs_bp.post("/session")
def realtime_session():
    """Placeholder endpoint for creating Realtime (WebRTC) ephemeral session tokens."""
    enabled = current_app.config.get("ELEVENLABS_REALTIME_ENABLED", False)
    if not enabled:
        return (
            jsonify({
                "error": "Realtime not enabled",
                "hint": "Set ELEVENLABS_REALTIME_ENABLED=1 and implement create_realtime_session once your docs are verified.",
            }),
            501,
        )

    try:
        agent_id = request.json.get("agent_id") if request.is_json else None
        voice_id = request.json.get("voice_id") if request.is_json else None
        data = _client().create_realtime_session(agent_id=agent_id, voice_id=voice_id)
        return jsonify(data)
    except NotImplementedError as e:
        return jsonify({"error": str(e)}), 501
    except Exception as e:
        return jsonify({"error": str(e)}), 500
