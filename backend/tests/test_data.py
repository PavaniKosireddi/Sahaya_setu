from app.engine import match
from app.loader import load_schemes

def ids(group): return {i["scheme"]["id"] for i in group}

BASE = {"occupation": "student", "course_level": "degree", "categories": ["BC"],
        "family_income_inr": 300000, "class12_above_80th_percentile": True,
        "regular_course": True, "receiving_other_scholarship": False}

def test_ap_bc_degree_student():
    g = match(load_schemes("AP"), BASE)
    assert {"ap-post-matric-rtf", "ap-post-matric-mtf-degree", "central-csss"} <= ids(g["eligible"])
    assert "ap-post-matric-mtf-iti" in ids(g["not_eligible"])

def test_mtf_tier_by_course():
    g = match(load_schemes("AP"), {**BASE, "course_level": "iti"})
    assert "ap-post-matric-mtf-iti" in ids(g["eligible"])
    assert "ap-post-matric-mtf-degree" in ids(g["not_eligible"])

def test_csss_excluded_when_other_scholarship():
    g = match(load_schemes("AP"), {**BASE, "receiving_other_scholarship": True})
    assert "central-csss" in ids(g["not_eligible"])

def test_csss_income_cap():
    g = match(load_schemes("AP"), {**BASE, "family_income_inr": 500000})
    assert "central-csss" in ids(g["not_eligible"])

def test_otr_guide_only_for_st():
    assert "nsp-otr-guide-st" not in ids(match(load_schemes("AP"), BASE)["eligible"])
    st = match(load_schemes("AP"), {**BASE, "categories": ["ST"]})
    assert "nsp-otr-guide-st" in ids(st["eligible"])
