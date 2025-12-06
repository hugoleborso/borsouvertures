import { useEffect, useMemo, useRef, useState } from 'react';
import { Chess, type PieceSymbol } from 'chess.js';
import type { Arrow, CustomSquareStyles, Square } from 'react-chessboard/dist/chessboard/types';
import type { Opening } from '@/openings/types';
import { findLine, findOpening, findVariation, ALL_KEY, type Selection } from '@/openings/selectors';
import { BoardView } from '@/components/BoardView';
import { Modal } from '@/components/Modal';
import type { BoardThemeId, Side } from '@/state/useAppState';

interface ModeLearnProps {
  openings: Opening[];
  selection: Selection;
  side: Side;
  boardStyle: BoardThemeId;
}

export function ModeLearn({ openings, selection, side, boardStyle }: ModeLearnProps) {
  const gameRef = useRef(new Chess());
  const [fen, setFen] = useState(gameRef.current.fen());
  const [incorrectArrow, setIncorrectArrow] = useState<Arrow | null>(null);
  const [correctArrow, setCorrectArrow] = useState<Arrow | null>(null);
  const [showIncorrect, setShowIncorrect] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const selectedLine = useMemo(() => {
    const opening = findOpening(openings, selection.openingId);
    const variation = findVariation(opening, selection.variationId);
    return findLine(variation, selection.lineId);
  }, [openings, selection]);

  useEffect(() => {
    resetBoard();
  }, [selectedLine, side]);

  const highlightSquares: CustomSquareStyles =
    incorrectArrow && showIncorrect
      ? {
          [incorrectArrow[0]]: { backgroundColor: 'rgba(255,0,0,0.35)' },
          [incorrectArrow[1]]: { backgroundColor: 'rgba(255,0,0,0.35)' }
        }
      : {};

  function resetBoard() {
    gameRef.current = new Chess();
    setIncorrectArrow(null);
    setCorrectArrow(null);
    setShowIncorrect(false);
    setShowSuccess(false);
    syncToPlayerTurn();
  }

  function syncToPlayerTurn() {
    if (!selectedLine) {
      setFen(gameRef.current.fen());
      return;
    }
    while (gameRef.current.history().length < selectedLine.movesUci.length) {
      const ply = gameRef.current.history().length;
      const isPlayersTurn = (side === 'white' && ply % 2 === 0) || (side === 'black' && ply % 2 === 1);
      if (isPlayersTurn) break;
      applyUci(selectedLine.movesUci[ply]);
    }
    setFen(gameRef.current.fen());
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
    if (nextPly >= selectedLine.movesUci.length) {
      setFen(gameRef.current.fen());
      setShowSuccess(true);
      return true;
    }
    syncToPlayerTurn();

    if (gameRef.current.history().length === selectedLine.movesUci.length) {
      setShowSuccess(true);
    }
    setFen(gameRef.current.fen());
    setIncorrectArrow(null);
    setShowIncorrect(false);
    setCorrectArrow(null);
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
          <div className="controls-row" style={{ justifyContent: 'flex-end' }}>
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
          <div className="controls-row" style={{ justifyContent: 'flex-end' }}>
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
