import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

export default function HintButton({ hintsLeft, hint, onHint, isLoading, disabled }) {
  return (
    <div className="w-full max-w-sm mx-auto px-4 my-2 flex flex-col items-center">
      <button
        onClick={onHint}
        disabled={disabled || isLoading || hintsLeft <= 0}
        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-purple-950/20 hover:shadow-indigo-500/10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-white" />
        ) : (
          <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
        )}
        <span>Кеңес алу ({hintsLeft} қалды)</span>
      </button>

      {hint && (
        <div className="mt-4 w-full glass-card p-4 rounded-xl border border-purple-500/20 shadow-lg shadow-purple-950/5 relative overflow-hidden animate-pop">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-purple-500 to-indigo-500"></div>
          <div className="pl-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Жасанды Интеллект Кеңесі
            </h4>
            <p className="text-slate-200 text-sm leading-relaxed italic">
              « {hint} »
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
