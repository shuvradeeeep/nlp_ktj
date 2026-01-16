import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Send, Sparkles, Slash } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  onAttach?: () => void;
  onCommand?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  onAttach,
  onCommand,
  disabled,
  placeholder = "Ask anything about your documents...",
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "/" && message === "") {
      e.preventDefault();
      onCommand?.();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  return (
    <div
      className={cn(
        "relative rounded-xl border bg-card p-2 transition-all duration-200",
        isFocused ? "border-primary/50 shadow-glow" : "border-border"
      )}
    >
      <div className="flex items-end gap-2">
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={onAttach}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={onCommand}
          >
            <Slash className="h-4 w-4" />
          </Button>
        </div>

        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          className="min-h-[44px] max-h-[200px] flex-1 resize-none border-0 bg-transparent p-2 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
          rows={1}
        />

        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          variant="gradient"
          size="icon"
          className="h-9 w-9 shrink-0"
        >
          {disabled ? (
            <Sparkles className="h-4 w-4 animate-pulse" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="mt-1 flex items-center justify-between px-2 text-xs text-muted-foreground">
        <span>Press / for commands</span>
        <span>⏎ to send</span>
      </div>
    </div>
  );
}
