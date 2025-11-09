import { useState, useEffect } from "react";
import AgentVisualizer from "@/components/AgentVisualizer";
import ChatWindow from "@/components/ChatWindow";
import PushToTalkIndicator from "@/components/PushToTalkIndicator";
import SpaceBackground from "@/components/SpaceBackground";

export interface Message {
  id: string;
  content: string;
  timestamp: Date;
  markdown?: boolean;
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
  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");

    // Mock agent response
    setTimeout(() => {
      setIsAgentSpeaking(true);
      const agentMessage: Message = {
        id: Date.now().toString(),
        content: "That's an interesting point. Let me analyze that further.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, agentMessage]);
      setTimeout(() => setIsAgentSpeaking(false), 3000);
    }, 1000);
  };

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
      <SpaceBackground />
      <img src="/courses.png" alt="Logo" className="absolute top-4 left-4 h-16 w-auto z-20" />
      {/* Left side - Agent Visualizer */}
      <div className="flex-1 flex items-center justify-center relative z-10">
        <AgentVisualizer isAgentSpeaking={isAgentSpeaking} />
        <PushToTalkIndicator isSpeaking={isSpeaking} />
      </div>

      {/* Right side - Chat Window */}
      <div className="w-[800px] border-l border-border z-10">
        <ChatWindow
          messages={messages}
          inputValue={inputValue}
          onInputChange={(e) => setInputValue(e.target.value)}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default Meeting;
