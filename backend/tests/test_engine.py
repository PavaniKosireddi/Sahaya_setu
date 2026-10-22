from app.engine import evaluate, match
from app.loader import load_schemes

S = {"id": "x", "benefit": {"annual_value_inr": 100},
     "eligibility": [{"field": "occupation", "op": "in", "value": ["student"]},
                     {"field": "family_income_band", "op": "lte", "value": 2}]}

def test_eligible():
    assert evaluate(S, {"occupation": "student", "family_income_band": 1})["status"] == "eligible"

def test_not_eligible_has_reason():
    r = evaluate(S, {"occupation": "student", "family_income_band": 5})
    assert r["status"] == "not_eligible" and r["failed_rules"][0]["field"] == "family_income_band"

def test_possible_when_field_missing():
    r = evaluate(S, {"occupation": "student"})
    assert r["status"] == "possible" and r["missing_fields"] == ["family_income_band"]

def test_failure_beats_unknown():
    assert evaluate(S, {"occupation": "farmer"})["status"] == "not_eligible"

def test_total_value():
    g = match([S, S], {"occupation": "student", "family_income_band": 1})
    assert g["total_annual_value_inr"] == 200

def test_state_loading_adds_state_folder_only():
    ids = {s["id"] for s in load_schemes("AP")}
    assert "ap-sample" in ids and "central-sample" in ids and "ts-sample" not in ids
