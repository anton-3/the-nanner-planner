import { useState, useEffect } from "react";
import AgentVisualizer from "@/components/AgentVisualizer";
import ChatWindow from "@/components/ChatWindow";
import PushToTalkIndicator from "@/components/PushToTalkIndicator";

export interface Message {
  id: string;
  content: string;
  timestamp: Date;
}

const Meeting = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm ready to discuss your transcript. Hold spacebar to speak.",
      timestamp: new Date(),
    },
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        setIsSpeaking(true);
        // Mock: Stop agent if user starts speaking
        setIsAgentSpeaking(false);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setIsSpeaking(false);
        
        // Mock: Simulate agent response after user stops speaking
        setTimeout(() => {
          setIsAgentSpeaking(true);
          const newMessage: Message = {
            id: Date.now().toString(),
            content: "I understand. Let me think about that...",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, newMessage]);
          
          // Stop agent speaking after some time
          setTimeout(() => {
            setIsAgentSpeaking(false);
          }, 3000);
        }, 500);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <div className="h-screen bg-background flex">
      {/* Left side - Agent Visualizer */}
      <div className="flex-1 flex items-center justify-center relative">
        <AgentVisualizer isAgentSpeaking={isAgentSpeaking} />
        <PushToTalkIndicator isSpeaking={isSpeaking} />
      </div>

      {/* Right side - Chat Window */}
      <div className="w-[800px] border-l border-border">
        <ChatWindow messages={messages} />
      </div>
    </div>
  );
};

export default Meeting;
