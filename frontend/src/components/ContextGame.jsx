import { ArrowLeft, Flag, Loader2, MoreVertical, RotateCcw, Send, Trophy } from 'lucide-react';
import { useContextGame } from '../hooks/useContextGame';

function getRankClass(rank) {
  if (rank < 100) return 'context-attempt context-attempt--green';
  if (rank < 500) return 'context-attempt context-attempt--orange';
  return 'context-attempt context-attempt--pink';
}

function getRankWarmth(rank, total) {
  if (!total) return 0;
  return Math.max(3, Math.round((1 - (rank - 1) / total) * 100));
}

export default function ContextGame({ onBack }) {
  const {
    sessionId,
    attempts,
    currentWord,
    total,
    answer,
    solved,
    isLoading,
    errorMessage,
    setCurrentWord,
    startGame,
    submitGuess,
    giveUp,
    resetGame,
  } = useContextGame();

  const handleSubmit = (event) => {
    event.preventDefault();
    submitGuess();
  };

  const handleRestart = async () => {
    resetGame();
    await startGame();
  };

  return (
    <main className="context-layout">
      <section className="context-panel">
        <header className="context-header">
          <button type="button" onClick={onBack} className="context-icon-button cursor-target" aria-label="Артқа">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="context-brand">
            <span className="context-logo" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <h1>Контекст</h1>
          </div>
          <button type="button" className="context-icon-button cursor-target" aria-label="Меню">
            <MoreVertical className="w-5 h-5" />
          </button>
        </header>

        <div className="context-meta">
          <strong>{new Intl.DateTimeFormat('kk-KZ').format(new Date())}</strong>
          <span>Әрекет: {attempts.length}</span>
          <span>Кеңес: 0</span>
        </div>

        {!sessionId ? (
          <div className="context-start">
            <Trophy className="w-11 h-11" />
            <h2>Жасырын сөзді табыңыз</h2>
            <p>Сөздер мағыналық жақындығына қарай сұрыпталған. #1 - жасырын сөз.</p>
            <button type="button" onClick={startGame} disabled={isLoading} className="context-start-button cursor-target">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Ойынды бастау</span>
            </button>
          </div>
        ) : (
          <>
            <form className="context-form" onSubmit={handleSubmit}>
              <input
                value={currentWord}
                onChange={(event) => setCurrentWord(event.target.value)}
                disabled={isLoading || solved || Boolean(answer)}
                placeholder="сөз енгізіңіз"
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={isLoading || solved || Boolean(answer) || !currentWord.trim()}
                className="context-submit cursor-target"
                aria-label="Жіберу"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </form>

            <div className="context-action-row">
              <button type="button" onClick={giveUp} disabled={isLoading || Boolean(answer)} className="context-secondary cursor-target">
                <Flag className="w-4 h-4" />
                <span>Берілу</span>
              </button>
              <button type="button" onClick={handleRestart} disabled={isLoading} className="context-secondary cursor-target">
                <RotateCcw className="w-4 h-4" />
                <span>Қайта</span>
              </button>
            </div>

            {answer && (
              <div className="context-answer animate-pop">
                <span>{solved ? 'Таптыңыз!' : 'Жасырын сөз'}</span>
                <strong>{answer}</strong>
              </div>
            )}

            {attempts.length === 0 ? (
              <div className="context-empty-state">
                <p>Сөз енгізіңіз. Жақын сөздер ұзын әрі жасыл жолақпен көрінеді.</p>
              </div>
            ) : (
              <div className="context-attempts">
                {attempts.map((attempt, index) => {
                  const warmth = getRankWarmth(attempt.rank, total);
                  return (
                    <div key={`${attempt.word}-${index}`} className={getRankClass(attempt.rank)}>
                      <i className="context-attempt__bar" style={{ width: `${warmth}%` }} />
                      <div className="context-attempt__content">
                        <span>{attempt.word}</span>
                        <strong>{attempt.rank}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {errorMessage && <div className="context-error">{errorMessage}</div>}
      </section>
    </main>
  );
}
