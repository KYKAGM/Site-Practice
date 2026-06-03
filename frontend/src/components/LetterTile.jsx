import React from 'react';

export default function LetterTile({ letter, status, reveal, index }) {
  // Determine standard classes
  let baseClass = "w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center text-xl sm:text-2xl font-black rounded-lg border uppercase select-none transition-all duration-200";
  let stateClass = "";
  let animationStyle = {};

  if (reveal) {
    // When revealed, use flip animations
    if (status === 'correct') {
      stateClass = "border-green-600 text-white animate-flip-correct";
    } else if (status === 'present') {
      stateClass = "border-yellow-600 text-white animate-flip-present";
    } else if (status === 'absent') {
      stateClass = "border-slate-700 text-slate-350 animate-flip-absent";
    }
    // Set delay for stagger effect
    animationStyle = {
      animationDelay: `${index * 150}ms`,
      animationFillMode: 'forwards'
    };
  } else {
    // Current or future rows
    if (letter) {
      stateClass = "border-slate-500 text-white bg-slate-900/40 animate-pop";
    } else {
      stateClass = "border-slate-800 text-transparent bg-slate-950/20";
    }
  }

  return (
    <div 
      className={`${baseClass} ${stateClass}`}
      style={animationStyle}
    >
      {letter}
    </div>
  );
}
