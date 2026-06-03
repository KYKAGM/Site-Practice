import { CircleHelp, Settings, Sparkles, Trophy } from 'lucide-react';

export default function Header({ wordLength, hintsLeft, onShowHelp, onToggleSettings, isSettingsOpen }) {
  return (
    <header className="app-header">
      <div className="brand-lockup">
        <div className="brand-mark">
          <Trophy className="w-5 h-5" />
        </div>
        <div>
          <h1>Сөзді тап!</h1>
          <p>Қазақша Wordle</p>
        </div>
      </div>

      <div className="header-actions">
        {wordLength && <span className="status-pill">{wordLength} әріп</span>}

        {hintsLeft !== undefined && (
          <div className="status-pill status-pill--accent">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{hintsLeft}</span>
          </div>
        )}

        <button
          type="button"
          onClick={onToggleSettings}
          className={`icon-button cursor-target${isSettingsOpen ? ' is-active' : ''}`}
          title="Баптаулар"
          aria-label="Баптаулар"
          aria-pressed={isSettingsOpen}
        >
          <Settings className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={onShowHelp}
          className="icon-button cursor-target"
          title="Нұсқаулық"
          aria-label="Нұсқаулық"
        >
          <CircleHelp className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
