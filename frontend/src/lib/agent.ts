export async function fetchAgentReply(userText: string): Promise<string> {
  const payload = {
    conversation: [
      {
        role: "user",
        parts: [userText],
      },
    ],
  };
  const resp = await fetch("/api/agent/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const raw = await resp.text();
    let errBody: { error?: string; code?: string } | null = null;
    try {
      errBody = raw ? JSON.parse(raw) : null;
    } catch (e) {
      errBody = null;
    }
    if (resp.status === 503 && errBody?.code === 'agent_unavailable') {
      // Gracefully degrade: echo user text if agent unavailable
      return userText;
    }
    throw new Error(`Agent error ${resp.status}: ${errBody?.error || resp.statusText}`);
  }
  const data = await resp.json();
  return (data && data.reply) || "";
}
