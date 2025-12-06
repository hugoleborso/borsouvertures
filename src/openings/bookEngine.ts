import type { Line, Opening, Variation } from "./types";
import { ALL_KEY, type Selection } from "./selectors";

export interface BookCandidate {
  opening: Opening;
  variation: Variation;
  line: Line;
}

export interface BookState {
  inBook: boolean;
  candidates: BookCandidate[];
  possibleNextMovesUci: string[];
  uniqueOpening?: Opening;
  uniqueVariation?: Variation;
  uniqueLine?: Line;
  atLineEnd: boolean;
}

export function gatherCandidates(
  openings: Opening[],
  selection: Selection
): BookCandidate[] {
  const results: BookCandidate[] = [];
  openings.forEach((opening) => {
    if (
      selection.openingId !== ALL_KEY &&
      selection.openingId &&
      selection.openingId !== opening.id
    )
      return;
    opening.variations.forEach((variation) => {
      if (
        selection.variationId !== ALL_KEY &&
        selection.variationId &&
        selection.variationId !== variation.id
      )
        return;
      variation.lines.forEach((line) => {
        if (
          selection.lineId !== ALL_KEY &&
          selection.lineId &&
          selection.lineId !== line.id
        )
          return;
        results.push({ opening, variation, line });
      });
    });
  });
  return results;
}

export function computeBookState(
  openings: Opening[],
  selection: Selection,
  playedMoves: string[]
): BookState {
  const scopedCandidates = gatherCandidates(openings, selection);
  const matchingCandidates = scopedCandidates.filter((candidate) =>
    playedMoves.every((move, idx) => candidate.line.movesUci[idx] === move)
  );

  const possibleNextMovesUci = Array.from(
    new Set(
      matchingCandidates
        .map((candidate) => candidate.line.movesUci[playedMoves.length])
        .filter((nextMove): nextMove is string => Boolean(nextMove))
    )
  );

  const uniqueOpening =
    matchingCandidates.length > 0
      ? maybeUnique(
          matchingCandidates.map((c) => c.opening),
          (o) => o.id
        )
      : undefined;
  const uniqueVariation =
    matchingCandidates.length > 0
      ? maybeUnique(
          matchingCandidates.map((c) => c.variation),
          (v) => v.id
        )
      : undefined;
  const uniqueLine =
    matchingCandidates.length > 0
      ? maybeUnique(
          matchingCandidates.map((c) => c.line),
          (l) => l.id
        )
      : undefined;

  const atLineEnd =
    matchingCandidates.length > 0 &&
    matchingCandidates.every(
      (candidate) => candidate.line.movesUci.length === playedMoves.length
    );

  return {
    inBook: matchingCandidates.length > 0,
    candidates: matchingCandidates,
    possibleNextMovesUci,
    uniqueOpening,
    uniqueVariation,
    uniqueLine,
    atLineEnd,
  };
}

function maybeUnique<T>(items: T[], key: (item: T) => string): T | undefined {
  if (items.length === 0) return undefined;
  const first = items[0];
  const firstKey = key(first);
  return items.every((item) => key(item) === firstKey) ? first : undefined;
}
