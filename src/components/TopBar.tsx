import { boardThemes } from '@/theme/boardThemes';
import type { BoardThemeId, Mode } from '@/state/useAppState';

interface TopBarProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  boardStyle: BoardThemeId;
  onBoardStyleChange: (style: BoardThemeId) => void;
}

export function TopBar({ mode, onModeChange, boardStyle, onBoardStyleChange }: TopBarProps) {
  return (
    <header className="panel controls-row topbar">
      <div className="topbar-left">
        <div className="brand-title">Borsouvertures</div>
        <div className="controls-row">
          <button className={`btn ${mode === 'learn' ? 'active' : ''}`} onClick={() => onModeChange('learn')}>
            Learn
          </button>
          <button className={`btn ${mode === 'play' ? 'active' : ''}`} onClick={() => onModeChange('play')}>
            Play
          </button>
        </div>
      </div>
      <div className="controls-row">
        <span>Board style:</span>
        <select
          className="select"
          value={boardStyle}
          onChange={(e) => onBoardStyleChange(e.target.value as BoardThemeId)}
        >
          {boardThemes.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.name}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}
