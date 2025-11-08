import pytest
from app import create_app


@pytest.fixture()
def client():
    app = create_app()
    app.config.update({
        "TESTING": True,
        # Ensure no API key in test environment
        "ELEVENLABS_API_KEY": "",
    })
    with app.test_client() as client:
        yield client


def test_voices_returns_503_without_api_key(client):
    resp = client.get("/api/elevenlabs/voices")
    assert resp.status_code == 503
    data = resp.get_json()
    assert data["error"] == "ELEVENLABS_API_KEY not configured"


def test_tts_returns_503_without_api_key(client):
    resp = client.post("/api/elevenlabs/tts", json={"text": "Hello"})
    assert resp.status_code == 503
    data = resp.get_json()
    assert data["error"] == "ELEVENLABS_API_KEY not configured"
