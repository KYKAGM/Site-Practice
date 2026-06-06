import { BookOpen, Play, Sparkles } from 'lucide-react';

export default function LengthSelector({ onSelect, isLoading }) {
  return (
    <section className="start-panel">
      <div className="start-panel__intro">
        <div className="intro-icon">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2>Сөз ұзындығын таңдаңыз</h2>
        <p>Жасырын қазақ сөзін алты әрекетте табыңыз. Әр жауаптан кейін торкөздер қаншалықты жақын екеніңізді көрсетеді.</p>
      </div>

      <div className="length-grid">
        {[2, 3, 4, 5, 6, 7, 8].map((length) => (
          <button
            key={length}
            type="button"
            onClick={() => onSelect(length)}
            disabled={isLoading}
            className="length-card cursor-target"
          >
            <span className="length-card__number">{length}</span>
            <span className="length-card__label">әріп</span>
            <Play className="length-card__icon" />
          </button>
        ))}
      </div>

      <div className="ai-note">
        <Sparkles className="w-4 h-4" />
        <span>Ойын кезінде екі ақылды кеңес алуға болады.</span>
      </div>
    </section>
  );
}
