"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { generateDaily, saveDaily, dailyFile, wheelFor, rotatingSlug, keyOf } = require("../daily");
const { questionErrors } = require("../question-schema");
const { CATEGORIES } = require("../spec");

const SLUGS = new Set(CATEGORIES.map((c) => c.slug));

test("the same date always produces the same set", () => {
  const a = generateDaily("2026-10-08", 10, new Set());
  const b = generateDaily("2026-10-08", 10, new Set());
  assert.deepEqual(a, b);
});

test("different dates produce different sets", () => {
  const a = generateDaily("2026-10-08", 10, new Set());
  const b = generateDaily("2026-10-09", 10, new Set());
  const qa = new Set(a.questions.map((q) => keyOf(q.question, q.options)));
  const shared = b.questions.filter((q) => qa.has(keyOf(q.question, q.options)));
  assert.ok(shared.length < b.questions.length, "a new day should bring new questions");
});

test("every daily question is valid, categorised and unique within the day", () => {
  const day = generateDaily("2026-10-08", 12, new Set());
  assert.equal(day.date, "2026-10-08");
  assert.equal(day.questions.length, 12);
  const seen = new Set();
  for (const q of day.questions) {
    assert.deepEqual(questionErrors(q), []);
    assert.ok(SLUGS.has(q.category), "known category: " + q.category);
    assert.ok([1, 2, 3].includes(q.level));
    assert.ok(q.topic && q.topic.length, "topic is set");
    const key = q.question + "|" + q.options.slice().sort().join("~");
    assert.ok(!seen.has(key), "no duplicate in the day: " + q.question);
    seen.add(key);
  }
});

test("candidates already in the bank are skipped", () => {
  const first = generateDaily("2026-10-08", 10, new Set());
  const keys = new Set(first.questions.map((q) => keyOf(q.question, q.options)));
  const second = generateDaily("2026-10-08", 10, keys);
  const again = new Set(second.questions.map((q) => keyOf(q.question, q.options)));
  for (const q of first.questions) assert.ok(!again.has(keyOf(q.question, q.options)), "banked question is not reused");
  assert.equal(second.questions.length, 10);
});

test("bad dates and counts are rejected", () => {
  assert.throws(() => generateDaily("tomorrow", 10, new Set()), /date must look like/);
  assert.throws(() => generateDaily("2026-10-08", 0, new Set()), /count must be/);
  assert.throws(() => generateDaily("2026-10-08", 101, new Set()), /count must be/);
});

test("the rotating category changes through the week", () => {
  const week = ["2026-10-05", "2026-10-06", "2026-10-07", "2026-10-08", "2026-10-09", "2026-10-10", "2026-10-11"];
  const picks = week.map(rotatingSlug);
  assert.ok(new Set(picks).size > 1, "rotation moves: " + picks.join(", "));
  for (const p of picks) assert.ok(SLUGS.has(p));
  assert.ok(wheelFor("2026-10-08").includes(rotatingSlug("2026-10-08")));
});

test("daily files save and load back unchanged", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "daily-test-"));
  try {
    const day = generateDaily("2026-10-08", 5, new Set());
    const file = saveDaily(day, dir);
    assert.equal(file, dailyFile("2026-10-08", dir));
    assert.deepEqual(require(file), day);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
