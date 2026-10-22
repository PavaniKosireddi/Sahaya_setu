import { useState } from "react";
import Checker from "./Checker";
import Landing from "./Landing";
import { Lang } from "./i18n";

export default function App() {
  const [lang, setLang] = useState<Lang>("en");
  const [view, setView] = useState<"home" | "check">("home");
  const [initial, setInitial] = useState<string[] | undefined>();
  const start = (segments?: string[]) => { setInitial(segments); setView("check"); };
  return view === "home"
    ? <Landing lang={lang} setLang={setLang} onStart={start} />
    : <Checker key={(initial ?? []).join()} lang={lang} setLang={setLang} initial={initial} onExit={() => setView("home")} />;
}
