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
    url: "https://examsathi.test/" + hash, runScripts: "outside-only"
  });
  t.after(() => dom.window.close());
  const w = dom.window;
  w.localStorage.setItem("examsathi.target", "graduation");
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
    const result = JSON.parse(w.localStorage.getItem("examsathi.progress.v1")).attempts[0];
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
  const result = JSON.parse(w.localStorage.getItem("examsathi.progress.v1")).attempts[0];
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
    url: "https://examsathi.test/", runScripts: "outside-only"
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
  assert.equal(w.localStorage.getItem("examsathi.exam.settings"), null);
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
  assert.deepEqual(JSON.parse(w.localStorage.getItem("examsathi.exam.settings")), { questions: 10, minutes: 5, marks: 2, penalty: 0.5 });

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
  const result = JSON.parse(w.localStorage.getItem("examsathi.progress.v1")).attempts[0];
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

test("saved data migrates from the old comp.* keys to the examsathi.* keys", (t) => {
  const dom = new JSDOM('<main id="app"></main><button id="theme-toggle"></button><p id="bank-stats"></p>', {
    url: "https://examsathi.test/#/exam", runScripts: "outside-only"
  });
  t.after(() => dom.window.close());
  const w = dom.window;
  /* A returning visitor from before the rename only has the old keys. */
  w.localStorage.setItem("comp.target", "ssc-chsl");
  w.localStorage.setItem("comp.exam.settings", JSON.stringify({ questions: 10, minutes: 5, marks: 2, penalty: 0.5 }));
  w.localStorage.setItem("comp.drill.length", "10");
  w.localStorage.setItem("comp.theme", "dark");
  w.QBANK_MANIFEST = bank.manifest;
  w.QBANK_CATEGORIES = Object.fromEntries(bank.categories().map((c) => [c.slug, c]));
  w.confirm = () => true;
  w.eval(appScript);
  w.dispatchEvent(new w.Event("qbank-ready"));
  assert.equal(w.localStorage.getItem("examsathi.target"), "ssc-chsl");
  assert.equal(w.localStorage.getItem("examsathi.exam.settings"), JSON.stringify({ questions: 10, minutes: 5, marks: 2, penalty: 0.5 }));
  assert.equal(w.localStorage.getItem("examsathi.drill.length"), "10");
  assert.equal(w.localStorage.getItem("examsathi.theme"), "dark");
  /* …and the migrated values actually drive the UI. */
  assert.equal(w.document.querySelector("#e-target").value, "ssc-chsl");
  assert.equal(w.document.querySelector("#e-questions").value, "10");
  assert.equal(w.document.documentElement.getAttribute("data-theme"), "dark");
});

test("the daily route drills the latest published set", (t) => {
  const pad = (n) => String(n).padStart(2, "0");
  const now = new Date();
  const stamp = now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate());
  const dq = (id, date) => ({ ...example, id, source: "daily", dailyDate: date });
  const w = setup(t, "#/daily", [
    { slug: "english", name: "English", questions: [dq("english-daily-" + stamp + "-01", stamp), dq("english-daily-old-01", "2026-01-01")] },
    { slug: "reasoning", name: "Reasoning", questions: [dq("reasoning-daily-" + stamp + "-02", stamp)] }
  ]);
  const d = w.document;
  /* today published, so the older day is not mixed in */
  assert.match(d.querySelector(".badge.plain").textContent, /Question 1 of 2/);
  assert.match(d.querySelector(".badge").textContent, /Daily Dose/);
  d.querySelectorAll(".opt")[example.answer].click();
  assert.match(d.querySelector("#feedback").textContent, /Correct answer/);
  d.querySelector("#next").click();
  d.querySelectorAll(".opt")[example.answer].click();
  d.querySelector("#next").click();
  const result = JSON.parse(w.localStorage.getItem("examsathi.progress.v1")).attempts[0];
  assert.equal(result.category, "daily");
  assert.equal(result.correct, 2);
  /* the drill-again button replays the daily set, not a category drill */
  d.querySelector("#again").click();
  assert.match(d.querySelector(".badge.plain").textContent, /Question 1 of 2/);
  /* the home page advertises the fresh set */
  w.location.hash = "#/";
  w.dispatchEvent(new w.Event("hashchange"));
  assert.match(d.querySelector(".daily-strip").textContent, /2 fresh questions/);
  assert.match(d.querySelector(".daily-strip").textContent, /New today/);
});

