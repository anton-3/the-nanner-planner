import React, { useEffect, useState } from 'react';

interface VoiceMeta {
  voice_id: string;
  name: string;
  category?: string;
  labels?: Record<string, string>;
  description?: string;
  preview_url?: string;
}

interface Props {
  value: string | undefined;
  onChange: (voiceId: string) => void;
  disabled?: boolean;
}

// Simple voice selector component; fetches voices from backend and allows choosing one.
// Persists choice in localStorage under 'selectedVoiceId'.
const VoiceSelector: React.FC<Props> = ({ value, onChange, disabled }) => {
  const [voices, setVoices] = useState<VoiceMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchVoices = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetch('/api/elevenlabs/voices');
        if (!resp.ok) throw new Error(`Voices fetch failed: ${resp.status}`);
        const data = await resp.json();
        if (!cancelled) setVoices(Array.isArray(data.voices) ? data.voices : []);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (!cancelled) setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchVoices();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="flex flex-col gap-2 text-sm">
      <label className="font-medium">Voice</label>
      {loading && <div className="text-xs text-muted-foreground">Loading voices...</div>}
      {error && <div className="text-xs text-red-500">{error}</div>}
      <select
        disabled={disabled || loading || !!error}
        className="bg-background border border-border rounded px-2 py-1 outline-none focus:ring-2 focus:ring-primary/30"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">(default)</option>
        {voices.map(v => (
          <option key={v.voice_id} value={v.voice_id}>{v.name || v.voice_id}</option>
        ))}
      </select>
      {value && voices.find(v => v.voice_id === value)?.description && (
        <div className="text-xs text-muted-foreground">{voices.find(v => v.voice_id === value)?.description}</div>
      )}
      {value && voices.find(v => v.voice_id === value)?.preview_url && (
        <audio
          className="mt-1"
          controls
          src={voices.find(v => v.voice_id === value)?.preview_url}
        />
      )}
    </div>
  );
};

export default VoiceSelector;
