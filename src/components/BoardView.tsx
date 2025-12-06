import { Chessboard } from 'react-chessboard';
import type { Arrow, CustomPieces, CustomSquareStyles } from 'react-chessboard/dist/chessboard/types';
import type { BoardThemeId, Side } from '@/state/useAppState';
import { getBoardTheme } from '@/theme/boardThemes';
import { chesscomPieces } from '@/theme/chesscomPieces';

interface BoardViewProps {
  orientation: Side;
  fen: string;
  onMove: (sourceSquare: string, targetSquare: string) => boolean;
  arrows?: Arrow[];
  highlightSquares?: CustomSquareStyles;
  boardStyleId: BoardThemeId;
}

export function BoardView({
  orientation,
  fen,
  onMove,
  arrows = [],
  highlightSquares = {},
  boardStyleId
}: BoardViewProps) {
  const theme = getBoardTheme(boardStyleId);
  const customPieces: CustomPieces | undefined = boardStyleId === 'lichess' ? undefined : chesscomPieces;
  return (
    <div className="panel" style={{ maxWidth: 640 }}>
      <Chessboard
        id="bors-board"
        position={fen}
        boardOrientation={orientation}
        onPieceDrop={(sourceSquare, targetSquare) => onMove(sourceSquare, targetSquare)}
        customDarkSquareStyle={{ backgroundColor: theme.dark }}
        customLightSquareStyle={{ backgroundColor: theme.light }}
        customBoardStyle={{ borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}
        customArrowColor={theme.arrow}
        customArrows={arrows}
        customSquareStyles={highlightSquares}
        customPieces={customPieces}
        animationDuration={150}
        arePiecesDraggable
      />
    </div>
  );
}
