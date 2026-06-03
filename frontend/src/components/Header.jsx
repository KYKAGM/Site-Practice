import React from 'react';
import { Sparkles, HelpCircle, Trophy } from 'lucide-react';

export default function Header({ wordLength, hintsLeft, onShowHelp }) {
  return (
    <header className="w-full max-w-lg mx-auto py-4 px-4 flex justify-between items-center border-b border-slate-800/80 mb-6">
      <div className="flex items-center gap-2">
        <div className="bg-gradient-to-tr from-purple-600 to-indigo-600 p-1.5 rounded-lg shadow-md shadow-purple-900/30">
          <Trophy className="w-5 h-5 text-white animate-pulse" />
        </div>
        <h1 className="text-xl font-bold tracking-wider bg-gradient-to-r from-purple-400 via-indigo-300 to-indigo-400 bg-clip-text text-transparent">
          СӨЗДІ ТАП!
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {wordLength && (
          <span className="px-2.5 py-1 bg-slate-800/60 border border-slate-700/60 text-xs font-semibold rounded-full text-slate-300">
            {wordLength} әріп
          </span>
        )}
        
        {hintsLeft !== undefined && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-950/40 border border-purple-800/40 text-xs font-semibold rounded-full text-purple-300 shadow-sm shadow-purple-950/20">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Кеңес: {hintsLeft}</span>
          </div>
        )}

        <button 
          onClick={onShowHelp}
          className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors hover:bg-slate-800/50 rounded-lg"
          title="Ойын ережесі"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
