import type { Lang } from "./i18n";

const CODE: Record<Lang, string> = { en: "en-IN", te: "te-IN", hi: "hi-IN" };
type Rec = { lang: string; interimResults: boolean; maxAlternatives: number; start(): void; onresult: ((e: any) => void) | null; onerror: ((e: any) => void) | null; onend: (() => void) | null };
const RecClass = (): (new () => Rec) | undefined => (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const canListen = () => !!RecClass();
export const canSpeak = () => "speechSynthesis" in window;
const voiceFor = (lang: Lang) => {
  const vs = speechSynthesis.getVoices();
  return vs.find((v) => v.lang.replace("_", "-").toLowerCase() === CODE[lang].toLowerCase()) ?? vs.find((v) => v.lang.toLowerCase().startsWith(lang));
};
export const hasVoice = (lang: Lang) => canSpeak() && !!voiceFor(lang);

export function speak(text: string, lang: Lang) {
  if (!canSpeak()) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = CODE[lang]; u.rate = 0.95;
  const v = voiceFor(lang); if (v) u.voice = v;
  speechSynthesis.speak(u);
}
export const stopSpeaking = () => { if (canSpeak()) speechSynthesis.cancel(); };

export function listen(lang: Lang): Promise<string> {
  return new Promise((resolve, reject) => {
    const C = RecClass();
    if (!C) return reject(new Error("unsupported"));
    const r = new C(); let got = "";
    r.lang = CODE[lang]; r.interimResults = false; r.maxAlternatives = 1;
    r.onresult = (e) => { got = e.results[0][0].transcript; };
    r.onerror = (e) => reject(new Error(e.error || "error"));
    r.onend = () => resolve(got);
    r.start();
  });
}
