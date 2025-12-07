import { chesscomPieces } from '@/theme/chesscomPieces';
import { getBoardTheme } from '@/theme/boardThemes';
import type { BoardThemeId } from '@/state/useAppState';

export function getBoardAppearance(boardStyleId: BoardThemeId) {
  const theme = getBoardTheme(boardStyleId);
  const customPieces = boardStyleId === 'lichess' ? undefined : chesscomPieces;
  return { theme, customPieces };
}
