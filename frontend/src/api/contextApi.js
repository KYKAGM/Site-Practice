const BASE_URL = '/api/game/context';

async function parseError(response, fallback) {
  const errorData = await response.json().catch(() => ({}));
  throw new Error(errorData.error || fallback);
}

export const contextApi = {
  async startGame() {
    const response = await fetch(`${BASE_URL}/start/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      await parseError(response, 'Контекст ойынын бастау мүмкін болмады');
    }

    return response.json();
  },

  async submitGuess(sessionId, word) {
    const response = await fetch(`${BASE_URL}/guess/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, word }),
    });

    if (!response.ok) {
      await parseError(response, 'Жауапты тексеру мүмкін болмады');
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
      await parseError(response, 'Жасырын сөзді ашу мүмкін болмады');
    }

    return response.json();
  },
};
