# Sahaya Setu

Voice-first, multilingual assistant that tells people which government schemes they qualify for,
which documents they are missing, and what to do next. Starts with Andhra Pradesh; any state can be
added with data files only.

> Guidance only. Always confirm on the official website before applying.

## Run the backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
API docs: http://localhost:8000/docs

## Test
```bash
python scripts/validate_data.py
cd backend && python -m pytest -q
```

## Add a state
1. Add an entry to `data/states.json`.
2. Create `data/<code>/` and add one JSON file per scheme (copy an existing one).
3. Run `python scripts/validate_data.py`. No code changes needed.

## Status
Stage 2 done: verified AP student scheme data (see docs/SOURCES.md). Next: React frontend, voice, deployment.
Scheme files marked `"verified": false` are placeholders.

## Run the website (frontend)
Needs Node.js 18+ (nodejs.org). Start the backend first (see above), then in a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173. To point at a deployed backend, copy `frontend/.env.example` to `frontend/.env` and set `VITE_API_URL`.
Scheme text is currently in English; the interface (questions and labels) is in Telugu, English and Hindi.
