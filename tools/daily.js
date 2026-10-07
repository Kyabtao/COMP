#!/usr/bin/env node
"use strict";
/**
 * Daily scheduler generator: mints fresh questions for one calendar date.
 *
 *   node tools/daily.js                    # today (UTC), 10 questions
 *   node tools/daily.js --date 2026-10-08  # a specific date
 *   node tools/daily.js --count 15         # more questions that day
 *   node tools/daily.js --force            # regenerate even if the day exists
 *   node tools/daily.js --dry-run          # print the set without writing
 *
 * Every question is produced by the same verified generators as the main bank:
 * computed numeric questions (quantitative aptitude, mathematics, reasoning)
 * plus fact-table questions (English vocab, Static GK and one rotating
 * category). Nothing is invented — every answer is computed or comes from a
 * fact row — and every candidate is checked against the current bank so a
 * daily question is always new.
 *
 * Output is one file per day, tools/daily/YYYY-MM-DD.js, which the build
 * (tools/build-qbank.js) appends to its categories. Generation is
 * deterministic: the same date always produces the same set.
 */
const fs = require("fs");
const path = require("path");
const { Rand } = require("./qcore");
const { tableQuestions } = require("./forms");
const { spec } = require("./tables");
const { CATEGORIES } = require("./spec");
const numeric = require("./numeric");
const { assertQuestion } = require("./question-schema");

const ROOT = path.join(__dirname, "..");
const DAILY_DIR = process.env.DAILY_DIR || path.join(__dirname, "daily");

const DEFAULT_COUNT = 10;
/** Aptitude categories stream unlimited computed questions. */
const NUMERIC_STREAMS = {
  "quantitative-aptitude": "quantStream",
  mathematics: "mathsStream",
  reasoning: "reasoningStream"
};
/** One of these joins the mix each day, rotating by day of year. */
const ROTATION = [
  "general-knowledge", "general-science", "indian-history", "geography",
  "days-events", "computer-awareness", "sports", "economics"
];
const VALID_SLUGS = new Set(CATEGORIES.map((c) => c.slug));

const norm = (s) => String(s).toLowerCase().replace(/\s+/g, " ").trim();
const keyOf = (question, options) =>
  norm(question) + "|" + norm((options || []).slice().sort().join("~"));

/** FNV-1a hash: stable uint32 seed from any string. */
function seedFor(text) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function dayOfYear(dateStr) {
  const d = new Date(dateStr + "T00:00:00Z");
  const jan1 = Date.UTC(d.getUTCFullYear(), 0, 1);
  return Math.floor((d.getTime() - jan1) / 86400000);
}

function rotatingSlug(dateStr) {
  return ROTATION[dayOfYear(dateStr) % ROTATION.length];
}

/** Category wheel for the day: core mix plus the rotating pick. */
function wheelFor(dateStr) {
  return [
    "quantitative-aptitude", "mathematics", "reasoning",
    "english", "static-gk", rotatingSlug(dateStr)
  ];
}

/** Compact generator fields -> authored-style question for a daily file. */
function toDaily(question, category) {
  return assertQuestion({
    category,
    question: question.q,
    options: question.opts,
    answer: question.ans,
    explanation: question.e,
    topic: question.topic,
    level: question.level
  }, "Daily candidate for " + category);
}

/**
 * Pull fresh questions for one category. Numeric streams are unlimited;
 * fact-table streams walk every matching table with the day's seed.
 */
function pullForCategory(slug, seed, need, isFresh) {
  const out = [];
  const streamName = NUMERIC_STREAMS[slug];
  if (streamName) {
    const stream = numeric[streamName](seed);
    for (let tries = 0; out.length < need && tries < need * 200; tries++) {
      const q = stream.next();
      if (!q) break;
      if (!isFresh(q.q, q.opts)) continue;
      out.push(toDaily(q, slug));
    }
    return out;
  }
  const entries = new Rand(seed).shuffle(spec.filter((s) => s.categories.indexOf(slug) !== -1));
  entries.forEach((entry, i) => {
    if (out.length >= need) return;
    const gen = tableQuestions(entry, new Rand(seed + i * 101));
    let guard = 0;
    while (out.length < need && guard++ < 2000) {
      const r = gen.next();
      if (r.done) break;
      const q = r.value;
      if (!isFresh(q.q, q.opts)) continue;
      out.push(toDaily(q, slug));
    }
  });
  return out;
}

/**
 * Generate the daily set. bankKeys holds keyOf() for every question already
 * published, so the day's set is guaranteed new.
 */
