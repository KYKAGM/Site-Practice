import { useState, useCallback, useEffect } from 'react';
import { gameApi } from '../api/gameApi';

export function useGame() {
  const [sessionId, setSessionId] = useState(null);
  const [wordLength, setWordLength] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [results, setResults] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [usedLetters, setUsedLetters] = useState({});
  const [gameStatus, setGameStatus] = useState('idle'); // 'idle' | 'playing' | 'won' | 'lost'
  const [hintsLeft, setHintsLeft] = useState(2);
  const [currentHint, setCurrentHint] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [answer, setAnswer] = useState(null);
  const [shakeRow, setShakeRow] = useState(false);

  // Automatically clear error message after 2 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const selectLength = useCallback(async (length) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await gameApi.startGame(length);
      setSessionId(data.session_id);
      setWordLength(data.word_length);
      setGuesses([]);
      setResults([]);
      setCurrentGuess('');
      setUsedLetters({});
      setHintsLeft(data.max_hints);
      setCurrentHint(null);
      setAnswer(null);
      setGameStatus('playing');
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const typeKey = useCallback((key) => {
    if (gameStatus !== 'playing' || isLoading) return;
    
    // Only allow Kazakh Cyrillic letters (both standard Cyrillic and Kazakh-specific)
    // Kazakh letters: ә, і, ң, ғ, ү, ұ, қ, ө, һ and standard cyrillic
    const isKazakhLetter = /^[а-яёәіңғүұқоһ]$/i.test(key);
    
    if (isKazakhLetter && currentGuess.length < wordLength) {
      setCurrentGuess(prev => prev + key.toLowerCase());
    }
  }, [gameStatus, currentGuess, wordLength, isLoading]);

  const deleteLetter = useCallback(() => {
    if (gameStatus !== 'playing' || isLoading) return;
    setCurrentGuess(prev => prev.slice(0, -1));
  }, [gameStatus, isLoading]);

  const submitGuess = useCallback(async () => {
    if (gameStatus !== 'playing' || isLoading) return;

    if (currentGuess.length !== wordLength) {
      setErrorMessage('Әріптер саны жеткіліксіз');
      setShakeRow(true);
      setTimeout(() => setShakeRow(false), 500);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      // 1. Validate word first
      const valResult = await gameApi.validateWord(currentGuess, wordLength);
      if (!valResult.valid) {
        setErrorMessage('Мұндай сөз сөздікте жоқ');
        setShakeRow(true);
        setTimeout(() => setShakeRow(false), 500);
        setIsLoading(false);
        return;
      }

      // 2. Submit guess
      const data = await gameApi.submitGuess(sessionId, currentGuess);
      
      const newGuesses = [...guesses, currentGuess];
      const newResults = [...results, data.result];
      
      setGuesses(newGuesses);
      setResults(newResults);
      setCurrentGuess('');

      // Update used letters
      const newUsedLetters = { ...usedLetters };
      currentGuess.split('').forEach((char, index) => {
        const letterStatus = data.result[index];
        const currentLetterStatus = newUsedLetters[char];
        
        // Priority order: correct > present > absent
        if (letterStatus === 'correct') {
          newUsedLetters[char] = 'correct';
        } else if (letterStatus === 'present' && currentLetterStatus !== 'correct') {
          newUsedLetters[char] = 'present';
        } else if (!currentLetterStatus) {
          newUsedLetters[char] = 'absent';
        }
      });
      setUsedLetters(newUsedLetters);

      if (data.is_complete) {
        setAnswer(data.word);
        setGameStatus(data.is_won ? 'won' : 'lost');
      }
    } catch (err) {
      setErrorMessage(err.message);
      setShakeRow(true);
      setTimeout(() => setShakeRow(false), 500);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, currentGuess, wordLength, guesses, results, usedLetters, gameStatus, isLoading]);

  const getHint = useCallback(async () => {
    if (gameStatus !== 'playing' || isLoading || hintsLeft <= 0) return;

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await gameApi.getHint(sessionId);
      setCurrentHint(data.hint);
      setHintsLeft(data.hints_left);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, gameStatus, isLoading, hintsLeft]);

  const resetGame = useCallback(() => {
    setSessionId(null);
    setWordLength(null);
    setGuesses([]);
    setResults([]);
    setCurrentGuess('');
    setUsedLetters({});
    setGameStatus('idle');
    setHintsLeft(2);
    setCurrentHint(null);
    setErrorMessage(null);
    setAnswer(null);
  }, []);

  return {
    sessionId,
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
  };
}
