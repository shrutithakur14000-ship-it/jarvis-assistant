import { Cpu } from "lucide-react";

/** Technology badges shown in the About section. */
const TECHNOLOGIES: string[] = [
  "React",
  "JavaScript",
  "HTML",
  "CSS",
  "Web Speech API",
  "Local Storage",
];

/**
 * About section — the portfolio summary for the project.
 *
 * Presents the product title, a one-line description, and the technology
 * badges that make up the stack.
 */
export function AboutPage() {
  return (
    <div
      data-ocid="about.page"
      className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4 md:p-6"
    >
      <div className="glass-panel relative overflow-hidden rounded-lg p-8">
        {/* Ambient reactor glow */}
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative flex flex-col items-start gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-full border border-primary/40 bg-primary/10">
            <Cpu className="h-6 w-6 text-primary" aria-hidden="true" />
          </span>

          <div>
            <h2 className="font-display text-2xl font-bold tracking-widest text-foreground sm:text-3xl">
              JARVIS <span className="text-gradient-primary">AI ASSISTANT</span>
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              An AI-powered personal assistant web application developed as a
              portfolio project.
            </p>
          </div>

          {/* Technology badges */}
          <div className="mt-2">
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Built with
            </h3>
            <ul
              data-ocid="about.tech_list"
              className="mt-3 flex flex-wrap gap-2"
            >
              {TECHNOLOGIES.map((tech) => (
                <li
                  key={tech}
                  data-ocid={`about.tech.${tech
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")}`}
                  className="rounded-full border border-border bg-muted/40 px-3 py-1.5 font-mono text-xs tracking-wide text-muted-foreground transition-smooth hover:border-primary/40 hover:text-primary"
                >
                  {tech}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
