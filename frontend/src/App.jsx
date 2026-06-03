import React, { useState } from 'react';
import Header from './components/Header';
import LengthSelector from './components/LengthSelector';
import GameBoard from './components/GameBoard';
import Keyboard from './components/Keyboard';
import HintButton from './components/HintButton';
import GameModal from './components/GameModal';
import HelpModal from './components/HelpModal';
import { useGame } from './hooks/useGame';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default function App() {
  const {
    wordLength,
    guesses,
    results,
    currentGuess,
    usedLetters,
    gameStatus,
    hintsLeft,
    currentHint,
    isLoading,
    errorMessage,
    answer,
    shakeRow,
    selectLength,
    typeKey,
    deleteLetter,
    submitGuess,
    getHint,
    resetGame
  } = useGame();

  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-slate-950 text-slate-100">
      {/* Dynamic blurred radial glows for high aesthetic premium feel */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 left-1/4 w-[350px] h-[350px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <Header 
        wordLength={wordLength} 
        hintsLeft={gameStatus !== 'idle' ? hintsLeft : undefined}
        onShowHelp={() => setIsHelpOpen(true)}
      />

      <main className="flex-1 flex flex-col justify-between max-w-lg w-full mx-auto pb-6 relative z-10">
        {gameStatus === 'idle' ? (
          <LengthSelector onSelect={selectLength} isLoading={isLoading} />
        ) : (
          <div className="flex-1 flex flex-col justify-between">
            {/* Game Board Section */}
            <div className="flex-1 flex flex-col justify-center py-2">
              <GameBoard
                guesses={guesses}
                results={results}
                currentGuess={currentGuess}
                wordLength={wordLength}
                shake={shakeRow}
              />
              
              {gameStatus === 'playing' && (
                <HintButton
                  hintsLeft={hintsLeft}
                  hint={currentHint}
                  onHint={getHint}
                  isLoading={isLoading}
                  disabled={gameStatus !== 'playing'}
                />
              )}
            </div>

            {/* Keyboard Section */}
            <div className="mt-auto">
              {gameStatus === 'playing' ? (
                <Keyboard
                  onKey={typeKey}
                  onDelete={deleteLetter}
                  onEnter={submitGuess}
                  usedLetters={usedLetters}
                />
              ) : (
                <div className="flex justify-center p-6">
                  <button
                    onClick={resetGame}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl text-indigo-300 font-bold transition-all hover:bg-slate-850"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Жаңа ойын бастау</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Floating Error Toast */}
      {errorMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-950/90 border border-red-500/30 text-red-200 px-4 py-2.5 rounded-xl shadow-lg shadow-red-950/20 flex items-center gap-2 text-sm animate-pop">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      {/* Modals */}
      <GameModal
        status={gameStatus}
        answer={answer}
        guessCount={guesses.length}
        onReset={resetGame}
      />

      <HelpModal 
        isOpen={isHelpOpen} 
        onClose={() => setIsHelpOpen(false)} 
      />
    </div>
  );
}
