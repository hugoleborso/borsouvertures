import { Chessboard } from 'react-chessboard';
import type { BoardOrientation, Square } from 'react-chessboard/dist/chessboard/types';
import { getBoardTheme } from '@/theme/boardThemes';
import type { BoardThemeId } from '@/state/useAppState';
import { chesscomPieces } from '@/theme/chesscomPieces';

interface MiniBoardProps {
  fen: string;
  orientation?: BoardOrientation;
  boardStyleId: BoardThemeId;
}

export function MiniBoard({ fen, orientation = 'white', boardStyleId }: MiniBoardProps) {
  const theme = getBoardTheme(boardStyleId);
  const useCustomPieces = boardStyleId !== 'lichess';
  return (
    <div style={{ width: 140, height: 140 }}>
      <Chessboard
        id={`mini-${fen}`}
        position={fen}
        boardOrientation={orientation}
        customDarkSquareStyle={{ backgroundColor: theme.dark }}
        customLightSquareStyle={{ backgroundColor: theme.light }}
        customBoardStyle={{ borderRadius: '10px', boxShadow: '0 6px 16px rgba(0,0,0,0.35)' }}
        customArrowColor={theme.arrow}
        customArrows={[]}
        customSquareStyles={{}}
        customPieces={useCustomPieces ? chesscomPieces : undefined}
        arePiecesDraggable={false}
        animationDuration={0}
        boardWidth={140}
        snapToCursor={false}
        clearPremovesOnRightClick={false}
        areArrowsAllowed={false}
        arePremovesAllowed={false}
        onPieceDrop={() => false}
        onSquareClick={() => {}}
        onDragOverSquare={() => {}}
        onMouseOverSquare={() => {}}
        onMouseOutSquare={() => {}}
      />
    </div>
  );
}
