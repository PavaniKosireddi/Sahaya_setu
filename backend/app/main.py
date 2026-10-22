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
    schemes = load_schemes(state)
    if os.getenv("SHOW_UNVERIFIED") != "1":  # hide unverified placeholder data from real users
        schemes = [s for s in schemes if s.get("verified")]
    return match(schemes, body.get("profile", {}))