test("the daily challenge takes only 10 random questions even when 100 are added to the bank", (t) => {
  const pad = (n) => String(n).padStart(2, "0");
  const now = new Date();
  const stamp = now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate());
  const hundred = Array.from({ length: 100 }, (_, i) => ({
    ...example,
    id: "current-affairs-daily-" + stamp + "-" + String(i + 1).padStart(2, "0"),
    question: "Real-world news question #" + (i + 1) + "?",
    source: "daily",
    dailyDate: stamp
  }));
  const w = setup(t, "#/daily", [
    { slug: "current-affairs", name: "Current Affairs", questions: hundred }
  ]);
  const d = w.document;
  assert.match(d.querySelector(".badge.plain").textContent, /^Question 1 of 10$/);

  const firstRunStems = [];
  for (let i = 0; i < 10; i++) {
    firstRunStems.push(d.querySelector(".qtext").textContent);
    d.querySelectorAll(".opt")[example.answer].click();
    d.querySelector("#next").click();
  }
  assert.equal(new Set(firstRunStems).size, 10, "10 distinct questions in the challenge");
  const attempt = JSON.parse(w.localStorage.getItem("examsathi.progress.v1")).attempts[0];
  assert.equal(attempt.total, 10);
  assert.equal(attempt.correct, 10);

  /* Home strip shows 100 fresh questions in the bank and 10 random per daily challenge */
  w.location.hash = "#/";
  w.dispatchEvent(new w.Event("hashchange"));
  assert.match(d.querySelector(".daily-strip").textContent, /100 fresh questions/);
  assert.match(d.querySelector(".daily-strip").textContent, /10 random questions per daily challenge/);
});

test("the daily route explains itself when nothing has published yet", (t) => {
  const w = setup(t, "#/daily", [{ slug: "english", name: "English", questions: [example] }]);
  assert.match(w.document.querySelector("#app").textContent, /Nothing has been published yet/);
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
  assert.equal(w.localStorage.getItem("examsathi.drill.length"), "10");
  w.location.hash = "#/practice/indian-history";
  w.dispatchEvent(new w.Event("hashchange"));
  assert.match(d.querySelector(".badge.plain").textContent, /Question 1 of 1/);
});

test("the app boots instantly from the manifest and loads categories on demand", (t) => {
  const dom = new JSDOM('<main id="app"></main><button id="theme-toggle"></button><p id="bank-stats"></p>', {
    url: "https://examsathi.test/#/", runScripts: "outside-only"
  });
  t.after(() => dom.window.close());
  const w = dom.window;
  const d = w.document;
  w.localStorage.setItem("examsathi.target", "class-8");
  w.QBANK_MANIFEST = [
    { slug: "physics", name: "Physics", count: 271, levelCounts: { 1: 80, 2: 120, 3: 71 } },
    { slug: "mathematics", name: "Mathematics", count: 1518, levelCounts: { 1: 500, 2: 518, 3: 500 } }
  ];
  w.QBANK_DAILY_INDEX = {
    date: "2026-10-24",
    questions: [
      { ...example, id: "physics-daily-2026-10-24-01", category: "physics", source: "daily", dailyDate: "2026-10-24" }
    ]
  };
  /* Start with zero category files loaded in memory */
  w.QBANK_CATEGORIES = {};
  const ensured = [];
  w.QBANK_LOADER = {
    ensure(slugs, cb) {
      ensured.push(...slugs);
      for (const s of slugs) {
        w.QBANK_CATEGORIES[s] = { slug: s, name: s, questions: [example] };
      }
      cb(null);
    }
  };
  w.eval(appScript);
  w.dispatchEvent(new w.Event("qbank-ready"));

  /* Home screen and stats render immediately from manifest + dailyIndex without category files */
  assert.match(d.querySelector("#bank-stats").textContent, /1,789 questions from 2 categories/);
  assert.match(d.querySelector(".daily-strip").textContent, /1 fresh question/);

  /* Practice index shows exact levelCounts before any category file is loaded */
  w.location.hash = "#/practice";
  w.dispatchEvent(new w.Event("hashchange"));
  assert.match(d.querySelector("#cat-sections").textContent, /200 of 271 ready/);

  /* Navigating to a category triggers on-demand loading via QBANK_LOADER.ensure */
  w.location.hash = "#/practice/physics";
  w.dispatchEvent(new w.Event("hashchange"));
  assert.deepEqual(ensured, ["physics"]);
  assert.equal(d.querySelector(".qtext").textContent, example.question);
});

