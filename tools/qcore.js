"use strict";
/** Core helpers for deterministic question generation. */

/** Deterministic PRNG (mulberry32) so every build is reproducible. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

class Rand {
  constructor(seed) {
    this.next = mulberry32(seed);
  }
  int(n) {
    return Math.floor(this.next() * n);
  }
  pick(arr) {
    return arr[this.int(arr.length)];
  }
  /** Fisher-Yates shuffle on a copy. */
  shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = this.int(i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  sample(arr, n, exclude) {
    const ex = new Set(exclude || []);
    const pool = arr.filter((v) => !ex.has(v));
    const out = [];
    const copy = pool.slice();
    while (out.length < n && copy.length) {
      const i = this.int(copy.length);
      out.push(copy[i]);
      copy.splice(i, 1);
    }
    return out;
  }
}

/** Normalise a value to a display string. */
function txt(v) {
  return String(v == null ? "" : v).trim();
}

/** Build 4 shuffled options from an answer and candidate distractors. */
function options(rand, answer, candidates, count) {
  const n = count || 4;
  const ans = txt(answer);
  const seen = new Set([ans.toLowerCase()]);
  const distractors = [];
  const pool = rand.shuffle(candidates.map(txt));
  for (const c of pool) {
    const key = c.toLowerCase();
    if (!c || seen.has(key)) continue;
    seen.add(key);
    distractors.push(c);
    if (distractors.length >= n - 1) break;
  }
  if (distractors.length < n - 1) return null; // not enough distinct wrong options
  const all = rand.shuffle(distractors.concat([ans]));
  return { opts: all, ans: all.indexOf(ans) };
}

/** Convert a year to its century label, e.g. 1857 -> "19th century". */
function century(y) {
  const n = parseInt(y, 10);
  if (!isFinite(n)) return null;
  const c = Math.floor((n - 1) / 100) + 1;
  const suffix = c % 100 >= 11 && c % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][c % 10] || "th";
  return c + suffix + " century";
}

/** Convert a year to its decade label, e.g. 1857 -> "1850s". */
function decade(y) {
  const n = parseInt(y, 10);
  if (!isFinite(n)) return null;
  return Math.floor(n / 10) * 10 + "s";
}

function titleCase(s) {
  return String(s).replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1));
}

/** Jaccard similarity of significant words between two question stems. */
function similarity(a, b) {
  const stop = new Set(["which", "what", "who", "is", "the", "of", "in", "a", "an", "to", "and", "does", "did",
    "was", "were", "are", "it", "that", "this", "for", "on", "by", "from", "with", "as", "at", "be", "has",
    "have", "had", "known", "called", "named", "following", "one", "most", "how", "many", "there", "belongs",
    "associated", "described", "observed", "located", "found", "used", "study", "studies"]);
  const tok = (s) => new Set(String(s).toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/)
    .filter((w) => w && !stop.has(w)));
  const A = tok(a), B = tok(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const w of A) if (B.has(w)) inter++;
  return inter / (A.size + B.size - inter);
}

module.exports = { Rand, mulberry32, options, txt, century, decade, titleCase, similarity };
