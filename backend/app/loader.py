import json, os
from pathlib import Path

DATA_DIR = Path(os.getenv("DATA_DIR", Path(__file__).resolve().parents[2] / "data"))

def load_states():
    return json.loads((DATA_DIR / "states.json").read_text(encoding="utf-8"))

def load_schemes(state_code):
    """Central schemes apply everywhere; state schemes come from data/<code>/."""
    schemes = []
    for folder in ("central", state_code.lower()):
        for path in sorted((DATA_DIR / folder).glob("*.json")):
            schemes.append(json.loads(path.read_text(encoding="utf-8")))
    return schemes
