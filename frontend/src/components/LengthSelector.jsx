import React from 'react';
import { BookOpen, Sparkles } from 'lucide-react';

export default function LengthSelector({ onSelect, isLoading }) {
  return (
    <div className="w-full max-w-md mx-auto my-auto px-4 py-8 flex flex-col justify-center items-center">
      <div className="text-center mb-8">
        <div className="inline-flex p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl mb-4 shadow-inner">
          <BookOpen className="w-8 h-8 text-indigo-400" />
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight text-white mb-2 sm:text-3xl">
          Сөз ұзындығын таңдаңыз
        </h2>
        <p className="text-slate-400 text-sm max-w-xs mx-auto">
          Қазақ тіліндегі жасырын сөзді табу үшін әріптер санын таңдап, ойынды бастаңыз
        </p>
      </div>

      <div className="flex flex-col w-full gap-3 sm:flex-row sm:justify-center">
        {[4, 5, 6].map((length) => (
          <button
            key={length}
            onClick={() => onSelect(length)}
            disabled={isLoading}
            className="group relative flex flex-col items-center justify-center p-5 bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850/80 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/5 disabled:opacity-50 disabled:pointer-events-none sm:w-28 sm:h-28"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/10 to-purple-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <span className="text-3xl font-black text-white group-hover:text-indigo-300 transition-colors">
              {length}
            </span>
            <span className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider group-hover:text-slate-300">
              әріп
            </span>
          </button>
        ))}
      </div>

      <div className="mt-12 flex items-center gap-2 text-xs text-slate-500 bg-slate-900/30 px-4 py-2 rounded-full border border-slate-900/50">
        <Sparkles className="w-3.5 h-3.5 text-yellow-500/70" />
        <span>Claude 3.5 немесе Gemini сізге кеңес бере алады!</span>
      </div>
    </div>
  );
}
