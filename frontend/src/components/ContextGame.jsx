import { ArrowLeft, Flag, Loader2, RotateCcw, Send, Sparkles } from 'lucide-react';
import { useContextGame } from '../hooks/useContextGame';

function getRankClass(rank) {
  if (rank < 100) return 'context-rank context-rank--green';
  if (rank < 500) return 'context-rank context-rank--yellow';
  return 'context-rank context-rank--red';
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
        <div className="context-topbar">
          <button type="button" onClick={onBack} className="icon-button cursor-target" title="Артқа">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2>Контекст</h2>
            <p>Сөздерді мағынасы бойынша жақындатып табыңыз.</p>
          </div>
        </div>

        {!sessionId ? (
          <div className="context-start">
            <Sparkles className="w-10 h-10" />
            <p>Жасырын сөз рейтингте #1. Әр енгізген сөзіңізге тек rank көрсетіледі.</p>
            <button type="button" onClick={startGame} disabled={isLoading} className="primary-action cursor-target">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Контекст бастау</span>
            </button>
          </div>
        ) : (
          <>
            <form className="context-form" onSubmit={handleSubmit}>
              <input
                value={currentWord}
                onChange={(event) => setCurrentWord(event.target.value)}
                disabled={isLoading || solved || Boolean(answer)}
                placeholder="Сөз енгізіңіз"
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={isLoading || solved || Boolean(answer) || !currentWord.trim()}
                className="primary-action cursor-target"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Жіберу</span>
              </button>
            </form>

            <div className="context-actions">
              <span>{total ? `${total} сөз рейтингте` : 'Рейтинг дайын'}</span>
              <button type="button" onClick={giveUp} disabled={isLoading || Boolean(answer)} className="danger-action cursor-target">
                <Flag className="w-4 h-4" />
                <span>Сдаться</span>
              </button>
              <button type="button" onClick={handleRestart} disabled={isLoading} className="primary-action cursor-target">
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

            <div className="context-attempts">
              {attempts.length === 0 ? (
                <p className="context-empty">Алғашқы сөзіңізді енгізіңіз.</p>
              ) : (
                attempts.map((attempt, index) => (
                  <div key={`${attempt.word}-${index}`} className="context-attempt">
                    <span>{attempt.word}</span>
                    <strong className={getRankClass(attempt.rank)}>#{attempt.rank}</strong>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </section>

      {errorMessage && <div className="error-toast">{errorMessage}</div>}
    </main>
  );
}
