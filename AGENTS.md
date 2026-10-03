# Project Guidance

## User Preferences

- Dark theme by default
- Glassmorphism-style cards with smooth hover effects and subtle animations
- Professional typography and accessible buttons
- No fake buttons; every visible button performs its action
- No secret API keys exposed in frontend code
- Clean, beginner-friendly component structure with meaningful names and comments
- Avoid unnecessary dependencies

## Verified Commands

- **typecheck**: `pnpm typecheck`
- **fix**: `pnpm fix`
- **build**: `pnpm build`

## Learnings

- Frontend pipeline: pnpm typecheck, pnpm check (biome), pnpm build all pass; backend: mops check --fix, mops build, then pnpm bindgen.
- App.tsx switches sections via local useState<AppSection> (no router); AssistantContext owns messages + settings persisted in localStorage.
- Local rule-based reply engine lives in src/lib/assistant.ts as the single seam for a future secure backend call.
- Web Speech recognition is wrapped in src/hooks/useSpeechRecognition.ts with graceful unsupported/permission handling; TTS via SpeechSynthesis in AssistantContext.speak.
- Generated files src/frontend/src/backend.ts and backend.d.ts come from pnpm bindgen; never hand-edit them.
- Tests: Vitest + React Testing Library frontend suite plus a PocketIC backend lane; run with pnpm --dir app test.
