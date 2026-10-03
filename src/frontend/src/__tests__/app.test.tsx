import App from "@/App";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Integration journeys across the real App, provider, pages, and components.
 *
 * The reply engine is the app's own local rule set (no network), so these tests
 * exercise the accepted chat flow end to end with only the browser APIs mocked.
 */

/** Install a minimal SpeechSynthesis stub so the speak path is observable. */
function installSpeechSynthesis() {
  const speak = vi.fn();
  const cancel = vi.fn();
  class Utterance {
    text: string;
    rate = 1;
    pitch = 1;
    constructor(text: string) {
      this.text = text;
    }
  }
  Object.defineProperty(window, "speechSynthesis", {
    configurable: true,
    value: { speak, cancel },
  });
  Object.defineProperty(window, "SpeechSynthesisUtterance", {
    configurable: true,
    value: Utterance,
  });
  return { speak, cancel };
}

/** Install a fake Web Speech recognition constructor and capture instances. */
function installSpeechRecognition() {
  const instances: Array<{
    start: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
    abort: ReturnType<typeof vi.fn>;
    onresult: ((event: unknown) => void) | null;
    onerror: ((event: { error: string }) => void) | null;
    onend: (() => void) | null;
  }> = [];

  class FakeRecognition {
    lang = "";
    continuous = false;
    interimResults = false;
    onresult: ((event: unknown) => void) | null = null;
    onerror: ((event: { error: string }) => void) | null = null;
    onend: (() => void) | null = null;
    start = vi.fn();
    stop = vi.fn();
    abort = vi.fn();
    constructor() {
      instances.push(this);
    }
  }

  Object.defineProperty(window, "SpeechRecognition", {
    configurable: true,
    value: FakeRecognition,
  });
  return instances;
}

/** Remove speech APIs so the unsupported path is exercised. */
function removeSpeechApis() {
  Reflect.deleteProperty(window, "SpeechRecognition");
  Reflect.deleteProperty(window, "webkitSpeechRecognition");
}

beforeEach(() => {
  window.localStorage.clear();
  installSpeechSynthesis();
});

afterEach(() => {
  vi.restoreAllMocks();
  removeSpeechApis();
});

describe("JARVIS dashboard", () => {
  it("loads the chat dashboard with a welcome message and online status", async () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Chat" })).toBeInTheDocument();
    expect(screen.getByText(/JARVIS Online/i)).toBeInTheDocument();
    expect(
      await screen.findByText(/I'm online and ready to help/i),
    ).toBeInTheDocument();
  });

  it("sends a question and shows a user bubble then a JARVIS reply with a timestamp", async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByLabelText("Message the assistant");
    await user.type(input, "Hello");
    await user.click(screen.getByRole("button", { name: "Send message" }));

    // User bubble appears immediately.
    const userBubble = await screen.findByTestId("chat.message.user");
    expect(within(userBubble).getByText("Hello")).toBeInTheDocument();

    // Thinking indicator appears before the reply.
    expect(screen.getByTestId("chat.loading_state")).toBeInTheDocument();

    // Reply bubble arrives with a timestamp.
    const replyText = await screen.findByText(
      /Hello! I'm JARVIS, your personal assistant/,
      {},
      { timeout: 3000 },
    );
    const assistantBubble = replyText.closest(
      '[data-ocid="chat.message.assistant"]',
    );
    expect(assistantBubble).not.toBeNull();
    expect(assistantBubble?.querySelector("time")).not.toBeNull();
  });

  it("answers the 'Current time' quick command with the browser time", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByTestId("chat.quick_command.time"));

    const reply = await screen.findByText(
      /It's currently/i,
      {},
      { timeout: 3000 },
    );
    expect(reply).toBeInTheDocument();
  });

  it("answers the 'Tell me a joke' quick command with a joke", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByTestId("chat.quick_command.joke"));

    const reply = await screen.findByText(
      /cache|sleep|dark mode|off-by-one/,
      {},
      { timeout: 3000 },
    );
    expect(reply).toBeInTheDocument();
  });

  it("returns a helpful fallback for an unknown question", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(
      screen.getByLabelText("Message the assistant"),
      "Explain quantum entanglement",
    );
    await user.click(screen.getByRole("button", { name: "Send message" }));

    expect(
      await screen.findByText(/not sure I understand/i, {}, { timeout: 3000 }),
    ).toBeInTheDocument();
  });

  it("clears the conversation back to the welcome message", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText("Message the assistant"), "Hello");
    await user.click(screen.getByRole("button", { name: "Send message" }));
    await screen.findByTestId("chat.message.user");

    await user.click(screen.getByTestId("chat.clear_button"));

    await waitFor(() => {
      expect(screen.queryByTestId("chat.message.user")).not.toBeInTheDocument();
    });
    expect(
      screen.getByText(/I'm online and ready to help/i),
    ).toBeInTheDocument();
  });

  it("restores persisted chat history on reload", async () => {
    const user = userEvent.setup();
    const first = render(<App />);

    await user.type(screen.getByLabelText("Message the assistant"), "Hello");
    await user.click(screen.getByRole("button", { name: "Send message" }));
    await screen.findByTestId("chat.message.user");

    // Simulate a reload: unmount and render a fresh App against the same storage.
    first.unmount();
    render(<App />);

    expect(await screen.findByTestId("chat.message.user")).toBeInTheDocument();
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});

