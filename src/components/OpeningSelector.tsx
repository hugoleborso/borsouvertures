import { ALL_KEY, type Selection } from '@/openings/selectors';
import type { Opening } from '@/openings/types';

interface OpeningSelectorProps {
  openings: Opening[];
  selection: Selection;
  onChange: (selection: Selection) => void;
}

export function OpeningSelector({ openings, selection, onChange }: OpeningSelectorProps) {
  const { openingId, variationId, lineId } = selection;
  const selectedOpening = openings.find((o) => o.id === openingId);
  const variations = selectedOpening?.variations ?? [];
  const selectedVariation = variations.find((v) => v.id === variationId);

  const lineCandidates =
    selectedVariation?.lines ??
    (variationId === ALL_KEY && selectedOpening
      ? selectedOpening.variations.flatMap((v) => v.lines)
      : []);

  const handleOpeningChange = (value: string) => {
    const nextOpeningId = value || ALL_KEY;
    onChange({
      openingId: nextOpeningId,
      variationId: ALL_KEY,
      lineId: ALL_KEY
    });
  };

  const handleVariationChange = (value: string) => {
    const nextVariationId = value || ALL_KEY;
    onChange({
      openingId,
      variationId: nextVariationId,
      lineId: ALL_KEY
    });
  };

  const handleLineChange = (value: string) => {
    const nextLineId = value || ALL_KEY;
    onChange({
      openingId,
      variationId,
      lineId: nextLineId
    });
  };

  return (
    <div className="controls-row">
      <div>
        <div>Opening</div>
        <select className="select" value={openingId ?? ALL_KEY} onChange={(e) => handleOpeningChange(e.target.value)}>
          <option value={ALL_KEY}>All openings</option>
          {openings.map((opening) => (
            <option key={opening.id} value={opening.id}>
              {opening.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <div>Variation</div>
        <select
          className="select"
          value={variationId ?? ALL_KEY}
          onChange={(e) => handleVariationChange(e.target.value)}
          disabled={!selectedOpening && openingId !== ALL_KEY}
        >
          <option value={ALL_KEY}>All variations</option>
          {variations.map((variation) => (
            <option key={variation.id} value={variation.id}>
              {variation.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <div>Line</div>
        <select
          className="select"
          value={lineId ?? ALL_KEY}
          onChange={(e) => handleLineChange(e.target.value)}
          disabled={!selectedOpening && openingId !== ALL_KEY}
        >
          <option value={ALL_KEY}>All lines</option>
          {lineCandidates.map((line) => (
            <option key={line.id} value={line.id}>
              {line.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
