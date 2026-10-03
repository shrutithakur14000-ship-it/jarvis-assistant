import { AppShell } from "@/components/layout/AppShell";
import { AssistantProvider, useAssistant } from "@/context/AssistantContext";
import { AboutPage } from "@/pages/AboutPage";
import { ChatPage } from "@/pages/ChatPage";
import { SettingsPage } from "@/pages/SettingsPage";
import type { AppSection } from "@/types/chat";
import { useState } from "react";

/**
 * Inner shell that reads assistant state (for the display name) and renders the
 * active section. Kept separate so it can consume the provider above it.
 */
function Shell() {
  const { settings } = useAssistant();
  const [active, setActive] = useState<AppSection>("chat");

  return (
    <AppShell
      active={active}
      onNavigate={setActive}
      assistantName={settings.assistantName}
    >
      {active === "chat" && <ChatPage />}
      {active === "settings" && <SettingsPage />}
      {active === "about" && <AboutPage />}
    </AppShell>
  );
}

/**
 * Application root: wraps the shell in the assistant provider so every section
 * shares the same conversation and settings state.
 */
export default function App() {
  return (
    <AssistantProvider>
      <Shell />
    </AssistantProvider>
  );
}
