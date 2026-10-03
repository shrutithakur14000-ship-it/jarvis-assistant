import { useAssistant } from "@/context/AssistantContext";

/**
 * Animated "thinking" indicator shown while the assistant composes a reply.
 *
 * Three dots bounce in sequence next to a status label. The animation is
 * transform/opacity only and is disabled automatically for users who prefer
 * reduced motion (see the global reduced-motion rule in index.css).
 */
export function TypingIndicator() {
  const { settings } = useAssistant();

  return (
    <output
      data-ocid="chat.loading_state"
      aria-live="polite"
      className="flex w-full animate-fade-in justify-start"
    >
      <div className="glass-panel flex items-center gap-3 rounded-lg px-4 py-3">
        <span className="flex items-center gap-1" aria-hidden="true">
          <span className="h-1.5 w-1.5 animate-bounce-dot rounded-full bg-primary [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 animate-bounce-dot rounded-full bg-primary [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 animate-bounce-dot rounded-full bg-primary" />
        </span>
        <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          {settings.assistantName} is thinking…
        </span>
      </div>
    </output>
  );
}
