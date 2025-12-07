import { useEffect, useMemo, useState } from 'react';
import { type PieceSymbol } from 'chess.js';
import type { Arrow, CustomSquareStyles, Square } from 'react-chessboard/dist/chessboard/types';
import type { Opening } from '@/openings/types';
import { findLine, findOpening, findVariation, ALL_KEY, type Selection } from '@/openings/selectors';
import { BoardView } from '@/components/BoardView';
import { Modal } from '@/components/Modal';
import type { BoardThemeId, Side } from '@/state/useAppState';
import { useBoardSize } from '@/hooks/useBoardSize';
import { useChessGame } from '@/hooks/useChessGame';

interface ModeLearnProps {
  openings: Opening[];
  selection: Selection;
  side: Side;
  boardStyle: BoardThemeId;
  showMoves: boolean;
}

export function ModeLearn({ openings, selection, side, boardStyle, showMoves }: ModeLearnProps) {
  const { gameRef, fen, reset, syncFen } = useChessGame();
  const [incorrectArrow, setIncorrectArrow] = useState<Arrow | null>(null);
  const [correctArrow, setCorrectArrow] = useState<Arrow | null>(null);
  const [showIncorrect, setShowIncorrect] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const boardWidth = useBoardSize();

  const selectedLine = useMemo(() => {
    const opening = findOpening(openings, selection.openingId);
    const variation = findVariation(opening, selection.variationId);
    return findLine(variation, selection.lineId);
  }, [openings, selection]);

  useEffect(() => {
    resetBoard();
  }, [selectedLine, side]);

  useEffect(() => {
    if (!selectedLine) return;
    if (showMoves) {
      const currentPly = gameRef.current.history().length;
      const expectedMove = selectedLine.movesUci[currentPly];
      if (expectedMove) {
        setCorrectArrow([toSquare(expectedMove.slice(0, 2)), toSquare(expectedMove.slice(2, 4))]);
      }
    } else {
      setCorrectArrow(null);
    }
  }, [showMoves, selectedLine]);

  const highlightSquares: CustomSquareStyles =
    incorrectArrow && showIncorrect
      ? {
          [incorrectArrow[0]]: { backgroundColor: 'rgba(255,0,0,0.35)' },
          [incorrectArrow[1]]: { backgroundColor: 'rgba(255,0,0,0.35)' }
        }
      : {};

  function resetBoard() {
    reset();
    setIncorrectArrow(null);
    setCorrectArrow(null);
    setShowIncorrect(false);
    setShowSuccess(false);
    syncToPlayerTurn();
  }

  function syncToPlayerTurn() {
    if (!selectedLine) {
      syncFen();
      return;
    }
    
    // Apply opponent moves with animation
    const applyNextOpponentMove = () => {
      const ply = gameRef.current.history().length;
      
      // Check if we've reached the end or it's the player's turn
      if (ply >= selectedLine.movesUci.length) {
        return;
      }
      
      const isPlayersTurn = (side === 'white' && ply % 2 === 0) || (side === 'black' && ply % 2 === 1);
      if (isPlayersTurn) {
        return;
      }
      
      // Schedule the opponent's move with a delay for animation
      // The key is to apply the move INSIDE setTimeout, not before it
      setTimeout(() => {
        applyUci(selectedLine.movesUci[ply]);
        syncFen();
        
        // Continue with next opponent move if needed
        applyNextOpponentMove();
      }, 250);
    };
    
    // Start applying opponent moves
    applyNextOpponentMove();
  }

  function applyUci(uci: string) {
    const from = uci.slice(0, 2);
    const to = uci.slice(2, 4);
    const promotion = (uci.slice(4) || undefined) as PieceSymbol | undefined;
    gameRef.current.move({ from, to, promotion });
  }

  function handleMove(sourceSquare: string, targetSquare: string): boolean {
    if (!selectedLine) return false;
    const currentPly = gameRef.current.history().length;
    const expectedMove = selectedLine.movesUci[currentPly];
    const attemptedUci = `${sourceSquare}${targetSquare}`;
    const needsPromotion = expectedMove?.length === 5 ? expectedMove[4] : '';
    const attemptedFull = attemptedUci + needsPromotion;

    if (attemptedFull !== expectedMove) {
      setIncorrectArrow([toSquare(sourceSquare), toSquare(targetSquare)]);
      setShowIncorrect(true);
      return false;
    }

    applyUci(expectedMove);
    const nextPly = gameRef.current.history().length;
    
    // Clear visual states
    setIncorrectArrow(null);
    setShowIncorrect(false);
    setCorrectArrow(null);
    
    if (nextPly >= selectedLine.movesUci.length) {
      syncFen();
      setShowSuccess(true);
      return true;
    }
    
    // Sync the player's move first, THEN schedule opponent moves
    syncFen();
    syncToPlayerTurn();

    if (gameRef.current.history().length === selectedLine.movesUci.length) {
      setShowSuccess(true);
    }
    return true;
  }

  const missingLine = !selectedLine || selection.lineId === ALL_KEY;

  return (
    <div className="layout">
      <div>
        {missingLine ? (
          <div className="panel">Select a specific line to start Learn mode.</div>
        ) : (
          <BoardView
            orientation={side}
            fen={fen}
            onMove={handleMove}
            arrows={[correctArrow ?? undefined].filter(Boolean) as Arrow[]}
            highlightSquares={highlightSquares}
            boardStyleId={boardStyle}
            boardWidth={boardWidth}
          />
        )}
      </div>
      <div className="panel">
        <h3>Instructions</h3>
        <p>Play the next book move. Incorrect moves will be reverted; you can reveal the correct move.</p>
        <button className="btn" onClick={resetBoard}>
          Reset line
        </button>
      </div>

      {showIncorrect && (
        <Modal title="Incorrect Move" onClose={() => setShowIncorrect(false)}>
          <div className="controls-row modal-actions">
            <button className="btn" onClick={() => setShowIncorrect(false)}>
              Try Again
            </button>
            <button
              className="btn active"
              onClick={() => {
                if (selectedLine) {
                  const expectedMove = selectedLine.movesUci[gameRef.current.history().length];
                  if (expectedMove) {
                    setCorrectArrow([toSquare(expectedMove.slice(0, 2)), toSquare(expectedMove.slice(2, 4))]);
                  }
                }
                setShowIncorrect(false);
              }}
            >
              Show Correct Move
            </button>
          </div>
        </Modal>
      )}

      {showSuccess && (
        <Modal title="Line completed successfully!" onClose={() => setShowSuccess(false)}>
          <div className="controls-row modal-actions">
            <button className="btn active" onClick={resetBoard}>
              Replay line
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function toSquare(value: string): Square {
  if (!/^[a-h][1-8]$/.test(value)) {
    throw new Error(`Invalid square: ${value}`);
  }
  return value as Square;
}
