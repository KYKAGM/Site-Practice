/**
 * API client for the Kazakh Wordle game backend.
 */

const BASE_URL = '/api/game';

export const gameApi = {
  /**
   * Starts a new game session
   * @param {number} wordLength - The length of the word (4, 5, or 6)
   */
  async startGame(wordLength) {
    const response = await fetch(`${BASE_URL}/start/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ word_length: wordLength }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Ойынды бастау мүмкін болмады');
    }
    
    return response.json();
  },

  /**
   * Submits a guess for the current session
   * @param {number} sessionId - The session ID
   * @param {string} guess - The guessed word
   */
  async submitGuess(sessionId, guess) {
    const response = await fetch(`${BASE_URL}/guess/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ session_id: sessionId, guess }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Болжамды жіберу мүмкін болмады');
    }
    
    return response.json();
  },

  /**
   * Requests a hint for the current session
   * @param {number} sessionId - The session ID
   */
  async getHint(sessionId) {
    const response = await fetch(`${BASE_URL}/hint/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ session_id: sessionId }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Кеңес алу мүмкін болмады');
    }
    
    return response.json();
  },

  /**
   * Validates if a word exists in the dictionary
   * @param {string} word - The word to validate
   * @param {number} length - The word length
   */
  async validateWord(word, length) {
    const response = await fetch(`${BASE_URL}/validate-word/?word=${encodeURIComponent(word)}&length=${length}`);
    if (!response.ok) {
      return { valid: false };
    }
    return response.json();
  }
};
