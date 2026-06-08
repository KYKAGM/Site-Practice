# Сөзді тап!

Қазақ тіліндегі сөз ойындары жинағы: классикалық Wordle және семантикалық `Контекст` режимі.

Жоба оқу практикасы үшін жасалды. Автор: **Сансызбай Қуандық**, IITU, 1 курс, Жасанды интеллект тобы.

## Мүмкіндіктер

- `Wordle` режимі: 2-8 әріптік жасырын сөзді табу.
- `Контекст` режимі: Contexto ойынына ұқсас semantic rank арқылы сөз табу.
- Қазақ кирилл әріптері бар экрандық пернетақта.
- Қараңғы/жарық тақырып.
- Түсті ажырату режимі.
- AI кеңестер.
- Кастом курсор және адаптивті UI.
- PostgreSQL сөздік базасы.
- Gemini embeddings арқылы мағыналық жақындық рейтингі.

## Стек

### Frontend

- React 19
- Vite
- Tailwind CSS
- CSS custom properties
- lucide-react
- GSAP

### Backend

- Django 5
- Django REST Framework
- PostgreSQL
- django-cors-headers
- python-dotenv
- google-genai

### AI

- Google Gemini API
- Gemini text generation: кеңес жасау
- Gemini Embeddings: `gemini-embedding-001`

## Архитектура

```text
Browser
  |
  | React + Vite SPA
  | - App.jsx
  | - useGame.js
  | - useContextGame.js
  | - gameApi.js
  | - contextApi.js
  v
Django REST API
  |
  | /api/game/start/
  | /api/game/guess/
  | /api/game/hint/
  | /api/game/give-up/
  | /api/game/context/start/
  | /api/game/context/guess/
  | /api/game/context/give-up/
  v
PostgreSQL
  |
  | KazakhWord
  | GameSession
  | ContextGameSession
```

## Режим Wordle

Ойыншы сөз ұзындығын таңдайды: `2`, `3`, `4`, `5`, `6`, `7`, `8`.

Backend кездейсоқ сөз таңдайды және `GameSession` жасайды. Әр жауаптан кейін әріптер үш күйдің бірін алады:

- `correct` - әріп дұрыс орында.
- `present` - әріп сөзде бар, бірақ басқа орында.
- `absent` - әріп сөзде жоқ.

API:

```text
POST /api/game/start/
POST /api/game/guess/
POST /api/game/hint/
POST /api/game/give-up/
GET  /api/game/validate-word/
```

## Режим Контекст

Бұл режим Contexto ойынына ұқсайды. Мақсат - жасырын сөзді мағыналық жақындық арқылы табу.

Жұмыс істеу принципі:

1. Әр сөз үшін алдын ала embedding жасалады.
2. Backend жасырын сөз таңдайды.
3. Сол сөздің embedding векторы барлық сөздердің embedding векторымен салыстырылады.
4. Cosine similarity арқылы рейтинг жасалады.
5. Ең жақын сөз `#1`.
6. Ойыншы сөз енгізеді, backend тек rank қайтарады.

Мысал:

```json
{
  "rank": 228,
  "total": 36930,
  "solved": false
}
```

API:

```text
POST /api/game/context/start/
POST /api/game/context/guess/
POST /api/game/context/give-up/
```

Маңызды: ойын кезінде Gemini API шақырылмайды. `guess` endpoint тек БД-дағы дайын embedding деректерін қолданады.

## Embeddings генерациясы

Алдымен migration қолдану керек:

```powershell
cd backend
venv\Scripts\python.exe manage.py migrate
```

Тест үшін 100 сөзге embedding жасау:

```powershell
venv\Scripts\python.exe manage.py generate_embeddings --batch-size 100 --limit 100
```

Барлық сөздерге embedding жасау:

```powershell
venv\Scripts\python.exe manage.py generate_embeddings --batch-size 100 --delay-seconds 65
```

Неге `65 секунд`? Gemini free tier үшін embedding лимиті `100 RPM`. `batch-size 100` бір минуттық лимитті толық қолданады, сондықтан келесі batch алдында күту керек.

Embedding саны тексеру:

```powershell
venv\Scripts\python.exe manage.py shell -c "from game.models import KazakhWord; print(KazakhWord.objects.exclude(embedding__isnull=True).exclude(embedding=[]).count())"
```

## Сөздік

Негізгі сөздік файлы:

```text
words.txt
```

Сөздерді БД-ға жүктеу:

```powershell
cd backend
venv\Scripts\python.exe manage.py load_words
```

`load_words` командасы 2-8 әріптік сөздерді қабылдайды.

## Орнату және іске қосу

### Backend

```powershell
cd backend
venv\Scripts\activate
pip install -r requirements.txt
venv\Scripts\python.exe manage.py migrate
venv\Scripts\python.exe manage.py runserver
```

`.env` ішінде керек айнымалылар:

```env
DATABASE_NAME=kazakh_wordle
DATABASE_USER=postgres
DATABASE_PASSWORD=...
DATABASE_HOST=localhost
DATABASE_PORT=5432
GEMINI_API_KEY=...
GEMINI_EMBEDDING_MODEL=gemini-embedding-001
```

### Frontend

```powershell
cd frontend
npm install
cmd /c npm run dev
```

Әдетте frontend мына жерде ашылады:

```text
http://localhost:5173
```

## Тексеру командалары

Frontend:

```powershell
cd frontend
cmd /c npm run lint
cmd /c npm run build
```

Backend:

```powershell
cd backend
venv\Scripts\python.exe manage.py check
venv\Scripts\python.exe manage.py makemigrations --check --dry-run
```

## Негізгі файлдар

```text
frontend/src/App.jsx
frontend/src/components/MainMenu.jsx
frontend/src/components/ContextGame.jsx
frontend/src/hooks/useGame.js
frontend/src/hooks/useContextGame.js
frontend/src/api/gameApi.js
frontend/src/api/contextApi.js
frontend/src/index.css

backend/game/models.py
backend/game/views.py
backend/game/urls.py
backend/game/context_embeddings.py
backend/game/ai_hints.py
backend/game/management/commands/load_words.py
backend/game/management/commands/generate_embeddings.py
backend/config/settings.py
```

## Автор

**Сансызбай Қуандық**  
IITU, 1 курс, Жасанды интеллект тобы  
Жоба оқу практикасы үшін жасалды.

## Референстер

- Қазақ сөздері: [Epimetheus84/kazakh_words](https://github.com/Epimetheus84/kazakh_words)
- Wordle game reference: [wordle.com](https://www.nytimes.com/games/wordle/index.html)
- Context game reference: [contexto.me](https://contexto.me/en/)
- Gemini Embeddings API: [Google AI for Developers](https://ai.google.dev/api/embeddings)
