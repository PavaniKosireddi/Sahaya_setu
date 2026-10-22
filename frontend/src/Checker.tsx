import { useEffect, useState } from "react";
import { getStates, Item, matchSchemes, Result, StateInfo } from "./api";
import { Logo } from "./art";
import { Counter } from "./hooks";
import { Key, Lang, LANGS, T } from "./i18n";

type V = string | number | boolean | null;
type Answers = Record<string, V | string[]>;
type Q = { key: string; q: Key; multi?: boolean; opts: [V, Key][]; when: (a: Answers) => boolean };
const has = (a: Answers, s: string) => ((a.segments as string[]) ?? []).includes(s);
const YN: [V, Key][] = [[true, "yes"], [false, "no"]];
const QS: Q[] = [
  { key: "segments", q: "q_segments", multi: true, opts: [["student", "seg_student"], ["woman", "seg_woman"], ["farmer", "seg_farmer"]], when: () => true },
  { key: "course_level", q: "q_level", opts: [["iti", "iti"], ["polytechnic", "poly"], ["degree", "degree"], ["postgraduate", "pg"]], when: (a) => has(a, "student") },
  { key: "categories", q: "q_cat", multi: true, opts: ["SC", "ST", "BC", "EBC", "KAPU", "MINORITY", "PWD", "OTHER"].map((c) => [c, c as Key] as [V, Key]), when: (a) => has(a, "student") || has(a, "woman") },
  { key: "family_income_inr", q: "q_income", opts: [[100000, "inc1"], [250000, "inc2"], [450000, "inc3"], [800000, "inc4"], [9999999, "inc5"]], when: (a) => has(a, "student") || has(a, "woman") },
  { key: "class12_above_80th_percentile", q: "q_p80", opts: [...YN, [null, "unsure"]], when: (a) => has(a, "student") },
  { key: "regular_course", q: "q_regular", opts: YN, when: (a) => has(a, "student") },
  { key: "receiving_other_scholarship", q: "q_other", opts: YN, when: (a) => has(a, "student") },
  { key: "child_case", q: "q_child", opts: [["none", "ch_none"], ["first", "ch_first"], ["second_girl", "ch_second_girl"], ["second_boy", "ch_second_boy"], ["later", "ch_later"]], when: (a) => has(a, "woman") },
  { key: "farmer_type", q: "q_ftype", opts: [["landowner", "ft_landowner"], ["tenant", "ft_tenant"]], when: (a) => has(a, "farmer") },
  { key: "income_tax_payer", q: "q_itax", opts: YN, when: (a) => has(a, "farmer") },
  { key: "govt_high_status", q: "q_govt", opts: YN, when: (a) => has(a, "farmer") },
];
const FIELD_Q: Record<string, Key> = Object.fromEntries(QS.map((q) => [q.key, q.q]));
const ICON: Record<string, string> = { education: "🎓", women: "👩", agriculture: "🌾", registration: "📝" };
const fmt = (n: number) => n.toLocaleString("en-IN");

export default function Checker({ lang, setLang, initial, onExit }: { lang: Lang; setLang: (l: Lang) => void; initial?: string[]; onExit: () => void }) {
  const t = (k: Key) => T[lang][k];
  const [states, setStates] = useState<StateInfo[]>([]);
  const [state, setState] = useState("AP");
  const [begun, setBegun] = useState(false);
  const [answers, setAnswers] = useState<Answers>(initial ? { segments: initial } : {});
  const [order, setOrder] = useState<string[]>(initial ? ["segments"] : []);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => { getStates().then(setStates).catch(() => setError(true)); window.scrollTo(0, 0); }, []);

  const remaining = QS.filter((q) => q.when(answers) && !(q.key in answers));
  const q = begun && !result ? remaining[0] : undefined;
  const total = order.length + remaining.length;

  useEffect(() => {
    if (!begun || result || remaining.length || !order.length) return;
    const profile = Object.fromEntries(Object.entries(answers).filter(([, v]) => v !== null));
    matchSchemes(state, profile).then((r) => { setResult(r); setError(false); }).catch(() => setError(true));
  }, [begun, result, remaining.length, order.length, answers, state]);

  const pick = (key: string, v: V | string[]) => { setAnswers({ ...answers, [key]: v }); setOrder([...order, key]); };
  const toggle = (key: string, v: string) => {
    const cur = (answers[key] as string[]) ?? [];
    setAnswers({ ...answers, [key]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] });
  };
  const confirmMulti = (key: string) => { setOrder([...order, key]); setAnswers({ ...answers }); };
  const back = () => {
    const last = order[order.length - 1];
    if (result) { setResult(null); }
    if (!last) { setBegun(false); return; }
    const { [last]: _drop, ...rest } = answers; void _drop;
    setAnswers(rest); setOrder(order.slice(0, -1));
  };
  const restart = () => { setAnswers({}); setOrder([]); setResult(null); setBegun(false); setError(false); };

  return (
    <div className="checker">
      <div className="ck-top wrap">
        <button className="brand" onClick={onExit}><Logo /><span>Sahaya Setu</span></button>
        <div className="nav-r">
          <select value={lang} onChange={(e) => setLang(e.target.value as Lang)} aria-label="Language">{LANGS.map((x) => <option key={x.code} value={x.code}>{x.label}</option>)}</select>
          <button className="btn ghost sm" onClick={onExit}>{t("home")}</button>
        </div>
      </div>
      <div className="ck-body">
        {error && <p className="warn center">{t("error")}</p>}

        {!begun && (
          <div className="panel pop">
            <h2>{t("chooseState")}</h2>
            <div className="opts">
              {states.map((s) => (
                <button key={s.code} className={`opt ${state === s.code ? "on" : ""}`} onClick={() => setState(s.code)}>
                  <span>{s.name[lang] ?? s.name.en}</span>{s.status !== "live" && <em>{t("beta")}</em>}
                </button>
              ))}
            </div>
            <button className="btn lg full" disabled={!states.length} onClick={() => setBegun(true)}>{t("start")} →</button>
          </div>
        )}

        {q && (
          <div className="panel slide" key={q.key}>
            <div className="bar"><i style={{ width: `${(order.length / Math.max(total, 1)) * 100}%` }} /></div>
            <p className="small">{t("step")} {order.length + 1} / {total}</p>
            <h2>{t(q.q)}</h2>
            <div className="opts">
              {q.opts.map(([v, k]) => {
                const on = q.multi && ((answers[q.key] as string[]) ?? []).includes(v as string);
                return <button key={k} className={`opt ${on ? "on" : ""}`} onClick={() => (q.multi ? toggle(q.key, v as string) : pick(q.key, v))}>
                  <span>{t(k)}</span>{q.multi && <i className="tick">{on ? "✓" : ""}</i>}</button>;
              })}
            </div>
            {q.multi && <button className="btn lg full" disabled={!((answers[q.key] as string[]) ?? []).length} onClick={() => confirmMulti(q.key)}>{t("next")} →</button>}
            <button className="linkbtn" onClick={back}>← {t("back")}</button>
          </div>
        )}

        {begun && !q && !result && !error && <div className="panel center"><div className="spin" /></div>}

        {result && <Results r={result} lang={lang} t={t} onRestart={restart} onBack={back} />}
      </div>
    </div>
  );
}

