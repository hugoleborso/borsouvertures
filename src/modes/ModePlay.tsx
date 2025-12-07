import { useEffect, useMemo, useState } from 'react';
import type { Arrow, CustomSquareStyles } from 'react-chessboard/dist/chessboard/types';
import type { Opening } from '@/openings/types';
import { ALL_KEY, type Selection } from '@/openings/selectors';
import { BoardView } from '@/components/BoardView';
import { Modal } from '@/components/Modal';
import { StatusPanel } from '@/components/StatusPanel';
import type { BoardThemeId, Side } from '@/state/useAppState';
import { computeBookState } from '@/openings/bookEngine';
import { useBoardSize } from '@/hooks/useBoardSize';
import { useChessGame } from '@/hooks/useChessGame';

interface ModePlayProps {
  openings: Opening[];
  selection: Selection;
  side: Side;
  boardStyle: BoardThemeId;
  autoOpponent: boolean;
  showMoves: boolean;
  playScope: { openingIds: string[]; variationIds: string[]; lineIds?: string[] };
}

export function ModePlay({ openings, selection, side, boardStyle, autoOpponent, showMoves, playScope }: ModePlayProps) {
  const { gameRef, fen, reset, syncFen } = useChessGame();
  const [playedMoves, setPlayedMoves] = useState<string[]>([]);
  const [showOutOfBook, setShowOutOfBook] = useState(false);
  const [arrows, setArrows] = useState<Arrow[]>([]);
  const [highlightSquares, setHighlightSquares] = useState<CustomSquareStyles>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const boardWidth = useBoardSize();

  const bookState = useMemo(
    () => computeBookState(openings, selection, playedMoves, playScope),
    [openings, selection, playedMoves, playScope]
  );

  useEffect(() => {
    resetGame();
  }, [selection.openingId, selection.variationId, selection.lineId, side]);

  function resetGame() {
    reset();
    setPlayedMoves([]);
    setShowOutOfBook(false);
    setArrows([]);
    setHighlightSquares({});
    setShowSuccess(false);
  }

  useEffect(() => {
    if (showMoves && bookState.inBook) {
      const nextArrows = bookState.possibleNextMovesUci.map((uci) => [uci.slice(0, 2), uci.slice(2, 4)] as Arrow);
      setArrows(nextArrows);
    } else if (!showMoves) {
      setArrows([]);
    }
  }, [showMoves, bookState]);

  function handleMove(sourceSquare: string, targetSquare: string): boolean {
    setHighlightSquares({});
    setArrows([]);
    setShowSuccess(false);
    const move = gameRef.current.move({ from: sourceSquare, to: targetSquare, promotion: 'q' });
    if (!move) return false;

    const moveStr = `${move.from}${move.to}${move.promotion ?? ''}`;
    const nextMoves = [...playedMoves, moveStr];
    const state = computeBookState(openings, selection, nextMoves, playScope);

    if (!state.inBook) {
      gameRef.current.undo();
      setShowOutOfBook(true);
      syncFen();
      setPlayedMoves(playedMoves);
      return false;
    }

    setPlayedMoves(nextMoves);
    if (state.atLineEnd) {
      setShowOutOfBook(false);
      setHighlightSquares({});
      setArrows([]);
      syncFen();
      setShowSuccess(true);
      return true;
    }

    if (autoOpponent && state.inBook && state.candidates.length > 0) {
      const candidate = state.candidates[0];
      const ply = nextMoves.length;
      const isOppTurn = (side === 'white' && ply % 2 === 1) || (side === 'black' && ply % 2 === 0);
      const opponentMove = candidate.line.movesUci[ply];
      if (isOppTurn && opponentMove) {
        setTimeout(() => {
          gameRef.current.move({
            from: opponentMove.slice(0, 2),
            to: opponentMove.slice(2, 4),
            promotion: opponentMove.slice(4) || undefined
          });
          setPlayedMoves((prev) => [...prev, opponentMove]);
          syncFen();
        }, 200);
      }
    }

    syncFen();
    return true;
  }

  const candidateCount = bookState.candidates.length;
  const missingScope =
    selection.lineId === ALL_KEY && selection.variationId === ALL_KEY && selection.openingId === ALL_KEY;

  return (
    <div className="play-grid">
      <div className="board-area">
        <BoardView
          orientation={side}
          fen={fen}
          onMove={handleMove}
          arrows={arrows}
          highlightSquares={highlightSquares}
          boardStyleId={boardStyle}
          boardWidth={boardWidth}
        />
      </div>
      <div className="play-aside">
        <div className="panel">
          <h3>Play within book</h3>
          <p>Stay in-book by matching any candidate line. Request book moves if you go out of book.</p>
          <div className="controls-row">
            <button className="btn" onClick={resetGame}>
              Reset game
            </button>
          </div>
        </div>
        <StatusPanel
          inBook={bookState.inBook}
          candidateCount={candidateCount}
          openingName={bookState.uniqueOpening?.name}
          variationName={bookState.uniqueVariation?.name}
          lineName={bookState.uniqueLine?.name}
        />
      </div>

      {showOutOfBook && (
        <Modal title="Out of Book" onClose={() => setShowOutOfBook(false)}>
          <div className="controls-row modal-actions between">
            <button
              className="btn"
              onClick={() => {
                setShowOutOfBook(false);
              }}
            >
              Try Again
            </button>
            <button
              className="btn active"
              onClick={() => {
                const nextArrows = bookState.possibleNextMovesUci.map(
                  (uci) => [uci.slice(0, 2), uci.slice(2, 4)] as Arrow
                );
                setArrows(nextArrows);
                setShowOutOfBook(false);
              }}
            >
              Show Book Moves
            </button>
          </div>
        </Modal>
      )}

      {showSuccess && (
        <Modal title="You reached the end of the line!" onClose={() => setShowSuccess(false)}>
          <div className="controls-row modal-actions">
            <button className="btn active" onClick={resetGame}>
              Play again
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
