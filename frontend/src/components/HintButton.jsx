import { Flag, Loader2, Sparkles } from 'lucide-react';

export default function HintButton({ hintsLeft, hint, onHint, onGiveUp, isLoading, disabled }) {
  return (
    <div className="hint-area">
      <div className="game-actions">
        <button
          type="button"
          onClick={onHint}
          disabled={disabled || isLoading || hintsLeft <= 0}
          className="primary-action cursor-target"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>Кеңес ({hintsLeft})</span>
        </button>
        <button
          type="button"
          onClick={onGiveUp}
          disabled={disabled || isLoading}
          className="danger-action cursor-target"
        >
          <Flag className="w-4 h-4" />
          <span>Жеңілу</span>
        </button>
      </div>

      {hint && (
        <div className="hint-card animate-pop">
          <h4>
            <Sparkles className="w-3.5 h-3.5" />
            Ақылды кеңес
          </h4>
          <p>«{hint}»</p>
        </div>
      )}
    </div>
  );
}
