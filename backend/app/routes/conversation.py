from flask import Blueprint, current_app, jsonify, request, Response
from .elevenlabs import _client  # reuse client factory

conversation_bp = Blueprint("conversation", __name__)


def generate_reply(user_text: str) -> str:
    """Stub academic advisor logic. Replace with actual agent later."""
    user_text = user_text.strip()
    if not user_text:
        return "Could you tell me more about your academic goals?"
    # Very naive heuristic
    if "major" in user_text.lower():
        return "Choosing a major involves matching your interests with market demand. What subjects energize you most?"
    if "schedule" in user_text.lower():
        return "We can optimize your schedule by balancing core requirements with lighter electives each term."
    if "internship" in user_text.lower():
        return "Internships build experience early. Have you explored your career center's listings yet?"
    return "I hear you. Let's break that down and prioritize next steps."  # generic fallback


@conversation_bp.post("/turn")
def conversation_turn():
    """
    Accepts JSON { "text": "..." } from user, generates a reply string, then streams
    ElevenLabs TTS audio back in the response body. Also returns headers with the text.
    """
    api_key = current_app.config.get("ELEVENLABS_API_KEY", "")
    if not api_key:
        return jsonify({"error": "ELEVENLABS_API_KEY not configured"}), 503

    body = request.get_json(silent=True) or {}
    user_text = body.get("text")
    if not user_text or not isinstance(user_text, str):
        return jsonify({"error": "Missing 'text' in body"}), 400

    reply = generate_reply(user_text)

    try:
        resp = _client().tts_generate(text=reply)

        def generate():
            for chunk in resp.iter_content(chunk_size=4096):
                if chunk:
                    yield chunk

        fmt = current_app.config.get("ELEVENLABS_OUTPUT_FORMAT", "mp3_44100_128").lower()
        if fmt.startswith("mp3"):
            mimetype = "audio/mpeg"
        elif fmt.startswith("pcm"):
            mimetype = "audio/wav"
        else:
            mimetype = "application/octet-stream"

        response = Response(generate(), mimetype=mimetype)
        response.headers["X-Advisor-Reply"] = reply
        return response
    except Exception as e:
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
                "reply": reply,
            }), e.response.status_code
        return jsonify({"error": str(e), "reply": reply}), 500
