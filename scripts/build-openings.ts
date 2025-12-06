import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Chess } from "chess.js";

interface RawRow {
  eco: string;
  name: string;
  pgn: string;
}

interface Opening {
  id: string;
  name: string;
  ecoCodes: string[];
  variations: Variation[];
}

interface Variation {
  id: string;
  name: string;
  lines: Line[];
}

interface Line {
  id: string;
  name: string;
  eco: string;
  movesSan: string[];
  movesUci: string[];
}

const OUTPUT_PATH = path.resolve("src/openings/openings.json");
const PUBLIC_OUTPUT_PATH = path.resolve("public/openings.json");
const CACHE_VERSION_PATH = path.resolve("src/config/openingsCacheVersion.ts");
const LICHESS_COMMIT = "refs/heads/master";
const TSV_FILES = ["a", "b", "c", "d", "e"];
const FAMILIES = [
  "Scandinavian Defense",
  "Caro-Kann Defense",
  "Italian Game",
  "Giuoco Piano",
  "Sicilian Defense",
  "Ruy Lopez",
  "French Defense",
  "Queen's Gambit",
  "Queen's Gambit Declined",
  "Queen's Gambit Accepted",
  "King’s Indian Defense",
  "Nimzo-Indian Defense",
  "English Opening",
  "Petrov Defense",
  "Vienna Game",
  "Scotch Game",
  "Four Knights Game",
  "King’s Gambit",
  "Pirc Defense",
  "Modern Defense",
  "Catalan Opening",
];

async function fetchTsv(letter: string): Promise<string> {
  const url = `https://raw.githubusercontent.com/lichess-org/chess-openings/${LICHESS_COMMIT}/${letter}.tsv`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.text();
}

function parseTsv(tsv: string): RawRow[] {
  const lines = tsv.trim().split("\n");
  const headerRemoved = lines[0].startsWith("eco") ? lines.slice(1) : lines;
  return headerRemoved
    .map((line) => line.split("\t"))
    .filter((cols) => cols.length >= 3)
    .map(([eco, name, pgn]) => ({ eco, name, pgn }));
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractVariation(name: string): {
  variation: string;
  lineName: string;
} {
  if (!name.includes(":")) {
    return { variation: "Main Line", lineName: name };
  }
  const [_, rest] = name.split(":");
  const [variation] = rest.split(",");
  return { variation: variation.trim() || "Main Line", lineName: name };
}

function convertPgnToMoves(pgn: string): {
  movesSan: string[];
  movesUci: string[];
} {
  const chess = new Chess();
  chess.loadPgn(pgn);
  const history = chess.history({ verbose: true });
  const movesSan = history.map((m) => m.san);
  const movesUci = history.map((m) => `${m.from}${m.to}${m.promotion ?? ""}`);
  return { movesSan, movesUci };
}

async function buildOpenings() {
  const openingsMap = new Map<string, Opening>();

  for (const letter of TSV_FILES) {
    const tsv = await fetchTsv(letter);
    const rows = parseTsv(tsv);
    for (const row of rows) {
      const family = FAMILIES.find((familyName) =>
        row.name.startsWith(familyName)
      );
      if (!family) continue;

      const openingId = slugify(family);
      if (!openingsMap.has(openingId)) {
        openingsMap.set(openingId, {
          id: openingId,
          name: family,
          ecoCodes: [],
          variations: [],
        });
      }
      const opening = openingsMap.get(openingId)!;
      if (!opening.ecoCodes.includes(row.eco)) opening.ecoCodes.push(row.eco);

      const { variation, lineName } = extractVariation(row.name);
      const variationId = slugify(variation);
      let variationEntry = opening.variations.find((v) => v.id === variationId);
      if (!variationEntry) {
        variationEntry = { id: variationId, name: variation, lines: [] };
        opening.variations.push(variationEntry);
      }

      const { movesSan, movesUci } = convertPgnToMoves(row.pgn);
      const lineId = slugify(lineName);
      variationEntry.lines.push({
        id: lineId,
        name: lineName,
        eco: row.eco,
        movesSan,
        movesUci,
      });
    }
  }

  const openings = Array.from(openingsMap.values()).map((opening) => ({
    ...opening,
    variations: opening.variations.map((variation) => ({
      ...variation,
      lines: variation.lines.sort((a, b) => a.name.localeCompare(b.name)),
    })),
  }));

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await mkdir(path.dirname(PUBLIC_OUTPUT_PATH), { recursive: true });
  await mkdir(path.dirname(CACHE_VERSION_PATH), { recursive: true });
  const contents = JSON.stringify(openings, null, 2);
  await writeFile(OUTPUT_PATH, contents, "utf-8");
  await writeFile(PUBLIC_OUTPUT_PATH, contents, "utf-8");
  const version = Date.now().toString(36);
  const cacheVersionSource = `export const OPENINGS_CACHE_VERSION = "${version}";\n`;
  await writeFile(CACHE_VERSION_PATH, cacheVersionSource, "utf-8");
  console.log(
    `Wrote ${openings.length} openings to ${OUTPUT_PATH} and ${PUBLIC_OUTPUT_PATH} with cache version ${version}`
  );
}

buildOpenings().catch((err) => {
  console.error(err);
  process.exit(1);
});
