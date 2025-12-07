import { boardThemes } from '@/theme/boardThemes';
import type { BoardThemeId, Mode } from '@/state/useAppState';
import { ToggleSlider } from '@/components/ToggleSlider';

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
        <ToggleSlider
          value={mode === 'play'}
          onChange={(isPlay) => onModeChange(isPlay ? 'play' : 'learn')}
          leftLabel="Learn"
          rightLabel="Play"
          ariaLabel="Toggle mode"
        />
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
