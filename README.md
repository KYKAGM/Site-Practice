# ARCHITECTURE.md — Сөзді тап! (Казахский Wordle)

## 1. Обзор системы

```
┌─────────────────────────────────────────────────────────┐
│                        БРАУЗЕР                          │
│                                                         │
│   React + Vite + Tailwind CSS                           │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│   │LengthSel.│  │GameBoard │  │Keyboard  │              │
│   └──────────┘  └──────────┘  └──────────┘              │
│                  useGame() hook                         │
│                  gameApi.js (fetch)                     │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP / JSON (REST)
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   BACKEND (Django)                      │
│                                                         │
│   Django REST Framework                                 │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│   │  /start  │  │  /guess  │  │  /hint   │              │
│   └──────────┘  └──────────┘  └──────────┘              │
│                   game/views.py                         │
│                   game/ai_hints.py                      │
└──────────┬──────────────────────────┬───────────────────┘
           │                          │ HTTPS
           ▼                          ▼
┌──────────────────┐      ┌───────────────────────┐
│ SQLite / Postgres│      │  Anthropic Claude API │
│                  │      │  (claude-haiku-4-5)   │
│  KazakhWord      │      │                       │
│  GameSession     │      │  Генерация подсказок  │
└──────────────────┘      └───────────────────────┘
```

**Слои:**
- **Frontend** — React SPA, управляет UI и состоянием игры через хук `useGame`. Общается с backend только через REST API.
- **Backend** — Django обрабатывает бизнес-логику: выбор слова, проверку букв, счёт подсказок. Хранит состояние сессии в БД.
- **База данных** — хранит словарь казахских слов и состояние каждой игровой сессии.
- **Claude API** — вызывается только при запросе подсказки, генерирует текст на казахском не раскрывая слово.

---

## 2. Структура папок

```
kazakh-wordle/
│
├── backend/
│   ├── manage.py                      # Django CLI
│   ├── requirements.txt               # Python зависимости
│   ├── .env.example                   # Шаблон переменных окружения
│   │
│   ├── config/
│   │   ├── __init__.py
│   │   ├── settings.py                # Настройки Django (CORS, DB, API keys)
│   │   ├── urls.py                    # Корневой роутер → /api/game/
│   │   └── wsgi.py                    # WSGI точка входа для деплоя
│   │
│   └── game/
│       ├── __init__.py
│       ├── models.py                  # KazakhWord, GameSession
│       ├── serializers.py             # DRF сериализаторы для моделей
│       ├── views.py                   # StartView, GuessView, HintView, ValidateView
│       ├── urls.py                    # /start/ /guess/ /hint/ /validate-word/
│       ├── ai_hints.py                # Логика вызова Claude API
│       ├── admin.py                   # Регистрация моделей в Django Admin
│       │
│       ├── management/
│       │   └── commands/
│       │       └── load_words.py      # python manage.py load_words — загрузка слов в БД
│       │
│       └── data/
│           ├── words_4.json           # Список казахских слов из 4 букв
│           ├── words_5.json           # Список казахских слов из 5 букв
│           └── words_6.json           # Список казахских слов из 6 букв
│
└── frontend/
    ├── index.html                     # HTML точка входа
    ├── package.json                   # npm зависимости
    ├── vite.config.js                 # Настройки Vite + прокси на backend
    ├── tailwind.config.js             # Tailwind тема (цвета, шрифты)
    ├── .env.development               # VITE_API_URL=http://localhost:8000
    ├── .env.example                   # Шаблон для других окружений
    │
    └── src/
        ├── main.jsx                   # Точка входа React
        ├── App.jsx                    # Корневой компонент, роутинг по gameStatus
        │
        ├── api/
        │   └── gameApi.js             # fetch-обёртки для всех API эндпоинтов
        │
        ├── hooks/
        │   └── useGame.js             # Весь стейт и логика игры
        │
        ├── components/
        │   ├── Header.jsx             # Заголовок + счётчик подсказок
        │   ├── LengthSelector.jsx     # Экран выбора длины слова (4/5/6)
        │   ├── GameBoard.jsx          # Сетка 6×N тайлов
        │   ├── WordRow.jsx            # Одна строка угадывания
        │   ├── LetterTile.jsx         # Один тайл с буквой и анимацией
        │   ├── Keyboard.jsx           # Казахская экранная клавиатура
        │   ├── HintButton.jsx         # Кнопка подсказки + отображение текста
        │   └── GameModal.jsx          # Модалка победы / поражения
        │
        └── styles/
            └── index.css              # Tailwind директивы + кастомные анимации
```

