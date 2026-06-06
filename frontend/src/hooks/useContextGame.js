import { useCallback, useEffect, useState } from 'react';
import { contextApi } from '../api/contextApi';

export function useContextGame() {
  const [sessionId, setSessionId] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [currentWord, setCurrentWord] = useState('');
  const [total, setTotal] = useState(null);
  const [answer, setAnswer] = useState(null);
  const [solved, setSolved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (!errorMessage) return undefined;
    const timer = setTimeout(() => setErrorMessage(null), 2400);
    return () => clearTimeout(timer);
  }, [errorMessage]);

  const startGame = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await contextApi.startGame();
      setSessionId(data.session_id);
      setTotal(data.total);
      setAttempts([]);
      setCurrentWord('');
      setAnswer(null);
      setSolved(false);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submitGuess = useCallback(async () => {
    const word = currentWord.trim().toLowerCase();
    if (!sessionId || !word || isLoading || solved || answer) return;

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await contextApi.submitGuess(sessionId, word);
      setAttempts((items) => [{ word, rank: data.rank }, ...items]);
      setTotal(data.total);
      setSolved(data.solved);
      setCurrentWord('');
      if (data.solved) {
        setAnswer(word);
      }
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, currentWord, isLoading, solved, answer]);

  const giveUp = useCallback(async () => {
    if (!sessionId || isLoading || answer) return;

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await contextApi.giveUp(sessionId);
      setAnswer(data.word);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, isLoading, answer]);

  const resetGame = useCallback(() => {
    setSessionId(null);
    setAttempts([]);
    setCurrentWord('');
    setTotal(null);
    setAnswer(null);
    setSolved(false);
    setErrorMessage(null);
  }, []);

  return {
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
  };
}
