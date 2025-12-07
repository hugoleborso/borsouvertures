import { Chessboard } from 'react-chessboard';
import type { BoardOrientation } from 'react-chessboard/dist/chessboard/types';
import { getBoardAppearance } from '@/theme/boardAppearance';
import type { BoardThemeId } from '@/state/useAppState';

interface MiniBoardProps {
  fen: string;
  orientation?: BoardOrientation;
  boardStyleId: BoardThemeId;
}

export function MiniBoard({ fen, orientation = 'white', boardStyleId }: MiniBoardProps) {
  const { theme, customPieces } = getBoardAppearance(boardStyleId);
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
        customPieces={customPieces}
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
