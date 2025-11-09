import TypewriterReply from "./TypewriterReply";
import BigBanana from "./BigBanana";
import BananaRain from "./BananaRain";
import "./AgentVisualizer.css";

interface AgentVisualizerProps {
  isAgentSpeaking: boolean;
  isThinking?: boolean;
  text?: string; // current agent reply to render as typewriter overlay
  audioLevel?: number; // 0..1 amplitude level
}

const AgentVisualizer = ({ isAgentSpeaking, isThinking, text, audioLevel = 0 }: AgentVisualizerProps) => {
  return (
    <div
      className={`white-dwarf relative flex items-center justify-center w-full ${isAgentSpeaking ? "speaking" : ""}`}
      style={{ ['--wd-level']: audioLevel.toFixed(3) } as React.CSSProperties}
    >
      {/* Banana rain background */}
      <BananaRain />
      <div className="wd-stage">
        {/* Banana visual: the stage still handles speaking scale and audio-level driven boost */}
        <BigBanana />
      </div>

      {/* Typewriter reply overlay under the star */}
      <TypewriterReply reply={text || ""} isAgentSpeaking={isAgentSpeaking} isThinking={isThinking} />
    </div>
  );
};

export default AgentVisualizer;
