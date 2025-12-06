# **Borsouvertures – Product Requirements Document (PRD) & Technical Specification**

## 1. Overview

Borsouvertures is a **Progressive Web App (PWA)** designed to help users **learn and practice chess openings**.
The app is fully front-end, built with **React + TypeScript + Vite + pnpm**, and deployed to S3.
All opening data is stored locally and cached offline via the service worker.

The PWA offers two primary modes:

1. **Learn an Opening**
2. **Play Within an Opening**

It supports training **as White or Black**, and displays board arrows for corrections and book moves.

---

# 2. Opening Dataset

## 2.1 Opening Sources

The project uses the **official Lichess chess-openings database**, stored in TSV files `a.tsv` through `e.tsv` in the `lichess-org/chess-openings` repository.
Each row contains:

* `eco`: ECO code
* `name`: Opening name and variation hierarchy
* `pgn`: Full PGN describing the sequence of moves

## 2.2 Selected Opening Families

We include **~20 major opening families**, each with **all their variations and lines** found in the Lichess dataset.

Chosen families:

1. Scandinavian Defense
2. Caro-Kann Defense
3. Italian Game
4. Giuoco Piano
5. Sicilian Defense
6. Ruy Lopez
7. French Defense
8. Queen's Gambit
9. Queen's Gambit Declined
10. Queen's Gambit Accepted
11. King’s Indian Defense
12. Nimzo-Indian Defense
13. English Opening
14. Petrov Defense
15. Vienna Game
16. Scotch Game
17. Four Knights Game
18. King’s Gambit
19. Pirc Defense
20. Modern Defense
21. Catalan Opening

> A line is included if its `name` field **begins with** one of the above families.

## 2.3 Data Pipeline Requirements

A Node script (`build-openings.ts`) must:

1. **Download** Lichess TSV files (`a.tsv`–`e.tsv`) directly from GitHub.
2. **Parse** each TSV to extract `{eco, name, pgn}`.
3. **Filter** rows where `name` starts with one of the chosen families.
4. **Convert PGN → SAN and UCI arrays** using `chess.js`.
5. **Organize** into a hierarchical JSON structure:

   * Opening

     * Variation

       * Line
6. Output `src/openings/openings.json`.

### 2.4 Data Structure

```ts
interface Opening {
  id: string;            // slugified family name
  name: string;          // e.g. "Sicilian Defense"
  ecoCodes: string[];
  variations: Variation[];
}

interface Variation {
  id: string;            // slugified variation name
  name: string;          // e.g. "Najdorf Variation"
  lines: Line[];
}

interface Line {
  id: string;
  name: string;          // Full Lichess name
  eco: string;
  movesSan: string[];    // ["e4", "c5", ...]
  movesUci: string[];    // ["e2e4", "c7c5", ...]
}
```

### 2.5 Variation Extraction Rule

Given a Lichess name:

Example:
`"Sicilian Defense: Najdorf Variation, English Attack"`

* Opening family = `"Sicilian Defense"`
* Variation name = `"Najdorf Variation"` (substring after `:` and before first `,`)
* Line name = entire `name` field

If no `:`, variation = `"Main Line"`.

---

# 3. Product Behavior

## 3.1 Global Features

* Dark mode only
* Fully offline-capable PWA
* User-selectable board style (4 themes):

  * Lichess style
  * Chess.com green style
  * Nord blue
  * Sand light
* Train as **White** or **Black**
* Browser local caching of data
* Board arrows for feedback & guidance

---

# 4. Modes

# **4.1 Learn an Opening – Specification**

## Flow

1. User selects Opening → Variation → Line
2. User selects side: **White** or **Black**
3. Board resets
4. User plays moves according to the chosen line sequence

## Behavior

### Correct move

* Move is applied
* Opponent’s next move (according to the line) is **auto-played**
* Continue until line end

### Incorrect move

* User's move is **reverted**
* Board highlights incorrect attempt in **red**
* A **modal popup** appears:

#### Popup content:

* Title: **“Incorrect Move”**
* Buttons:

  * **Try Again** → revert to pre-move state
  * **Show Correct Move** → display **one arrow** indicating correct move

### Completion

At the end of the line:

* Display a success modal:

  * “Line completed successfully!”

---

# **4.2 Play Within an Opening – Specification**

## Scope Selection

