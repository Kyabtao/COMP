#!/usr/bin/env node
"use strict";
/**
 * Builds tools/categories/*.js — the question bank files that index.html loads.
 * Deterministic: run `node tools/build-qbank.js` and you get the same bank.
 *
 * Allocation order matters. Subject categories claim their own pools first, the
 * aptitude categories then stream unlimited numeric questions, and GK Misc is
 * filled last from whatever fact capacity is left, split into 17 part files.
 */
const fs = require("fs");
const path = require("path");
const { Rand } = require("./qcore");
const { tableQuestions, capacity } = require("./forms");
const { spec } = require("./tables");
const { CATEGORIES, CLASSES, EXAMS } = require("./spec");
const numeric = require("./numeric");
const { assertQuestion } = require("./question-schema");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(__dirname, "categories");
const AUTHORED = path.join(__dirname, "authored");
const DAILY = path.join(__dirname, "daily");

/**
 * Allocation phases. Niche categories claim their small pools first, broad subject
 * categories are filled to 1,000 next, the aptitude categories stream unlimited
 * numeric questions, and GK Misc (last) takes whatever fact capacity remains.
 */
const PHASE_A = [
  "abbreviations", "computer-awareness", "environmental-studies", "economics",
  "physics", "chemistry", "biology", "sports", "awards-honours", "books-authors",
  "days-events", "inventions-discoveries", "general-awareness", "general-english-grammar"
];
/** Caps for the niche categories, so the catch-all GK Misc can reach its target. */
const PHASE_A_CAPS = {
  abbreviations: 280, "computer-awareness": 280, "environmental-studies": 280,
  economics: 280, "days-events": 280, "general-awareness": 280, biology: 280,
  "general-english-grammar": 280, physics: 260, chemistry: 260, sports: 260,
  "awards-honours": 260, "books-authors": 260, "inventions-discoveries": 260,
  "indian-polity": 1000
};
const PHASE_B = [
  "english", "general-knowledge", "static-gk", "general-science", "geography",
  "indian-history", "indian-polity", "current-affairs"
];
const PHASE_C = [
  { slug: "reasoning", stream: "reasoningStream", cap: 1500 },
  { slug: "quantitative-aptitude", stream: "quantStream", cap: 1500 },
  { slug: "mathematics", stream: "mathsStream", cap: 1500 }
];
const FILL_ORDER = PHASE_A.concat(PHASE_B, PHASE_C.map((p) => p.slug), ["gk-misc"]);

const seenQuestions = new Set();
const norm = (s) => String(s).toLowerCase().replace(/\s+/g, " ").trim();
/** Question identity includes the options, because matched pair items share a stem. */
const keyOf = (q) => norm(q.q) + "|" + norm((q.opts || []).slice().sort().join("~"));

function loadAuthored(slug) {
  const f = path.join(AUTHORED, slug + ".js");
  if (!fs.existsSync(f)) return [];
  return require(f).map((q, index) => {
    assertQuestion(q, slug + " authored question " + (index + 1));
    return {
      question: q.question, options: q.options, answer: q.answer, explanation: q.explanation,
      topic: q.topic || "Curated", level: q.level === undefined ? 1 : q.level, source: "curated"
    };
  });
}

/**
 * Daily scheduler questions for one category, oldest day first. Each day file
 * is tools/daily/YYYY-MM-DD.js (see tools/daily.js). Items carry their own
 * stable ids so the positional numbering below never renumbers old questions.
 */
function loadDaily(slug) {
  if (!fs.existsSync(DAILY)) return [];
  const files = fs.readdirSync(DAILY).filter((f) => /^\d{4}-\d{2}-\d{2}\.js$/.test(f)).sort();
  const out = [];
  files.forEach((f) => {
    const day = require(path.join(DAILY, f));
    (day.questions || []).forEach((q, index) => {
      if (q.category !== slug) return;
      assertQuestion(q, "daily " + day.date + " question " + (index + 1));
      const key = keyOf({ q: q.question, opts: q.options });
      if (seenQuestions.has(key)) return; // a manual re-run must never duplicate
      seenQuestions.add(key);
      out.push({
        id: slug + "-daily-" + day.date + "-" + String(index + 1).padStart(2, "0"),
        question: q.question, options: q.options, answer: q.answer, explanation: q.explanation,
        topic: q.topic, level: q.level === undefined ? 1 : q.level,
        source: "daily", dailyDate: day.date
      });
    });
  });
  return out;
}

