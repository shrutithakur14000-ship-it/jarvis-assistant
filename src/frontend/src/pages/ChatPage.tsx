import { ChatComposer } from "@/components/chat/ChatComposer";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { QuickCommands } from "@/components/chat/QuickCommands";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { useAssistant } from "@/context/AssistantContext";
import { Eraser } from "lucide-react";
import { useEffect, useRef } from "react";

/**
 * The main chat experience.
 *
 * Renders the scrollable transcript, the thinking indicator, the quick-command
 * row, and the composer. The welcome message is seeded by the context on first
 * load, so this page only renders whatever the shared conversation holds.
 */
export function ChatPage() {
  const { messages, isThinking, clearChat } = useAssistant();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Keep the newest message in view as the conversation grows. The effect
  // intentionally re-runs on every message/thinking change; the ref read is
  // stable, so biome's "extra dependency" warning is suppressed here.
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on transcript change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isThinking]);

  return (
    <div
      data-ocid="chat.page"
      className="mx-auto flex h-[calc(100vh-3.5rem)] w-full max-w-3xl flex-col p-4 md:p-6"
    >
      {/* Transcript header with the clear action */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Conversation
        </h2>
        <button
          type="button"
          data-ocid="chat.clear_button"
          onClick={clearChat}
          className="flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-smooth hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Eraser className="h-3.5 w-3.5" aria-hidden="true" />
          Clear Chat
        </button>
      </div>

      {/* Scrollable message list */}
      <div
        data-ocid="chat.list"
        className="scrollbar-slim flex-1 space-y-4 overflow-y-auto rounded-lg px-1 py-2"
      >
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isThinking && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Quick commands + composer pinned to the bottom */}
      <div className="mt-3 flex flex-col gap-3">
        <QuickCommands />
        <ChatComposer />
      </div>
    </div>
  );
}
