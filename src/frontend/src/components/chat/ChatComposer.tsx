import { useAssistant } from "@/context/AssistantContext";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { cn } from "@/lib/utils";
import { Mic, MicOff, SendHorizontal } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";

/**
 * The chat input area: a text field, a send button, and a microphone button.
 *
 * The microphone wraps the Web Speech API through `useSpeechRecognition` and
 * appends the recognized transcript to the draft. When the browser lacks
 * support, an inline hint replaces the mic affordance instead of an error.
 */
export function ChatComposer() {
  const { sendMessage, isThinking } = useAssistant();
  const { supported, listening, transcript, start, stop, error } =
    useSpeechRecognition();

  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Fold recognized speech into the draft as it arrives.
  useEffect(() => {
    if (transcript) {
      setDraft(transcript);
    }
  }, [transcript]);

  const canSend = draft.trim().length > 0 && !isThinking;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || isThinking) return;
    setDraft("");
    void sendMessage(text);
    inputRef.current?.focus();
  };

  const handleMicClick = () => {
    if (listening) {
      stop();
    } else {
      start();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      data-ocid="chat.composer"
      className="flex flex-col gap-2"
    >
      <div className="glass-panel-strong flex items-center gap-2 rounded-full p-1.5 pl-4 shadow-panel">
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Type a message…"
          aria-label="Message the assistant"
          data-ocid="chat.input"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />

        {/* Microphone — hidden entirely when unsupported */}
        {supported && (
          <button
            type="button"
            data-ocid="chat.mic_button"
            onClick={handleMicClick}
            aria-label={listening ? "Stop voice input" : "Start voice input"}
            aria-pressed={listening}
            className={cn(
              "grid h-10 w-10 shrink-0 place-items-center rounded-full transition-smooth",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              listening
                ? "bg-destructive/20 text-destructive"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {listening ? (
              <MicOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Mic className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        )}

        <button
          type="submit"
          data-ocid="chat.send_button"
          disabled={!canSend}
          aria-label="Send message"
          className={cn(
            "grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-primary text-primary-foreground transition-smooth",
            "hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:brightness-100",
          )}
        >
          <SendHorizontal className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {/* Voice status / graceful unsupported hint */}
      {listening && (
        <output
          data-ocid="chat.listening_state"
          className="flex items-center gap-2 px-2 font-mono text-[11px] uppercase tracking-widest text-primary"
        >
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-primary/60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          Listening…
        </output>
      )}

      {!supported && (
        <p
          data-ocid="chat.voice_unsupported"
          className="px-2 text-xs text-muted-foreground"
        >
          Voice input isn't supported in this browser — you can still type your
          message.
        </p>
      )}

      {error && (
        <p
          data-ocid="chat.voice_error"
          role="alert"
          className="px-2 text-xs text-destructive"
        >
          {error}
        </p>
      )}
    </form>
  );
}
