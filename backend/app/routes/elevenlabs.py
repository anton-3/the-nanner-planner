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
        optimize_streaming_latency=cfg.get("ELEVENLABS_OPTIMIZE_STREAMING_LATENCY"),
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
        # If upstream responded, include its details to aid debugging
        from requests import HTTPError
        if isinstance(e, HTTPError) and getattr(e, "response", None) is not None:
            try:
                err_json = e.response.json()
            except Exception:
                err_json = {"message": e.response.text}
            return jsonify({
                "error": "Upstream ElevenLabs error",
                "status": e.response.status_code,
                "details": err_json,
            }), e.response.status_code
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

    client = _client()
    try:
        resp = client.tts_generate(text=text, voice_id=voice_id, model_id=model_id, output_format=output_format)

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
        from requests import HTTPError
        if isinstance(e, HTTPError) and getattr(e, "response", None) is not None:
            status = e.response.status_code
            # If the failure might be due to an unavailable voice id, try first available voice
            if status in (404, 422):
                try:
                    voices = client.list_voices()
                    vlist = voices.get("voices") or []
                    fallback_voice = vlist[0]["voice_id"] if vlist else None
                except Exception:
                    fallback_voice = None
                if fallback_voice and fallback_voice != (voice_id or current_app.config.get("ELEVENLABS_DEFAULT_VOICE_ID")):
                    try:
                        resp = client.tts_generate(text=text, voice_id=fallback_voice, model_id=model_id, output_format=output_format)
                        def generate2():
                            for chunk in resp.iter_content(chunk_size=4096):
                                if chunk:
                                    yield chunk
                        fmt2 = (output_format or current_app.config.get("ELEVENLABS_OUTPUT_FORMAT", "mp3_44100_128")).lower()
                        mimetype2 = "audio/mpeg" if fmt2.startswith("mp3") else ("audio/wav" if fmt2.startswith("pcm") else ("audio/basic" if fmt2.startswith("ulaw") or fmt2.startswith("mulaw") or fmt2.startswith("mu_law") else "application/octet-stream"))
                        return Response(generate2(), mimetype=mimetype2)
                    except Exception:
                        pass
            # Bubble up original error
            try:
                err_json = e.response.json()
            except Exception:
                err_json = {"message": e.response.text}
            return jsonify({
                "error": "Upstream ElevenLabs error",
                "status": status,
                "details": err_json,
            }), status
        return jsonify({"error": str(e)}), 500


@elevenlabs_bp.get("/tts_stream")
def tts_stream_get():
    """
    Stream TTS audio over HTTP GET so browsers can progressively play it via
    a simple <audio> element source. Query params:
      - text (required)
      - voice_id (optional)
      - model_id (optional)
      - output_format (optional)
    """
    api_key = current_app.config.get("ELEVENLABS_API_KEY", "")
    if not api_key:
        return jsonify({"error": "ELEVENLABS_API_KEY not configured"}), 503

    text = request.args.get("text", type=str)
    if not text:
        return jsonify({"error": "Missing 'text' query param"}), 400

    voice_id = request.args.get("voice_id")
    model_id = request.args.get("model_id")
    output_format = request.args.get("output_format")

    client = _client()
    try:
        resp = client.tts_generate(text=text, voice_id=voice_id, model_id=model_id, output_format=output_format)

        def generate():
            for chunk in resp.iter_content(chunk_size=4096):
                if chunk:
                    yield chunk

        fmt = (output_format or current_app.config.get("ELEVENLABS_OUTPUT_FORMAT", "mp3_44100_128")).lower()
        if fmt.startswith("mp3"):
            mimetype = "audio/mpeg"
        elif fmt.startswith("pcm"):
            mimetype = "audio/wav"
        elif fmt.startswith("ulaw") or fmt.startswith("mulaw") or fmt.startswith("mu_law"):
            mimetype = "audio/basic"
        else:
            mimetype = "application/octet-stream"

        return Response(generate(), mimetype=mimetype)
    except Exception as e:
        from requests import HTTPError
        if isinstance(e, HTTPError) and getattr(e, "response", None) is not None:
            status = e.response.status_code
            if status in (404, 422):
                try:
                    voices = client.list_voices()
                    vlist = voices.get("voices") or []
                    fallback_voice = vlist[0]["voice_id"] if vlist else None
                except Exception:
                    fallback_voice = None
                if fallback_voice and fallback_voice != (voice_id or current_app.config.get("ELEVENLABS_DEFAULT_VOICE_ID")):
                    try:
                        resp = client.tts_generate(text=text, voice_id=fallback_voice, model_id=model_id, output_format=output_format)
                        def generate2():
                            for chunk in resp.iter_content(chunk_size=4096):
                                if chunk:
                                    yield chunk
                        fmt2 = (output_format or current_app.config.get("ELEVENLABS_OUTPUT_FORMAT", "mp3_44100_128")).lower()
                        mimetype2 = "audio/mpeg" if fmt2.startswith("mp3") else ("audio/wav" if fmt2.startswith("pcm") else ("audio/basic" if fmt2.startswith("ulaw") or fmt2.startswith("mulaw") or fmt2.startswith("mu_law") else "application/octet-stream"))
                        return Response(generate2(), mimetype=mimetype2)
                    except Exception:
                        pass
            try:
                err_json = e.response.json()
            except Exception:
                err_json = {"message": e.response.text}
            return jsonify({
                "error": "Upstream ElevenLabs error",
                "status": status,
                "details": err_json,
            }), status
        return jsonify({"error": str(e)}), 500


@elevenlabs_bp.post("/session")
def realtime_session():
    """Create Realtime (WebRTC) session via ElevenLabs and return its payload."""
    if not current_app.config.get("ELEVENLABS_API_KEY"):
        return jsonify({"error": "ELEVENLABS_API_KEY not configured"}), 503

    if not current_app.config.get("ELEVENLABS_REALTIME_ENABLED", False):
        return jsonify({"error": "Realtime not enabled"}), 501

    try:
        body = request.get_json(silent=True) or {}
        agent_id = body.get("agent_id") or current_app.config.get("ELEVENLABS_REALTIME_AGENT_ID")
        voice_id = body.get("voice_id") or current_app.config.get("ELEVENLABS_REALTIME_VOICE_ID")
        raw = _client().create_realtime_session(agent_id=agent_id, voice_id=voice_id)

        # Normalize into a frontend-friendly shape
        token = (
            raw.get("token")
            or raw.get("client_secret")
            or (raw.get("client_secret", {}) if isinstance(raw.get("client_secret"), dict) else None)
        )
        # Some APIs nest secret as { value: "..." }
        if isinstance(token, dict):
            token = token.get("value")

        url = raw.get("url") or raw.get("webrtc_url") or raw.get("websocket_url")
        rtc_config = raw.get("rtc_config") or {"iceServers": raw.get("ice_servers")} if raw.get("ice_servers") else None

        payload = {
            "token": token,
            "url": url,
            "rtc_config": rtc_config,
            "_raw": raw,  # include for debugging until finalized
        }
        return jsonify(payload)
    except NotImplementedError as e:
        return jsonify({"error": str(e)}), 501
    except Exception as e:
        return jsonify({"error": str(e)}), 500
