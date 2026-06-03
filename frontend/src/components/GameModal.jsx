import { Frown, RefreshCw, Trophy } from 'lucide-react';

export default function GameModal({ status, answer, guessCount, onReset }) {
  if (status !== 'won' && status !== 'lost') return null;

  const isWon = status === 'won';

  return (
    <div className="modal-backdrop animate-fade-in">
      <div className="modal-panel modal-panel--center animate-pop">
        <div className={`result-icon ${isWon ? 'result-icon--won' : 'result-icon--lost'}`}>
          {isWon ? <Trophy className="w-12 h-12" /> : <Frown className="w-12 h-12" />}
        </div>

        <h2>{isWon ? 'Жеңіс!' : 'Ойын аяқталды'}</h2>
        <p className="result-subtitle">
          {isWon ? `Сөзді ${guessCount} әрекетте таптыңыз.` : 'Бұл жолы сөз табылмады.'}
        </p>

        <div className="answer-card">
          <span>Жасырын сөз</span>
          <strong>{answer}</strong>
        </div>

        <button type="button" onClick={onReset} className="primary-action cursor-target">
          <RefreshCw className="w-4 h-4" />
          <span>Қайта ойнау</span>
        </button>
      </div>
    </div>
  );
}
