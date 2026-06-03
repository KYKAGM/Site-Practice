import React from 'react';
import { Trophy, Frown, RefreshCw, X } from 'lucide-react';

export default function GameModal({ status, answer, guessCount, onReset }) {
  if (status !== 'won' && status !== 'lost') return null;

  const isWon = status === 'won';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm glass-panel p-6 rounded-2xl border border-slate-800 shadow-2xl text-center relative overflow-hidden animate-pop">
        
        {/* Decorative background glow */}
        <div className={`absolute -top-12 -left-12 w-24 h-24 rounded-full blur-3xl opacity-20 ${isWon ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <div className={`absolute -bottom-12 -right-12 w-24 h-24 rounded-full blur-3xl opacity-20 ${isWon ? 'bg-indigo-500' : 'bg-purple-500'}`}></div>

        <div className="flex flex-col items-center mb-6">
          {isWon ? (
            <div className="p-4 bg-green-950/50 border border-green-500/30 rounded-full mb-4 animate-bounce">
              <Trophy className="w-12 h-12 text-green-400" />
            </div>
          ) : (
            <div className="p-4 bg-red-950/50 border border-red-500/30 rounded-full mb-4">
              <Frown className="w-12 h-12 text-red-400" />
            </div>
          )}

          <h2 className="text-2xl font-black text-white">
            {isWon ? 'Жеңіс! Құттықтаймыз!' : 'Ойын аяқталды'}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {isWon ? `${guessCount} әрекетте таптыңыз` : 'Бұл жолы сөзді таба алмадыңыз'}
          </p>
        </div>

        {/* Word Reveal Card */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Жасырын сөз
          </span>
          <span className="text-3xl font-black text-white uppercase tracking-widest block bg-gradient-to-r from-indigo-300 via-white to-purple-300 bg-clip-text text-transparent">
            {answer}
          </span>
        </div>

        <button
          onClick={onReset}
          className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-950/20 hover:shadow-indigo-500/10 transition-all duration-300 transform active:scale-98"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Қайта ойнау</span>
        </button>
      </div>
    </div>
  );
}
