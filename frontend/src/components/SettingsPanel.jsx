import { Eye, Moon, Settings, Sun } from 'lucide-react';

export default function SettingsPanel({ theme, accessibilityMode, onThemeChange, onAccessibilityChange }) {
  return (
    <section className="settings-panel animate-pop" aria-label="Баптаулар">
      <div className="settings-panel__title">
        <Settings className="icon-sm" />
        <span>Баптаулар</span>
      </div>

      <div className="segmented-control" role="group" aria-label="Тақырып">
        <button
          type="button"
          className={theme === 'light' ? 'is-active' : ''}
          onClick={() => onThemeChange('light')}
          title="Жарық тақырып"
          aria-pressed={theme === 'light'}
        >
          <Sun className="icon-sm" />
          <span>Жарық</span>
        </button>
        <button
          type="button"
          className={theme === 'dark' ? 'is-active' : ''}
          onClick={() => onThemeChange('dark')}
          title="Қараңғы тақырып"
          aria-pressed={theme === 'dark'}
        >
          <Moon className="icon-sm" />
          <span>Қараңғы</span>
        </button>
      </div>

      <label className="toggle-row">
        <span className="toggle-row__copy">
          <Eye className="icon-sm" />
          <span>Түсті ажырату режимі</span>
        </span>
        <input
          type="checkbox"
          checked={accessibilityMode}
          onChange={(event) => onAccessibilityChange(event.target.checked)}
        />
      </label>
    </section>
  );
}
