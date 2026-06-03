const BASE_URL = '/api/game';

async function parseError(response, fallback) {
  const errorData = await response.json().catch(() => ({}));
  throw new Error(errorData.error || fallback);
}

export const gameApi = {
  async startGame(wordLength) {
    const response = await fetch(`${BASE_URL}/start/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word_length: wordLength }),
    });

    if (!response.ok) {
      await parseError(response, 'Ойынды бастау мүмкін болмады');
    }

    return response.json();
  },

  async submitGuess(sessionId, guess) {
    const response = await fetch(`${BASE_URL}/guess/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, guess }),
    });

    if (!response.ok) {
      await parseError(response, 'Жауапты жіберу мүмкін болмады');
    }

    return response.json();
  },

  async getHint(sessionId) {
    const response = await fetch(`${BASE_URL}/hint/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId }),
    });

    if (!response.ok) {
      await parseError(response, 'Кеңес алу мүмкін болмады');
    }

    return response.json();
  },

  async giveUp(sessionId) {
    const response = await fetch(`${BASE_URL}/give-up/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId }),
    });

    if (!response.ok) {
      await parseError(response, 'Ойынды аяқтау мүмкін болмады');
    }

    return response.json();
  },

  async validateWord(word, length) {
    const response = await fetch(`${BASE_URL}/validate-word/?word=${encodeURIComponent(word)}&length=${length}`);
    if (!response.ok) {
      return { valid: false };
    }
    return response.json();
  }
};
