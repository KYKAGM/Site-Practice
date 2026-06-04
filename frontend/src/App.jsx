import { useEffect, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Header from './components/Header';
import LengthSelector from './components/LengthSelector';
import GameBoard from './components/GameBoard';
import Keyboard from './components/Keyboard';
import HintButton from './components/HintButton';
import GameModal from './components/GameModal';
import HelpModal from './components/HelpModal';
import SettingsPanel from './components/SettingsPanel';
import SideRays from './components/SideRays';
import TargetCursor from './components/TargetCursor';
import MainMenu from './components/MainMenu';
import AboutModal from './components/AboutModal';
import { useGame } from './hooks/useGame';

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
    giveUp,
    resetGame
  } = useGame();

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isMainMenuOpen, setIsMainMenuOpen] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('wordle-theme') || 'dark');
  const [accessibilityMode, setAccessibilityMode] = useState(
    () => localStorage.getItem('wordle-accessibility') === 'true'
  );

  useEffect(() => {
    localStorage.setItem('wordle-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('wordle-accessibility', String(accessibilityMode));
  }, [accessibilityMode]);

  return (
    <div className={`app-shell theme-${theme} ${accessibilityMode ? 'mode-colorblind' : ''}`}>
      <SideRays />
      <TargetCursor />

      {!isMainMenuOpen && (
        <Header
          wordLength={wordLength}
          hintsLeft={gameStatus !== 'idle' ? hintsLeft : undefined}
          onShowHelp={() => setIsHelpOpen(true)}
          onToggleSettings={() => setIsSettingsOpen((value) => !value)}
          isSettingsOpen={isSettingsOpen}
        />
      )}

      {isSettingsOpen && (
        <SettingsPanel
          theme={theme}
          accessibilityMode={accessibilityMode}
          onThemeChange={setTheme}
          onAccessibilityChange={setAccessibilityMode}
        />
      )}

      {isMainMenuOpen ? (
        <MainMenu
          onPlayClick={() => setIsMainMenuOpen(false)}
          onAboutClick={() => setIsAboutOpen(true)}
        />
      ) : (
        <main className="game-layout">
          {gameStatus === 'idle' ? (
            <LengthSelector onSelect={selectLength} isLoading={isLoading} />
          ) : (
            <div className="flex-1 flex flex-col justify-between">
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
                    onGiveUp={giveUp}
                    isLoading={isLoading}
                    disabled={gameStatus !== 'playing'}
                  />
                )}
              </div>

              <div className="mt-auto">
                {gameStatus === 'playing' ? (
                  <Keyboard
                    onKey={typeKey}
                    onDelete={deleteLetter}
                    onEnter={submitGuess}
                    usedLetters={usedLetters}
                  />
                ) : (
                  <div className="flex justify-center gap-4 p-6">
                    <button onClick={resetGame} className="primary-action cursor-target">
                      <RefreshCw className="w-4 h-4" />
                      <span>Жаңа ойын</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsMainMenuOpen(true);
                        resetGame();
                      }}
                      className="primary-action bg-slate-700 hover:bg-slate-600 cursor-target"
                    >
                      <span>Негізгі меню</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      )}

      {errorMessage && (
        <div className="error-toast">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      {!isMainMenuOpen && (
        <>
          <GameModal
            status={gameStatus}
            answer={answer}
            guessCount={guesses.length}
            onReset={resetGame}
          />

          <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
        </>
      )}

      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  );
}