---

## 3. Схема базы данных

### Таблица `game_kazakhword`

| Поле         | Тип           | Описание                          |
|--------------|---------------|-----------------------------------|
| `id`         | INTEGER PK    | Автоинкремент                     |
| `word`       | VARCHAR(10)   | Казахское слово (уникальное)      |
| `length`     | INTEGER       | Длина слова: 4, 5 или 6           |
| `definition` | TEXT          | Краткое определение (необязат.)   |

**Индексы:** `length` (для быстрого случайного выбора по длине)
**Ограничения:** `word` — UNIQUE

---

### Таблица `game_gamesession`

| Поле          | Тип          | Описание                                        |
|---------------|--------------|-------------------------------------------------|
| `id`          | INTEGER PK   | Автоинкремент                                   |
| `session_key` | VARCHAR(64)  | Уникальный ключ сессии (UUID, генерится бэком)  |
| `word`        | VARCHAR(10)  | Загаданное слово (не передаётся на фронт)       |
| `word_length` | INTEGER      | Длина слова (4/5/6)                             |
| `guesses`     | JSON         | Список сделанных попыток: `["қазақ", "алма"]`   |
| `results`     | JSON         | Результаты по каждой попытке (см. ниже)         |
| `hints_used`  | INTEGER      | Количество использованных подсказок (макс. 2)   |
| `is_complete` | BOOLEAN      | Игра завершена?                                 |
| `is_won`      | BOOLEAN      | Игрок выиграл?                                  |
| `created_at`  | DATETIME     | Время создания                                  |

**Формат `results`:**
```json
[
  ["correct", "absent", "present", "absent", "correct"],
  ["correct", "correct", "correct", "correct", "correct"]
]
```

---

## 4. API контракт

Базовый путь: `/api/game/`

---

### `POST /api/game/start/`

Начинает новую игру. Выбирает случайное слово нужной длины из БД.

**Request:**
```json
{ "word_length": 5 }
```

**Response:**
```json
{
  "session_id": 42,
  "word_length": 5,
  "max_guesses": 6,
  "max_hints": 2
}
```

> Слово **не возвращается** на фронт. Хранится только в БД.

---

### `POST /api/game/guess/`

Принимает попытку игрока. Сравнивает с загаданным словом, возвращает результат по каждой букве.

**Request:**
```json
{ "session_id": 42, "guess": "кітап" }
```

**Response (игра продолжается):**
```json
{
  "result": ["absent", "correct", "present", "absent", "correct"],
  "is_complete": false,
  "is_won": false,
  "guesses_left": 4,
  "word": null
}
```

**Response (игра завершена):**
```json
{
  "result": ["correct", "correct", "correct", "correct", "correct"],
  "is_complete": true,
  "is_won": true,
  "guesses_left": 0,
  "word": "кітап"
}
```

**Логика проверки букв:**
1. `"correct"` — буква есть в слове и стоит на правильном месте
2. `"present"` — буква есть в слове, но на другой позиции
3. `"absent"` — буквы нет в слове

**Ошибки:**
```json
{ "error": "Сессия не найдена" }          // 404
{ "error": "Игра уже завершена" }          // 400
{ "error": "Слово не найдено в словаре" }  // 400
{ "error": "Неверная длина слова" }        // 400
```

---

### `POST /api/game/hint/`

Запрашивает подсказку от Claude AI. Подсказка на казахском языке, слово не раскрывается.

**Request:**
```json
{ "session_id": 42 }
```

**Response:**
```json
{
  "hint": "Бұл сөз күнделікті тұрмыста жиі қолданылады.",
  "hints_left": 1
}
```

**Ошибки:**
```json
{ "error": "Подсказки закончились" }  // 400
{ "error": "Игра уже завершена" }     // 400
```

---

### `GET /api/game/validate-word/?word=кітап&length=5`

Проверяет, есть ли слово в словаре. Вызывается перед отправкой guess.

**Response:**
```json
{ "valid": true }
```
```json
{ "valid": false }
```

---

## 5. Дерево компонентов React

