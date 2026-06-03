import React, { useEffect } from 'react';
import { Delete } from 'lucide-react';

export default function Keyboard({ onKey, onDelete, onEnter, usedLetters }) {
  // Kazakh layout: Cyrillic standard + Kazakh-specific letters placed at the end of each row
  const rows = [
    ['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х', 'ә', 'і', 'ң'],
    ['ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э', 'ғ', 'ү', 'ұ'],
    ['ENTER', 'я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю', 'қ', 'ө', 'һ', 'DELETE']
  ];

  // Listen to physical keyboard presses
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat) return;
      
      const key = e.key.toLowerCase();
      
      if (e.key === 'Enter') {
        onEnter();
      } else if (e.key === 'Backspace') {
        onDelete();
      } else if (/^[а-яёәіңғүұқоһ]$/i.test(key)) {
        onKey(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onKey, onDelete, onEnter]);

  const getKeyClass = (key) => {
    let base = "flex-1 h-12 sm:h-14 flex items-center justify-center font-bold text-sm sm:text-base rounded-md border uppercase select-none transition-all duration-150 cursor-pointer active:scale-95 ";
    
    if (key === 'ENTER' || key === 'DELETE') {
      return base + "px-2 bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-100 text-xs sm:text-sm flex-[1.6]";
    }

    const status = usedLetters[key];
    if (status === 'correct') {
      return base + "bg-green-600 border-green-600 text-white";
    }
    if (status === 'present') {
      return base + "bg-yellow-600 border-yellow-600 text-white";
    }
    if (status === 'absent') {
      return base + "bg-slate-800/80 border-slate-900 text-slate-600 pointer-events-none";
    }
    
    return base + "bg-slate-700/40 hover:bg-slate-700/80 text-slate-200 border-slate-700/20";
  };

  const handleKeyClick = (key) => {
    if (key === 'ENTER') {
      onEnter();
    } else if (key === 'DELETE') {
      onDelete();
    } else {
      onKey(key);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-1 sm:px-4 mt-6 mb-4 flex flex-col gap-2">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1 sm:gap-1.5 justify-center w-full">
          {row.map((key) => (
            <button
              key={key}
              onClick={() => handleKeyClick(key)}
              className={getKeyClass(key)}
            >
              {key === 'DELETE' ? (
                <Delete className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                key
              )}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
