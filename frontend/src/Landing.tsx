import { useEffect, useState } from "react";
import { Brief, getSchemes, getStates, getStats, StateInfo } from "./api";
import { FarmerArt, HeroArt, Logo, StudentArt, WomanArt } from "./art";
import { Counter, Reveal } from "./hooks";
import { L, LANGS, Lang, LKey } from "./i18n";

type Props = { lang: Lang; setLang: (l: Lang) => void; onStart: (segments?: string[]) => void };
const ICON: Record<string, string> = { education: "🎓", women: "👩", agriculture: "🌾", registration: "📝" };
const FAQ: [LKey, LKey][] = [["q1", "a1"], ["q2", "a2"], ["q3", "a3"], ["q4", "a4"], ["q5", "a5"]];

export default function Landing({ lang, setLang, onStart }: Props) {
  const l = (k: LKey) => L[lang][k] ?? L.en[k] ?? "";
  const [schemes, setSchemes] = useState<Brief[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [states, setStates] = useState<StateInfo[]>([]);
  const [sel, setSel] = useState("AP");
  const count = stats[sel] ?? 0;
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(0);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    getStates().then(setStates).catch(() => {});
    getStats().then(setStats).catch(() => {});
    const on = () => setScrolled(window.scrollY > 12);
    on(); window.addEventListener("scroll", on);
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => { getSchemes(sel).then(setSchemes).catch(() => setSchemes([])); }, [sel]);

  const go = (id: string) => { setMenu(false); document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); };
  const feats: [string, LKey, LKey][] = [["🏛️", "f1", "f1d"], ["🗣️", "f2", "f2d"], ["📄", "f3", "f3d"], ["🔒", "f4", "f4d"], ["✅", "f5", "f5d"], ["🗺️", "f6", "f6d"]];

  return (
    <>
      <nav className={`nav ${scrolled ? "solid" : ""}`}>
        <div className="wrap nav-in">
          <a className="brand" href="#top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}><Logo /><span>{lang === "te" ? "సహాయ సేతు" : lang === "hi" ? "सहाय सेतु" : "Sahaya Setu"}</span></a>
          <div className={`links ${menu ? "open" : ""}`}>
            <button onClick={() => go("who")}>{l("nav_who")}</button><button onClick={() => go("how")}>{l("nav_how")}</button>
            <button onClick={() => go("schemes")}>{l("nav_schemes")}</button><button onClick={() => go("faq")}>{l("nav_faq")}</button>
          </div>
          <div className="nav-r">
            <select value={lang} onChange={(e) => setLang(e.target.value as Lang)} aria-label="Language">{LANGS.map((x) => <option key={x.code} value={x.code}>{x.label}</option>)}</select>
            <button className="btn sm" onClick={() => onStart()}>{l("cta")}</button>
            <button className="burger" aria-label="Menu" onClick={() => setMenu(!menu)}>☰</button>
          </div>
        </div>
      </nav>

      <header className="hero" id="top">
        <div className="blob b1" /><div className="blob b2" /><div className="blob b3" />
        <div className="wrap hero-in">
          <div className="hero-copy">
            <span className="badge-pill"><i className="dot" />{l("hero_badge")}</span>
            <h1>{l("hero_title")}</h1>
            <p>{l("hero_sub")}</p>
            <div className="hero-cta">
              <button className="btn lg" onClick={() => onStart()}>{l("cta")} →</button>
              <button className="btn ghost lg" onClick={() => go("how")}>{l("hero_cta2")}</button>
            </div>
            <div className="stats">
              <div><b><Counter key={count} to={count} /></b><span>{l("stat_schemes")}</span></div>
              <div><b><Counter to={3} /></b><span>{l("stat_langs")}</span></div>
              <div><b>~<Counter to={2} /></b><span>{l("stat_min")}</span></div>
              <div><b><Counter to={0} /></b><span>{l("stat_id")}</span></div>
            </div>
          </div>
          <div className="hero-art">
            <HeroArt />
            <span className="chip c1">{l("chip1")}</span><span className="chip c2">{l("chip2")}</span><span className="chip c3">{l("chip3")}</span>
          </div>
        </div>
      </header>

      {schemes.length > 0 && (
        <div className="marquee" aria-hidden="true"><div className="track">
          {[...schemes, ...schemes].map((s, i) => <span key={i}>{ICON[s.category] ?? "•"} {s.name}</span>)}
        </div></div>
      )}

      <section id="who" className="sec">
        <div className="wrap">
          <Reveal><h2 className="title">{l("who_title")}</h2><p className="sub">{l("who_sub")}</p></Reveal>
          <div className="grid3">
            {([["student", <StudentArt />, "who_student", "who_student_d"], ["woman", <WomanArt />, "who_woman", "who_woman_d"], ["farmer", <FarmerArt />, "who_farmer", "who_farmer_d"]] as [string, JSX.Element, LKey, LKey][]).map(([seg, art, t, d], i) => (
              <Reveal key={seg} delay={i * 120}>
                <div className="card who">{art}<h3>{l(t)}</h3><p>{l(d)}</p>
                  <button className="btn ghost sm" onClick={() => onStart([seg])}>{l("who_go")} →</button></div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="sec alt">
        <div className="wrap">
          <Reveal><h2 className="title">{l("how_title")}</h2><p className="sub">{l("how_sub")}</p></Reveal>
          <div className="steps">
            {(["s1", "s2", "s3"] as const).map((k, i) => (
              <Reveal key={k} delay={i * 140}><div className="step"><span className="num">{i + 1}</span><h3>{l(k)}</h3><p>{l(`${k}d` as LKey)}</p></div></Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <Reveal><h2 className="title">{l("feat_title")}</h2></Reveal>
          <div className="grid3">
            {feats.map(([ic, t, d], i) => <Reveal key={t} delay={(i % 3) * 100}><div className="card feat"><span className="ic">{ic}</span><h3>{l(t)}</h3><p>{l(d)}</p></div></Reveal>)}
          </div>
        </div>
      </section>

      <section id="schemes" className="sec alt">
        <div className="wrap">
          <Reveal><h2 className="title">{l("schemes_title")}</h2><p className="sub">{l("schemes_sub")}</p></Reveal>
          <div className="tabs">{states.map((s) => <button key={s.code} className={sel === s.code ? "on" : ""} onClick={() => setSel(s.code)}>{s.name.en}{s.status !== "live" && " (beta)"}</button>)}</div>
          <div className="grid3">
            {schemes.map((s, i) => (
              <Reveal key={s.id} delay={(i % 3) * 90}>
                <div className="card sch"><span className="ic">{ICON[s.category] ?? "📌"}</span><h3>{s.name}</h3><p>{s.summary}</p>
                  <a href={s.official_url} target="_blank" rel="noreferrer">Official source ↗</a></div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="sec">
        <div className="wrap narrow">
          <Reveal><h2 className="title">{l("faq_title")}</h2></Reveal>
          {FAQ.map(([q, a], i) => (
            <div key={q} className={`faq ${open === i ? "open" : ""}`}>
              <button onClick={() => setOpen(open === i ? -1 : i)}>{l(q)}<span>{open === i ? "−" : "+"}</span></button>
              <div className="ans"><p>{l(a)}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-band">
        <div className="wrap"><Reveal><h2>{l("end_title")}</h2><p>{l("end_sub")}</p><button className="btn lg light" onClick={() => onStart()}>{l("cta")} →</button></Reveal></div>
      </section>

      <footer className="foot"><div className="wrap">
        <div className="brand dark"><Logo /><span>Sahaya Setu</span></div>
        <p>{l("foot")}</p>
        <p className="small"><a href="https://github.com/PavaniKosireddi/Sahaya_setu" target="_blank" rel="noreferrer">{l("foot_code")}</a> · <a href="https://github.com/PavaniKosireddi/Sahaya_setu/blob/main/docs/SOURCES.md" target="_blank" rel="noreferrer">{l("foot_src")}</a></p>
      </div></footer>
    </>
  );
}
