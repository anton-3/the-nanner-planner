import { ScrollArea } from "@/components/ui/scroll-area";
import { Message } from "@/pages/Interview";

interface ChatWindowProps {
  messages: Message[];
}

const ChatWindow = ({ messages }: ChatWindowProps) => {
  return (
    <div className="h-full flex flex-col bg-card/50">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-semibold text-foreground">Agent Messages</h2>
      </div>
      
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className="animate-fade-in bg-secondary/50 rounded-lg p-4 border border-border/50"
            >
              <p className="text-foreground leading-relaxed">{message.content}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatWindow;
