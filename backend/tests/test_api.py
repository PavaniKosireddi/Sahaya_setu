from fastapi.testclient import TestClient
from app.main import app

c = TestClient(app)
PROFILE = {"segments": ["student"], "course_level": "degree", "categories": ["BC"], "family_income_inr": 250000,
           "class12_above_80th_percentile": True, "regular_course": True, "receiving_other_scholarship": False}

def test_states():
    assert "AP" in {s["code"] for s in c.get("/states").json()}

def test_match_ap_returns_verified_schemes():
    r = c.post("/match", json={"state": "AP", "profile": PROFILE}).json()
    assert "central-csss" in {i["scheme"]["id"] for i in r["eligible"]}

def test_unverified_state_data_hidden():
    r = c.post("/match", json={"state": "TS", "profile": PROFILE}).json()
    assert all(i["scheme"]["verified"] for g in ("eligible", "possible", "not_eligible") for i in r[g])

def test_unknown_state_rejected():
    assert c.post("/match", json={"state": "XX", "profile": {}}).status_code == 400


def test_schemes_list_and_stats():
    names = {s["id"] for s in c.get("/schemes/AP").json()}
    assert {"central-csss", "ap-stree-shakti", "central-pm-kisan"} <= names and "nsp-otr-guide-st" not in names
    assert c.get("/stats").json()["AP"] >= 8
