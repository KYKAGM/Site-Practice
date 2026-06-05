export default function MainMenu({ onPlayClick, onAboutClick }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
      <div className="flex flex-col items-center gap-12 max-w-md w-full">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-white mb-2">
            СӨЗДІ ТАП!
          </h1>
          <p className="text-slate-300 text-lg">Wordle ойынының қазақша нұсқасы</p>
        </div>

        
        <div className="flex flex-col gap-6 w-full">
          <button
            onClick={onPlayClick}
            className="w-full py-4 px-6 bg-gradient-to-r from-green-400 to-yellow-500  text-white font-bold text-2xl rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl cursor-target"
          >
            Ойнау
          </button>

          <button
            onClick={onAboutClick}
            className="w-full py-4 px-6 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xl rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl cursor-target border border-slate-600 hover:border-slate-500"
          >
            Проект туралы
          </button>
        </div>

        <div className="mt-12 text-center text-slate-500 text-sm">
          <p>Өз сөздік қорыңызды ұлғайтыңыз!</p>
        </div>
      </div>
    </div>
  );
}
