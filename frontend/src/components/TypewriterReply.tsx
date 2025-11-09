import React from "react";
import { useTypewriter } from "@/hooks/useTypewriter";

interface TypewriterReplyProps {
  reply: string;
  isAgentSpeaking: boolean;
}

const TypewriterReply: React.FC<TypewriterReplyProps> = ({ reply, isAgentSpeaking }) => {
  const typed = useTypewriter(reply, 12);
  return (
    <div className="absolute top-[440px] w-full flex justify-center px-6 pointer-events-none">
      <div
        className="max-w-xl text-center text-sm md:text-base font-medium text-foreground/90 transition-opacity"
        style={{ opacity: reply ? 1 : 0 }}
        aria-live="polite"
      >
        {typed}
        {isAgentSpeaking && !typed && reply && (
          <span className="inline-block w-3 h-3 ml-1 align-middle bg-agent-glow rounded-full animate-pulse" />
        )}
      </div>
    </div>
  );
};

export default TypewriterReply;
