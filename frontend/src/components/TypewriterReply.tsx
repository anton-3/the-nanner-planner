import React, { useEffect, useState } from "react";
import { useTypewriter } from "@/hooks/useTypewriter";

interface TypewriterReplyProps {
  reply: string;
  isAgentSpeaking: boolean;
  isThinking?: boolean;
}

const TypewriterReply: React.FC<TypewriterReplyProps> = ({ reply, isAgentSpeaking, isThinking = false }) => {
  const typed = useTypewriter(reply, 12);
  const [thinkingDots, setThinkingDots] = useState(".");

  useEffect(() => {
    if (!isThinking) {
      setThinkingDots(".");
      return;
    }

    let dotCount = 1;

    const interval = setInterval(() => {
      dotCount = (dotCount % 3) + 1; // Cycle: 1 -> 2 -> 3 -> 1 -> 2 -> 3...
      setThinkingDots(".".repeat(dotCount));
    }, 500); // Change every 500ms

    return () => clearInterval(interval);
  }, [isThinking]);

  const displayText = isThinking ? `Thinking${thinkingDots}` : typed;
  const shouldShow = isThinking || reply;

  return (
    <div className="absolute top-[440px] left-0 right-0 flex justify-center px-6 pointer-events-none">
      <div
        className="max-w-[54rem] text-center text-sm md:text-base font-medium text-foreground/90 transition-opacity"
        style={{ opacity: shouldShow ? 1 : 0 }}
        aria-live="polite"
      >
        {displayText}
        {isAgentSpeaking && !typed && reply && !isThinking && (
          <span className="inline-block w-3 h-3 ml-1 align-middle bg-agent-glow rounded-full animate-pulse" />
        )}
      </div>
    </div>
  );
};

export default TypewriterReply;
