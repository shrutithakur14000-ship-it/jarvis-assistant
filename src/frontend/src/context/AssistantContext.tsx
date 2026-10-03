import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useTheme } from "@/hooks/useTheme";
import { getAssistantReply } from "@/lib/assistant";
import {
  type AssistantSettings,
  type ChatMessage,
  DEFAULT_SETTINGS,
} from "@/types/chat";
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/** Shape of the value exposed by AssistantContext. */
interface AssistantContextValue {
  /** Full conversation transcript, oldest first. */
  messages: ChatMessage[];
  /** User preferences (theme, voice, assistant name). */
  settings: AssistantSettings;
  /** True while a reply is being generated. */
  isThinking: boolean;
  /** Append a user message and asynchronously append the assistant reply. */
  sendMessage: (text: string) => Promise<void>;
  /** Remove every message and reset to the welcome state. */
  clearChat: () => void;
  /** Update one or more settings fields. */
  updateSettings: (patch: Partial<AssistantSettings>) => void;
  /** Read text aloud via the browser SpeechSynthesis API. */
  speak: (text: string) => void;
}

const AssistantContext = createContext<AssistantContextValue | null>(null);

/** Build the greeting shown on first load. */
function createWelcomeMessage(assistantName: string): ChatMessage {
  return {
    id: `welcome-${Date.now()}`,
    role: "assistant",
    text: `Hello, I'm ${assistantName}. I'm online and ready to help. Ask me the time, the date, for a joke, or what I can do.`,
    timestamp: Date.now(),
  };
}

/** Generate a collision-resistant message id. */
function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Owns all assistant state: the persisted conversation, user settings, the
 * thinking flag, and the speech helper. Wrap the app in this provider and read
 * state through `useAssistant()`.
 */
export function AssistantProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useLocalStorage<AssistantSettings>(
    "jarvis.settings",
    DEFAULT_SETTINGS,
  );
  const [messages, setMessages] = useLocalStorage<ChatMessage[]>(
    "jarvis.messages",
    [],
  );
  const [isThinking, setIsThinking] = useState(false);

  // Keep the document theme in sync with the persisted setting.
  const { setTheme } = useTheme();
  useEffect(() => {
    setTheme(settings.theme);
  }, [settings.theme, setTheme]);

  // Seed the welcome message exactly once, on first load with no history.
  const seeded = useRef(false);
  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    if (messages.length === 0) {
      setMessages([createWelcomeMessage(settings.assistantName)]);
    }
  }, [messages.length, setMessages, settings.assistantName]);

  const updateSettings = useCallback(
    (patch: Partial<AssistantSettings>) => {
      setSettings((prev) => ({ ...prev, ...patch }));
    },
    [setSettings],
  );

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isThinking) return;

      const userMessage: ChatMessage = {
        id: createId(),
        role: "user",
        text: trimmed,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsThinking(true);

      try {
        const reply = await getAssistantReply(trimmed, settings.assistantName);
        const assistantMessage: ChatMessage = {
          id: createId(),
          role: "assistant",
          text: reply,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        if (settings.voiceEnabled) speak(reply);
      } finally {
        setIsThinking(false);
      }
    },
    [
      isThinking,
      settings.assistantName,
      settings.voiceEnabled,
      setMessages,
      speak,
    ],
  );

  const clearChat = useCallback(() => {
    setMessages([createWelcomeMessage(settings.assistantName)]);
  }, [setMessages, settings.assistantName]);

  const value = useMemo<AssistantContextValue>(
    () => ({
      messages,
      settings,
      isThinking,
      sendMessage,
      clearChat,
      updateSettings,
      speak,
    }),
    [
      messages,
      settings,
      isThinking,
      sendMessage,
      clearChat,
      updateSettings,
      speak,
    ],
  );

  return (
    <AssistantContext.Provider value={value}>
      {children}
    </AssistantContext.Provider>
  );
}

/** Access the assistant state. Must be used inside `AssistantProvider`. */
export function useAssistant(): AssistantContextValue {
  const context = useContext(AssistantContext);
  if (!context) {
    throw new Error("useAssistant must be used within an AssistantProvider");
  }
  return context;
}