```
App
│
├── [gameStatus === "idle"]
│   └── LengthSelector
│       props: onSelect(length)
│       Три кнопки: 4 әріп / 5 әріп / 6 әріп
│
└── [gameStatus === "playing" | "won" | "lost"]
    │
    ├── Header
    │   props: wordLength, hintsLeft
    │   Заголовок игры + счётчик оставшихся подсказок
    │
    ├── GameBoard
    │   props: guesses[], results[], currentGuess, wordLength
    │   │
    │   └── WordRow × 6
    │       props: letters, results, isCurrent, wordLength
    │       │
    │       └── LetterTile × N
    │           props: letter, status, reveal, animationDelay
    │           status: "correct" | "present" | "absent" | "filled" | "empty"
    │
    ├── HintButton
    │   props: hintsLeft, hint, onHint(), isLoading, disabled
    │   Кнопка + карточка с текстом подсказки
    │
    ├── Keyboard
    │   props: onKey(key), onDelete(), onEnter(), usedLetters{}
    │   usedLetters: { "қ": "correct", "а": "absent", ... }
    │   Казахская раскладка, цвет клавиш по лучшему результату
    │
    ├── [errorMessage]
    │   ErrorToast
    │   props: message
    │   Всплывает на 2 секунды, затем скрывается
    │
    └── [gameStatus === "won" | "lost"]
        GameModal
        props: status, answer, guessCount, onReset()
        Победа / поражение + кнопка "Қайта ойна"
```

---

## 6. Стейт-менеджмент — хук `useGame`

Весь игровой стейт и логика инкапсулированы в одном хуке `useGame`. Компоненты только отображают данные и вызывают экшены.

### Стейт хука

| Переменная      | Тип                              | Описание                              |
|-----------------|----------------------------------|---------------------------------------|
| `sessionId`     | `number \| null`                 | ID текущей сессии                     |
| `wordLength`    | `4 \| 5 \| 6 \| null`            | Выбранная длина слова                 |
| `guesses`       | `string[]`                       | Отправленные попытки                  |
| `results`       | `string[][]`                     | Результаты по каждой попытке          |
| `currentGuess`  | `string`                         | Буквы, набранные в текущей строке     |
| `usedLetters`   | `Record<string, string>`         | Лучший статус каждой буквы            |
| `gameStatus`    | `"idle"\|"playing"\|"won"\|"lost"` | Состояние игры                      |
| `hintsLeft`     | `number`                         | Оставшихся подсказок (начало: 2)      |
| `currentHint`   | `string \| null`                 | Текст последней подсказки             |
| `isLoading`     | `boolean`                        | Идёт запрос к API                     |
| `errorMessage`  | `string \| null`                 | Ошибка (исчезает через 2 сек)         |
| `answer`        | `string \| null`                 | Раскрытое слово после конца игры      |

### Экшены хука

| Экшен          | Параметры      | Описание                                                |
|----------------|----------------|---------------------------------------------------------|
| `selectLength` | `length`       | Запускает новую игру, вызывает `POST /start/`           |
| `typeKey`      | `key: string`  | Добавляет букву в `currentGuess` (до wordLength)        |
| `deleteLetter` | —              | Удаляет последнюю букву из `currentGuess`               |
| `submitGuess`  | —              | Валидирует + отправляет `POST /guess/`, обновляет стейт |
| `getHint`      | —              | Вызывает `POST /hint/`, сохраняет текст подсказки       |
| `resetGame`    | —              | Возвращает `gameStatus` в `"idle"`, сбрасывает стейт    |

---

## 7. Интеграция AI (система подсказок)

### Поток данных

```
Игрок нажимает "Кеңес" (Подсказка)
        │
        ▼
HintButton → getHint() в useGame
        │
        ▼
POST /api/game/hint/ { session_id }
        │
        ▼
Backend: game/views.py → HintView
  - Проверяет hints_used < 2
  - Проверяет is_complete == False
  - Инкрементирует hints_used
        │
        ▼
game/ai_hints.py → Anthropic API
  Передаёт:
    - Загаданное слово (скрытно, только в промпте)
    - Историю попыток + результаты
    - Инструкцию: ответить на казахском, не раскрывать слово
        │
        ▼
Claude генерирует 1-2 предложения подсказки на казахском
        │
        ▼
Backend возвращает: { hint: "...", hints_left: 1 }
        │
        ▼
useGame сохраняет hint в currentHint, обновляет hintsLeft
        │
        ▼
HintButton отображает текст в карточке под кнопкой
```

### Что передаётся в промпт Claude

- Загаданное слово (модель знает его, чтобы дать осмысленную подсказку)
- История попыток с результатами (чтобы не повторять то, что уже известно)
- Жёсткая инструкция: ответ строго на казахском, 1-2 предложения, слово не называть напрямую

### Ограничения безопасности

