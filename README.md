# borsouvertures

PWA for learning and practicing chess openings.

## Installation

```bash
pnpm install
```

## Run locally (PWA dev)

```bash
pnpm dev
```

Then open the printed localhost URL (e.g., http://localhost:5173). The service worker is registered in dev so you can test offline and PWA install flows.

## Build and deploy

```bash
pnpm build
```

The production build lands in `dist/`. Deploy the contents of `dist/` to your S3 static website bucket (optionally fronted by CloudFront). Ensure MIME types: `application/json` for `openings.json`, `application/manifest+json` for the PWA manifest, and `text/javascript` for JS.

## Generate/update openings data

The opening dataset is pinned to a specific Lichess chess-openings commit. To (re)generate:

```bash
pnpm build:openings
```

This writes both `src/openings/openings.json` (bundled) and `public/openings.json` (served at runtime).

## Project structure & flow

- `scripts/build-openings.ts` — downloads Lichess TSVs (pinned commit), filters families, converts PGN→SAN/UCI via chess.js, emits `src/openings/openings.json` + `public/openings.json`.
- `src/openings/` — types, loader (`loadOpenings`), selectors, and book-matching engine.
- `src/state/useAppState.ts` — global state (mode, side, board theme, selection, openings) via Zustand.
- `src/theme/boardThemes.ts` — four board themes (Lichess, Chess.com green, Nord, Sand).
- `src/components/` — UI primitives: TopBar, OpeningSelector, SideSelector, BoardView (react-chessboard), Modal, StatusPanel.
- `src/modes/` — feature logic:
  - `ModeLearn` enforces line order, auto-plays opponent moves, handles incorrect move modal + correct arrow, and completion modal.
  - `ModePlay` checks book prefixes across candidates, reverts out-of-book moves, shows book arrows on request, updates status, and signals end-of-line only when all candidates end.
- `vite.config.ts` — React + PWA setup with cache-first `openings.json` and stale-while-revalidate app shell.
- `public/` — runtime-served assets including `openings.json`.
- `src/main.tsx` / `App.tsx` — app bootstrap, PWA registration, and shell wiring.

Functional flow: openings load (runtime fetch with bundled fallback) → user selects scope (opening/variation/line with “All” options) and side → board renders with selected theme → Learn mode enforces exact line; Play mode validates “in book” against all scoped lines, showing arrows for valid continuations when out of book.

## Install the PWA (download as an app)

- Desktop Chrome/Edge: open the site → install prompt in the address bar (“Install app”).  
- iOS Safari: open the site → Share → “Add to Home Screen”.  
- Android Chrome: open the site → menu → “Install app” (or “Add to Home screen”).

The app is dark-only and works offline after first load.
