/**
 * Local rule-based response engine.
 *
 * This module is the SINGLE seam between the UI and whatever produces an
 * assistant reply. Today it answers from a small deterministic rule set so the
 * app works fully offline with no API keys. To connect a real AI model later,
 * replace the body of `getAssistantReply` with a call to a secure backend
 * endpoint (e.g. `fetch("/api/chat", { method: "POST", ... })`) that holds the
 * provider credentials server-side — never call a model API directly from the
 * browser, and never ship a secret key in frontend code.
 */

/** Small delay so the typing indicator is perceptible, mimicking a real model. */
const THINKING_DELAY_MS = 550;

/** A few canned jokes for the "Tell me a joke" quick command. */
const JOKES: string[] = [
  "Why did the developer go broke? Because he used up all his cache.",
  "I told my computer I needed a break, and it said: no problem, I'll go to sleep.",
  "Why do programmers prefer dark mode? Because light attracts bugs.",
  "There are only two hard things in computer science: cache invalidation, naming things, and off-by-one errors.",
];

/** Pick a random element from a non-empty array. */
function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/** Format the current wall-clock time, e.g. "3:42 PM". */
function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Format the current date, e.g. "Saturday, October 3, 2026". */
function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Normalize input for keyword matching. */
function normalize(input: string): string {
  return input.trim().toLowerCase();
}

/** True when the input contains any of the given keywords. */
function hasAny(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword));
}

/**
 * Produce the assistant's reply to a user message.
 *
 * @param input         Raw text typed or dictated by the user.
 * @param assistantName Display name used to personalize replies.
 * @returns A promise resolving to the reply text.
 */
export async function getAssistantReply(
  input: string,
  assistantName: string,
): Promise<string> {
  const text = normalize(input);

  // Simulate a brief "thinking" pause so the UI feels responsive and alive.
  await new Promise((resolve) => setTimeout(resolve, THINKING_DELAY_MS));

  // --- Greetings ---------------------------------------------------------
  if (
    hasAny(text, [
      "hello",
      "hi ",
      "hey",
      "greetings",
      "good morning",
      "good evening",
    ]) ||
    text === "hi"
  ) {
    return `Hello! I'm ${assistantName}, your personal assistant. How can I help you today?`;
  }

  // --- Current time ------------------------------------------------------
  if (hasAny(text, ["time", "clock"])) {
    return `It's currently ${formatTime(new Date())}.`;
  }

  // --- Current date ------------------------------------------------------
  if (hasAny(text, ["date", "day is it", "today"])) {
    return `Today is ${formatDate(new Date())}.`;
  }

  // --- Identity ----------------------------------------------------------
  if (hasAny(text, ["who are you", "your name", "what are you"])) {
    return `I'm ${assistantName}, an AI-powered personal assistant. I can answer questions, tell jokes, report the time and date, and help you explore this app.`;
  }

  // --- Capabilities ------------------------------------------------------
  if (
    hasAny(text, ["what can you do", "help me", "capabilities", "features"])
  ) {
    return [
      `Here's what I can do, ${assistantName === "JARVIS" ? "sir" : "friend"}:`,
      "• Tell you the current time and date",
      "• Share a joke when you need a break",
      "• Explain who I am and what this app offers",
      "• Answer general questions with helpful guidance",
      "Try a quick command below, or just type naturally.",
    ].join("\n");
  }

  // --- Jokes -------------------------------------------------------------
  if (hasAny(text, ["joke", "funny", "make me laugh"])) {
    return pickRandom(JOKES);
  }

  // --- Help --------------------------------------------------------------
  if (hasAny(text, ["help", "how do i", "how to"])) {
    return "I'm here to help. You can ask me the time or date, request a joke, or ask what I can do. Use the microphone to speak your question, and the speaker icon on my replies to hear them read aloud.";
  }

  // --- Fallback ----------------------------------------------------------
  return `I'm not sure I understand "${input.trim()}". I'm a local assistant, so my knowledge is limited — try asking for the time, the date, a joke, or what I can do.`;

  // ---------------------------------------------------------------------
  // FUTURE: real AI integration seam.
  // Replace the rule set above with a secure backend call, e.g.:
  //
  //   const res = await fetch("/api/chat", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ message: input, assistantName }),
  //   });
  //   const data = (await res.json()) as { reply: string };
  //   return data.reply;
  //
  // The backend holds the provider API key; the browser never sees it.
  // ---------------------------------------------------------------------
}