- Слово никогда не передаётся на фронтенд до конца игры
- Claude инструктирован не называть слово — ни напрямую, ни по буквам
- Максимум 2 подсказки за игру (хранится в `GameSession.hints_used`)
- Кнопка блокируется после исчерпания лимита и после окончания игры

---

## 8. Диаграммы потоков данных

### Начало игры

```
Игрок              Frontend            Backend              БД
  │                   │                   │                  │
  │── Выбирает 5 ──►  │                   │                  │
  │                   │── POST /start/ ──►│                  │
  │                   │   {word_length:5} │                  │
  │                   │                   │── SELECT random ►│
  │                   │                   │   WHERE length=5 │
  │                   │                   │◄── KazakhWord ───│
  │                   │                   │── CREATE Session ►│
  │                   │◄── {session_id,   │                  │
  │                   │     word_length,  │                  │
  │                   │     max_guesses} ─│                  │
  │◄── GameBoard ─────│                   │                  │
```

### Попытка угадать слово

```
Игрок              Frontend            Backend              БД
  │                   │                   │                  │
  │── Вводит "кітап"─►│                   │                  │
  │── Нажимает Enter ►│                   │                  │
  │                   │── GET /validate? ►│                  │
  │                   │   word=кітап      │── SELECT word ──►│
  │                   │◄── {valid: true} ─│◄── found ────────│
  │                   │── POST /guess/ ──►│                  │
  │                   │   {session_id,    │── GET Session ──►│
  │                   │    guess:"кітап"} │◄── Session ──────│
  │                   │                   │ (проверка букв)  │
  │                   │                   │── UPDATE Session ►│
  │                   │◄── {result:[...], │                  │
  │                   │     is_won:false, │                  │
  │                   │     guesses_left} │                  │
  │◄── Анимация тайлов│                   │                  │
  │◄── Обновление     │                   │                  │
  │    клавиатуры ────│                   │                  │
```

### Запрос подсказки

```
Игрок              Frontend            Backend           Claude API
  │                   │                   │                  │
  │── Нажимает ──────►│                   │                  │
  │   "Кеңес"         │── POST /hint/ ───►│                  │
  │                   │   {session_id}    │── GET Session ──►│(БД)
  │                   │                   │◄── Session ──────│
  │                   │                   │                  │
  │                   │                   │── POST messages ►│
  │                   │                   │   (слово,        │
  │                   │                   │    попытки,      │
  │                   │                   │    инструкция)   │
  │                   │                   │◄── hint text ────│
  │                   │                   │── UPDATE hints_used
  │                   │◄── {hint:"...",   │                  │
  │                   │     hints_left:1} │                  │
  │◄── Карточка с ────│                   │                  │
  │    подсказкой     │                   │                  │
```

---

## 9. Переменные окружения

### Backend (`backend/.env`)

| Переменная          | Описание                                     |
|---------------------|----------------------------------------------|
| `SECRET_KEY`        | Django secret key                            |
| `DEBUG`             | True / False                                 |
| `ALLOWED_HOSTS`     | Список разрешённых хостов                    |
| `DATABASE_URL`      | URL подключения к PostgreSQL (для прода)     |
| `ANTHROPIC_API_KEY` | API ключ Anthropic для Claude                |
| `CORS_ALLOWED_ORIGINS` | Разрешённые источники для CORS            |

### Frontend (`frontend/.env.development`)

| Переменная       | Описание                                |
|------------------|-----------------------------------------|
| `VITE_API_URL`   | Базовый URL backend API                 |

---

## 10. Ключевые архитектурные решения

- **Сессии хранятся на сервере, а не в localStorage.** Загаданное слово никогда не покидает backend — это исключает читерство через DevTools. Frontend знает только `session_id`.

- **Валидация слова перед отправкой.** Вызов `/validate-word/` до `/guess/` позволяет показать ошибку мгновенно и не тратить попытку на несуществующее слово.

- **Лимит подсказок (2 штуки) хранится в БД, а не на фронте.** Фронтенд только отображает счётчик — он не может его подделать.

- **`useGame` хук изолирует логику от UI.** Все компоненты "тупые" — они получают props и вызывают колбэки. Это упрощает тестирование и рефакторинг.

- **Отдельные JSON-файлы для слов каждой длины** (`words_4.json`, `words_5.json`, `words_6.json`) — легко пополнять словарь независимо по каждой категории без изменения кода.

- **Claude Haiku** выбран для подсказок — самая быстрая и дешёвая модель, достаточная для генерации 1-2 предложений. Latency важна, так как игрок ждёт ответа в реальном времени.