/** Internal generators use compact fields; publish only the documented MCQ schema. */
function generatedQuestion(q) {
  return assertQuestion({
    question: q.q, options: q.opts, answer: q.ans, explanation: q.e,
    topic: q.topic, level: q.level, source: "generated"
  }, "Generated question " + q.q);
}

/** Round robin over a category's table specs, keeping only fresh questions. */
function poolFor(catSlug, seed) {
  const specs = spec.filter((s) => s.categories.indexOf(catSlug) !== -1);
  const streams = specs.map((s) => {
    const rows = s.rows.filter((r) => (s.filter ? s.filter(r) : true));
    return { topic: s.topic, gen: tableQuestions(s, new Rand(seed + rows.length)), done: false };
  });
  return {
    pools: specs.map((s) => s.topic),
    /** Pull up to n questions round-robin across this category's tables. */
    pull(n, take) {
      const out = [];
      let guard = 0;
      while (out.length < n && guard++ < n * 40) {
        let progress = false;
        for (const st of streams) {
          if (out.length >= n) break;
          const r = st.gen.next();
          if (r.done) { st.done = true; continue; }
          progress = true;
          const q = r.value;
          const key = keyOf(q);
          if (seenQuestions.has(key)) continue;
          seenQuestions.add(key);
          const item = generatedQuestion(q);
          if (take) take(item);
          out.push(item);
        }
        if (!progress) break;
      }
      return out;
    }
  };
}

function numericFill(catSlug, streamFactory, target, seed) {
  const stream = streamFactory();
  const out = [];
  let guard = 0;
  while (out.length < target && guard++ < target * 20) {
    const q = stream.next();
    if (!q) break;
    const key = keyOf(q);
    if (seenQuestions.has(key)) continue;
    seenQuestions.add(key);
    out.push(generatedQuestion(q));
  }
  return out;
}

function writeCategoryFile(fileName, data) {
  const body = [
    '"use strict";',
    "/* Generated by tools/build-qbank.js — do not edit by hand. */",
    "(function () {",
    "  var data = " + JSON.stringify(data, null, 1) + ";",
    "  if (typeof module !== \"undefined\" && module.exports) module.exports = data;",
    "  if (typeof window !== \"undefined\") {",
    "    window.QBANK_CATEGORIES = window.QBANK_CATEGORIES || {};",
    "    window.QBANK_CATEGORIES[data.slug] = data;",
    "  }",
    "})();",
    ""
  ].join("\n");
  fs.writeFileSync(path.join(OUT, fileName), body);
  return Buffer.byteLength(body);
}

function meta(cat, count) {
  return {
    slug: cat.slug, name: cat.name, icon: cat.icon, group: cat.group,
    exams: cat.exams, blurb: cat.blurb, count: count
  };
}

