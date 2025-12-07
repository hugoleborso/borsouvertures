import { useEffect, useState } from 'react';
import { ChessboardDnDProvider } from 'react-chessboard';
import { TopBar } from '@/components/TopBar';
import { OpeningFlowSelector } from '@/components/OpeningFlowSelector';
import { SideSelector } from '@/components/SideSelector';
import { ModeLearn } from '@/modes/ModeLearn';
import { ModePlay } from '@/modes/ModePlay';
import { useAppState } from '@/state/useAppState';
import { ALL_KEY, type Selection } from '@/openings/selectors';
import { loadOpenings } from '@/openings/loadOpenings';
import { findLine, findOpening, findVariation } from '@/openings/selectors';
import { ToggleSlider } from '@/components/ToggleSlider';

export default function App() {
  const {
    mode,
    setMode,
    boardStyle,
    setBoardStyle,
    side,
    setSide,
    selection,
    setSelection,
    openings,
    setOpenings,
    view,
    setView,
    playAutoOpponent,
    setPlayAutoOpponent,
    playScope,
    setPlayScope
  } = useAppState();
  const [loading, setLoading] = useState(true);
  const [showMoves, setShowMoves] = useState(false);

  useEffect(() => {
    loadOpenings()
      .then(setOpenings)
      .finally(() => setLoading(false));
  }, [setOpenings]);

  const selectionWithDefaults: Selection = selection ?? { openingId: ALL_KEY, variationId: ALL_KEY, lineId: ALL_KEY };
  const selectedOpening = findOpening(openings, selectionWithDefaults.openingId);
  const selectedVariation = findVariation(selectedOpening, selectionWithDefaults.variationId);
  const selectedLine = findLine(selectedVariation, selectionWithDefaults.lineId);

  function handleModeChange(nextMode: typeof mode) {
    if (nextMode === 'play' && mode !== 'play') {
      // Reset play scope when leaving Learn to avoid locking Play to the last learned line.
      setPlayScope({ openingIds: [], variationIds: [], lineIds: [] });
      setSelection({ openingId: ALL_KEY, variationId: ALL_KEY, lineId: ALL_KEY });
    }
    setMode(nextMode);
  }

  return (
    <ChessboardDnDProvider>
      <div className="app-shell">
        <TopBar mode={mode} onModeChange={handleModeChange} boardStyle={boardStyle} onBoardStyleChange={setBoardStyle} />

      {view === 'select' && (
        <>
          <div className="panel">
            <SideSelector value={side} onChange={setSide} />
            {mode === 'play' && (
              <div className="controls-row" style={{ marginTop: '0.5rem' }}>
                <ToggleSlider
                  value={playAutoOpponent}
                  onChange={setPlayAutoOpponent}
                  leftLabel="You play both"
                  rightLabel="Auto opponent"
                  ariaLabel="Auto opponent toggle"
                />
              </div>
            )}
          </div>
          <OpeningFlowSelector
            openings={openings}
            selection={selectionWithDefaults}
            onChange={setSelection}
            boardStyle={boardStyle}
            mode={mode}
            playScope={playScope}
            onPlayScopeChange={setPlayScope}
          />
          <div className="panel">
            <button className="btn active" onClick={() => setView('session')}>
              Start session
            </button>
          </div>
        </>
      )}

      {view === 'session' && (
        <>
          <div className="controls-row" style={{ justifyContent: 'space-between' }}>
            <div className="controls-row">
              <button className="btn" onClick={() => setView('select')}>
                Change selection
              </button>
              <ToggleSlider
                value={showMoves}
                onChange={setShowMoves}
                leftLabel="Hide moves"
                rightLabel="Show moves"
                ariaLabel="Show moves toggle"
              />
              {mode === 'play' && (
                <ToggleSlider
                  value={playAutoOpponent}
                  onChange={setPlayAutoOpponent}
                  leftLabel="You play both"
                  rightLabel="Auto opponent"
                  ariaLabel="Auto opponent toggle"
                />
              )}
            </div>
          </div>
          {loading ? (
            <div className="panel">Loading openings...</div>
          ) : mode === 'learn' ? (
            <ModeLearn
              openings={openings}
              selection={selectionWithDefaults}
              side={side}
              boardStyle={boardStyle}
              showMoves={showMoves}
            />
          ) : (
            <ModePlay
              openings={openings}
              selection={selectionWithDefaults}
              side={side}
              boardStyle={boardStyle}
              autoOpponent={playAutoOpponent}
              showMoves={showMoves}
              playScope={playScope}
            />
          )}
        </>
      )}
      </div>
    </ChessboardDnDProvider>
  );
}
