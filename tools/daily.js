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
 *
 * The build calls ensureDaily() itself, so running the build is enough to
 * grow the bank by a day's worth of questions.
 */
const fs = require("fs");
const path = require("path");
const { Rand } = require("./qcore");
const { tableQuestions } = require("./forms");
const { spec } = require("./tables");
const { CATEGORIES } = require("./spec");
const numeric = require("./numeric");
const { assertQuestion } = require("./question-schema");
const { buildPoolFromNewsData, SUBJECT_WHEEL } = require("./news");

const ROOT = path.join(__dirname, "..");
const DAILY_DIR = process.env.DAILY_DIR || path.join(__dirname, "daily");

const DEFAULT_COUNT = 100;
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

/** Category wheel for the day: core mix plus the rotating pick, followed by all remaining subjects. */
function wheelFor(dateStr) {
  const head = [
    "quantitative-aptitude", "mathematics", "reasoning",
    "english", "static-gk", rotatingSlug(dateStr)
  ];
  const rest = SUBJECT_WHEEL.filter((s) => !head.includes(s));
  return head.concat(rest);
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

let cachedNewsPool = null;
function getNewsPool() {
  if (!cachedNewsPool) cachedNewsPool = buildPoolFromNewsData("daily-shared", true);
  return cachedNewsPool;
}

/**
 * Pull fresh questions for one category. Real-world news & competition
 * questions are drawn first; fact-table and computed streams act as fallbacks.
 */
function pullForCategory(slug, seed, need, isFresh) {
  const out = [];
  const rand = new Rand(seed);
  const newsForSlug = rand.shuffle(getNewsPool().filter((q) => q.category === slug));
  for (const q of newsForSlug) {
    if (out.length >= need) return out;
    if (!isFresh(q.question, q.options)) continue;
    out.push(q);
  }
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
 * published, so the day's set is guaranteed new (both by stem and options).
 */
function generateDaily(dateStr, count, bankKeys) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr) || isNaN(new Date(dateStr + "T00:00:00Z").getTime())) {
    throw new Error('date must look like 2026-10-08, got "' + dateStr + '"');
  }
  const n = count === undefined ? DEFAULT_COUNT : Number(count);
  if (!Number.isInteger(n) || n < 1 || n > 100) {
    throw new Error("count must be a whole number from 1 to 100, got " + count);
  }
  const seen = new Set(bankKeys || []);
  const seenStems = new Set();
  for (const k of seen) {
    const idx = String(k).indexOf("|");
    if (idx !== -1) seenStems.add(String(k).slice(0, idx));
  }
  const fresh = [];
  const isFresh = (question, options) => {
    const stem = norm(question);
    const key = keyOf(question, options);
    if (seen.has(key) || (!/^which of the following pairs/i.test(stem) && seenStems.has(stem))) return false;
    seen.add(key);
    seenStems.add(stem);
    return true;
  };
  const wheel = wheelFor(dateStr);
  const generalNews = new Rand(seedFor("examsathi:daily:news:" + dateStr)).shuffle(getNewsPool().slice());
  for (let i = 0; i < n; i++) {
    const slug = wheel[i % wheel.length];
    const seed = seedFor("examsathi:daily:" + dateStr + ":" + slug + ":" + Math.floor(i / wheel.length));
    let got = pullForCategory(slug, seed, 1, isFresh);
    if (!got.length) {
      for (const q of generalNews) {
        if (isFresh(q.question, q.options)) {
          got = [q];
          break;
        }
      }
    }
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

/** Every stored day file, oldest first. */
function dailyFiles(dir) {
  const target = dir || DAILY_DIR;
  if (!fs.existsSync(target)) return [];
  return fs.readdirSync(target)
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.js$/.test(f))
    .sort()
    .map((f) => path.join(target, f));
}

/** The dates of every stored day, oldest first. */
function storedDates(dir) {
  return dailyFiles(dir).map((f) => path.basename(f, ".js"));
}

/**
 * Keys of every question in the built bank, read one category file at a time.
 * `complete` is false when the manifest lists a file that cannot be read: the
 * key set is then only a part of the bank, and nothing new may be minted on
 * it. A bank that has not been built yet is not a problem — there is nothing
 * published to repeat.
 */
function bankKeys() {
  const keys = new Set();
  const manifestFile = path.join(__dirname, "categories", "index.js");
  if (!fs.existsSync(manifestFile)) return { keys, complete: true };
  let manifest = [];
  try {
    manifest = require(manifestFile);
  } catch (err) {
    return { keys, complete: false };
  }
  let complete = true;
  for (const entry of manifest) {
    const file = path.join(__dirname, "categories", entry.file + ".js");
    let data = null;
    try {
      data = require(file);
    } catch (err) {
      complete = false; // one unreadable file must not hide the rest of the bank
      continue;
    }
    for (const q of data.questions || []) keys.add(keyOf(q.question, q.options));
  }
  return { keys, complete };
}

/** Keys of every question in the stored days. */
function dailyKeys(dir) {
  const keys = new Set();
  dailyFiles(dir).forEach((f) => {
    const day = require(f);
    (day.questions || []).forEach((q) => keys.add(keyOf(q.question, q.options)));
  });
  return keys;
}

