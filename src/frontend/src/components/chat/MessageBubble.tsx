import { useAssistant } from "@/context/AssistantContext";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/chat";
import { Volume2 } from "lucide-react";

interface MessageBubbleProps {
  /** The message to render. */
  message: ChatMessage;
}

/** Format an epoch-millisecond timestamp as a short local time. */
function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * A single conversation turn rendered as a frosted glass bubble.
 *
 * User messages sit on the right with a cyan-tinted accent; assistant messages
 * sit on the left with a neutral glass treatment and a speaker button that
 * reads the reply aloud through the shared `speak` helper.
 */
export function MessageBubble({ message }: MessageBubbleProps) {
  const { speak, settings } = useAssistant();
  const isUser = message.role === "user";

  return (
    <div
      data-ocid={`chat.message.${message.role}`}
      className={cn(
        "flex w-full animate-fade-in-up",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "group relative max-w-[85%] rounded-lg px-4 py-3 shadow-subtle transition-smooth sm:max-w-[75%]",
          isUser
            ? "bg-primary/15 text-foreground ring-1 ring-primary/30"
            : "glass-panel text-foreground",
        )}
      >
        {/* Assistant label + read-aloud control */}
        {!isUser && (
          <div className="mb-1.5 flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-primary">
              {settings.assistantName}
            </span>
            <button
              type="button"
              data-ocid="chat.speak_button"
              onClick={() => speak(message.text)}
              aria-label={`Read ${settings.assistantName}'s reply aloud`}
              className="grid h-6 w-6 place-items-center rounded-md text-muted-foreground transition-smooth hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Message body — preserve newlines from multi-line replies */}
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
          {message.text}
        </p>

        {/* Timestamp */}
        <time
          dateTime={new Date(message.timestamp).toISOString()}
          className={cn(
            "mt-1.5 block font-mono text-[10px] tracking-wide",
            isUser
              ? "text-right text-muted-foreground"
              : "text-muted-foreground",
          )}
        >
          {formatTimestamp(message.timestamp)}
        </time>
      </div>
    </div>
  );
}
