import { useAssistant } from "@/context/AssistantContext";
import { cn } from "@/lib/utils";

/** A single one-tap command shown as a pill button. */
interface QuickCommand {
  /** Stable id used for the React key and test marker. */
  id: string;
  /** Visible label and the exact text sent to the assistant. */
  label: string;
}

/** The preset commands surfaced above the composer. */
const QUICK_COMMANDS: QuickCommand[] = [
  { id: "hello", label: "Hello Jarvis" },
  { id: "joke", label: "Tell me a joke" },
  { id: "capabilities", label: "What can you do?" },
  { id: "date", label: "Today's date" },
  { id: "time", label: "Current time" },
  { id: "help", label: "Help" },
];

/**
 * A horizontally scrollable row of pill buttons that send preset prompts.
 *
 * Each button dispatches its label through `sendMessage`, so every control
 * performs real work. Buttons are disabled while a reply is in flight to avoid
 * overlapping requests.
 */
export function QuickCommands() {
  const { sendMessage, isThinking } = useAssistant();

  return (
    <div
      data-ocid="chat.quick_commands"
      className="scrollbar-slim flex gap-2 overflow-x-auto pb-1"
    >
      {QUICK_COMMANDS.map((command) => (
        <button
          key={command.id}
          type="button"
          data-ocid={`chat.quick_command.${command.id}`}
          disabled={isThinking}
          onClick={() => void sendMessage(command.label)}
          className={cn(
            "shrink-0 rounded-full border border-border bg-muted/40 px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-smooth",
            "hover:border-primary/40 hover:bg-primary/10 hover:text-primary",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          {command.label}
        </button>
      ))}
    </div>
  );
}
