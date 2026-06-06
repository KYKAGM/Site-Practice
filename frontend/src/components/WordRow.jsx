import LetterTile from './LetterTile';

export default function WordRow({ guess, result, isCurrent, wordLength, shake }) {
  const tiles = [];
  const displayLength = wordLength || 5;

  for (let i = 0; i < displayLength; i++) {
    const letter = guess ? guess[i] : '';
    const status = result ? result[i] : null;
    
    tiles.push(
      <LetterTile
        key={i}
        letter={letter}
        status={status}
        reveal={!!result}
        index={i}
      />
    );
  }

  return (
    <div className={`word-row ${isCurrent && shake ? 'animate-shake' : ''}`}>
      {tiles}
    </div>
  );
}
