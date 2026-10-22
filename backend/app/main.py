import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .engine import match
from .loader import load_schemes, load_states

app = FastAPI(title="Sahaya Setu API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(","),
    allow_methods=["*"], allow_headers=["*"],
)

def visible(state):
    """Verified schemes only (unverified placeholders stay hidden unless SHOW_UNVERIFIED=1)."""
    schemes = load_schemes(state)
    if os.getenv("SHOW_UNVERIFIED") != "1":
        schemes = [s for s in schemes if s.get("verified")]
    return schemes

@app.get("/health")
def health():
    return {"ok": True}

@app.get("/states")
def states():
    return load_states()

@app.post("/match")
def match_schemes(body: dict):
    state = body.get("state")
    if state not in {s["code"] for s in load_states()}:
        raise HTTPException(400, "Unknown state")
    return match(visible(state), body.get("profile", {}))


@app.get("/schemes/{state}")
def list_schemes(state: str):
    if state not in {s["code"] for s in load_states()}:
        raise HTTPException(400, "Unknown state")
    return [{"id": s["id"], "name": s["name"]["en"], "summary": s["benefit"]["summary"]["en"],
             "category": s.get("category", ""), "state": s["state"], "official_url": s["official_url"]}
            for s in visible(state) if s.get("kind") != "guide"]

@app.get("/stats")
def stats():
    return {s["code"]: len([x for x in visible(s["code"]) if x.get("kind") != "guide"]) for s in load_states()}
