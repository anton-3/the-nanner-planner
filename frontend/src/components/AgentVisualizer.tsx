import TypewriterReply from "./TypewriterReply";

interface AgentVisualizerProps {
  isAgentSpeaking: boolean;
  isThinking?: boolean;
  text?: string; // current agent reply to render as typewriter overlay
}

const AgentVisualizer = ({ isAgentSpeaking, isThinking, text }: AgentVisualizerProps) => {
  return (
    <div className="relative flex items-center justify-center w-full">
      {/* Outer glow rings */}
      <div
        className={`absolute w-96 h-96 rounded-full bg-agent-glow/10 blur-2xl transition-all duration-500 ${
          isAgentSpeaking ? "scale-125 opacity-100" : "scale-100 opacity-50"
        }`}
      />
      <div
        className={`absolute w-80 h-80 rounded-full bg-agent-glow/20 blur-xl transition-all duration-300 ${
          isAgentSpeaking ? "scale-110" : "scale-100"
        }`}
      />
      
      {/* Main agent circle */}
      <div
        className={`relative w-64 h-64 rounded-full bg-gradient-to-br from-agent-glow to-agent-glowIntense shadow-2xl transition-all duration-500 ${
          isAgentSpeaking ? "animate-pulse-glow scale-110" : "scale-100"
        }`}
        style={{
          boxShadow: isAgentSpeaking
            ? "0 0 80px hsl(var(--agent-glow)), 0 0 120px hsl(var(--agent-glow)/0.5)"
            : "0 0 40px hsl(var(--agent-glow)/0.5)",
        }}
      >
        {/* Inner circle detail */}
        <div className="absolute inset-4 rounded-full bg-background/20 backdrop-blur-sm" />
      </div>

      {/* Speaking animation rings */}
      {isAgentSpeaking && (
        <>
          <div className="absolute w-72 h-72 rounded-full border-2 border-agent-glow/30 animate-ping" />
          <div className="absolute w-80 h-80 rounded-full border border-agent-glow/20 animate-ping" style={{ animationDelay: "0.2s" }} />
        </>
      )}

      {/* Typewriter reply overlay under the circle */}
      <TypewriterReply reply={text || ""} isAgentSpeaking={isAgentSpeaking} isThinking={isThinking} />
    </div>
  );
};

export default AgentVisualizer;
