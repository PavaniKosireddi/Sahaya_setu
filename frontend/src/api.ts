const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export type StateInfo = { code: string; name: Record<string, string>; languages: string[]; status: string };
export type Scheme = {
  id: string; verified: boolean; category?: string; name: { en: string };
  benefit: { summary: { en: string }; annual_value_inr: number | null; value_note?: string };
  documents: { id: string; name?: { en: string } }[];
  how_to_apply: { en: string[] }; to_confirm?: string[];
  official_url: string; source_checked_on: string;
};
export type Item = { scheme: Scheme; status: string; missing_fields: string[] };
export type Result = { eligible: Item[]; possible: Item[]; not_eligible: Item[]; total_annual_value_inr: number };
export type Brief = { id: string; name: string; summary: string; category: string; state: string; official_url: string };

async function get<T>(path: string): Promise<T> {
  const r = await fetch(`${BASE}${path}`);
  if (!r.ok) throw new Error(path);
  return r.json();
}
export const getStates = () => get<StateInfo[]>("/states");
export const getSchemes = (state: string) => get<Brief[]>(`/schemes/${state}`);
export const getStats = () => get<Record<string, number>>("/stats");
export async function matchSchemes(state: string, profile: Record<string, unknown>): Promise<Result> {
  const r = await fetch(`${BASE}/match`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ state, profile }),
  });
  if (!r.ok) throw new Error("match");
  return r.json();
}

export async function parseProfile(text: string, lang: string): Promise<Record<string, unknown>> {
  const r = await fetch(`${BASE}/parse-profile`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, lang }) });
  if (!r.ok) throw new Error(String(r.status));
  return (await r.json()).profile;
}
export async function postFeedback(b: { helpful: boolean; comment: string; state: string; lang: string; eligible_count: number }) {
  const r = await fetch(`${BASE}/feedback`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) });
  if (!r.ok) throw new Error("feedback");
}
