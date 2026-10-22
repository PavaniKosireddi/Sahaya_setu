"""Deterministic eligibility engine. AI never decides eligibility; these rules do."""
OPS = {
    "eq": lambda a, b: a == b,
    "in": lambda a, b: a in b,
    "not_in": lambda a, b: a not in b,
    "lte": lambda a, b: a <= b,
    "gte": lambda a, b: a >= b,
    "between": lambda a, b: b[0] <= a <= b[1],
}

def check_rule(rule, profile):
    """True / False, or None when the profile lacks the field."""
    value = profile.get(rule["field"])
    if value is None:
        return None
    return OPS[rule["op"]](value, rule["value"])

def evaluate(scheme, profile):
    unknown, failed = [], []
    for rule in scheme.get("eligibility", []):
        result = check_rule(rule, profile)
        if result is None:
            unknown.append(rule["field"])
        elif not result:
            failed.append(rule)
    status = "not_eligible" if failed else "possible" if unknown else "eligible"
    return {"status": status, "missing_fields": sorted(set(unknown)), "failed_rules": failed}

def match(schemes, profile):
    groups = {"eligible": [], "possible": [], "not_eligible": []}
    for scheme in schemes:
        result = evaluate(scheme, profile)
        groups[result["status"]].append({"scheme": scheme, **result})
    value = lambda item: item["scheme"].get("benefit", {}).get("annual_value_inr", 0)
    groups["eligible"].sort(key=value, reverse=True)
    groups["total_annual_value_inr"] = sum(value(i) for i in groups["eligible"])
    return groups
