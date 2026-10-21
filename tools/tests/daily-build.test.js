"use strict";
/**
 * The build grows the bank: it mints the day's questions, stores them and
 * appends them to their categories. These tests cover that loop.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const daily = require("../daily");
const { parseArgs } = require("../build-qbank");

const BUILD = path.join(__dirname, "..", "build-qbank.js");

function tmpDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

/** Run the build into throwaway folders, so the repo stays untouched. */
function runBuild(args, env) {
  const out = tmpDir("qbank-out-");
  const days = tmpDir("qbank-days-");
  const summary = path.join(out, "build-summary.json");
  execFileSync("node", [BUILD, ...args], {
    env: Object.assign({}, process.env, { QBANK_OUT: out, DAILY_DIR: days, QBANK_SUMMARY: summary }, env),
    stdio: "pipe"
  });
  return { out, days, summary };
}

test("the build command line is read the way the docs say", () => {
  const base = parseArgs(["node", "build-qbank.js"]);
  assert.equal(base.mint, true);
  assert.equal(base.catchUp, false);
  assert.equal(base.count, daily.DEFAULT_COUNT);
  assert.match(base.date, /^\d{4}-\d{2}-\d{2}$/);

  const custom = parseArgs(["node", "build-qbank.js", "--date", "2026-11-01", "--daily-count", "15", "--catch-up", "--no-daily"]);
  assert.equal(custom.date, "2026-11-01");
  assert.equal(custom.count, 15);
  assert.equal(custom.catchUp, true);
  assert.equal(custom.mint, false);

  assert.throws(() => parseArgs(["node", "build-qbank.js", "--date", "tomorrow"]), /date must look like/);
  assert.throws(() => parseArgs(["node", "build-qbank.js", "--daily-count", "0"]), /daily count must be/);
  assert.throws(() => parseArgs(["node", "build-qbank.js", "--wat"]), /unknown argument/);
});

test("a day is minted once and stored, a second run leaves it alone", () => {
  const dir = tmpDir("daily-once-");
  try {
    const first = daily.ensureDaily("2026-11-01", 5, { dir, keys: new Set() });
    assert.equal(first.created, true);
    assert.equal(first.questions.length, 5);
    assert.ok(fs.existsSync(first.file));
    assert.deepEqual(require(first.file).questions, first.questions);

    const second = daily.ensureDaily("2026-11-01", 5, { dir, keys: new Set() });
    assert.equal(second.created, false);
    assert.equal(fs.readdirSync(dir).length, 1);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("a minted day never repeats a question that is already published", () => {
  const dir = tmpDir("daily-fresh-");
  try {
    const keys = daily.publishedKeys();
    const day = daily.ensureDaily("2026-11-02", 10, { dir, keys });
    assert.equal(day.questions.length, 10);
    for (const q of day.questions) {
      assert.ok(!keys.has(daily.keyOf(q.question, q.options)), "new question: " + q.question);
    }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("published keys cover the bank and every stored day", () => {
  const dir = tmpDir("daily-keys-");
  try {
    daily.ensureDaily("2026-11-03", 3, { dir, keys: new Set() });
    const keys = daily.publishedKeys(dir);
    const stored = require(path.join(dir, "2026-11-03.js"));
    for (const q of stored.questions) {
      assert.ok(keys.has(daily.keyOf(q.question, q.options)), "stored day is in the key set");
    }
    const bank = require("../../qbank.js");
    const sample = bank.questions()[0];
    assert.ok(keys.has(daily.keyOf(sample.question, sample.options)), "the bank is in the key set");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("the missing days are worked out from the last stored one", () => {
  const dir = tmpDir("daily-gap-");
  try {
    daily.ensureDaily("2026-11-01", 3, { dir, keys: new Set() });
    assert.deepEqual(daily.missingDates("2026-11-04", dir), ["2026-11-02", "2026-11-03", "2026-11-04"]);
    assert.deepEqual(daily.missingDates("2026-11-01", dir), []);
    assert.deepEqual(daily.dateRange("2026-11-30", "2026-12-02"), ["2026-11-30", "2026-12-01", "2026-12-02"]);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("a build mints the day, stores it and appends it to the categories", () => {
  const { out, days, summary } = runBuild(["--date", "2026-11-04", "--daily-count", "6"]);
  try {
    const dayFile = path.join(days, "2026-11-04.js");
    assert.ok(fs.existsSync(dayFile), "the day is stored");
    const day = require(dayFile);
    assert.equal(day.questions.length, 6);

    const english = require(path.join(out, "english.js"));
    const added = english.questions.filter((q) => q.source === "daily" && q.dailyDate === "2026-11-04");
    const fromDay = day.questions.filter((q) => q.category === "english");
    assert.equal(added.length, fromDay.length);
    assert.ok(added.length > 0, "the day reached the english category");
    for (const q of added) {
      assert.match(q.id, /-daily-2026-11-04-\d\d$/, "stable daily id: " + q.id);
      assert.ok(q.explanation, "every daily question explains itself");
    }

    /* the questions that were already published keep their ids */
    const published = require("../../tools/categories/english.js");
    const withoutDaily = (c) => c.questions.filter((q) => q.source !== "daily").map((q) => q.id);
    assert.deepEqual(withoutDaily(english), withoutDaily(published), "old ids never move");

    const report = JSON.parse(fs.readFileSync(summary, "utf8"));
    assert.equal(report.daily.minted.length, 1);
    assert.equal(report.daily.minted[0].date, "2026-11-04");
    assert.equal(report.daily.minted[0].questions, 6);
    assert.equal(report.totalQuestions, report.categories.reduce((a, c) => a + c.count, 0));
  } finally {
    fs.rmSync(out, { recursive: true, force: true });
    fs.rmSync(days, { recursive: true, force: true });
  }
});

test("a bank that cannot be read in full stops the mint", () => {
  /* one unreadable category file must not let a duplicate through */
  const dir = tmpDir("daily-broken-");
  try {
    const bank = daily.bankKeys();
    assert.equal(bank.complete, true, "the published bank reads cleanly");
    assert.ok(bank.keys.size > 30000, "the whole bank is in the key set");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("a build without the daily step adds nothing", () => {
  const { out, days } = runBuild(["--no-daily"]);
  try {
    assert.deepEqual(fs.readdirSync(days), [], "no day is stored");
    const english = require(path.join(out, "english.js"));
    const published = require("../../tools/categories/english.js");
    const withoutDaily = (c) => c.questions.filter((q) => q.source !== "daily").map((q) => q.id);
    assert.deepEqual(withoutDaily(english), withoutDaily(published), "the same questions, the same ids");
  } finally {
    fs.rmSync(out, { recursive: true, force: true });
    fs.rmSync(days, { recursive: true, force: true });
  }
});
