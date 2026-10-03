# Design Brief

## Direction

Arc Reactor — a precise, cinematic AI command console: a deep blue-black void where a single luminous cyan signal marks every interactive surface.

## Tone

Refined futuristic / tech-noir — restrained and professional rather than neon arcade, so the assistant reads as capable and trustworthy.

## Differentiation

A frosted-glass command deck: layered translucent panels over an ambient cyan glow, with one cyan "reactor" accent reserved for live state (online dot, active nav, send button) so the interface feels alive but never noisy.

## Color Palette

| Token       | OKLCH          | Role                                          |
| ----------- | -------------- | --------------------------------------------- |
| background  | 0.145 0.018 262 | Deep blue-black void (dark default)          |
| foreground  | 0.96 0.008 250  | Primary text, near-white cool                |
| card        | 0.205 0.022 262 | Glass panel base surface                     |
| primary     | 0.79 0.135 195  | Luminous cyan signal — CTAs, active, focus   |
| accent      | 0.78 0.14 80    | Restrained warm amber — highlights, badges   |
| muted       | 0.255 0.024 262 | Secondary surfaces, chips, timestamps        |
| border      | 0.31 0.022 262  | Hairline separators, input outlines          |
| destructive | 0.66 0.19 25    | Clear-chat / destructive actions             |

## Typography

- Display: Space Grotesk — headings, brand wordmark, nav labels (geometric, techy)
- Body: DM Sans — chat text, paragraphs, buttons (clean humanist, highly legible)
- Mono: JetBrains Mono — timestamps, status text, keyboard hints
- Scale: hero `text-3xl md:text-5xl font-bold tracking-tight`, h2 `text-xl md:text-2xl font-semibold tracking-tight`, label `text-xs font-semibold tracking-widest uppercase`, body `text-sm md:text-base`

## Elevation & Depth

Depth comes from layered translucency, not heavy shadows: glass panels at 55–78% opacity with 14–18% hairline borders over an ambient radial cyan glow; `shadow-elevated`/`shadow-panel` add soft lift on hover and floating surfaces, `shadow-glow-soft` marks the primary CTA only.

## Structural Zones

| Zone     | Background                          | Border                          | Notes                                             |
| -------- | ----------------------------------- | ------------------------------- | ------------------------------------------------- |
| Sidebar  | `bg-sidebar` glass, 0.175 L         | `border-r border-sidebar-border` | Logo + nav (Chat/Settings/About) + Online status |
| Header   | `glass-panel` translucent, blurred  | `border-b border-border`        | Title, subtitle, overflow menu, status pill       |
| Content  | `bg-background` + ambient-glow      | —                               | Chat transcript, quick-command chip row           |
| Composer | `glass-panel-strong` floating bar   | `border border-border`          | Input + mic + circular cyan send button           |
| Footer   | none (composer anchors the bottom)  | —                               | Status line only inside sidebar                   |

## Spacing & Rhythm

Generous shell padding (`p-3 md:p-5`), chat column max-width `max-w-3xl` centered, message gaps `space-y-4`, chip row `gap-2 flex-wrap`, micro-spacing on 4/8/12/16/24 increments for consistent rhythm.

## Component Patterns

- Buttons: pill/rounded-lg; primary = cyan gradient with `shadow-glow-soft`; secondary = glass outline; hover lifts `-translate-y-0.5` + brightens border; focus-visible uses `.focus-ring` (`--ring`, 2px offset).
- Cards: 14–16px radius, `glass-panel` + `glass-panel-hover`, 1px translucent border, `shadow-subtle`; assistant bubbles get a 2px cyan left border.
- Badges/chips: pill shape, `bg-muted`/glass; active chip = cyan tint; tech badges on About use muted glass.

## Motion

- Entrance: `animate-fade-in-up` on messages and panels, 0.45s cubic-bezier(0.4,0,0.2,1), staggered.
- Hover: `transition-smooth` (0.3s) — lift, border brighten, subtle glow on primary.
- Decorative: `pulse-dot` on the JARVIS Online indicator, `bounce-dot` on the typing indicator, `float-slow`/`spin-slow` on the ambient logo glow, `shimmer` on loading placeholders.
- Reduced motion: all decorative animation and hover transforms disabled under `prefers-reduced-motion`.

## Constraints

- Dark theme is the DEFAULT active theme; light mode is a tuned counterpart, not an inverted copy.
- Glassmorphism and cyan accent used sparingly — never rainbow, never neon glow shadows.
- Semantic tokens only in components; no raw hex/rgb, no arbitrary color classes.
- AA+ contrast everywhere; body text ≥ 4.5:1. Clean and uncluttered — no dead zones.

## Signature Detail

A pulsing cyan "reactor" status dot beside the JARVIS wordmark, mirrored by the active-nav pill and circular send button — one live signal repeated across the shell to make the console feel awake.
