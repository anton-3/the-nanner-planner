// ElevenLabs-only TTS client. No browser speech fallback; if the request fails, no audio plays.

// Intentionally no browser speech synthesis fallback here.

export async function speakText(text: string, voice_id?: string): Promise<boolean> {
  // Use GET streaming endpoint for lower latency playback if available.
  const params = new URLSearchParams({ text });
  if (voice_id) params.set('voice_id', voice_id);
  const resp = await fetch(`/api/elevenlabs/tts_stream?${params.toString()}`);
  if (!resp.ok) {
    console.error('TTS request failed', resp.status);
    return false;
  }
  // Stream into MediaSource for progressive playback
  const contentType = resp.headers.get('Content-Type') || 'audio/mpeg';
  if (!('MediaSource' in window)) {
    // Fallback: load whole blob
    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.onended = () => URL.revokeObjectURL(url);
    try { await audio.play(); return true; } catch (e) { console.error('Audio play failed', e); return false; }
  }
  const mediaSource = new MediaSource();
  const audioEl = new Audio();
  audioEl.preload = 'auto';
  audioEl.src = URL.createObjectURL(mediaSource);
  audioEl.play().catch((e) => console.error('Audio play failed', e));
  mediaSource.addEventListener('sourceopen', async () => {
    const mime = contentType.includes('mpeg') ? 'audio/mpeg' : contentType;
    let sourceBuffer: SourceBuffer;
    try {
      sourceBuffer = mediaSource.addSourceBuffer(mime);
    } catch (e) {
      console.warn('Failed to create SourceBuffer, falling back to full blob', e);
      const blob = await resp.blob();
      const url2 = URL.createObjectURL(blob);
      audioEl.src = url2;
      audioEl.play().catch((err) => console.error('Audio play failed', err));
      return;
    }
    const reader = resp.body?.getReader();
    if (!reader) return;
    const waitUpdateEnd = () => new Promise<void>((resolve) => {
      const handler = () => resolve();
      sourceBuffer.addEventListener('updateend', handler, { once: true });
    });
    const appendChunk = async (chunk: Uint8Array) => {
      // Ensure previous update completed
      if (sourceBuffer.updating) await waitUpdateEnd();
      try {
        const ab = new ArrayBuffer(chunk.byteLength);
        const view = new Uint8Array(ab);
        view.set(chunk);
        sourceBuffer.appendBuffer(ab);
      } catch (e) {
        console.error('appendBuffer error', e);
        return;
      }
      // Wait for this append to finish before returning
      await waitUpdateEnd();
    };
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (value) await appendChunk(value);
    }
    // Ensure buffer not updating before closing stream
    if (sourceBuffer.updating) await waitUpdateEnd();
    try {
      mediaSource.endOfStream();
    } catch (e) {
      console.error('endOfStream failed', e);
    }
  });
  return true;
}

export async function converse(userText: string) {
  // Hit conversation turn endpoint and stream advisor reply audio
  const resp = await fetch('/api/conversation/turn', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: userText })
  });
  if (!resp.ok) {
    console.error('Conversation turn failed', resp.status);
    return { reply: '(error)', status: resp.status };
  }
  const replyHeader = resp.headers.get('X-Advisor-Reply') || '';
  // Stream audio similarly to speakText fallback
  const blob = await resp.blob(); // simpler for now; could implement streaming like above
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.onended = () => URL.revokeObjectURL(url);
  audio.play().catch(() => {});
  return { reply: replyHeader || '(no reply header)', status: resp.status };
}
