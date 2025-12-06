import { useEffect, useState } from 'react';
import { TopBar } from '@/components/TopBar';
import { OpeningFlowSelector } from '@/components/OpeningFlowSelector';
import { SideSelector } from '@/components/SideSelector';
import { ModeLearn } from '@/modes/ModeLearn';
import { ModePlay } from '@/modes/ModePlay';
import { useAppState } from '@/state/useAppState';
import { ALL_KEY, type Selection } from '@/openings/selectors';
import { loadOpenings } from '@/openings/loadOpenings';

export default function App() {
  const { mode, setMode, boardStyle, setBoardStyle, side, setSide, selection, setSelection, openings, setOpenings } =
    useAppState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOpenings()
      .then(setOpenings)
      .finally(() => setLoading(false));
  }, [setOpenings]);

  const selectionWithDefaults: Selection = selection ?? { openingId: ALL_KEY, variationId: ALL_KEY, lineId: ALL_KEY };

  return (
    <div className="app-shell">
      <TopBar mode={mode} onModeChange={setMode} boardStyle={boardStyle} onBoardStyleChange={setBoardStyle} />

      <div className="panel">
        <SideSelector value={side} onChange={setSide} />
      </div>

      <OpeningFlowSelector
        openings={openings}
        selection={selectionWithDefaults}
        onChange={setSelection}
        boardStyle={boardStyle}
      />

      {loading ? (
        <div className="panel">Loading openings...</div>
      ) : mode === 'learn' ? (
        <ModeLearn openings={openings} selection={selectionWithDefaults} side={side} boardStyle={boardStyle} />
      ) : (
        <ModePlay openings={openings} selection={selectionWithDefaults} side={side} boardStyle={boardStyle} />
      )}
    </div>
  );
}
