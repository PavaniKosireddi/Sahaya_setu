import { describe, expect, it } from "vitest";
import { T } from "./i18n";
import { matchOptions, parseIncome, V } from "./matcher";
import type { Key } from "./i18n";

const en = (k: Key) => T.en[k];
const te = (k: Key) => T.te[k];
const YN: [V, Key][] = [[true, "yes"], [false, "no"], [null, "unsure"]];
const SEG: [V, Key][] = [["student", "seg_student"], ["woman", "seg_woman"], ["farmer", "seg_farmer"]];
const CASTE: [V, Key][] = ["SC", "ST", "BC", "EBC", "KAPU"].map((c) => [c, c as Key]);

describe("voice matching", () => {
  it("yes/no in English, Telugu and Hindi", () => {
    expect(matchOptions("yes please", YN, en)).toEqual([true]);
    expect(matchOptions("అవును", YN, te)).toEqual([true]);
    expect(matchOptions("కాదు", YN, te)).toEqual([false]);
    expect(matchOptions("nahi", YN, en)).toEqual([false]);
    expect(matchOptions("हाँ", YN, en)).toEqual([true]);
  });
  it("not sure wins over no", () => {
    expect(matchOptions("I don't know", YN, en)).toEqual([null]);
    expect(matchOptions("తెలియదు", YN, te)).toEqual([null]);
  });
  it("does not match short labels inside words", () => {
    expect(matchOptions("I am a student", CASTE, en)).toEqual([]);
    expect(matchOptions("I am BC", CASTE, en)).toEqual(["BC"]);
  });
  it("multi-select segments", () => {
    expect(matchOptions("I am a student and a farmer", SEG, en)).toEqual(["student", "farmer"]);
    expect(matchOptions("నేను రైతును", SEG, te)).toEqual(["farmer"]);
  });
});

describe("income parsing", () => {
  it("handles lakh and plain numbers", () => {
    expect(parseIncome("about 2 lakh")).toBe(200000);
    expect(parseIncome("3.5 lakhs per year")).toBe(350000);
    expect(parseIncome("2 లక్షలు")).toBe(200000);
    expect(parseIncome("300000")).toBe(300000);
    expect(parseIncome("not much")).toBeNull();
  });
});
