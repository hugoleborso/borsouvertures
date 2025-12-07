import { useEffect, useMemo, useState } from 'react';
import { MiniBoard } from '@/components/MiniBoard';
import { SelectorCard } from '@/components/SelectorCard';
import { SelectorPanel } from '@/components/SelectorPanel';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { useIsMobile } from '@/hooks/useIsMobile';
import { ALL_KEY, type Selection } from '@/openings/selectors';
import { buildLinePreview, buildOpeningPreview, buildVariationPreview } from '@/openings/previews';
import type { Line, Opening, Variation } from '@/openings/types';
import type { BoardThemeId, Mode, PlayScope } from '@/state/useAppState';

interface OpeningFlowSelectorProps {
  openings: Opening[];
  selection: Selection;
  onChange: (selection: Selection) => void;
  boardStyle: BoardThemeId;
  mode: Mode;
  playScope: PlayScope;
  onPlayScopeChange: (scope: PlayScope) => void;
}

export function OpeningFlowSelector({
  openings,
  selection,
  onChange,
  boardStyle,
  mode,
  playScope,
  onPlayScopeChange
}: OpeningFlowSelectorProps) {
  type PlayLineEntry = { opening: Opening; variation: Variation; line: Line; preview: ReturnType<typeof buildLinePreview> };
  type LearnLineEntry = { line: Line; preview: ReturnType<typeof buildLinePreview> };
  const { openingId, variationId, lineId } = selection;
  const isMobile = useIsMobile();
  const [mobileStep, setMobileStep] = useState<'opening' | 'variation' | 'line'>('opening');
  const PAGE_SIZE = 20;

  const isPlay = mode === 'play';

  const openingPreviews = useMemo(() => new Map(openings.map((o) => [o.id, buildOpeningPreview(o)])), [openings]);

  const selectedOpening = !isPlay ? openings.find((o) => o.id === openingId) : undefined;
  const selectedVariation = !isPlay ? selectedOpening?.variations.find((v) => v.id === variationId) : undefined;

  const openingsForVariations =
    isPlay && playScope.openingIds.length > 0
      ? openings.filter((o) => playScope.openingIds.includes(o.id))
      : !isPlay && selectedOpening
        ? [selectedOpening]
        : openings;

  const variationEntries = useMemo(
    () =>
      openingsForVariations.flatMap((opening) =>
        opening.variations.map((v) => ({
          opening,
          variation: v,
          preview: buildVariationPreview(opening, v)
        }))
      ),
    [openingsForVariations]
  );

  const variationsForLines =
    isPlay && playScope.variationIds.length > 0
      ? variationEntries.filter((ve) => playScope.variationIds.includes(ve.variation.id))
      : variationEntries;

  const lineEntries = useMemo(
    () =>
      variationsForLines.flatMap(({ opening, variation }) =>
        variation.lines.map((line) => ({
          opening,
        variation,
        line,
          preview: buildLinePreview(opening, variation, line)
        }))
      ),
    [variationsForLines]
  );

  const allLines =
    variationId === ALL_KEY && selectedOpening
      ? selectedOpening.variations.flatMap((v) => v.lines)
      : selectedVariation?.lines ?? [];
  const isPlayLineEntry = (entry: PlayLineEntry | LearnLineEntry): entry is PlayLineEntry => 'opening' in entry;

  const openingsPagination = usePaginatedList(openings, PAGE_SIZE);
  const variationsPagination = usePaginatedList(
    isPlay
      ? variationEntries
      : selectedOpening
        ? selectedOpening.variations.map((variation) => ({
            opening: selectedOpening,
            variation,
            preview: buildVariationPreview(selectedOpening, variation)
          }))
        : [],
    PAGE_SIZE
  );
  const linesPagination = usePaginatedList<PlayLineEntry | LearnLineEntry>(
    isPlay
      ? lineEntries
      : selectedOpening && selectedVariation
        ? selectedVariation.lines.map((line) => ({
            line,
            preview: buildLinePreview(selectedOpening, selectedVariation, line)
          }))
        : [],
    PAGE_SIZE
  );

  useEffect(() => {
    openingsPagination.reset();
  }, [openings, playScope.openingIds, mode]);

  useEffect(() => {
    variationsPagination.reset();
  }, [openingId, playScope.openingIds, playScope.variationIds, mode]);

  useEffect(() => {
    linesPagination.reset();
  }, [variationId, playScope.variationIds, playScope.lineIds, mode]);

  const panels = [
    <SelectorPanel title="Openings" key="openings">
        {isPlay && (
          <SelectorCard
            label="All openings"
            meta={`${openings.length} families`}
            active={playScope.openingIds.length === 0}
            onClick={() => {
              onPlayScopeChange({ ...playScope, openingIds: [], variationIds: [], lineIds: [] });
              if (isMobile) setMobileStep('variation');
            }}
          />
        )}
        {openingsPagination.visibleItems.map((opening) => {
          const preview = openingPreviews.get(opening.id);
          const activePlay = playScope.openingIds.includes(opening.id);
          return (
            <SelectorCard
              key={opening.id}
              label={opening.name}
              meta={`${opening.variations.length} variations`}
              active={mode === 'play' ? activePlay : openingId === opening.id}
              onClick={() => {
                if (mode === 'play') {
                  const next = activePlay
                    ? playScope.openingIds.filter((id) => id !== opening.id)
                    : [...playScope.openingIds, opening.id];
                  onPlayScopeChange({ ...playScope, openingIds: next });
                } else {
                  onChange({
                    openingId: opening.id,
                    variationId: ALL_KEY,
                    lineId: ALL_KEY
                  });
                }
                if (isMobile) setMobileStep('variation');
              }}
              board={preview?.fen ? <MiniBoard fen={preview.fen} boardStyleId={boardStyle} /> : undefined}
            />
          );
        })}
        {openingsPagination.hasMore && (
          <div className="controls-row selector-load-more">
            <button className="btn" onClick={openingsPagination.loadMore}>
              Load more
            </button>
          </div>
        )}
      </SelectorPanel>,

    <SelectorPanel title="Variations" key="variations">
        {isPlay && (
          <SelectorCard
            label="All variations"
            meta={`${variationEntries.length} total`}
            active={playScope.variationIds.length === 0}
            onClick={() => {
              onPlayScopeChange({ ...playScope, variationIds: [], lineIds: [] });
              if (isMobile) setMobileStep('line');
            }}
          />
        )}
        {variationsPagination.visibleItems.map(({ opening, variation, preview }) => {
          const activePlay = playScope.variationIds.includes(variation.id);
          return (
            <SelectorCard
              key={`${opening.id}-${variation.id}`}
              label={variation.name}
              meta={`${variation.lines.length} lines`}
              active={mode === 'play' ? activePlay : variationId === variation.id}
              onClick={() => {
                if (mode === 'play') {
                  const nextOpeningIds = playScope.openingIds.includes(opening.id)
                    ? playScope.openingIds
                    : [...playScope.openingIds, opening.id];
                  const nextVariationIds = activePlay
                    ? playScope.variationIds.filter((id) => id !== variation.id)
                    : [...playScope.variationIds, variation.id];
                  onPlayScopeChange({ ...playScope, openingIds: nextOpeningIds, variationIds: nextVariationIds });
                } else {
                  onChange({
                    openingId: opening.id,
                    variationId: variation.id,
                    lineId: ALL_KEY
                  });
                }
                if (isMobile) setMobileStep('line');
              }}
              board={preview?.fen ? <MiniBoard fen={preview.fen} boardStyleId={boardStyle} /> : undefined}
            />
          );
        })}
        {variationsPagination.hasMore && (
          <div className="controls-row selector-load-more">
            <button className="btn" onClick={variationsPagination.loadMore}>
              Load more
            </button>
          </div>
        )}
      </SelectorPanel>,

    <SelectorPanel title="Lines" key="lines">
        {isPlay && (
          <SelectorCard
            label="All lines"
            meta={`${lineEntries.length} lines`}
            active={(playScope.lineIds?.length ?? 0) === 0}
            onClick={() => {
              onPlayScopeChange({ ...playScope, lineIds: [] });
            }}
          />
        )}
        {linesPagination.visibleItems.map((entry) => {
          const line = entry.line;
          const preview = entry.preview;
          const openingForLine = isPlayLineEntry(entry) ? entry.opening : undefined;
          const variationForLine = isPlayLineEntry(entry) ? entry.variation : undefined;
          const activePlay = playScope.lineIds?.includes(line.id) ?? false;
          return (
            <SelectorCard
              key={`${preview ? preview.variationId ?? variationId : variationId}-${line.id}`}
              label={line.name}
              meta={`ECO ${line.eco}`}
              active={mode === 'play' ? activePlay : lineId === line.id}
              onClick={() => {
                if (mode === 'play') {
                  const nextOpeningIds =
                    openingForLine && !playScope.openingIds.includes(openingForLine.id)
                      ? [...playScope.openingIds, openingForLine.id]
                      : playScope.openingIds;
                  const nextVariationIds =
                    variationForLine && !playScope.variationIds.includes(variationForLine.id)
                      ? [...playScope.variationIds, variationForLine.id]
                      : playScope.variationIds;
                  const next = activePlay
                    ? (playScope.lineIds ?? []).filter((id) => id !== line.id)
                    : [...(playScope.lineIds ?? []), line.id];
                  onPlayScopeChange({ ...playScope, openingIds: nextOpeningIds, variationIds: nextVariationIds, lineIds: next });
                } else {
                  onChange({
                    openingId,
                    variationId,
                    lineId: line.id
                  });
                }
              }}
              board={preview?.fen ? <MiniBoard fen={preview.fen} boardStyleId={boardStyle} /> : undefined}
            />
          );
        })}
        {linesPagination.hasMore && (
          <div className="controls-row selector-load-more">
            <button className="btn" onClick={linesPagination.loadMore}>
              Load more
            </button>
          </div>
        )}
      </SelectorPanel>
  ];

  if (!isMobile) {
    return <div className="selector-columns">{panels}</div>;
  }

  return (
    <div className="selector-columns">
      <div className="selector-back">
        {mobileStep !== 'opening' && (
          <button className="btn" onClick={() => setMobileStep(mobileStep === 'line' ? 'variation' : 'opening')}>
            Back
          </button>
        )}
      </div>
      {mobileStep === 'opening' && panels[0]}
      {mobileStep === 'variation' && panels[1]}
      {mobileStep === 'line' && panels[2]}
    </div>
  );
}
