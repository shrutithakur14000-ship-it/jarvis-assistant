import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Minimal shape of the Web Speech API recognition interface.
 *
 * The DOM lib does not ship these types in every TypeScript version, so we
 * declare only the members this hook actually touches. This keeps the hook
 * dependency-free and avoids `any`.
 */
interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEventLike {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEventLike {
  error: string;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

/** Window augmented with the vendor-prefixed recognition constructor. */
interface SpeechWindow extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

/** Public surface returned by {@link useSpeechRecognition}. */
export interface UseSpeechRecognition {
  /** True when the browser exposes the Web Speech API. */
  supported: boolean;
  /** True while the microphone is actively listening. */
  listening: boolean;
  /** Latest recognized transcript (final or interim). */
  transcript: string;
  /** Begin listening. No-op when unsupported. */
  start: () => void;
  /** Stop listening. No-op when unsupported. */
  stop: () => void;
  /** Friendly, human-readable error message, or null when there is none. */
  error: string | null;
}

/** Resolve the recognition constructor across browser prefixes. */
function getRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const speechWindow = window as SpeechWindow;
  return (
    speechWindow.SpeechRecognition ??
    speechWindow.webkitSpeechRecognition ??
    null
  );
}

/** Map raw Web Speech error codes to friendly copy. */
function describeError(code: string): string {
  switch (code) {
    case "not-allowed":
    case "service-not-allowed":
      return "Microphone access was blocked. Allow it in your browser settings and try again.";
    case "no-speech":
      return "I didn't catch that. Try speaking again.";
    case "audio-capture":
      return "No microphone was found. Check that one is connected.";
    case "network":
      return "Speech recognition needs a network connection right now.";
    case "aborted":
      return "Voice input stopped.";
    default:
      return "Voice input ran into a problem. Please try again.";
  }
}

/**
 * Wrap the browser Web Speech API for one-shot voice input.
 *
 * Exposes `{ supported, listening, transcript, start, stop, error }`. When the
 * browser lacks the API the hook degrades gracefully: `supported` is false and
 * `start`/`stop` are safe no-ops. Recognition is configured for a single
 * utterance with interim results so the transcript updates as the user speaks.
 */
export function useSpeechRecognition(): UseSpeechRecognition {
  const [supported] = useState<boolean>(
    () => getRecognitionConstructor() !== null,
  );
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Keep the live recognition instance across renders without re-creating it.
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  // Tear down any active session when the component unmounts.
  useEffect(() => {
    return () => {
      const recognition = recognitionRef.current;
      if (recognition) {
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        recognition.abort();
      }
      recognitionRef.current = null;
    };
  }, []);

  const start = useCallback(() => {
    const Recognition = getRecognitionConstructor();
    if (!Recognition) {
      setError("Voice input isn't supported in this browser.");
      return;
    }

    // Reuse a single instance; abort any in-flight session first.
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    const recognition = new Recognition();
    recognition.lang = navigator.language || "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let text = "";
      for (let i = 0; i < event.results.length; i += 1) {
        text += event.results[i][0].transcript;
      }
      setTranscript(text);
    };

    recognition.onerror = (event) => {
      setError(describeError(event.error));
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    setError(null);
    setTranscript("");
    setListening(true);

    try {
      recognition.start();
    } catch {
      // Some browsers throw if start() is called while already active.
      setListening(false);
      setError("Voice input is already active.");
    }
  }, []);

  const stop = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    recognition.stop();
    setListening(false);
  }, []);

  return { supported, listening, transcript, start, stop, error };
}