describe("navigation and sections", () => {
  it("switches between Chat, Settings, and About", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByTestId("nav.settings.link"));
    expect(
      screen.getByRole("heading", { name: "Settings", level: 1 }),
    ).toBeInTheDocument();

    await user.click(screen.getByTestId("nav.about.link"));
    expect(screen.getByTestId("about.page")).toBeInTheDocument();

    await user.click(screen.getByTestId("nav.chat.link"));
    expect(screen.getByTestId("chat.page")).toBeInTheDocument();
  });

  it("shows the About description and all six tech badges", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByTestId("nav.about.link"));

    expect(
      screen.getByText(/AI-powered personal assistant web application/i),
    ).toBeInTheDocument();
    for (const tech of [
      "React",
      "JavaScript",
      "HTML",
      "CSS",
      "Web Speech API",
      "Local Storage",
    ]) {
      expect(screen.getByText(tech)).toBeInTheDocument();
    }
  });
});

describe("settings", () => {
  it("toggles the theme and reflects it on the document root", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByTestId("nav.settings.link"));
    const toggle = screen.getByRole("switch", { name: "Toggle dark theme" });
    expect(toggle).toHaveAttribute("aria-checked", "true");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "false");
    await waitFor(() => {
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });
  });

  it("toggles voice responses", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByTestId("nav.settings.link"));
    const toggle = screen.getByRole("switch", {
      name: "Toggle voice responses",
    });
    expect(toggle).toHaveAttribute("aria-checked", "false");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "true");
  });

  it("reflects a changed assistant name in the UI and persists it", async () => {
    const user = userEvent.setup();
    const first = render(<App />);

    await user.click(screen.getByTestId("nav.settings.link"));
    const nameInput = screen.getByLabelText("Assistant name");
    await user.clear(nameInput);
    await user.type(nameInput, "FRIDAY");
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/FRIDAY Online/i)).toBeInTheDocument();
    });

    first.unmount();
    render(<App />);
    expect(await screen.findByText(/FRIDAY Online/i)).toBeInTheDocument();
  });

  it("persists the theme choice across reloads", async () => {
    const user = userEvent.setup();
    const first = render(<App />);

    await user.click(screen.getByTestId("nav.settings.link"));
    await user.click(screen.getByRole("switch", { name: "Toggle dark theme" }));

    first.unmount();
    render(<App />);

    await user.click(screen.getByTestId("nav.settings.link"));
    expect(
      screen.getByRole("switch", { name: "Toggle dark theme" }),
    ).toHaveAttribute("aria-checked", "false");
  });
});

describe("voice input", () => {
  it("starts listening and places transcribed speech into the chat input", async () => {
    const instances = installSpeechRecognition();
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByTestId("chat.mic_button"));
    expect(screen.getByTestId("chat.listening_state")).toBeInTheDocument();

    const recognition = instances[0];
    recognition.onresult?.({
      results: {
        length: 1,
        item: () => [{ transcript: "what is the time" }],
        0: [{ transcript: "what is the time" }],
      },
    });

    await waitFor(() => {
      expect(screen.getByLabelText("Message the assistant")).toHaveValue(
        "what is the time",
      );
    });
  });

  it("shows a friendly message when the browser lacks speech recognition", () => {
    removeSpeechApis();
    render(<App />);

    expect(screen.getByTestId("chat.voice_unsupported")).toBeInTheDocument();
    expect(screen.queryByTestId("chat.mic_button")).not.toBeInTheDocument();
  });
});

describe("speaker button", () => {
  it("reads a JARVIS reply aloud via SpeechSynthesis", async () => {
    const { speak } = installSpeechSynthesis();
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText("Message the assistant"), "Hello");
    await user.click(screen.getByRole("button", { name: "Send message" }));
    await screen.findByTestId("chat.message.assistant", {}, { timeout: 3000 });

    await user.click(screen.getByTestId("chat.speak_button"));
    expect(speak).toHaveBeenCalledTimes(1);
  });
});
