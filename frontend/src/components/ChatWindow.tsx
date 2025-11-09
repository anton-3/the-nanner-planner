import { ScrollArea } from "@/components/ui/scroll-area";
import { Message } from "@/pages/Meeting";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface ChatWindowProps {
  messages: Message[];
  inputValue: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSendMessage: () => void;
}

const ChatWindow = ({
  messages,
  inputValue,
  onInputChange,
  onSendMessage,
}: ChatWindowProps) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col mission-panel">
      <div className="mission-header">
        <div className="status-item"><span className="status-dot" /> Mission Control</div>
        <div className="status-item">Uplink: Online</div>
        <div className="status-item">Latency: Nominal</div>
      </div>

      <ScrollArea className="mission-body">
        <div className="space-y-2.5">
          {messages.map((message) => {
            const isMd = message.markdown;
            return (
              <div key={message.id} className={`mission-message ${isMd ? 'markdown' : ''}`}>
                {isMd ? (
                  <div className="prose prose-invert max-w-none text-foreground prose-sm md:prose-base">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-foreground leading-relaxed whitespace-pre-line">{message.content}</p>
                )}
                <time>{message.timestamp.toLocaleTimeString()}</time>
              </div>
            );
          })}
        </div>
      </ScrollArea>
      <div className="mission-footer">
        <Input
          placeholder="Type your message or use push-to-talk..."
          className="flex-1"
          value={inputValue}
          onChange={onInputChange}
          onKeyPress={handleKeyPress}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={onSendMessage}
          className="ml-2"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default ChatWindow;
