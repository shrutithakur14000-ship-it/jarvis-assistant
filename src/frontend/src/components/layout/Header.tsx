import type { AppSection } from "@/types/chat";
import { Menu } from "lucide-react";

/** Human-readable titles for each section. */
const SECTION_TITLES: Record<AppSection, string> = {
  chat: "Chat",
  settings: "Settings",
  about: "About",
};

interface HeaderProps {
  /** Active section, used to derive the title. */
  active: AppSection;
  /** Assistant display name shown in the status pill. */
  assistantName: string;
  /** Opens the mobile navigation drawer. */
  onOpenNav: () => void;
}

/**
 * Glass header showing the current section title and a persistent
 * "Online" status indicator. On mobile it exposes a menu button that opens the
 * navigation drawer.
 */
export function Header({ active, assistantName, onOpenNav }: HeaderProps) {
  return (
    <header className="glass-panel sticky top-0 z-20 flex items-center gap-3 border-b border-border px-4 py-3 md:px-6">
      {/* Mobile nav trigger */}
      <button
        type="button"
        data-ocid="nav.open_modal_button"
        onClick={onOpenNav}
        aria-label="Open navigation menu"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted-foreground transition-smooth hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate font-display text-lg font-semibold tracking-tight text-foreground">
          {SECTION_TITLES[active]}
        </h1>
      </div>

      {/* Persistent online status */}
      <div
        data-ocid="status.online"
        className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1.5"
      >
        <span className="relative flex h-2 w-2" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-primary/60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {assistantName} Online
        </span>
      </div>
    </header>
  );
}
