import type { Line, Opening, Variation } from "./types";

export const ALL_KEY = "all";

export interface Selection {
  openingId: string | typeof ALL_KEY | null;
  variationId: string | typeof ALL_KEY | null;
  lineId: string | typeof ALL_KEY | null;
}

export function findOpening(
  openings: Opening[],
  openingId?: string | null
): Opening | undefined {
  if (!openingId || openingId === ALL_KEY) return undefined;
  return openings.find((o) => o.id === openingId);
}

export function findVariation(
  opening: Opening | undefined,
  variationId?: string | null
): Variation | undefined {
  if (!opening || !variationId || variationId === ALL_KEY) return undefined;
  return opening.variations.find((v) => v.id === variationId);
}

export function findLine(
  variation: Variation | undefined,
  lineId?: string | null
): Line | undefined {
  if (!variation || !lineId || lineId === ALL_KEY) return undefined;
  return variation.lines.find((l) => l.id === lineId);
}

export function listVariations(opening?: Opening): Variation[] {
  return opening?.variations ?? [];
}

export function listLines(variation?: Variation): Line[] {
  return variation?.lines ?? [];
}
