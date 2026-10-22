"""Fails CI if a scheme file is malformed. Warns about unverified placeholders."""
import json, sys
from pathlib import Path

REQUIRED = {"id", "state", "name", "benefit", "eligibility", "documents", "how_to_apply", "official_url", "source_checked_on", "sources", "verified"}
OPS = {"eq", "in", "not_in", "lte", "gte", "between", "any_in"}
errors = 0
for path in sorted(Path(__file__).resolve().parents[1].glob("data/*/*.json")):
    scheme = json.loads(path.read_text(encoding="utf-8"))
    missing = REQUIRED - scheme.keys()
    bad_ops = [r for r in scheme.get("eligibility", []) if r.get("op") not in OPS]
    if missing or bad_ops:
        errors += 1
        print(f"ERROR {path.name}: missing={sorted(missing)} bad_ops={bad_ops}")
    if scheme.get("verified") and not scheme.get("sources"):
        errors += 1
        print(f"ERROR {path.name}: verified scheme needs sources")
    if scheme.get("verified") is False:
        print(f"WARN  {path.name}: unverified placeholder")
sys.exit(1 if errors else 0)
