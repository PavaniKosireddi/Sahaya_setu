from app.engine import match
from app.loader import load_schemes

def ids(group): return {i["scheme"]["id"] for i in group}

BASE = {"segments": ["student"], "course_level": "degree", "categories": ["BC"],
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


FARMER = {"segments": ["farmer"], "farmer_type": "landowner", "income_tax_payer": False, "govt_high_status": False}
WOMAN = {"segments": ["woman"], "categories": ["BC"], "family_income_inr": 400000, "child_case": "first"}

def test_landowner_farmer_gets_pmkisan_and_annadata():
    g = match(load_schemes("AP"), FARMER)
    assert {"central-pm-kisan", "ap-annadata-sukhibhava"} <= ids(g["eligible"])
    assert g["total_annual_value_inr"] == 20000

def test_tenant_not_pmkisan_but_annadata():
    g = match(load_schemes("AP"), {**FARMER, "farmer_type": "tenant"})
    assert "central-pm-kisan" in ids(g["not_eligible"]) and "ap-annadata-sukhibhava" in ids(g["eligible"])

def test_income_tax_payer_excluded_from_pmkisan():
    g = match(load_schemes("AP"), {**FARMER, "income_tax_payer": True})
    assert "central-pm-kisan" in ids(g["not_eligible"])

def test_woman_stree_shakti_and_pmmvy():
    g = match(load_schemes("AP"), WOMAN)
    assert {"ap-stree-shakti", "central-pmmvy"} <= ids(g["eligible"])

def test_pmmvy_or_group_and_child_case():
    assert "central-pmmvy" in ids(match(load_schemes("AP"), {**WOMAN, "family_income_inr": 900000, "categories": ["SC"]})["eligible"])
    assert "central-pmmvy" in ids(match(load_schemes("AP"), {**WOMAN, "family_income_inr": 900000, "categories": ["OTHER"]})["not_eligible"])
    assert "central-pmmvy" in ids(match(load_schemes("AP"), {**WOMAN, "child_case": "later"})["not_eligible"])
    assert "central-pmmvy" in ids(match(load_schemes("AP"), {**WOMAN, "child_case": "none"})["not_eligible"])

def test_state_specific_schemes_do_not_leak():
    assert "ap-stree-shakti" not in {s["id"] for s in load_schemes("TS")}
    assert "ts-mahalakshmi-free-bus" not in {s["id"] for s in load_schemes("AP")}