function main() {
  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(path.join(OUT, "gk-misc"), { recursive: true });

  const built = {};
  const bySlug = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c]));
  let seed = 20261007;
  const report = [];

  for (const slug of FILL_ORDER) {
    const cat = bySlug[slug];
    if (!cat) continue;
    seed += 7919;

    if (slug === "gk-misc") continue; // handled after everything else

    let questions = loadAuthored(slug);
    let pool = null;

    if (cat.type === "volume") {
      pool = poolFor(slug, seed);
      const need = Math.max(0, (cat.target || 1000) - questions.length);
      questions = questions.concat(pool.pull(need));
    } else {
      // authored categories: curated first, then generated fill from their own pools
      pool = poolFor(slug, seed);
      const cap = PHASE_A_CAPS[slug] || cat.target || 400;
      const need = Math.max(0, cap - questions.length);
      questions = questions.concat(pool.pull(need));
    }

    // aptitude categories have unlimited numeric capacity
    const numericSpec = PHASE_C.find((p) => p.slug === slug);
    if (numericSpec) {
      const cap = Math.max(numericSpec.cap, questions.length);
      questions = questions.concat(numericFill(slug, numeric[numericSpec.stream], Math.max(0, cap - questions.length), seed));
    }

    // daily scheduler additions go last, so existing ids never shift
    questions = questions.concat(loadDaily(slug));

    questions = questions.map((q, i) => ({ id: slug + "-" + String(i + 1).padStart(5, "0"), ...q }));
    built[slug] = questions;
    const bytes = writeCategoryFile(cat.file + ".js", Object.assign(meta(cat, questions.length), { questions }));
    report.push({ slug, count: questions.length, target: cat.target, bytes });
  }

  /* ---------------- GK Misc: everything left, in 17 parts ---------------- */
  const gkCat = bySlug["gk-misc"];
  const gkPool = poolFor("gk-misc", 987654321);
  const gkTarget = gkCat.target;
  const gkAuthored = loadAuthored("gk-misc");
  const gkQuestions = gkAuthored.concat(gkPool.pull(gkTarget - gkAuthored.length));
  const partSize = Math.ceil(Math.max(1, gkQuestions.length / 17));
  const parts = [];
  for (let p = 0; p < 17; p++) {
    const chunk = gkQuestions.slice(p * partSize, (p + 1) * partSize)
      .map((q, i) => ({ id: "gk-misc-p" + String(p + 1).padStart(2, "0") + "-" + String(i + 1).padStart(4, "0"), ...q }));
    const partMeta = Object.assign(meta(gkCat, chunk.length), {
      slug: "gk-misc:part-" + String(p + 1).padStart(2, "0"),
      name: gkCat.name + " — Part " + String(p + 1).padStart(2, "0"),
      part: p + 1, totalParts: 17, parent: "gk-misc"
    });
    const bytes = writeCategoryFile(path.join("gk-misc", "part-" + String(p + 1).padStart(2, "0") + ".js"),
      Object.assign(partMeta, { questions: chunk }));
    parts.push({ part: p + 1, count: chunk.length, bytes });
  }
  const gkAggregate = Object.assign(meta(gkCat, gkQuestions.length), {
    parts: 17, questions: gkQuestions.map((q, i) => ({ id: "gk-misc-" + String(i + 1).padStart(5, "0"), ...q }))
  });
  const gkBytes = writeCategoryFile("gk-misc.js", gkAggregate);
  report.push({ slug: "gk-misc", count: gkQuestions.length, target: gkTarget, bytes: gkBytes, parts });

  /* ---------------- manifest + root qbank ---------------- */
  const files = CATEGORIES.filter((c) => c.slug !== "gk-misc").map((c) => "tools/categories/" + c.file + ".js");
  files.push("tools/categories/gk-misc/" + "part-01.js");
  const manifest = CATEGORIES.map((c) => ({
    slug: c.slug, name: c.name, file: c.file, icon: c.icon, group: c.group,
    exams: c.exams, blurb: c.blurb, count: (built[c.slug] || gkQuestions).length,
    ...(c.slug === "gk-misc" ? { parts: 17, partDir: "tools/categories/gk-misc", aggregate: "tools/categories/gk-misc.js" } : {})
  }));
  fs.writeFileSync(path.join(OUT, "index.js"), [
    '"use strict";',
    "/* Generated manifest of every category file. */",
    "var manifest = " + JSON.stringify(manifest, null, 1) + ";",
    "if (typeof module !== \"undefined\" && module.exports) module.exports = manifest;",
    "if (typeof window !== \"undefined\") window.QBANK_MANIFEST = manifest;",
    "if (typeof window !== \"undefined\") (window.QBANK_CATEGORIES = window.QBANK_CATEGORIES || {});",
    ""
  ].join("\n"));

  const total = Object.values(built).reduce((a, q) => a + q.length, 0) + gkQuestions.length;
  const summary = {
    generatedAt: new Date().toISOString(),
    totalQuestions: total,
    categories: report.map((r) => ({ slug: r.slug, count: r.count, target: r.target })),
    gkMiscParts: parts.map((p) => ({ part: p.part, count: p.count })),
    classes: CLASSES.length,
    exams: EXAMS.map((e) => e.name)
  };
  fs.writeFileSync(path.join(__dirname, "build-summary.json"), JSON.stringify(summary, null, 2));

  console.log("Built " + report.length + " categories with " + total + " total questions.");
  for (const r of report) console.log("  " + r.slug.padEnd(24) + String(r.count).padStart(6) + " / target " + r.target);
  console.log("  gk-misc parts: " + parts.map((p) => p.count).join(", "));
}

main();
