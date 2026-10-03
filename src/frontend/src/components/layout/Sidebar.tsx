import { cn } from "@/lib/utils";
import type { AppSection } from "@/types/chat";
import { Info, MessageSquare, Settings } from "lucide-react";

/** A single navigation entry in the sidebar. */
interface NavItem {
  id: AppSection;
  label: string;
  icon: typeof MessageSquare;
}

const NAV_ITEMS: NavItem[] = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "about", label: "About", icon: Info },
];

interface SidebarProps {
  /** Currently active section. */
  active: AppSection;
  /** Called when the user selects a section. */
  onNavigate: (section: AppSection) => void;
  /** Assistant display name for the wordmark. */
  assistantName: string;
}

/**
 * Glass sidebar with the JARVIS wordmark, primary navigation, and a live
 * "Online" status row. Rendered inside the desktop shell and inside the mobile
 * drawer by AppShell.
 */
export function Sidebar({ active, onNavigate, assistantName }: SidebarProps) {
  return (
    <div className="flex h-full flex-col gap-6 p-4">
      {/* Brand / reactor mark */}
      <div className="flex items-center gap-3 px-2 pt-2">
        <span className="relative grid h-11 w-11 place-items-center">
          <span className="absolute inset-0 rounded-full bg-primary/20 blur-md" />
          <span className="relative grid h-9 w-9 place-items-center rounded-full border border-primary/40 bg-primary/10">
            <span className="h-3.5 w-3.5 rounded-full bg-primary shadow-[0_0_12px_2px] shadow-primary/60" />
          </span>
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-bold tracking-widest text-foreground">
            {assistantName}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            AI Assistant
          </p>
        </div>
      </div>

      {/* Primary navigation */}
      <nav aria-label="Primary" className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              data-ocid={`nav.${item.id}.link`}
              aria-current={isActive ? "page" : undefined}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-smooth",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
                isActive
                  ? "bg-primary/15 text-primary shadow-subtle"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-smooth",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
                aria-hidden="true"
              />
              <span className="truncate">{item.label}</span>
              {isActive && (
                <span
                  className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Live status — anchored to the bottom */}
      <div className="mt-auto">
        <div
          data-ocid="status.online"
          className="glass-panel flex items-center gap-3 rounded-lg px-3 py-2.5"
        >
          <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-primary/60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-xs font-semibold tracking-wide text-foreground">
              {assistantName}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-primary">
              Online
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
