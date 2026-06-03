import React from 'react';
import { X, Check } from 'lucide-react';

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-800 shadow-2xl relative animate-pop text-left">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-200 transition-colors hover:bg-slate-800/50 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-white mb-4">
          Ойын ережесі
        </h3>

        <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
          <p>
            Ойынның мақсаты — жасырын сөзді 6 әрекетте табу. Әрбір болжам сөздікте бар және таңдалған әріп санына сәйкес келуі тиіс.
          </p>
          <p>
            Әрбір болжамнан кейін әріптердің түсі сөздің қаншалықты жақын екенін көрсету үшін өзгереді:
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-650 border border-green-500 rounded-lg flex items-center justify-center text-white font-bold">
                Қ
              </div>
              <div>
                <p className="font-bold text-white text-xs uppercase text-green-400">Жасыл түс</p>
                <p className="text-slate-400 text-xs">Әріп сөзде бар және дұрыс орында тұр.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-650 border border-yellow-500 rounded-lg flex items-center justify-center text-white font-bold">
                А
              </div>
              <div>
                <p className="font-bold text-white text-xs uppercase text-yellow-400">Сары түс</p>
                <p className="text-slate-400 text-xs">Әріп сөзде бар, бірақ басқа орында тұр.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center text-white font-bold">
                З
              </div>
              <div>
                <p className="font-bold text-white text-xs uppercase text-slate-400">Сұр түс</p>
                <p className="text-slate-400 text-xs">Әріп сөзде мүлдем жоқ.</p>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-800/80 flex items-start gap-2 text-xs text-slate-400">
            <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <span>Ойын барысында қиналсаңыз, ЖИ-ден (Gemini/Claude) кеңес сұрау үшін «Кеңес алу» батырмасын басыңыз (әр ойында ең көбі 2 кеңес).</span>
          </div>
        </div>
      </div>
    </div>
  );
}
