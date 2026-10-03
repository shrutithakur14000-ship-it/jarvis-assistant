import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import type { AppSection } from "@/types/chat";
import { X } from "lucide-react";
import { type ReactNode, useState } from "react";

interface AppShellProps {
  /** Active section, drives the header title and nav state. */
  active: AppSection;
  /** Called when the user selects a section from the nav. */
  onNavigate: (section: AppSection) => void;
  /** Assistant display name for the wordmark and status pill. */
  assistantName: string;
  /** The active section's content. */
  children: ReactNode;
}

/**
 * Responsive split shell: a fixed glass sidebar on desktop, a slide-in drawer
 * on mobile, and a main content column with a sticky glass header.
 */
export function AppShell({
  active,
  onNavigate,
  assistantName,
  children,
}: AppShellProps) {
  const isMobile = useIsMobile();
  const [navOpen, setNavOpen] = useState(false);

  const handleNavigate = (section: AppSection) => {
    onNavigate(section);
    setNavOpen(false);
  };

  return (
    <div className="ambient-glow relative flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      {!isMobile && (
        <aside className="glass-panel fixed inset-y-0 left-0 z-30 w-64 border-r border-sidebar-border">
          <Sidebar
            active={active}
            onNavigate={handleNavigate}
            assistantName={assistantName}
          />
        </aside>
      )}

      {/* Mobile drawer */}
      {isMobile && navOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            data-ocid="nav.close_button"
            onClick={() => setNavOpen(false)}
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
          />
          <aside className="glass-panel-strong absolute inset-y-0 left-0 w-64 animate-fade-in border-r border-sidebar-border">
            <button
              type="button"
              aria-label="Close navigation menu"
              onClick={() => setNavOpen(false)}
              className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-smooth hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
            <Sidebar
              active={active}
              onNavigate={handleNavigate}
              assistantName={assistantName}
            />
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-h-screen w-full flex-col md:pl-64">
        <Header
          active={active}
          assistantName={assistantName}
          onOpenNav={() => setNavOpen(true)}
        />
        <main className="relative flex-1">{children}</main>
      </div>
    </div>
  );
}
