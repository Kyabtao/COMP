"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { questionErrors, assertQuestion } = require("../question-schema");
const bank = require("../../qbank");
const example = require("../authored/indian-history").find((q) => q.question === "The Harappan Civilisation belonged to which age?");

test("the user's four-field pattern is valid without metadata", () => {
  assert.deepEqual(Object.keys(example), ["question", "options", "answer", "explanation"]);
  assert.deepEqual(questionErrors(example), []);
  assert.equal(example.options[example.answer], "Bronze Age");
  for (const answer of [0, 1, 2, 3]) assert.doesNotThrow(() => assertQuestion({ ...example, answer }));
});

test("malformed questions fail with a useful error", () => {
  for (const item of [null, [], {}, { ...example, question: " " }, { ...example, question: 123 },
    { ...example, options: null }, { ...example, options: ["A", "B", "C"] },
    { ...example, options: ["A", "B", "C", " "] }, { ...example, options: ["A", "B", "C", 4] },
    { ...example, options: ["A", "B", "C", " a "] },
    ...[-1, 4, 1.5, "1", null, NaN].map((answer) => ({ ...example, answer })),
    ...[undefined, "", "  ", 42].map((explanation) => ({ ...example, explanation })),
    { ...example, level: 4 }]) {
    assert.throws(() => assertQuestion(item, "fixture"), /fixture:/);
  }
});

test("every authored and published question uses descriptive fields", () => {
  const authored = fs.readdirSync(path.join(__dirname, "../authored"))
    .flatMap((file) => require("../authored/" + file));
  const questions = bank.questions();
  assert.equal(questions.length, 32927);
  assert.equal(bank.manifest.length, 26);
  for (const q of authored.concat(questions)) {
    assert.deepEqual(questionErrors(q), [], q.question);
    for (const key of ["q", "o", "a", "e", "t", "l", "s", "opts", "ans", "exp"]) {
      assert.equal(Object.hasOwn(q, key), false, "legacy field " + key);
    }
  }
  const published = bank.bySlug("indian-history").find((q) => q.question === example.question);
  for (const key of Object.keys(example)) assert.deepEqual(published[key], example[key]);
  assert.equal(published.level, 1);
  assert.equal(published.source, "curated");
});

test("browser category scripts and Node API expose the same MCQ content", () => {
  const context = vm.createContext({ window: {} });
  context.self = context.window;
  const run = (file) => vm.runInContext(fs.readFileSync(path.join(__dirname, "../..", file), "utf8"), context);
  run("tools/categories/index.js");
  for (const entry of bank.manifest) {
    if (entry.parts) {
      for (let part = 1; part <= entry.parts; part++) {
        run(entry.partDir + "/part-" + String(part).padStart(2, "0") + ".js");
      }
    } else run("tools/categories/" + entry.file + ".js");
  }
  run("qbank.js");
  const browserBank = context.window.QBANK;
  assert.equal(browserBank.questions().length, bank.questions().length);
  // GK part files intentionally use part-local ids rather than aggregate ids.
  const withoutIds = (questions) => JSON.stringify(questions.map(({ id, ...q }) => q));
  for (const entry of bank.manifest) {
    assert.equal(withoutIds(browserBank.bySlug(entry.slug)), withoutIds(bank.bySlug(entry.slug)), entry.slug);
  }
});
