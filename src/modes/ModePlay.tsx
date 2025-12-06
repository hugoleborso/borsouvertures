import { useEffect, useMemo, useRef, useState } from 'react';
import { Chess, type Move } from 'chess.js';
import type { Arrow, CustomSquareStyles } from 'react-chessboard/dist/chessboard/types';
import type { Opening } from '@/openings/types';
import { ALL_KEY, findLine, findOpening, findVariation, type Selection } from '@/openings/selectors';
import { BoardView } from '@/components/BoardView';
import { Modal } from '@/components/Modal';
import { StatusPanel } from '@/components/StatusPanel';
import type { BoardThemeId, Side } from '@/state/useAppState';
import { computeBookState } from '@/openings/bookEngine';

interface ModePlayProps {
  openings: Opening[];
  selection: Selection;
  side: Side;
  boardStyle: BoardThemeId;
}

export function ModePlay({ openings, selection, side, boardStyle }: ModePlayProps) {
  const gameRef = useRef(new Chess());
  const [fen, setFen] = useState(gameRef.current.fen());
  const [playedMoves, setPlayedMoves] = useState<string[]>([]);
  const [showOutOfBook, setShowOutOfBook] = useState(false);
  const [arrows, setArrows] = useState<Arrow[]>([]);
  const [highlightSquares, setHighlightSquares] = useState<CustomSquareStyles>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const bookState = useMemo(
    () => computeBookState(openings, selection, playedMoves),
    [openings, selection, playedMoves]
  );

  const selectedLine = useMemo(() => {
    const opening = findOpening(openings, selection.openingId);
    const variation = findVariation(opening, selection.variationId);
    return findLine(variation, selection.lineId);
  }, [openings, selection]);

  useEffect(() => {
    reset();
  }, [selection.openingId, selection.variationId, selection.lineId, side]);

  function reset() {
    gameRef.current = new Chess();
    setFen(gameRef.current.fen());
    setPlayedMoves([]);
    setShowOutOfBook(false);
    setArrows([]);
    setHighlightSquares({});
    setShowSuccess(false);
  }

  function handleMove(sourceSquare: string, targetSquare: string): boolean {
    setHighlightSquares({});
    setArrows([]);
    setShowSuccess(false);
    const move = gameRef.current.move({ from: sourceSquare, to: targetSquare, promotion: 'q' });
    if (!move) return false;

    const moveStr = `${move.from}${move.to}${move.promotion ?? ''}`;
    const nextMoves = [...playedMoves, moveStr];
    const state = computeBookState(openings, selection, nextMoves);

    if (!state.inBook) {
      gameRef.current.undo();
      setShowOutOfBook(true);
      setFen(gameRef.current.fen());
      setPlayedMoves(playedMoves);
      return false;
    }

    setPlayedMoves(nextMoves);
    if (state.atLineEnd) {
      setShowOutOfBook(false);
      setHighlightSquares({});
      setArrows([]);
      setFen(gameRef.current.fen());
      setShowSuccess(true);
      return true;
    }

    setFen(gameRef.current.fen());
    return true;
  }

  const candidateCount = bookState.candidates.length;
  const missingScope =
    selection.lineId === ALL_KEY && selection.variationId === ALL_KEY && selection.openingId === ALL_KEY;

  return (
    <div className="layout">
      <div>
        {missingScope ? (
          <div className="panel">Optionally narrow scope or play any opening.</div>
        ) : null}
        <BoardView
          orientation={side}
          fen={fen}
          onMove={handleMove}
          arrows={arrows}
          highlightSquares={highlightSquares}
          boardStyleId={boardStyle}
        />
      </div>
      <div className="panel">
        <h3>Play within book</h3>
        <p>Stay in-book by matching any candidate line. Request book moves if you go out of book.</p>
        <div className="controls-row">
          <button className="btn" onClick={reset}>
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

      {showOutOfBook && (
        <Modal title="Out of Book" onClose={() => setShowOutOfBook(false)}>
          <div className="controls-row" style={{ justifyContent: 'space-between' }}>
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
          <div className="controls-row" style={{ justifyContent: 'flex-end' }}>
            <button className="btn active" onClick={reset}>
              Play again
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