Users may choose:

1. **Opening only** → all variations & lines under that opening
2. **Variation only** → all lines under a variation
3. **Line only** → a single opening line
4. **Nothing** (Play “any opening”) → all lines from the entire dataset

## Behavior

* Game begins with empty board (starting position)
* After each move, app evaluates if user is **still in book**:

  * Compare played move sequence to all candidate lines
  * If at least one line remains a prefix match → **in book**
  * If none remain → **out of book**

## Correct move

* Move is kept
* Game continues normally
* Status panel displays:

  * Current Opening (if uniquely determined)
  * Current Variation (if uniquely determined)
  * Current Line (if uniquely determined)
  * Number of matching lines

## Incorrect / Out-of-book move

* Move is **reverted**
* Board remains unchanged
* A popup appears:

### Popup content:

* Title: **“Out of Book”**
* Buttons:

  * **Try Again** → revert to previous position
  * **Show Book Moves** → show **arrows for every possible correct book continuation**

### Book Move Arrows (key requirement)

When user clicks **Show Book Moves**:

* Compute all possible next moves from remaining candidate lines
* For each UCI move `"e2e4"` create an arrow:

  * from `"e2"` to `"e4"`

Arrows disappear when the user makes a new correct move.

## Completion

If the user plays all moves of a known line:

* Show success modal:

  * “You reached the end of the line!”

---

# 5. UI Requirements

### 5.1 Components

* TopBar

  * App title “Borsouvertures”
  * Mode switch (Learn / Play)
  * Board style selector

* OpeningSelector

  * Three dropdowns:

    * Opening
    * Variation
    * Line

* Board

  * Provided by a lightweight library (`react-chessboard`)
  * Must support:

    * Custom square colors
    * Arrow overlays
    * Drag-and-drop moves
    * Orientation (White/Black)

* Modal

  * Centered, dark-themed
  * Two buttons depending on mode

* StatusPanel (Play mode only)

  * Displays:

    * In-book status
    * Opening name
    * Variation
    * Line
    * Candidate count

### 5.2 Board Themes

4 predefined themes:

* Lichess
* Chess.com Green
* Nord Blue
* Sand

Each theme defines:

* light square color
* dark square color
* highlight color
* arrow color

---

# 6. Chess Logic Layer

### 6.1 Game Engine

Use **chess.js** to:

* Validate moves
* Maintain position
* Replay moves
* Detect illegal attempts

### 6.2 Turn Logic

For move index `ply`:

* If player side = White → player moves on even plies
* If player side = Black → player moves on odd plies

Auto-play opponent moves in Learn Mode.

---

# 7. Book Matching Engine

### Filtering Logic

Given sequence of played UCI moves:

* A line is a **candidate** if
  `line.movesUci[0..N-1] === playedMoves[0..N-1]`

### Returned fields:

* `inBook`: boolean
* `candidates`: all lines that still match prefix
* `possibleNextMovesUci`: deduplicated next moves across candidates

### Hierarchy detection

If across candidates:

* Only one opening ID → uniquely determined opening
* Only one variation ID → uniquely determined variation
* Only one line ID → uniquely determined line

---

# 8. Architecture

## 8.1 Frontend

* React
* TypeScript
* Vite build system
* React components:

  * App
  * ModeLearn
  * ModePlay
  * Board
  * OpeningSelector
  * BoardStyleSelector
  * Modal

## 8.2 Data

* Generated `src/openings/openings.json`
* Fully cached in service worker
* Loaded at app startup

## 8.3 PWA

* `vite-plugin-pwa` configured with:

  * name: **Borsouvertures**
  * start_url: `/`
  * display: `standalone`
  * theme & background color = black
  * Offline caching of:

    * HTML
    * JS
    * CSS
    * opening JSON
    * icons

---

# 9. Deployment

* App built via `pnpm build`
* Output uploaded to S3 bucket
* Enable static website hosting
* Use CloudFront optionally for HTTPS & caching
* Must set correct MIME types:

  * `application/json` for openings.json
  * `application/manifest+json` for PWA manifest
  * `text/javascript` for JS

---

# 10. Future Enhancements (Not in scope)

* Import PGN from user repertoire
* Weighted random selection based on frequency
* Spaced repetition system
* Player performance stats
* Sync data to backend
* Mobile haptics