function Results({ r, lang, t, onRestart, onBack }: { r: Result; lang: Lang; t: (k: Key) => string; onRestart: () => void; onBack: () => void }) {
  const names = r.eligible.map((i) => `• ${i.scheme.name.en}`).join("\n");
  const wa = `https://wa.me/?text=${encodeURIComponent(`${t("shareText")}\n${names}\n${window.location.origin}`)}`;
  void lang;
  return (
    <div className="results pop">
      {r.eligible.length + r.possible.length === 0 && <div className="panel center"><p>{r.not_eligible.length ? t("noMatch") : t("noSchemes")}</p></div>}
      {r.total_annual_value_inr > 0 && (
        <div className="total"><span>{t("upTo").split("₹{amt}")[0]}</span><b>₹<Counter to={r.total_annual_value_inr} /></b><span>{t("upTo").split("₹{amt}")[1]}</span></div>
      )}
      <Group title={t("eligible")} items={r.eligible} t={t} tone="good" />
      <Group title={t("possible")} items={r.possible} t={t} tone="warn" />
      <Group title={t("notEligible")} items={r.not_eligible} t={t} tone="mute" />
      <p className="small center">{t("disclaimer")}</p>
      <div className="actions">
        <a className="btn" href={wa} target="_blank" rel="noreferrer">💬 {t("share")}</a>
        <button className="btn ghost" onClick={() => window.print()}>🖨️ {t("print")}</button>
        <button className="btn ghost" onClick={onBack}>← {t("back")}</button>
        <button className="btn ghost" onClick={onRestart}>{t("restart")}</button>
      </div>
    </div>
  );
}

function Group({ title, items, t, tone }: { title: string; items: Item[]; t: (k: Key) => string; tone: string }) {
  const [openId, setOpenId] = useState<string | null>(tone === "good" && items.length ? items[0].scheme.id : null);
  if (!items.length) return null;
  return (
    <section className={`grp ${tone}`}>
      <h3>{title} <span className="count">{items.length}</span></h3>
      {items.map(({ scheme: s, missing_fields }) => (
        <article key={s.id} className={`sc ${openId === s.id ? "open" : ""}`}>
          <button className="sc-head" onClick={() => setOpenId(openId === s.id ? null : s.id)}>
            <span className="ic">{ICON[s.category ?? ""] ?? "📌"}</span>
            <span className="sc-t"><b>{s.name.en}</b><small>{s.benefit.summary.en}</small></span>
            <span className="chev">{openId === s.id ? "−" : "+"}</span>
          </button>
          <div className="sc-body"><div>
            {!s.verified && <span className="badge">{t("sample")}</span>}
            {s.benefit.value_note && <p className="small">{s.benefit.value_note}</p>}
            {missing_fields.length > 0 && <p className="warn">{t("moreInfo")}: {[...new Set(missing_fields.map((f) => (FIELD_Q[f] ? t(FIELD_Q[f]) : f)))].join(" • ")}</p>}
            {s.documents.length > 0 && <><h4>{t("documents")}</h4><ul>{s.documents.map((d) => <li key={d.id}>{d.name?.en ?? d.id}</li>)}</ul></>}
            <h4>{t("apply")}</h4><ol>{s.how_to_apply.en.map((x, i) => <li key={i}>{x}</li>)}</ol>
            {!!s.to_confirm?.length && <><h4>{t("confirm")}</h4><ul className="conf">{s.to_confirm.map((x, i) => <li key={i}>{x}</li>)}</ul></>}
            <p className="small"><a href={s.official_url} target="_blank" rel="noreferrer">{t("official")} ↗</a> · {t("checked")}: {s.source_checked_on}</p>
          </div></div>
        </article>
      ))}
    </section>
  );
}
