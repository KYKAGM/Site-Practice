export default function LetterTile({ letter, status, reveal, index }) {
  let stateClass = 'tile--empty';
  let animationStyle = {};

  if (reveal) {
    stateClass = `tile--${status || 'absent'}`;
    animationStyle = {
      animationDelay: `${index * 150}ms`,
      animationFillMode: 'forwards'
    };
  } else if (letter) {
    stateClass = 'tile--filled animate-pop';
  }

  return (
    <div className={`letter-tile ${stateClass} ${reveal ? 'animate-flip-tile' : ''}`} style={animationStyle}>
      {letter}
    </div>
  );
}
