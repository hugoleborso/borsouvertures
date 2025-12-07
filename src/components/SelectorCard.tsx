import type { ReactNode } from 'react';

interface SelectorCardProps {
  label: string;
  meta?: string;
  board?: ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export function SelectorCard({ label, meta, board, active, disabled, onClick }: SelectorCardProps) {
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
