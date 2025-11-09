export type AgentEvent =
  | { type: "tool_call"; name: string; args?: Record<string, unknown>; output?: unknown }
  | { type: "rmp_professor"; name: string; match?: boolean }
  | { type: string; [key: string]: unknown };

// Maintain a running conversation so the agent has context.
// Seed with an instruction message; we expect the model to respond succinctly.
const conversationHistory: Array<{ role: string; parts: string[] }> = [
  {
    role: "user",
    parts: [
      "INSTRUCTIONS FOR THE CONVERSATION: You are an AI academic advisor. You are warm and friendly to the student you are talking to. You respond to requests in succinct answers that are no longer than a sentence. You may choose to add a second sentence to offer a specific relevant way you can help based on the tools available to you. The conversation begins on my next message.",
    ],
  },
  {
    role: "model",
    parts: ["Okay, let's start!"]
  },
];

export async function fetchAgentReply(userText: string): Promise<string> {
  // Append the new user message
  conversationHistory.push({ role: "user", parts: [userText] });

  const payload = { conversation: conversationHistory };

  const resp = await fetch("/api/agent/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const body = await resp.text();
    let parsed: { error?: string } | null = null;
    try {
      parsed = body ? JSON.parse(body) : null;
    } catch (_err) {
      parsed = null;
    }
    const msg = parsed?.error || resp.statusText;
    throw new Error(`Agent request failed (${resp.status}): ${msg}`);
  }

  const data = await resp.json();
  const reply: string = (data && data.reply) || "";
  const events: AgentEvent[] = Array.isArray(data?.events) ? data.events : [];

  // Add tool calls to conversation history for context
  for (const event of events) {
    if (event.type === "tool_call" && typeof event.name === "string" && "output" in event) {
      // Add model message indicating the tool call
      conversationHistory.push({
        role: "model",
        parts: [event.name],
      });
      // Add user message with the tool output
      const outputStr = JSON.stringify(event.output);
      conversationHistory.push({
        role: "user",
        parts: [outputStr],
      });
    }
  }

  if (reply) {
    // Store model reply into history for next turn context
    conversationHistory.push({ role: "model", parts: [reply] });
  }

  // If RMP grabbed Qing Hui, play the notification sound.
  const match = events.find(
    (e) => e?.type === "rmp_professor" && typeof e.name === "string" && e.name.toLowerCase() === "qing hui"
  );
  if (match) {
    try {
      const audio = new Audio("/sound.mp3");
      // Avoid blocking: fire-and-forget
      void audio.play();
    } catch (err) {
      // Non-fatal: just log in case autoplay is blocked
      console.warn("Failed to play notification sound:", err);
    }
  }

  return reply;
}
