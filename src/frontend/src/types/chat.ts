/**
 * Shared chat domain types for the JARVIS assistant.
 *
 * These types are the single source of truth for message shape and user
 * preferences, consumed by the context provider, the response engine, and
 * every page that renders a conversation.
 */

/** Who authored a given message. */
export type MessageRole = "user" | "assistant";

/** A single turn in the conversation. */
export interface ChatMessage {
  /** Stable unique id — used as the React list key. */
  id: string;
  /** Author of the message. */
  role: MessageRole;
  /** Plain-text body of the message. */
  text: string;
  /** Epoch milliseconds when the message was created. */
  timestamp: number;
}

/** The active color scheme. */
export type ThemeMode = "dark" | "light";

/** User-configurable assistant preferences, persisted across reloads. */
export interface AssistantSettings {
  /** Active color scheme; dark is the default. */
  theme: ThemeMode;
  /** Whether assistant replies are read aloud via SpeechSynthesis. */
  voiceEnabled: boolean;
  /** Display name used in greetings and the sidebar wordmark. */
  assistantName: string;
}

/** The top-level sections reachable from the sidebar navigation. */
export type AppSection = "chat" | "settings" | "about";

/** Default preferences applied on first load. */
export const DEFAULT_SETTINGS: AssistantSettings = {
  theme: "dark",
  voiceEnabled: false,
  assistantName: "JARVIS",
};
