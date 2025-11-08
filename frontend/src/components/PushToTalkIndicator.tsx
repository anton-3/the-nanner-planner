import { Mic } from "lucide-react";

interface PushToTalkIndicatorProps {
  isSpeaking: boolean;
}

const PushToTalkIndicator = ({ isSpeaking }: PushToTalkIndicatorProps) => {
  return (
    <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
      <div
        className={`flex items-center gap-3 px-6 py-3 rounded-full backdrop-blur-sm border transition-all duration-200 ${
          isSpeaking
            ? "bg-primary/20 border-primary scale-110 shadow-lg shadow-primary/50"
            : "bg-secondary/80 border-border scale-100"
        }`}
      >
        <Mic
          className={`h-5 w-5 transition-colors ${
            isSpeaking ? "text-primary" : "text-muted-foreground"
          }`}
        />
        <span
          className={`font-medium transition-colors ${
            isSpeaking ? "text-primary" : "text-muted-foreground"
          }`}
        >
          {isSpeaking ? "Speaking..." : "Hold SPACE to speak"}
        </span>
      </div>
    </div>
  );
};

export default PushToTalkIndicator;
