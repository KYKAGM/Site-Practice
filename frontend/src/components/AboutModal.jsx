import { X } from 'lucide-react';

export default function AboutModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-slate-900 rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-slate-700">
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            Проект туралы
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 cursor-target"
            aria-label="Жабу"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <p className="text-slate-300">
            СӨЗДІК - бұл танымал worldle ойынының қазақша нұсқасы, онда ойыншылар күнделікті сөзді табу үшін жарысады. Бұл жобаның мақсаты еуропалық тренды қазақстанда дамыту және сөздік қорды ұлғайтуға арналған!
          </p>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div className="pt-4 border-t border-slate-700">
            <p className="text-xs text-slate-500 text-center">
              © 2026 СӨЗДІК Жобасы. IITU @sansyzkuan.
            </p>
          </div>
        </div>

        <div className="bg-slate-800 border-t border-slate-700 p-4 sticky bottom-0">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded transition-colors cursor-target"
          >
            Жабу
          </button>
        </div>
      </div>
    </div>
  );
}
