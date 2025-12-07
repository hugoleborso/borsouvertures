# Repository Guidelines

## Project Structure & Module Organization
- App lives in `src/` with `main.tsx` bootstrapping React/Vite and `App.tsx` wiring modes and UI.
- Feature modules: `src/components/` (UI), `src/modes/` (Learn/Play logic), `src/state/useAppState.ts` (Zustand store), `src/openings/` (book types, selectors, loader), `src/theme/` (board themes), `src/hooks/` and `src/config/` as utilities/config.
- Public assets (including runtime `openings.json`) sit in `public/`; `scripts/` holds data build tooling.

## Build, Test, and Development Commands
- Install deps: `pnpm install`.
- Local dev server with SW enabled: `pnpm dev` (open printed localhost).
- Production build: `pnpm build` outputs `dist/`.
- Preview built assets: `pnpm preview`.
- Type-check (lint gate): `pnpm lint` (`tsc --noEmit`).
- Regenerate opening data from pinned Lichess TSVs: `pnpm build:openings` (writes `src/openings/openings.json` + `public/openings.json`).

## Coding Style & Naming Conventions
- Language: TypeScript + React functional components; prefer hooks over classes.
- Formatting: 2-space indent, single quotes, trailing semicolons; keep JSX compact. Follow existing import order (external → aliases `@/` → relative).
- Naming: Components PascalCase, hooks `useX`, Zustand selectors/fields camelCase, constants UPPER_SNAKE when shared.
- State flows through `useAppState`; avoid duplicating state locally unless view-specific.

## Testing & QA Guidelines
- No automated test suite yet; rely on type-check plus manual flows.
- Before opening a PR: run `pnpm lint`, start `pnpm dev`, and exercise both Learn and Play modes (side toggles, board themes, “Show moves”, auto-opponent) to ensure book validation and PWA shell still load.
- When changing openings data, rerun `pnpm build:openings` and verify `public/openings.json` is updated.

## Commit & Pull Request Guidelines
- Commit messages follow Conventional Commit style (e.g., `feat: ...`, `chore: ...`).
- Keep commits scoped and readable; mention user-facing changes in the subject.
- PRs should include: purpose/summary, key screenshots or GIFs for UI changes, steps to reproduce/test, and links to issues if applicable. Note any data refresh (`build:openings`) and PWA-impacting changes (manifest, SW, cache behavior).
