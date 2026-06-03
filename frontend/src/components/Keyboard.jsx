import { useEffect } from 'react';
import { Delete } from 'lucide-react';

const rows = [
  ['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х', 'ә', 'і', 'ң'],
  ['ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э', 'ғ', 'ү', 'ұ'],
  ['ENTER', 'я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю', 'қ', 'ө', 'һ', 'DELETE']
];

export default function Keyboard({ onKey, onDelete, onEnter, usedLetters }) {
  const createRipple = (event) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);

    ripple.className = 'keyboard-ripple';
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;

    button.querySelector('.keyboard-ripple')?.remove();
    button.appendChild(ripple);
    window.setTimeout(() => ripple.remove(), 520);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.repeat) return;

      const key = event.key.toLowerCase();

      if (event.key === 'Enter') {
        onEnter();
      } else if (event.key === 'Backspace') {
        onDelete();
      } else if (/^[а-яёәіңғүұқөһ]$/i.test(key)) {
        onKey(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onKey, onDelete, onEnter]);

  const getKeyClass = (key) => {
    const status = usedLetters[key];
    const actionClass = key === 'ENTER' || key === 'DELETE' ? 'keyboard-key--wide' : '';
    const statusClass = status ? `keyboard-key--${status}` : '';
    return `keyboard-key cursor-target ${actionClass} ${statusClass}`.trim();
  };

  const handleKeyClick = (event, key) => {
    createRipple(event);
    if (key === 'ENTER') {
      onEnter();
    } else if (key === 'DELETE') {
      onDelete();
    } else {
      onKey(key);
    }
  };

  return (
    <div className="keyboard">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="keyboard-row">
          {row.map((key) => (
            <button key={key} type="button" onClick={(event) => handleKeyClick(event, key)} className={getKeyClass(key)}>
              {key === 'DELETE' ? <Delete className="w-4 h-4 sm:w-5 sm:h-5" /> : key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
