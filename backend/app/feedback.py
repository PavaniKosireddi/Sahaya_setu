"""Anonymous feedback store (SQLite). No names, IDs or answers are stored."""
import os, sqlite3, time
from contextlib import closing
from pathlib import Path

def db_path():
    return Path(os.getenv("FEEDBACK_DB", Path(__file__).resolve().parents[1] / "feedback.db"))

def _conn():
    c = sqlite3.connect(db_path())
    c.execute("CREATE TABLE IF NOT EXISTS feedback (id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER, helpful INTEGER, comment TEXT, state TEXT, lang TEXT, eligible_count INTEGER)")
    return c

def add(helpful: bool, comment: str, state: str, lang: str, eligible_count: int):
    with closing(_conn()) as c:
        c.execute("INSERT INTO feedback (ts, helpful, comment, state, lang, eligible_count) VALUES (?,?,?,?,?,?)",
                  (int(time.time()), int(helpful), comment[:300], state, lang, eligible_count))
        c.commit()

def summary():
    with closing(_conn()) as c:
        total, helpful, avg = c.execute("SELECT COUNT(*), COALESCE(SUM(helpful),0), COALESCE(AVG(eligible_count),0) FROM feedback").fetchone()
    return {"total": total, "helpful": helpful, "helpful_pct": round(100 * helpful / total) if total else 0, "avg_schemes_found": round(avg, 1)}
