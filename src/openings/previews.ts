import { Chess } from 'chess.js';
import type { Opening, Variation, Line } from './types';

export interface OpeningPreview {
  openingId: string;
  fen: string;
}

export interface VariationPreview {
  openingId: string;
  variationId: string;
  fen: string;
}

export interface LinePreview {
  openingId: string;
  variationId: string;
  lineId: string;
  fen: string;
}

export function buildOpeningPreview(opening: Opening): OpeningPreview {
  const line =
    opening.variations.find((v) => v.name.toLowerCase().includes("main"))?.lines[0] ??
    opening.variations[0]?.lines[0];
  const fen = line ? playMoves(line.movesSan, 6) : new Chess().fen();
  return { openingId: opening.id, fen };
}

export function buildVariationPreview(opening: Opening, variation: Variation): VariationPreview {
  const line = variation.lines[0];
  const fen = line ? playMoves(line.movesSan, 6) : new Chess().fen();
  return { openingId: opening.id, variationId: variation.id, fen };
}

export function buildLinePreview(opening: Opening, variation: Variation, line: Line): LinePreview {
  const fen = playMoves(line.movesSan, 6);
  return { openingId: opening.id, variationId: variation.id, lineId: line.id, fen };
}

function playMoves(movesSan: string[], maxPlies: number): string {
  const chess = new Chess();
  const slice = movesSan.slice(0, maxPlies);
  for (const san of slice) {
    try {
      chess.move(san);
    } catch {
      break;
    }
  }
  return chess.fen();
}
