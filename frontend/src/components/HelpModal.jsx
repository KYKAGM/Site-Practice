import { Check, X } from 'lucide-react';

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-panel animate-pop">
        <button type="button" onClick={onClose} className="modal-close cursor-target" aria-label="Жабу">
          <X className="w-5 h-5" />
        </button>

        <h3>Нұсқаулық</h3>

        <div className="modal-copy">
          <p>Мақсат - жасырын сөзді 6 әрекет ішінде табу. Әр жауап таңдалған ұзындыққа сай болуы керек.</p>
          <p>Жауаптан кейін түстер әріптің дұрыс орнын, сөзде бар-жоғын көрсетеді.</p>

          <div className="legend-list">
            <div className="legend-item">
              <div className="letter-tile tile--correct">Қ</div>
              <div>
                <strong>Дұрыс орын</strong>
                <span>Әріп сөзде бар және өз орнында тұр.</span>
              </div>
            </div>
            <div className="legend-item">
              <div className="letter-tile tile--present">А</div>
              <div>
                <strong>Сөзде бар</strong>
                <span>Әріп сөзде бар, бірақ басқа орында тұр.</span>
              </div>
            </div>
            <div className="legend-item">
              <div className="letter-tile tile--absent">З</div>
              <div>
                <strong>Сөзде жоқ</strong>
                <span>Бұл әріп дұрыс жауапта жоқ.</span>
              </div>
            </div>
          </div>

          <div className="modal-note">
            <Check className="w-4 h-4" />
            <span>Қиын болса, кеңес батырмасын қолданыңыз. Бір ойынға екі кеңес беріледі.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
