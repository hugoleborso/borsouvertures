import type { ReactNode } from 'react';

interface SelectorPanelProps {
  title: string;
  children: ReactNode;
}

export function SelectorPanel({ title, children }: SelectorPanelProps) {
  return (
    <div className="panel selector-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
      </div>
      <div className="selector-list">{children}</div>
    </div>
  );
}
