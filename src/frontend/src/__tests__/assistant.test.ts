import { getAssistantReply } from "@/lib/assistant";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The rule-based reply engine is the single seam between the UI and whatever
 * produces a reply. These tests pin the accepted response categories and the
 * helpful fallback without touching the UI.
 */
describe("getAssistantReply", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /** Run the engine and advance past its simulated thinking delay. */
  async function reply(input: string, name = "JARVIS"): Promise<string> {
    const pending = getAssistantReply(input, name);
    await vi.advanceTimersByTimeAsync(600);
    return pending;
  }

  it("greets the user by the configured assistant name", async () => {
    const text = await reply("Hello");
    expect(text).toContain("JARVIS");
    expect(text.toLowerCase()).toContain("hello");
  });

  it("reports the current time", async () => {
    vi.setSystemTime(new Date("2026-10-03T15:42:00"));
    const text = await reply("Current time");
    expect(text).toContain("currently");
    expect(text).toMatch(/\d{1,2}:\d{2}/);
  });

  it("reports today's date", async () => {
    vi.setSystemTime(new Date("2026-10-03T15:42:00"));
    const text = await reply("Today's date");
    expect(text).toContain("Today is");
    expect(text).toContain("2026");
  });

  it("answers identity questions with the assistant name", async () => {
    const text = await reply("Who are you?");
    expect(text).toContain("JARVIS");
    expect(text.toLowerCase()).toContain("assistant");
  });

  it("lists capabilities for 'What can you do?'", async () => {
    const text = await reply("What can you do?");
    expect(text).toContain("time");
    expect(text).toContain("date");
    expect(text).toContain("joke");
  });

  it("returns a joke for 'Tell me a joke'", async () => {
    const text = await reply("Tell me a joke");
    expect(text.length).toBeGreaterThan(0);
    // Jokes are drawn from a fixed set; assert it is one of the canned lines.
    expect(text).toMatch(/cache|sleep|dark mode|off-by-one/);
  });

  it("returns help guidance for 'Help'", async () => {
    const text = await reply("Help");
    expect(text.toLowerCase()).toContain("help");
  });

  it("falls back helpfully for an unknown question", async () => {
    const text = await reply(
      "What is the airspeed velocity of an unladen swallow?",
    );
    expect(text).toContain("not sure I understand");
    expect(text).toContain("time");
  });

  it("personalizes replies with a custom assistant name", async () => {
    const text = await reply("Hello", "FRIDAY");
    expect(text).toContain("FRIDAY");
  });
});
