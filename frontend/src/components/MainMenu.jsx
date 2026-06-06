import { BookOpen, BrainCircuit, Info, Keyboard } from 'lucide-react';

export default function MainMenu({ onWordleClick, onContextClick, onAboutClick }) {
  return (
    <main className="main-menu">
      <section className="main-menu__content">
        <div className="main-menu__title">
          <BookOpen className="w-12 h-12" />
          <h1>Сөзді тап!</h1>
          <p>Қазақша сөз ойындары</p>
        </div>

        <div className="main-menu__actions">
          <button type="button" onClick={onWordleClick} className="menu-card cursor-target">
            <Keyboard className="w-7 h-7" />
            <span>Wordle</span>
            <small>Әріптер арқылы жасырын сөзді табыңыз</small>
          </button>

          <button type="button" onClick={onContextClick} className="menu-card menu-card--accent cursor-target">
            <BrainCircuit className="w-7 h-7" />
            <span>Контекст</span>
            <small>Мағынасы жақын сөздер арқылы #1 сөзді табыңыз</small>
          </button>

          <button type="button" onClick={onAboutClick} className="menu-card menu-card--quiet cursor-target">
            <Info className="w-7 h-7" />
            <span>Жоба туралы</span>
          </button>
        </div>
      </section>
    </main>
  );
}
