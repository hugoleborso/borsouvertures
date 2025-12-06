import { useMemo } from 'react';
import { MiniBoard } from '@/components/MiniBoard';
import { SelectorPanel } from '@/components/SelectorPanel';
import { ALL_KEY, type Selection } from '@/openings/selectors';
import type { Opening } from '@/openings/types';
import { buildLinePreview, buildOpeningPreview, buildVariationPreview } from '@/openings/previews';
import type { BoardThemeId } from '@/state/useAppState';

interface OpeningFlowSelectorProps {
  openings: Opening[];
  selection: Selection;
  onChange: (selection: Selection) => void;
  boardStyle: BoardThemeId;
}

export function OpeningFlowSelector({ openings, selection, onChange, boardStyle }: OpeningFlowSelectorProps) {
  const { openingId, variationId, lineId } = selection;

  const openingPreviews = useMemo(() => openings.map((o) => buildOpeningPreview(o)), [openings]);
  const variationPreviews = useMemo(() => {
    const opening = openings.find((o) => o.id === openingId);
    if (!opening) return [];
    return opening.variations.map((v) => buildVariationPreview(opening, v));
  }, [openings, openingId]);
  const linePreviews = useMemo(() => {
    const opening = openings.find((o) => o.id === openingId);
    const variation = opening?.variations.find((v) => v.id === variationId);
    if (!opening || !variation) return [];
    return variation.lines.map((l) => buildLinePreview(opening, variation, l));
  }, [openings, openingId, variationId]);

  const selectedOpening = openings.find((o) => o.id === openingId);
  const selectedVariation = selectedOpening?.variations.find((v) => v.id === variationId);

  const allLines =
    variationId === ALL_KEY && selectedOpening
      ? selectedOpening.variations.flatMap((v) => v.lines)
      : selectedVariation?.lines ?? [];

  return (
    <div className="selector-columns">
      <SelectorPanel title="Openings">
        <SelectorCard
          label="All openings"
          meta={`${openings.length} families`}
          active={openingId === ALL_KEY}
          onClick={() => onChange({ openingId: ALL_KEY, variationId: ALL_KEY, lineId: ALL_KEY })}
        />
        {openings.map((opening) => {
          const preview = openingPreviews.find((p) => p.openingId === opening.id);
          return (
            <SelectorCard
              key={opening.id}
              label={opening.name}
              meta={`${opening.variations.length} variations`}
              active={openingId === opening.id}
              onClick={() =>
                onChange({
                  openingId: opening.id,
                  variationId: ALL_KEY,
                  lineId: ALL_KEY
                })
              }
              board={preview?.fen ? <MiniBoard fen={preview.fen} boardStyleId={boardStyle} /> : undefined}
            />
          );
        })}
      </SelectorPanel>

      <SelectorPanel title="Variations">
        <SelectorCard
          label="All variations"
          meta={selectedOpening ? `${selectedOpening.variations.length} total` : '—'}
          active={variationId === ALL_KEY}
          disabled={!selectedOpening && openingId !== ALL_KEY}
          onClick={() =>
            onChange({
              openingId,
              variationId: ALL_KEY,
              lineId: ALL_KEY
            })
          }
        />
        {selectedOpening &&
          selectedOpening.variations.map((variation) => {
            const preview = variationPreviews.find(
              (p) => p.openingId === selectedOpening.id && p.variationId === variation.id
            );
            return (
              <SelectorCard
                key={variation.id}
                label={variation.name}
                meta={`${variation.lines.length} lines`}
                active={variationId === variation.id}
                onClick={() =>
                  onChange({
                    openingId,
                    variationId: variation.id,
                    lineId: ALL_KEY
                  })
                }
                board={preview?.fen ? <MiniBoard fen={preview.fen} boardStyleId={boardStyle} /> : undefined}
              />
            );
          })}
      </SelectorPanel>

      <SelectorPanel title="Lines">
        <SelectorCard
          label="All lines"
          meta={selectedVariation ? `${selectedVariation.lines.length} lines` : selectedOpening ? `${allLines.length} lines` : '—'}
          active={lineId === ALL_KEY}
          disabled={!selectedOpening && openingId !== ALL_KEY}
          onClick={() =>
            onChange({
              openingId,
              variationId,
              lineId: ALL_KEY
            })
          }
        />
        {selectedVariation &&
          selectedVariation.lines.map((line) => {
            const preview = linePreviews.find((p) => p.lineId === line.id);
            return (
              <SelectorCard
                key={line.id}
                label={line.name}
                meta={`ECO ${line.eco}`}
                active={lineId === line.id}
                onClick={() =>
                  onChange({
                    openingId,
                    variationId,
                    lineId: line.id
                  })
                }
                board={preview?.fen ? <MiniBoard fen={preview.fen} boardStyleId={boardStyle} /> : undefined}
              />
            );
          })}
      </SelectorPanel>
    </div>
  );
}

interface SelectorCardProps {
  label: string;
  meta?: string;
  board?: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

function SelectorCard({ label, meta, board, active, disabled, onClick }: SelectorCardProps) {
  return (
    <div
      className={`selector-card ${active ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
      style={disabled ? { opacity: 0.5, pointerEvents: 'none' } : undefined}
      onClick={onClick}
    >
      {board}
      <div>
        <div className="title">{label}</div>
        {meta && <div className="meta">{meta}</div>}
      </div>
    </div>
  );
}
