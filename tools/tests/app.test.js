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

test("the app still boots when storage is unavailable", (t) => {
  const dom = new JSDOM('<main id="app"></main><button id="theme-toggle"></button><p id="bank-stats"></p>', {
    url: "https://comp.test/", runScripts: "outside-only"
  });
  t.after(() => dom.window.close());
  const w = dom.window;
  /* Private browsing and blocked cookies both throw on access. */
  Object.defineProperty(w, "localStorage", {
    configurable: true,
    get() { throw new Error("storage is blocked"); }
  });
  w.QBANK_MANIFEST = bank.manifest;
  w.QBANK_CATEGORIES = Object.fromEntries(bank.categories().map((c) => [c.slug, c]));
  w.confirm = () => true;
  w.eval(appScript);
  w.dispatchEvent(new w.Event("qbank-ready"));
  const d = w.document;
  assert.ok(d.querySelector(".hero h1"), "home renders");
  assert.equal(d.querySelectorAll("#cat-sections .tile").length, bank.manifest.length);
  /* the exam screen must work too: no draft, straight to the defaults */
  w.location.hash = "#/exam";
  w.dispatchEvent(new w.Event("hashchange"));
  assert.equal(d.querySelector("#e-questions").value, "40");
  d.querySelector("#begin").click();
  assert.equal(d.querySelectorAll("#palette button").length, 40);
});

test("the setup screen defaults to 40 questions, 40 minutes, +1 and 0.25 penalty", (t) => {
  const w = setup(t, "#/exam");
  const d = w.document;
  const settings = (id) => d.querySelector(id).value;
  assert.equal(settings("#e-questions"), "40");
  assert.equal(settings("#e-minutes"), "40");
  assert.equal(settings("#e-marks"), "1");
  assert.equal(settings("#e-penalty"), "0.25");
  assert.match(d.querySelector("#begin").textContent, /Begin 40 question exam/);
  assert.match(d.querySelector("#plan-chips").textContent, /40 questions/);
  /* nothing is written until the user changes something */
  assert.equal(w.localStorage.getItem("comp.exam.settings"), null);
});

test("paper settings drive length, clock and marking", (t) => {
  const w = setup(t, "#/exam");
  const d = w.document;
  const set = (id, value) => {
    const field = d.querySelector(id);
    field.value = String(value);
    field.dispatchEvent(new w.Event("change"));
  };
  set("#e-questions", 10);
  set("#e-minutes", 5);
  set("#e-marks", 2);
  set("#e-penalty", 0.5);
  assert.match(d.querySelector("#begin").textContent, /Begin 10 question exam/);
  assert.deepEqual(JSON.parse(w.localStorage.getItem("comp.exam.settings")), { questions: 10, minutes: 5, marks: 2, penalty: 0.5 });

  d.querySelector("#begin").click();
  assert.equal(d.querySelectorAll("#palette button").length, 10);
  assert.equal(d.querySelector("#clock").textContent, "05:00");

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
  d.querySelector("#submit").click();
  const result = JSON.parse(w.localStorage.getItem("comp.progress.v1")).attempts[0];
  assert.equal(result.total, 10);
  assert.equal(result.max, 20);
  assert.equal(result.marks, 2);
  assert.equal(result.penalty, 0.5);
  assert.equal(result.minutes, 5);
  assert.equal(result.score, 1 * 2 - 1 * 0.5);
  assert.match(d.querySelector("#app").textContent, /10 questions · \+2 correct · −0\.5 wrong/);
  d.querySelector("#review").click();
  assert.equal(d.querySelectorAll(".explain").length, 10);
  assert.match(d.querySelector("#review-filters").textContent, /All 10/);
});

test("preset buttons and reset rewrite every paper setting", (t) => {
  const w = setup(t, "#/exam");
  const d = w.document;
  d.querySelector('#presets [data-preset="railways"]').click();
  assert.equal(d.querySelector("#e-questions").value, "100");
  assert.equal(d.querySelector("#e-minutes").value, "90");
  assert.equal(d.querySelector("#e-penalty").value, "0.33");
  assert.match(d.querySelector("#plan-chips").textContent, /Max score 100/);
  d.querySelector("#reset-settings").click();
  assert.equal(d.querySelector("#e-questions").value, "40");
  assert.equal(d.querySelector("#e-minutes").value, "40");
  assert.equal(d.querySelector("#e-marks").value, "1");
  assert.equal(d.querySelector("#e-penalty").value, "0.25");
});

test("a target without enough questions cannot start a paper", (t) => {
  const w = setup(t, "#/exam", [{ slug: "indian-history", name: "Indian History", questions: [example] }]);
  const d = w.document;
  assert.match(d.querySelector("#plan-note").textContent, /not enough for a paper/);
  assert.equal(d.querySelector("#begin").disabled, true);
  d.querySelector("#begin").click();
  assert.equal(d.querySelectorAll("#palette button").length, 0, "no paper is started");
});

test("drill length is remembered and used by the next drill", (t) => {
  const w = setup(t, "#/practice/indian-history", [{ slug: "indian-history", name: "Indian History", questions: [example] }]);
  const d = w.document;
  assert.equal(d.querySelector("#prev").disabled, true);
  w.location.hash = "#/practice";
  w.dispatchEvent(new w.Event("hashchange"));
  const select = d.querySelector("#drill-length");
  assert.ok(select, "practice index offers a drill length");
  select.value = "10";
  select.dispatchEvent(new w.Event("change"));
  assert.equal(w.localStorage.getItem("comp.drill.length"), "10");
  w.location.hash = "#/practice/indian-history";
  w.dispatchEvent(new w.Event("hashchange"));
  assert.match(d.querySelector(".badge.plain").textContent, /Question 1 of 1/);
});
