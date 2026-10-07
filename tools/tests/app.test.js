"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");
const bank = require("../../qbank");
const appScript = fs.readFileSync(path.join(__dirname, "../../assets/js/app.js"), "utf8");
const example = bank.bySlug("indian-history").find((q) => q.question === "The Harappan Civilisation belonged to which age?");

function setup(t, hash, categories) {
  const dom = new JSDOM('<main id="app"></main><button id="theme-toggle"></button><p id="bank-stats"></p>', {
    url: "https://comp.test/" + hash, runScripts: "outside-only"
  });
  t.after(() => dom.window.close());
  const w = dom.window;
  w.localStorage.setItem("comp.target", "graduation");
  w.QBANK_MANIFEST = categories ? categories.map((c) => ({ ...c, count: c.questions.length })) : bank.manifest;
  w.QBANK_CATEGORIES = Object.fromEntries((categories || bank.categories()).map((c) => [c.slug, c]));
  w.confirm = () => true;
  w.eval(appScript);
  w.dispatchEvent(new w.Event("qbank-ready"));
  return w;
}

for (const chosen of [0, 1]) {
  test("practice renders four options and reveals explanation for " + (chosen === 1 ? "correct" : "wrong") + " answer", (t) => {
    const w = setup(t, "#/practice/indian-history", [{ slug: "indian-history", name: "Indian History", questions: [example] }]);
    const d = w.document;
    assert.equal(d.querySelector(".qtext").textContent, example.question);
    assert.equal(d.querySelectorAll(".opt").length, 4);
    assert.equal(d.querySelector("#feedback").textContent, "");
    d.querySelectorAll(".opt")[chosen].click();
    assert.match(d.querySelector("#feedback").textContent, /Correct answer: B\. Bronze Age/);
    assert.ok(d.querySelector("#feedback").textContent.includes("Explanation: " + example.explanation));
    assert.ok(d.querySelectorAll(".opt")[1].classList.contains("correct"));
    if (chosen === 0) assert.ok(d.querySelectorAll(".opt")[0].classList.contains("wrong"));
    d.querySelector("#next").click();
    const result = JSON.parse(w.localStorage.getItem("comp.progress.v1")).attempts[0];
    assert.equal(result.correct, chosen === 1 ? 1 : 0);
    assert.equal(result.attempted, 1);
  });
}

test("question, option and explanation text is escaped, not rendered as HTML", (t) => {
  const payload = '<img src=x onerror="alert(1)">';
  const q = { ...example, question: payload, options: ["A", payload, "C", "D"], explanation: payload };
  const w = setup(t, "#/practice/indian-history", [{ slug: "indian-history", name: "Indian History", questions: [q] }]);
  const d = w.document;
  d.querySelectorAll(".opt")[1].click();
  assert.equal(d.querySelector(".qtext").textContent, payload);
  assert.ok(d.querySelector("#feedback").textContent.includes(payload));
  assert.equal(d.querySelector("#app img"), null);
});

test("exam scores descriptive answers and only reveals explanations in submitted review", (t) => {
  const w = setup(t, "#/exam");
  const d = w.document;
  d.querySelector("#begin").click();
  assert.equal(d.querySelectorAll("#palette button").length, 40);
  assert.equal(d.querySelector(".explain"), null);

  function currentQuestion() {
    const stem = d.querySelector(".qtext").textContent;
    const options = Array.from(d.querySelectorAll(".opt > span:last-child"), (el) => el.textContent);
    const q = bank.questions().find((q) => q.question === stem && JSON.stringify(q.options) === JSON.stringify(options));
    assert.ok(q, "rendered question is in the bank");
    return q;
  }
  const first = currentQuestion();
  d.querySelectorAll(".opt")[first.answer].click();
  d.querySelector("#next").click();
  const second = currentQuestion();
  d.querySelectorAll(".opt")[(second.answer + 1) % 4].click();
  assert.equal(d.querySelector(".explain"), null);
  d.querySelector("#submit").click();
  const result = JSON.parse(w.localStorage.getItem("comp.progress.v1")).attempts[0];
  assert.equal(result.correct, 1);
  assert.equal(result.wrong, 1);
  assert.equal(result.skipped, 38);
  assert.equal(result.score, 0.75);
  assert.equal(d.querySelector(".explain"), null);
  d.querySelector("#review").click();
  const explanations = d.querySelectorAll(".explain");
  assert.equal(explanations.length, 40);
  assert.ok(explanations[0].textContent.includes(first.explanation));
  assert.ok(explanations[1].textContent.includes(second.explanation));
  for (const explanation of explanations) {
    assert.match(explanation.textContent, /Correct answer: [ABCD]\./);
    assert.match(explanation.textContent, /Explanation: .+/);
  }
  assert.match(d.querySelectorAll("#list > div")[2].textContent, /Skipped/);
});
