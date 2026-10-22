const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export type StateInfo = { code: string; name: Record<string, string>; languages: string[]; status: string };
export type Scheme = {
  id: string; verified: boolean; name: { en: string };
  benefit: { summary: { en: string }; annual_value_inr: number | null; value_note?: string };
  documents: { id: string; name?: { en: string } }[];
  how_to_apply: { en: string[] }; to_confirm?: string[];
  official_url: string; source_checked_on: string;
};
export type Item = { scheme: Scheme; status: string; missing_fields: string[]; failed_rules: { field: string }[] };
export type Result = { eligible: Item[]; possible: Item[]; not_eligible: Item[]; total_annual_value_inr: number };

export async function getStates(): Promise<StateInfo[]> {
  const r = await fetch(`${BASE}/states`);
  if (!r.ok) throw new Error("states");
  return r.json();
}
export async function matchSchemes(state: string, profile: Record<string, unknown>): Promise<Result> {
  const r = await fetch(`${BASE}/match`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state, profile }),
  });
  if (!r.ok) throw new Error("match");
  return r.json();
}
