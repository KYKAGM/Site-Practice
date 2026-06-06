import { X } from 'lucide-react';

export default function AboutModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-panel animate-pop">
        <button type="button" onClick={onClose} className="modal-close cursor-target" aria-label="Жабу">
          <X className="w-5 h-5" />
        </button>

        <h3>Жоба туралы</h3>

        <div className="modal-copy">
          <p>
            Сөзді тап! - қазақ тіліндегі сөз ойындары жинағы. Wordle режимінде әріптер арқылы жасырын сөзді табасыз,
            ал Контекст режимінде мағынасы жақын сөздер арқылы рейтингтегі #1 сөзге жақындайсыз.
          </p>
          <p>
            Жоба React, Vite, Django REST Framework, PostgreSQL және Google Gemini API арқылы жасалған.
          </p>
          <div className="modal-note">
            <span>© 2026 Сөзді тап! жобасы. IITU @sansyzkuan.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
