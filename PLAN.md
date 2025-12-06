# Borsouvertures – Implementation Plan

- Project setup: scaffold Vite + React + TypeScript with pnpm; configure path aliases, linting, basic CSS reset; add `react-chessboard`, `chess.js`, and `vite-plugin-pwa`.
- Opening data pipeline: create `scripts/build-openings.ts` to download TSVs pinned to a specific Lichess commit, parse/filter chosen families, convert PGN to SAN/UCI via chess.js, slugify names, aggregate eco codes, and emit `src/openings/openings.json`; add pnpm script and basic unit tests for parsing/slugging.
- Data loading: lightweight loader to fetch openings JSON at startup (with error handling) and helpers to query openings/variations/lines by ID.
- Theming: define four board themes (lichess, chess.com green, nord blue, sand) with fixed color tokens for light/dark squares, highlight, arrow; plug into board component/theme selector; ensure dark-mode UI shell.
- UI layout: build TopBar (title, mode switch, board style selector), OpeningSelector (opening/variation/line dropdowns with cascading options and “All” entries at each level), Modal, StatusPanel (play mode), and main App shell.
- Board layer: integrate `react-chessboard` with orientation toggle (based on side), DnD moves, square highlights, and overlay arrows from logic layer.
- Learn mode logic: enforce turn parity by side, validate moves, auto-play opponent responses, handle incorrect move revert + red highlight + modal, support “Show Correct Move” single arrow, and show completion modal at line end.
- Play mode logic: implement book-matching engine (prefix match, candidate tracking, deduped next moves, hierarchy detection), revert out-of-book moves, modal with book arrows, status panel updates, and only show end-of-line success when no candidates have remaining moves.
- State management: central store for mode, side, board style, selection (opening/variation/line), current line candidates, arrows/modals; ensure selectors stay in sync with available data and reset state when scope changes.
- PWA: configure `vite-plugin-pwa` manifest (dark theme), service worker caching for HTML/JS/CSS/assets/openings JSON/icons; use cache-first for openings JSON and stale-while-revalidate for app shell; verify offline behavior and start_url `/`.
- Testing and QA: unit tests for book-matching engine and build script; lightweight component tests for selectors/board interaction; manual QA checklist for both modes and theme switching.
- Deployment: confirm `pnpm build` succeeds; document S3/CloudFront upload steps and MIME types for JSON/manifest/JS.

## Next iteration: visual selector flow (openings → variations → lines)

- Selector UX: replace dropdowns with scrollable lists of openings/variations/lines; each item shows name and a mini-board preview of the position before entering that scope.
- Data prep: for each opening/variation/line, derive preview FEN from the PGN prefix (opening: before first move? variation: after moves up to variation start? line: first N moves); decide consistent slice lengths.
- Components: build reusable MiniBoard component (static, no DnD) and list item card; three-step navigator with back/next breadcrumbs.
- State changes: store selected opening/variation/line IDs; ensure list filtering narrows lines by selected variation and variations by selected opening; keep “All”/any opening path as needed.
- Performance: memoize preview FENs at build time or at load time; consider precomputing previews during build-openings for fast rendering.
- QA: verify selection narrows correctly, previews match data, and integration with Learn/Play modes remains intact.
