import type { Side } from '@/state/useAppState';

interface SideSelectorProps {
  value: Side;
  onChange: (side: Side) => void;
}

export function SideSelector({ value, onChange }: SideSelectorProps) {
  return (
    <div className="controls-row">
      <span>Train as:</span>
      <div className="controls-row">
        <button className={`btn ${value === 'white' ? 'active' : ''}`} onClick={() => onChange('white')}>
          White
        </button>
        <button className={`btn ${value === 'black' ? 'active' : ''}`} onClick={() => onChange('black')}>
          Black
        </button>
      </div>
    </div>
  );
}
