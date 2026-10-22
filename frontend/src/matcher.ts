import type { Key } from "./i18n";

export type V = string | number | boolean | null;
const words = (s: string) => new Set(s.toLowerCase().match(/[\p{L}\p{M}\p{N}]+/gu) ?? []);

const YES = ["yes", "yeah", "yep", "yup", "ok", "okay", "avunu", "avunandi", "haan", "han", "హాఁ", "అవును", "ఔను", "అవునండి", "हाँ", "हां", "जी"];
const NO = ["no", "nope", "nahi", "nahin", "kadu", "kaadu", "ledu", "కాదు", "లేదు", "కాదండి", "లేదండి", "नहीं", "नही"];
const UNSURE = ["not sure", "don't know", "dont know", "unsure", "teliyadu", "తెలియదు", "పతా", "पता नहीं", "पता नही"];
const EXTRA: Partial<Record<Key, string[]>> = {
  iti: ["iti", "ఐటీఐ", "आईटीआई"], poly: ["polytechnic", "diploma", "పాలిటెక్నిక్", "पॉलिटेक्निक"],
  degree: ["degree", "graduation", "btech", "డిగ్రీ", "डिग्री"], pg: ["postgraduation", "post graduation", "pg", "masters", "mtech", "పోస్ట్ గ్రాడ్యుయేషన్", "पोस्ट ग्रेजुएशन"],
  SC: ["sc", "scheduled caste", "ఎస్సీ", "एससी"], ST: ["st", "scheduled tribe", "ఎస్టీ", "एसटी"], BC: ["bc", "backward", "బీసీ", "बीसी"], EBC: ["ebc", "ఈబీసీ", "ईबीसी"],
  KAPU: ["kapu", "కాపు", "कापू"], MINORITY: ["minority", "muslim", "christian", "మైనారిటీ", "अल्पसंख्यक"],
  PWD: ["disabled", "disability", "divyang", "differently abled", "దివ్యాంగ", "దివ్యాంగులు", "दिव्यांग"], OTHER: ["none", "none of these", "general", "ఇవేవీ కాదు", "कोई नहीं"],
  seg_student: ["student", "vidyarthi", "విద్యార్థి", "विद्यार्थी"], seg_woman: ["woman", "women", "mahila", "lady", "మహిళ", "మహిళా", "महिला"], seg_farmer: ["farmer", "raithu", "rythu", "kisan", "రైతు", "किसान"],
  ch_none: ["no", "not pregnant", "కాదు", "లేదు", "नहीं"], ch_first: ["first", "మొదటి", "पहला", "पहली"],
  ch_second_girl: ["second girl", "second child girl", "second daughter", "రెండవ ఆడపిల్ల", "రెండో ఆడపిల్ల", "दूसरी लड़की", "दूसरा बच्चा लड़की"],
  ch_second_boy: ["second boy", "second child boy", "second son", "రెండవ మగపిల్లవాడు", "రెండో మగ", "दूसरा लड़का"], ch_later: ["third", "later", "మూడవ", "మూడో", "तीसरा"],
  ft_landowner: ["own", "owner", "landowner", "my own", "సొంతం", "నా సొంతం", "अपनी"], ft_tenant: ["tenant", "rented", "lease", "kaulu", "కౌలు", "बटाईदार"],
};

export function matchOptions(text: string, opts: [V, Key][], t: (k: Key) => string): V[] {
  const low = text.toLowerCase(); const ws = words(text);
  const has = (p: string) => (p.includes(" ") ? low.includes(p) : ws.has(p));
  const unsure = UNSURE.some((p) => low.includes(p));
  const hit = (k: Key): boolean => {
    if (k === "unsure") return unsure;
    if (unsure) return false;
    if (k === "yes") return YES.some(has);
    if (k === "no") return NO.some(has);
    const label = t(k).toLowerCase();
    if ((EXTRA[k] ?? []).some(has)) return true;
    return /^[a-z]{1,4}$/.test(label) ? ws.has(label) : low.includes(label);
  };
  return opts.filter(([, k]) => hit(k)).map(([v]) => v);
}

/** "2 lakh", "3.5 లక్షలు", "डेढ़ नहीं" (digits only) or a plain number like 300000 -> rupees */
export function parseIncome(text: string): number | null {
  const m = text.match(/(\d+(?:[.,]\d+)?)\s*(lakh|lakhs|lac|లక్ష\S*|लाख)/i);
  if (m) return parseFloat(m[1].replace(",", ".")) * 100000;
  const n = text.replace(/,/g, "").match(/\b(\d{4,9})\b/);
  return n ? parseInt(n[1], 10) : null;
}