test("users can browse, read, and practise old date papers on demand", (t) => {
  const dom = new JSDOM('<main id="app"></main><button id="theme-toggle"></button><p id="bank-stats"></p>', {
    url: "https://examsathi.test/#/", runScripts: "outside-only"
  });
  t.after(() => dom.window.close());
  const w = dom.window;
  const d = w.document;
  w.localStorage.setItem("examsathi.target", "class-8");
  w.QBANK_MANIFEST = [
    { slug: "physics", name: "Physics", count: 271, levelCounts: { 1: 80, 2: 120, 3: 71 } }
  ];
  w.QBANK_DAILY_INDEX = {
    date: "2026-10-24",
    dates: [
      { date: "2026-10-24", count: 1 },
      { date: "2026-10-15", count: 2 }
    ],
    questions: [
      { ...example, id: "physics-daily-2026-10-24-01", category: "physics", source: "daily", dailyDate: "2026-10-24" }
    ]
  };
  w.QBANK_CATEGORIES = {};
  w.QBANK_DAILY_SETS = {};
  const loadedDates = [];
  w.QBANK_LOADER = {
    ensure(slugs, cb) { cb(null); },
    ensureDailyDate(dateStr, cb) {
      loadedDates.push(dateStr);
      w.QBANK_DAILY_SETS[dateStr] = {
        date: dateStr,
        questions: [
          { ...example, id: undefined, question: "Old paper question 1 (" + dateStr + ")?", category: "physics", topic: "Optics", level: 2 },
          { ...example, id: undefined, question: "Old paper question 2 (" + dateStr + ")?", category: "english", topic: "Grammar", level: 1 }
        ]
      };
      cb(w.QBANK_DAILY_SETS[dateStr]);
    }
  };
  w.eval(appScript);
  w.dispatchEvent(new w.Event("qbank-ready"));

  /* Home strip offers date selector, View date paper, and Old date papers button */
  assert.ok(d.querySelector("#daily-home-date"), "Home daily strip includes date selector");
  assert.ok(d.querySelector("#view-daily-paper"), "Home daily strip includes View date paper button");
  assert.ok(d.querySelector("#browse-daily-archive"), "Home daily strip includes Old date papers button");

  /* Navigating to #/daily/archive lists both current and old date papers */
  d.querySelector("#browse-daily-archive").click();
  w.dispatchEvent(new w.Event("hashchange"));
  assert.match(d.querySelector("#app").textContent, /Daily & Old Date Question Papers/);
  assert.equal(d.querySelectorAll("tr[data-archive-date]").length, 2);

  /* Viewing an old date paper (#/daily/2026-10-15/paper) loads it on demand and renders all questions */
  w.location.hash = "#/daily/2026-10-15/paper";
  w.dispatchEvent(new w.Event("hashchange"));
  assert.deepEqual(loadedDates, ["2026-10-15"]);
  assert.equal(d.querySelectorAll("#paper-questions-list .review-item").length, 2);
  assert.match(d.querySelector("#app").textContent, /Old paper question 1 \(2026-10-15\)\?/);

  /* Show all answers button reveals explanations across the date paper */
  d.querySelector("#toggle-paper-answers").click();
  assert.equal(d.querySelectorAll("#paper-questions-list .review-opt.is-answer").length, 2);

  /* Starting a drill on the old date paper (#/daily/2026-10-15) drills that date's questions */
  d.querySelector("#paper-start-10").click();
  w.dispatchEvent(new w.Event("hashchange"));
  assert.match(d.querySelector(".badge.plain").textContent, /Question 1 of 2/);
  assert.match(d.querySelector(".qtext").textContent, /2026-10-15/);
});

test("top nav includes Old Archive link everywhere and footer shows version based on merge count", (t) => {
  const dom = new JSDOM(
    '<nav class="topnav"><a href="#/" data-nav="home">Home</a><a href="#/daily" data-nav="daily">Daily</a></nav>' +
    '<main id="app"></main><button id="theme-toggle"></button>' +
    '<footer><p id="bank-stats"></p><p id="app-version"></p></footer>',
    { url: "https://examsathi.test/#/", runScripts: "outside-only" }
  );
  t.after(() => dom.window.close());
  const w = dom.window;
  const d = w.document;
  w.QBANK_MANIFEST = [{ slug: "physics", name: "Physics", count: 271, levelCounts: { 1: 80, 2: 120, 3: 71 } }];
  w.QBANK_META = { version: "v10.0", mergeCount: 10 };
  w.QBANK_DAILY_INDEX = {
    date: "2026-10-31",
    dates: [{ date: "2026-10-31", count: 1 }],
    questions: [{ ...example, id: "physics-daily-2026-10-31-01", category: "physics", source: "daily", dailyDate: "2026-10-31" }]
  };
  w.QBANK_CATEGORIES = {};
  w.eval(appScript);
  w.dispatchEvent(new w.Event("qbank-ready"));

  /* Top nav contains Old Archive link and highlights it on #/archive or #/daily/archive */
  const archiveNav = d.querySelector('.topnav [data-nav="archive"]');
  assert.ok(archiveNav, "top nav includes Old Archive link");
  w.location.hash = "#/archive";
  w.dispatchEvent(new w.Event("hashchange"));
  assert.equal(archiveNav.classList.contains("active"), true);
  assert.match(d.querySelector("#app").textContent, /Daily & Old Date Question Papers/);

  /* Footer displays version based on merge count */
  assert.match(d.querySelector("#bank-stats").textContent, /Version v10\.0 \(10 merges done\)/);
  assert.equal(d.querySelector("#app-version").textContent, "Version v10.0 (10 merges done)");
});