/**
 * Keys for everything already published: the built bank plus every stored day.
 * A minted question is checked against this set, so it is always new.
 */
function publishedKeys(dir) {
  const keys = new Set();
  bankKeys().keys.forEach((k) => keys.add(k));
  dailyKeys(dir).forEach((k) => keys.add(k));
  return keys;
}

/**
 * Mint one day and store it. A day that is already stored is left untouched,
 * so this is safe to call on every build — the same day is never minted twice.
 */
function ensureDaily(dateStr, count, options) {
  const opts = options || {};
  const dir = opts.dir || DAILY_DIR;
  const file = dailyFile(dateStr, dir);
  if (fs.existsSync(file)) {
    const stored = require(file);
    return { date: dateStr, file, created: false, questions: stored.questions || [] };
  }
  const keys = new Set(opts.keys || publishedKeys(dir));
  const payload = generateDaily(dateStr, count, keys);
  saveDaily(payload, dir);
  return { date: dateStr, file, created: true, questions: payload.questions };
}

/** The day after a date. */
function nextDay(dateStr) {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/** Every date from `from` to `to`, inclusive. */
function dateRange(from, to) {
  const out = [];
  const cursor = new Date(from + "T00:00:00Z");
  const end = new Date(to + "T00:00:00Z");
  while (cursor.getTime() <= end.getTime()) {
    out.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return out;
}

/**
 * The days still missing up to `target`: everything after the newest stored
 * day, so a build that has not run for a while can catch up in one go.
 */
function missingDates(target, dir) {
  const stored = storedDates(dir);
  if (!stored.length) return [target];
  const last = stored[stored.length - 1];
  if (last >= target) return [];
  return dateRange(nextDay(last), target);
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
    "(function () {",
    "  var data = " + JSON.stringify(payload, null, 2) + ";",
    "  if (typeof module !== \"undefined\" && module.exports) module.exports = data;",
    "  if (typeof window !== \"undefined\") {",
    "    window.QBANK_DAILY_SETS = window.QBANK_DAILY_SETS || {};",
    "    window.QBANK_DAILY_SETS[data.date] = data;",
    "  }",
    "})();",
    ""
  ].join("\n");
  fs.writeFileSync(dailyFile(payload.date, target), body);
  return dailyFile(payload.date, target);
}

function todayUTC() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Rebuild the question bank so the day's questions are in it, not only in the
 * day file. The build is the same one the site is served from, so the day's
 * questions land in their categories with their stable ids. It runs as its own
 * process, so the two tools keep their own state.
 */
function publishToBank() {
  const { execFileSync } = require("child_process");
  execFileSync(process.execPath, [path.join(__dirname, "build-qbank.js"), "--no-daily"], { stdio: "inherit" });
}

function main(argv) {
  const args = (argv || []).slice(2);
  let dateStr = todayUTC();
  let count = DEFAULT_COUNT;
  let force = false;
  let dryRun = false;
  let build = true;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--date" && args[i + 1]) dateStr = args[++i];
    else if (args[i] === "--count" && args[i + 1]) count = Number(args[++i]);
    else if (args[i] === "--force") force = true;
    else if (args[i] === "--dry-run") dryRun = true;
    else if (args[i] === "--no-build") build = false;
    else if (args[i] === "--help" || args[i] === "-h") {
      console.log("Usage: node tools/daily.js [--date YYYY-MM-DD] [--count N] [--force] [--dry-run] [--no-build]");
      console.log("");
      console.log("  (no flag)        mint the day's questions and publish them in the question bank");
      console.log("  --no-build       mint only, leave the question bank alone");
      console.log("  --date D         mint this day instead of today");
      console.log("  --count N        how many questions the day holds (1 to 100)");
      console.log("  --force          mint the day again, even if it is already stored");
      console.log("  --dry-run        print the set without writing anything");
      return;
    } else {
      throw new Error("unknown argument " + args[i] + " (try --help)");
    }
  }
  const file = dailyFile(dateStr);
  if (!dryRun && !force && fs.existsSync(file)) {
    console.log("Daily file already exists for " + dateStr + " (" + file + ").");
    if (build) {
      console.log("Publishing it in the question bank…");
      publishToBank();
    } else {
      console.log("Nothing to do.");
    }
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
  if (!build) {
    console.log("Next: node tools/build-qbank.js && node tools/validate.js");
    return;
  }
  console.log("Publishing the day in the question bank…");
  publishToBank();
  console.log("The question bank now holds the " + payload.questions.length + " questions of " + dateStr + ".");
  console.log("Next: node tools/validate.js");
}

module.exports = {
  generateDaily, saveDaily, dailyFile, loadBankKeys, wheelFor, rotatingSlug, keyOf, DEFAULT_COUNT,
  dailyFiles, storedDates, publishedKeys, bankKeys, dailyKeys, ensureDaily, dateRange, missingDates,
  nextDay, todayUTC, publishToBank
};

/* the exports are published before the command line runs, so that a tool
   required from here (the build) always sees a complete module */
if (require.main === module) {
  try {
    main(process.argv);
  } catch (err) {
    console.error("tools/daily.js: " + err.message);
    process.exitCode = 1;
  }
}
