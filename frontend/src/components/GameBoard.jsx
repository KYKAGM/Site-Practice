import WordRow from './WordRow';

export default function GameBoard({ guesses, results, currentGuess, wordLength, shake }) {
  const rows = [];
  const maxGuesses = 6;

  for (let i = 0; i < maxGuesses; i++) {
    if (i < guesses.length) {
      rows.push(
        <WordRow
          key={i}
          guess={guesses[i]}
          result={results[i]}
          isCurrent={false}
          wordLength={wordLength}
        />
      );
    } else if (i === guesses.length) {
      rows.push(
        <WordRow
          key={i}
          guess={currentGuess}
          result={null}
          isCurrent={true}
          wordLength={wordLength}
          shake={shake}
        />
      );
    } else {
      rows.push(
        <WordRow
          key={i}
          guess=""
          result={null}
          isCurrent={false}
          wordLength={wordLength}
        />
      );
    }
  }

  return (
    <div
      className="game-board"
      style={{ '--word-length': wordLength || 5 }}
    >
      {rows}
    </div>
  );
}
