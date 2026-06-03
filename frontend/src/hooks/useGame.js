import { useCallback, useEffect, useState } from 'react';
import { gameApi } from '../api/gameApi';

const KAZAKH_LETTER_PATTERN = /^[а-яёәіңғүұқөһ]$/i;

export function useGame() {
  const [sessionId, setSessionId] = useState(null);
  const [wordLength, setWordLength] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [results, setResults] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [usedLetters, setUsedLetters] = useState({});
  const [gameStatus, setGameStatus] = useState('idle');
  const [hintsLeft, setHintsLeft] = useState(2);
  const [currentHint, setCurrentHint] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [answer, setAnswer] = useState(null);
  const [shakeRow, setShakeRow] = useState(false);

  useEffect(() => {
    if (!errorMessage) return undefined;
    const timer = setTimeout(() => setErrorMessage(null), 2200);
    return () => clearTimeout(timer);
  }, [errorMessage]);

  const triggerShake = useCallback(() => {
    setShakeRow(true);
    setTimeout(() => setShakeRow(false), 500);
  }, []);

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

    if (KAZAKH_LETTER_PATTERN.test(key) && currentGuess.length < wordLength) {
      setCurrentGuess((value) => value + key.toLowerCase());
    }
  }, [gameStatus, currentGuess, wordLength, isLoading]);

  const deleteLetter = useCallback(() => {
    if (gameStatus !== 'playing' || isLoading) return;
    setCurrentGuess((value) => value.slice(0, -1));
  }, [gameStatus, isLoading]);

  const submitGuess = useCallback(async () => {
    if (gameStatus !== 'playing' || isLoading) return;

    if (currentGuess.length !== wordLength) {
      setErrorMessage('Әріп саны жеткіліксіз');
      triggerShake();
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const validation = await gameApi.validateWord(currentGuess, wordLength);
      if (!validation.valid) {
        setErrorMessage('Мұндай сөз сөздікте жоқ');
        triggerShake();
        return;
      }

      const data = await gameApi.submitGuess(sessionId, currentGuess);
      const newGuesses = [...guesses, currentGuess];
      const newResults = [...results, data.result];
      const newUsedLetters = { ...usedLetters };

      currentGuess.split('').forEach((char, index) => {
        const letterStatus = data.result[index];
        const currentLetterStatus = newUsedLetters[char];

        if (letterStatus === 'correct') {
          newUsedLetters[char] = 'correct';
        } else if (letterStatus === 'present' && currentLetterStatus !== 'correct') {
          newUsedLetters[char] = 'present';
        } else if (!currentLetterStatus) {
          newUsedLetters[char] = 'absent';
        }
      });

      setGuesses(newGuesses);
      setResults(newResults);
      setUsedLetters(newUsedLetters);
      setCurrentGuess('');

      if (data.is_complete) {
        setAnswer(data.word);
        setGameStatus(data.is_won ? 'won' : 'lost');
      }
    } catch (err) {
      setErrorMessage(err.message);
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, currentGuess, wordLength, guesses, results, usedLetters, gameStatus, isLoading, triggerShake]);

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

  const giveUp = useCallback(async () => {
    if (gameStatus !== 'playing' || isLoading || !sessionId) return;

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await gameApi.giveUp(sessionId);
      setAnswer(data.word);
      setGameStatus('lost');
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [gameStatus, isLoading, sessionId]);

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
    giveUp,
    resetGame
  };
}
