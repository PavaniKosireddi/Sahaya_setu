import json
from fastapi.testclient import TestClient
from app import ai
from app.main import app

c = TestClient(app)

def test_clean_keeps_only_valid_values():
    out = ai.clean({"segments": ["student", "alien"], "course_level": "degree", "categories": ["BC", "x"],
                    "family_income_annual_inr": 200000, "regular_course": True, "child_case": "bogus", "hack": 1})
    assert out == {"segments": ["student"], "course_level": "degree", "categories": ["BC"], "family_income_inr": 250000, "regular_course": True}

def test_income_band_above_top():
    assert ai.clean({"family_income_annual_inr": 2000000})["family_income_inr"] == 9999999

def test_parse_profile_endpoint(monkeypatch):
    monkeypatch.setenv("ANTHROPIC_API_KEY", "test")
    monkeypatch.setattr(ai, "call_model", lambda t: "Here: " + json.dumps({"segments": ["farmer"], "farmer_type": "tenant"}))
    r = c.post("/parse-profile", json={"text": "I farm rented land", "lang": "en"})
    assert r.status_code == 200 and r.json()["profile"] == {"segments": ["farmer"], "farmer_type": "tenant"}

def test_parse_profile_needs_key_and_text(monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    assert c.post("/parse-profile", json={"text": "hi"}).status_code == 503
    assert c.post("/parse-profile", json={"text": ""}).status_code == 400

def test_feedback_roundtrip(monkeypatch, tmp_path):
    monkeypatch.setenv("FEEDBACK_DB", str(tmp_path / "f.db"))
    assert c.get("/feedback/summary").json()["total"] == 0
    assert c.post("/feedback", json={"helpful": True, "state": "AP", "lang": "te", "eligible_count": 4, "comment": "nice"}).status_code == 200
    assert c.post("/feedback", json={"helpful": False, "state": "AP", "lang": "en", "eligible_count": 2}).status_code == 200
    s = c.get("/feedback/summary").json()
    assert s == {"total": 2, "helpful": 1, "helpful_pct": 50, "avg_schemes_found": 3.0}

def test_feedback_rejects_bad_input(monkeypatch, tmp_path):
    monkeypatch.setenv("FEEDBACK_DB", str(tmp_path / "f.db"))
    assert c.post("/feedback", json={"helpful": "yes", "state": "AP", "lang": "en"}).status_code == 400
    assert c.post("/feedback", json={"helpful": True, "state": "XX", "lang": "en"}).status_code == 400

def test_telangana_has_state_scheme_and_central_ones():
    ids = {s["id"] for s in c.get("/schemes/TS").json()}
    assert "ts-mahalakshmi-free-bus" in ids and "central-pm-kisan" in ids and "ap-stree-shakti" not in ids
    r = c.post("/match", json={"state": "TS", "profile": {"segments": ["woman"]}}).json()
    assert "ts-mahalakshmi-free-bus" in {i["scheme"]["id"] for i in r["eligible"]}
