import { useAssistant } from "@/context/AssistantContext";
import { cn } from "@/lib/utils";
import { Eraser, Moon, Sun, Volume2, VolumeX } from "lucide-react";
import { useEffect, useState } from "react";

/** A labelled row wrapping a single preference control. */
function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

/** An accessible on/off switch styled as a pill track. */
function Toggle({
  checked,
  onChange,
  label,
  ocid,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  ocid: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      data-ocid={ocid}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full border transition-smooth",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        checked ? "border-primary/50 bg-primary/30" : "border-border bg-muted",
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-foreground shadow-subtle transition-smooth",
          checked ? "translate-x-6 bg-primary" : "translate-x-1",
        )}
        aria-hidden="true"
      />
    </button>
  );
}

/**
 * Settings section: theme, voice, assistant name, and chat history controls.
 *
 * Every control writes through the shared context, so preferences persist in
 * localStorage and stay in sync across the whole app.
 */
export function SettingsPage() {
  const { settings, updateSettings, clearChat } = useAssistant();
  const isDark = settings.theme === "dark";

  // Local draft for the name field so typing stays responsive; committed on blur.
  const [nameDraft, setNameDraft] = useState(settings.assistantName);
  useEffect(() => {
    setNameDraft(settings.assistantName);
  }, [settings.assistantName]);

  const commitName = () => {
    const next = nameDraft.trim();
    if (next && next !== settings.assistantName) {
      updateSettings({ assistantName: next });
    } else {
      setNameDraft(settings.assistantName);
    }
  };

  return (
    <div
      data-ocid="settings.page"
      className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4 md:p-6"
    >
      <div className="glass-panel rounded-lg p-6">
        <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
          Settings
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Personalize how your assistant looks, sounds, and introduces itself.
        </p>

        <div className="mt-4 divide-y divide-border">
          {/* Theme */}
          <SettingRow
            title="Appearance"
            description="Switch between the dark command console and a light theme."
          >
            <div className="flex items-center gap-2">
              <Sun
                className={cn(
                  "h-4 w-4",
                  isDark ? "text-muted-foreground" : "text-accent",
                )}
                aria-hidden="true"
              />
              <Toggle
                checked={isDark}
                onChange={(next) =>
                  updateSettings({ theme: next ? "dark" : "light" })
                }
                label="Toggle dark theme"
                ocid="settings.theme.toggle"
              />
              <Moon
                className={cn(
                  "h-4 w-4",
                  isDark ? "text-primary" : "text-muted-foreground",
                )}
                aria-hidden="true"
              />
            </div>
          </SettingRow>

          {/* Voice */}
          <SettingRow
            title="Voice responses"
            description="Read each reply aloud using your browser's speech synthesis."
          >
            <div className="flex items-center gap-2">
              {settings.voiceEnabled ? (
                <Volume2 className="h-4 w-4 text-primary" aria-hidden="true" />
              ) : (
                <VolumeX
                  className="h-4 w-4 text-muted-foreground"
                  aria-hidden="true"
                />
              )}
              <Toggle
                checked={settings.voiceEnabled}
                onChange={(next) => updateSettings({ voiceEnabled: next })}
                label="Toggle voice responses"
                ocid="settings.voice.toggle"
              />
            </div>
          </SettingRow>

          {/* Assistant name */}
          <SettingRow
            title="Assistant name"
            description="The name used in greetings, the sidebar, and replies."
          >
            <input
              type="text"
              value={nameDraft}
              onChange={(event) => setNameDraft(event.target.value)}
              onBlur={commitName}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.currentTarget.blur();
                }
              }}
              maxLength={24}
              aria-label="Assistant name"
              data-ocid="settings.name.input"
              className="w-40 rounded-lg border border-input bg-muted/40 px-3 py-2 text-sm text-foreground transition-smooth placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </SettingRow>
        </div>
      </div>

      {/* Danger-ish zone: clear history */}
      <div className="glass-panel rounded-lg p-6">
        <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Conversation
        </h3>
        <div className="mt-3 flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Remove every message and start fresh with the welcome greeting.
          </p>
          <button
            type="button"
            data-ocid="settings.clear_button"
            onClick={clearChat}
            className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-muted/40 px-4 py-2 text-sm font-medium text-muted-foreground transition-smooth hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Eraser className="h-4 w-4" aria-hidden="true" />
            Clear Chat History
          </button>
        </div>
      </div>
    </div>
  );
}