function generateDaily(dateStr, count, bankKeys) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr) || isNaN(new Date(dateStr + "T00:00:00Z").getTime())) {
    throw new Error('date must look like 2026-10-08, got "' + dateStr + '"');
  }
  const n = Number(count);
  if (!Number.isInteger(n) || n < 1 || n > 100) {
    throw new Error("count must be a whole number from 1 to 100, got " + count);
  }
  const seen = new Set(bankKeys || []);
  const fresh = [];
  const isFresh = (question, options) => {
    const key = keyOf(question, options);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  };
  const wheel = wheelFor(dateStr);
  for (let i = 0; i < n; i++) {
    const slug = wheel[i % wheel.length];
    const seed = seedFor("examsathi:daily:" + dateStr + ":" + slug + ":" + Math.floor(i / wheel.length));
    let got = pullForCategory(slug, seed, 1, isFresh);
    if (!got.length) {
      // Fact pools can run dry; fall back to unlimited computed questions
      // from another aptitude stream so the day always ships full.
      const fallback = ["quantitative-aptitude", "mathematics", "reasoning"][i % 3];
      got = pullForCategory(fallback, seedFor("examsathi:daily:fallback:" + dateStr + ":" + i), 1, isFresh);
    }
    if (!got.length) throw new Error("could not mint a fresh question for " + dateStr + " slot " + (i + 1));
    fresh.push(got[0]);
  }
  fresh.forEach((q) => {
    if (!VALID_SLUGS.has(q.category)) throw new Error("unknown category " + q.category);
  });
  return { date: dateStr, questions: fresh };
}

function loadBankKeys() {
  const bank = require("../qbank.js");
  const keys = new Set();
  bank.questions().forEach((q) => keys.add(keyOf(q.question, q.options)));
  return keys;
}

function dailyFile(dateStr, dir) {
  return path.join(dir || DAILY_DIR, dateStr + ".js");
}

function saveDaily(payload, dir) {
  const target = dir || DAILY_DIR;
  fs.mkdirSync(target, { recursive: true });
  const body = [
    '"use strict";',
    "/** Daily questions for " + payload.date + " — generated by tools/daily.js. Do not edit by hand. */",
    "module.exports = " + JSON.stringify(payload, null, 2) + ";",
    ""
  ].join("\n");
  fs.writeFileSync(dailyFile(payload.date, target), body);
  return dailyFile(payload.date, target);
}

function todayUTC() {
  return new Date().toISOString().slice(0, 10);
}

function main(argv) {
  const args = (argv || []).slice(2);
  let dateStr = todayUTC();
  let count = DEFAULT_COUNT;
  let force = false;
  let dryRun = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--date" && args[i + 1]) dateStr = args[++i];
    else if (args[i] === "--count" && args[i + 1]) count = Number(args[++i]);
    else if (args[i] === "--force") force = true;
    else if (args[i] === "--dry-run") dryRun = true;
    else if (args[i] === "--help" || args[i] === "-h") {
      console.log("Usage: node tools/daily.js [--date YYYY-MM-DD] [--count N] [--force] [--dry-run]");
      return;
    } else {
      throw new Error("unknown argument " + args[i] + " (try --help)");
    }
  }
  const file = dailyFile(dateStr);
  if (!dryRun && !force && fs.existsSync(file)) {
    console.log("Daily file already exists for " + dateStr + " — nothing to do. (" + file + ")");
    return;
  }
  console.log("Loading the published bank to guarantee fresh questions…");
  const keys = loadBankKeys();
  console.log("Bank holds " + keys.size.toLocaleString("en-IN") + " questions.");
  const payload = generateDaily(dateStr, count, keys);
  if (dryRun) {
    console.log("Dry run — " + payload.questions.length + " questions for " + dateStr + ":");
    payload.questions.forEach((q, i) => console.log("  " + (i + 1) + ". [" + q.category + "] " + q.question));
    return;
  }
  saveDaily(payload);
  const mix = {};
  payload.questions.forEach((q) => { mix[q.category] = (mix[q.category] || 0) + 1; });
  console.log("Wrote " + payload.questions.length + " daily questions for " + dateStr + " to " + file);
  console.log("Mix: " + Object.keys(mix).map((k) => k + " x" + mix[k]).join(", "));
  console.log("Next: node tools/build-qbank.js && node tools/validate.js");
}

if (require.main === module) {
  try {
    main(process.argv);
  } catch (err) {
    console.error("tools/daily.js: " + err.message);
    process.exitCode = 1;
  }
}

module.exports = { generateDaily, saveDaily, dailyFile, loadBankKeys, wheelFor, rotatingSlug, keyOf, DEFAULT_COUNT };
