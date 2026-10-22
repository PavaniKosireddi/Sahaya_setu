import { useEffect, useState } from "react";
import { getStates, matchSchemes, Item, Result, StateInfo } from "./api";
import { Key, Lang, LANGS, T } from "./i18n";

type Opt = [string | number | boolean | null, Key];
type Q = { key: string; q: Key; multi?: boolean; opts: Opt[] };
const YN: Opt[] = [[true, "yes"], [false, "no"]];
const QS: Q[] = [
  { key: "occupation", q: "q_occupation", opts: [["student", "student"], ["other", "other"]] },
  { key: "course_level", q: "q_level", opts: [["iti", "iti"], ["polytechnic", "poly"], ["degree", "degree"], ["postgraduate", "pg"]] },
  { key: "categories", q: "q_cat", multi: true, opts: ["SC", "ST", "BC", "EBC", "KAPU", "MINORITY", "PWD", "OTHER"].map((c) => [c, c as Key] as Opt) },
  { key: "family_income_inr", q: "q_income", opts: [[100000, "inc1"], [250000, "inc2"], [450000, "inc3"], [800000, "inc4"], [9999999, "inc5"]] },
  { key: "class12_above_80th_percentile", q: "q_p80", opts: [...YN, [null, "unsure"]] },
  { key: "regular_course", q: "q_regular", opts: YN },
  { key: "receiving_other_scholarship", q: "q_other", opts: YN },
];
const FIELD_Q: Record<string, Key> = Object.fromEntries(QS.map((q) => [q.key, q.q]));
const fmt = (n: number) => n.toLocaleString("en-IN");

export default function App() {
  const [lang, setLang] = useState<Lang>("te");
  const [states, setStates] = useState<StateInfo[]>([]);
  const [state, setState] = useState("AP");
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState(false);
  const t = (k: Key) => T[lang][k];

  useEffect(() => { getStates().then(setStates).catch(() => setError(true)); }, []);

  const restart = () => { setStep(-1); setAnswers({}); setResult(null); setError(false); };

  async function submit(a: Record<string, unknown>) {
    const profile = Object.fromEntries(Object.entries(a).filter(([, v]) => v !== null));
    try { setResult(await matchSchemes(state, profile)); setStep(QS.length); setError(false); }
    catch { setError(true); }
  }
  function answer(q: Q, v: unknown) {
    const a = { ...answers, [q.key]: v };
    setAnswers(a);
    if (q.key === "occupation" && v !== "student") { setStep(99); return; }
    step + 1 < QS.length ? setStep(step + 1) : submit(a);
  }
  function toggle(c: string) {
    const cur = (answers.categories as string[]) ?? [];
    setAnswers({ ...answers, categories: cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c] });
  }

  const q = QS[step];
  return (
    <main>
      <header>
        <h1>{t("title")}</h1>
        <select value={lang} onChange={(e) => setLang(e.target.value as Lang)} aria-label="language">
          {LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
        </select>
      </header>
      <p className="tag">{t("tagline")}</p>
      {error && <p className="warn">{t("error")}</p>}

      {step === -1 && (
        <section>
          <h2>{t("chooseState")}</h2>
          <div className="opts">
            {states.map((s) => (
              <button key={s.code} className={state === s.code ? "on" : ""} onClick={() => setState(s.code)}>
                {s.name[lang] ?? s.name.en}{s.status !== "live" && ` (${t("beta")})`}
              </button>
            ))}
          </div>
          <button className="primary" onClick={() => setStep(0)} disabled={!states.length}>{t("start")}</button>
        </section>
      )}

      {q && step >= 0 && (
        <section>
          <p className="progress">{step + 1} / {QS.length}</p>
          <h2>{t(q.q)}</h2>
          <div className="opts">
            {q.opts.map(([v, k]) => {
              const on = q.multi && ((answers.categories as string[]) ?? []).includes(v as string);
              return <button key={k} className={on ? "on" : ""} onClick={() => (q.multi ? toggle(v as string) : answer(q, v))}>{t(k)}</button>;
            })}
          </div>
          {q.multi && <button className="primary" disabled={!((answers.categories as string[]) ?? []).length} onClick={() => answer(q, answers.categories)}>{t("next")}</button>}
          <button className="link" onClick={() => setStep(step - 1)}>{t("back")}</button>
        </section>
      )}

      {step === 99 && <section><p>{t("notStudent")}</p><button className="primary" onClick={restart}>{t("restart")}</button></section>}

      {result && step === QS.length && (
        <section>
          {result.eligible.length + result.possible.length === 0 && <p>{result.not_eligible.length ? t("noMatch") : t("noSchemes")}</p>}
          {result.total_annual_value_inr > 0 && <p className="total">{t("upTo").replace("{amt}", fmt(result.total_annual_value_inr))}</p>}
          <List title={t("eligible")} items={result.eligible} t={t} />
          <List title={t("possible")} items={result.possible} t={t} />
          <List title={t("notEligible")} items={result.not_eligible} t={t} muted />
          <p className="disc">{t("disclaimer")}</p>
          <button className="primary" onClick={restart}>{t("restart")}</button>
        </section>
      )}
    </main>
  );
}

function List({ title, items, t, muted }: { title: string; items: Item[]; t: (k: Key) => string; muted?: boolean }) {
  if (!items.length) return null;
  return (
    <div className={muted ? "muted" : ""}>
      <h2>{title}</h2>
      {items.map(({ scheme: s, missing_fields }) => (
        <details key={s.id} open={!muted && items.length === 1}>
          <summary>{s.name.en}{!s.verified && <span className="badge">{t("sample")}</span>}</summary>
          <p>{s.benefit.summary.en}</p>
          {s.benefit.value_note && <p className="small">{s.benefit.value_note}</p>}
          {missing_fields.length > 0 && <p className="warn">{missing_fields.map((f) => FIELD_Q[f] ? t(FIELD_Q[f]) : f).join(" • ")}</p>}
          {s.documents.length > 0 && <><h3>{t("documents")}</h3><ul>{s.documents.map((d) => <li key={d.id}>{d.name?.en ?? d.id}</li>)}</ul></>}
          <h3>{t("apply")}</h3><ol>{s.how_to_apply.en.map((x, i) => <li key={i}>{x}</li>)}</ol>
          {!!s.to_confirm?.length && <><h3>{t("confirm")}</h3><ul>{s.to_confirm.map((x, i) => <li key={i}>{x}</li>)}</ul></>}
          <p className="small"><a href={s.official_url} target="_blank" rel="noreferrer">{t("official")}</a> · {t("checked")}: {s.source_checked_on}</p>
        </details>
      ))}
    </div>
  );
}
