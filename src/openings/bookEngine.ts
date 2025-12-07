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
  selection: Selection,
  playScope?: { openingIds: string[]; variationIds: string[]; lineIds?: string[] }
): BookCandidate[] {
  const results: BookCandidate[] = [];
  openings.forEach((opening) => {
    if (playScope && playScope.openingIds.length > 0 && !playScope.openingIds.includes(opening.id)) return;
    if (
      selection.openingId !== ALL_KEY &&
      selection.openingId &&
      selection.openingId !== opening.id
    )
      return;
    opening.variations.forEach((variation) => {
      if (playScope && playScope.variationIds.length > 0 && !playScope.variationIds.includes(variation.id)) return;
      if (
        selection.variationId !== ALL_KEY &&
        selection.variationId &&
        selection.variationId !== variation.id
      )
        return;
      variation.lines.forEach((line) => {
        if (playScope && playScope.lineIds && playScope.lineIds.length > 0 && !playScope.lineIds.includes(line.id)) return;
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
  playedMoves: string[],
  playScope?: { openingIds: string[]; variationIds: string[]; lineIds?: string[] }
): BookState {
  const scopedCandidates = gatherCandidates(openings, selection, playScope);
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
