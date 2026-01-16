import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Bot, User, FileText, ExternalLink } from "lucide-react";

export interface Citation {
  id: string;
  title: string;
  page?: number;
}

export interface ChatMessageType {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  timestamp: Date;
}

interface ChatMessageProps {
  message: ChatMessageType;
  onCitationClick?: (citation: Citation) => void;
}

export function ChatMessage({ message, onCitationClick }: ChatMessageProps) {
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={cn(
        "flex gap-4 animate-slide-in-up",
        isAssistant ? "flex-row" : "flex-row-reverse"
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          isAssistant ? "bg-gradient-primary shadow-glow" : "bg-secondary"
        )}
      >
        {isAssistant ? (
          <Bot className="h-5 w-5 text-primary-foreground" />
        ) : (
          <User className="h-5 w-5 text-muted-foreground" />
        )}
      </div>

      <div
        className={cn(
          "flex max-w-[75%] flex-col gap-2",
          !isAssistant && "items-end"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-3",
            isAssistant
              ? "rounded-tl-md bg-card border border-border"
              : "rounded-tr-md bg-primary text-primary-foreground"
          )}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>

        {message.citations && message.citations.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {message.citations.map((citation) => (
              <button
                key={citation.id}
                onClick={() => onCitationClick?.(citation)}
                className="group inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/50 px-2 py-1 text-xs transition-colors hover:border-primary/30 hover:bg-primary/10"
              >
                <FileText className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
                <span className="text-muted-foreground group-hover:text-foreground">
                  {citation.title}
                  {citation.page && ` (p.${citation.page})`}
                </span>
                <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
              </button>
            ))}
          </div>
        )}

        <span className="text-xs text-muted-foreground">
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}
