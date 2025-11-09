import { ScrollArea } from "@/components/ui/scroll-area";
import { Message } from "@/pages/Meeting";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatWindowProps {
  messages: Message[];
}

const ChatWindow = ({ messages }: ChatWindowProps) => {
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
    </div>
  );
};

export default ChatWindow;
