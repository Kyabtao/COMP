"use strict";
/**
 * COMP — competition prep app.
 * Modes: home, practice (category drill), exam (40 question paper), progress.
 */
(function () {
  var STORE_KEY = "comp.progress.v1";
  var TARGET_KEY = "comp.target";
  /**
   * Merged target list: school classes and competitive exams live in one list
   * because every paper follows the same pattern (40 questions, 40 minutes,
   * +1 per correct answer, 0.25 negative marking). Class targets draw a
   * balanced paper from every category and filter by age band; exam targets
   * draw from their own sections at every difficulty level.
   */
  var CLASS_NAMES = ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8",
    "Class 9", "Class 10", "Class 11", "Class 12", "Graduation"];
  var CLASS_LEVELS = [[1], [1], [1], [1], [1], [1, 2], [1, 2], [1, 2], [2], [2], [2, 3], [2, 3], [1, 2, 3]];
  var TARGETS = CLASS_NAMES.map(function (name, i) {
    var last = i === CLASS_NAMES.length - 1;
    return {
      id: last ? "graduation" : "class-" + (i + 1),
      name: name,
      kind: last ? "college" : "school",
      type: last ? "Higher" : "School",
      levels: CLASS_LEVELS[i],
      sections: null /* null = balanced paper across every category */
    };
  }).concat([
    { id: "ssc-cgl", name: "SSC CGL", kind: "exam", type: "Competitive", levels: [1, 2, 3], sections: ["reasoning", "general-awareness", "quantitative-aptitude", "english"] },
    { id: "ssc-chsl", name: "SSC CHSL", kind: "exam", type: "Competitive", levels: [1, 2, 3], sections: ["reasoning", "general-awareness", "quantitative-aptitude", "english"] },
    { id: "banking", name: "Banking (IBPS / SBI)", kind: "exam", type: "Competitive", levels: [1, 2, 3], sections: ["reasoning", "quantitative-aptitude", "english", "general-awareness", "computer-awareness"] },
    { id: "railways", name: "Railways (RRB NTPC / Group D)", kind: "exam", type: "Competitive", levels: [1, 2, 3], sections: ["mathematics", "reasoning", "general-awareness"] }
  ]);
  var QUESTIONS_PER_EXAM = 40;
  var MINUTES_PER_EXAM = 40;
  var NEGATIVE_MARKING = 0.25;

  function targetById(id) {
    for (var i = 0; i < TARGETS.length; i++) if (TARGETS[i].id === id) return TARGETS[i];
    return null;
  }

  /** Reads the merged target, upgrading old builds that stored class + exam separately. */
  function migrateTarget() {
    var stored = localStorage.getItem(TARGET_KEY);
    if (stored && targetById(stored)) return stored;
    var legacyExam = localStorage.getItem("comp.exam");
    var legacyClass = localStorage.getItem("comp.class");
    var next = "ssc-cgl";
    if (legacyExam && targetById(legacyExam)) next = legacyExam;
    else if (legacyClass) {
      var idx = CLASS_NAMES.indexOf(legacyClass);
      if (idx !== -1) next = TARGETS[idx].id;
    }
    localStorage.setItem(TARGET_KEY, next);
    localStorage.removeItem("comp.exam");
    localStorage.removeItem("comp.class");
    return next;
  }

  var state = {
    target: migrateTarget(),
    mode: null,
    session: null,
    timer: null
  };
  function currentTarget() { return targetById(state.target) || TARGETS[0]; }

  /* ------------------------------------------------------------------ */
  /* bank access                                                        */
  /* ------------------------------------------------------------------ */
  function store() { return window.QBANK_CATEGORIES || {}; }
  function manifest() { return window.QBANK_MANIFEST || []; }

  function questionsFor(slug) {
    var s = store(), out = [];
    if (s[slug]) out = out.concat(s[slug].questions || []);
    Object.keys(s).forEach(function (key) {
      if (key.indexOf(slug + ":part-") === 0 && s[key] && s[key].questions) out = out.concat(s[key].questions);
    });
    return out;
  }

  function totalQuestions() {
    var s = store(), n = 0;
    Object.keys(s).forEach(function (k) { if (s[k] && s[k].questions) n += s[k].questions.length; });
    return n;
  }

  /** Merged target maps to question difficulty. */
  function levelsForTarget(target) { return (target && target.levels) || [1, 2, 3]; }

  /** Category slugs a target draws from; class targets use every category. */
  function targetSections(target) {
    if (target && target.sections) return target.sections.slice();
    return manifest().map(function (c) { return c.slug; });
  }

  function sectionLabel(slug) {
    var found = manifest().filter(function (c) { return c.slug === slug; })[0];
    return found ? found.name : slug.replace(/-/g, " ");
  }

  /** Single grouped <select> for the merged class + exam target list. */
  function targetOptions(selectedId) {
    var groups = [["school", "School — Classes 1 to 12"], ["college", "Higher"], ["exam", "Competitive exams"]];
    return groups.map(function (g) {
      var opts = TARGETS.filter(function (t) { return t.kind === g[0]; }).map(function (t) {
        return '<option value="' + t.id + '"' + (t.id === selectedId ? " selected" : "") + '>' + esc(t.name) + '</option>';
      }).join("");
      return '<optgroup label="' + g[1] + '">' + opts + '</optgroup>';
    }).join("");
  }

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function pickQuestions(slugs, count, levels) {
    var pools = slugs.map(function (slug) {
      return shuffle(questionsFor(slug).filter(function (q) { return levels.indexOf(q.level) !== -1; }));
    }).filter(function (p) { return p.length; });
    if (!pools.length) return [];
    /* Round robin across the shuffled pools so every section contributes. */
    var out = [], taken = pools.map(function () { return 0; }), i = 0, idle = 0;
    while (out.length < count && idle < pools.length) {
      var p = i % pools.length;
      if (taken[p] < pools[p].length) {
        out.push(pools[p][taken[p]++]);
        idle = 0;
      } else {
        idle++;
      }
      i++;
    }
    return shuffle(out).slice(0, count);
  }

  /* ------------------------------------------------------------------ */
  /* persistence                                                        */
  /* ------------------------------------------------------------------ */
  function loadProgress() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || { attempts: [] }; }
    catch (e) { return { attempts: [] }; }
  }
  function saveAttempt(attempt) {
    var p = loadProgress();
    p.attempts.unshift(attempt);
    p.attempts = p.attempts.slice(0, 60);
    localStorage.setItem(STORE_KEY, JSON.stringify(p));
  }

  /* ------------------------------------------------------------------ */
  /* rendering helpers                                                  */
  /* ------------------------------------------------------------------ */
  var app = document.getElementById("app");
  function el(html) { var d = document.createElement("div"); d.innerHTML = html.trim(); return d.firstChild; }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function letter(i) { return "ABCD"[i]; }
  function answerExplanation(q) {
    return '<p><strong>Correct answer: ' + letter(q.answer) + '. ' + esc(q.options[q.answer]) + '</strong></p>' +
      '<p><strong>Explanation:</strong> ' + esc(q.explanation) + '</p>';
  }

  var CATEGORY_ICONS = {
    layers: "\uD83D\uDCDA", globe: "\uD83C\uDF0D", newspaper: "\uD83D\uDCF0", bookmark: "\uD83D\uDD16",
    landmark: "\uD83C\uDFDB", scale: "\u2696", compass: "\uD83E\uDDED", atom: "\u269B",
    languages: "\uD83D\uDDE3", puzzle: "\uD83E\uDDE9", calculator: "\uD83E\uDDEE", sigma: "\u03A3",
    flag: "\uD83D\uDEA9", monitor: "\uD83D\uDDA5", coins: "\uD83E\uDE99", spellcheck: "\u270F",
    leaf: "\uD83C\uDF43", magnet: "\uD83E\uDDF2", flask: "\uD83E\uDDEA", dna: "\uD83E\uDDEC",
    trophy: "\uD83C\uDFC6", medal: "\uD83C\uDF96", "book-open": "\uD83D\uDCD6", calendar: "\uD83D\uDCC5",
    lightbulb: "\uD83D\uDCA1", type: "\uD83D\uDD24"
  };

  /* ------------------------------------------------------------------ */
  /* views                                                             */
  /* ------------------------------------------------------------------ */
  function viewHome() {
    var bank = totalQuestions();
    var cats = manifest();
    var oneK = cats.filter(function (c) { return c.count >= 1000; }).length;
    app.innerHTML = "";
    app.appendChild(el(
      '<section class="card hero">' +
        '<div>' +
          '<h1>Practice for the competition</h1>' +
          '<p class="muted">One target list — Classes 1 to 12, Graduation, SSC CGL, SSC CHSL, Banking and Railways · every paper is 40 questions in 40 minutes with 0.25 negative marking.</p>' +
          '<div class="kpis">' +
            '<div class="kpi"><b>' + bank.toLocaleString("en-IN") + '</b><span>questions</span></div>' +
            '<div class="kpi"><b>' + cats.length + '</b><span>categories</span></div>' +
            '<div class="kpi"><b>' + oneK + '</b><span>categories 1,000+</span></div>' +
            '<div class="kpi"><b>' + TARGETS.length + '</b><span>targets, one pattern</span></div>' +
          '</div>' +
        '</div>' +
        '<div class="picks">' +
          '<div style="min-width:min(260px,100%);flex:1">' +
            '<label class="field" for="pick-target">Target — class or exam</label>' +
            '<select id="pick-target">' + targetOptions(state.target) + '</select>' +
          '</div>' +
          '<button class="primary" id="start-exam" type="button">Start 40 question exam</button>' +
        '</div>' +
      '</section>'
    ));

    var stats = el('<section class="card"><h2>Question bank</h2>' +
      '<p class="muted small">Generated by <code>tools/build-qbank.js</code>. Every category file is a plain script that works in the browser and in Node.</p>' +
      '<div class="grid cats" id="cat-grid"></div></section>');
    app.appendChild(stats);
    var grid = stats.querySelector("#cat-grid");
    cats.slice().sort(function (a, b) { return b.count - a.count; }).forEach(function (c) {
      var tile = el('<a class="tile" href="#/practice/' + c.slug + '">' +
        '<span class="name">' + (CATEGORY_ICONS[c.icon] || "\u2022") + " " + esc(c.name) + '</span>' +
        '<span class="count">' + Number(c.count).toLocaleString("en-IN") + ' questions</span>' +
        '<span class="desc">' + esc(c.blurb || "") + '</span></a>');
      grid.appendChild(tile);
    });

    app.appendChild(el('<section class="card"><h2>Exam pattern</h2>' +
      '<p class="muted small">One pattern for every target: 40 questions, 40 minutes, +1 for a correct answer and 0.25 negative marking. Class targets draw a balanced paper from every category; competitive exams draw from their own sections.</p>' +
      '<div class="table-scroll"><table><thead><tr><th>Target</th><th>Type</th><th>Sections</th><th>Questions</th><th>Time</th><th>Marking</th></tr></thead><tbody>' +
      TARGETS.map(function (t) {
        var sections = t.sections ? t.sections.length + " sections" : "All categories";
        return '<tr><td>' + esc(t.name) + '</td><td>' + t.type + '</td><td>' + sections + '</td><td>40</td><td>40 minutes</td><td>+1, &minus;0.25</td></tr>';
      }).join("") +
      '</tbody></table></div></section>'));

    document.getElementById("pick-target").addEventListener("change", function (e) {
      state.target = e.target.value;
      localStorage.setItem(TARGET_KEY, state.target);
    });
    document.getElementById("start-exam").addEventListener("click", function () { location.hash = "#/exam"; });
  }

  function viewPractice(slug) {
    var meta = manifest().filter(function (c) { return c.slug === slug; })[0];
    if (!meta) { location.hash = "#/practice"; return; }
    var levels = levelsForTarget(currentTarget());
    var pool = questionsFor(slug).filter(function (q) { return levels.indexOf(q.level) !== -1; });
    var set = shuffle(pool).slice(0, 15);
    state.mode = "practice";
    state.session = { slug: slug, name: meta.name, questions: set, index: 0, answers: [], revealed: [] };
    renderQuestion();
  }

  function viewPracticeIndex() {
    app.innerHTML = "";
    app.appendChild(el('<section class="card"><h1>Practice by category</h1>' +
      '<p class="muted">Pick a category for a 15 question drill with instant explanations. Showing difficulty for <strong>' + esc(currentTarget().name) + '</strong>.</p>' +
      '<div class="grid cats" id="cat-grid"></div></section>'));
    var grid = app.querySelector("#cat-grid");
    manifest().forEach(function (c) {
      var levels = levelsForTarget(currentTarget());
      var available = questionsFor(c.slug).filter(function (q) { return levels.indexOf(q.level) !== -1; }).length;
      grid.appendChild(el('<a class="tile" href="#/practice/' + c.slug + '">' +
        '<span class="name">' + (CATEGORY_ICONS[c.icon] || "\u2022") + " " + esc(c.name) + '</span>' +
        '<span class="count">' + available.toLocaleString("en-IN") + ' of ' + c.count.toLocaleString("en-IN") + ' ready for ' + esc(currentTarget().name) + '</span></a>'));
    });
  }

  function renderQuestion() {
    var s = state.session;
    if (!s) { viewHome(); return; }
    var q = s.questions[s.index];
    if (!q) { renderPracticeSummary(); return; }
    var chosen = s.answers[s.index];
    var revealed = s.revealed[s.index];

    app.innerHTML = "";
    var card = el('<section class="card">' +
      '<div class="qhead">' +
        '<div><span class="badge">' + esc(s.name) + '</span> <span class="badge">Question ' + (s.index + 1) + ' of ' + s.questions.length + '</span></div>' +
        '<div class="muted small">' + esc(q.topic || "") + ' · level ' + q.level + '</div>' +
      '</div>' +
      '<p class="qtext">' + esc(q.question) + '</p>' +
      '<div class="options" id="opts"></div>' +
      '<div id="feedback" aria-live="polite"></div>' +
      '<div class="toolbar">' +
        '<button class="secondary" id="prev" type="button"' + (s.index === 0 ? " disabled" : "") + '>Previous</button>' +
        '<button class="primary" id="next" type="button">' + (s.index === s.questions.length - 1 ? "Finish drill" : "Next question") + '</button>' +
      '</div>' +
    '</section>');
    app.appendChild(card);

    var opts = card.querySelector("#opts");
    q.options.forEach(function (text, i) {
      var b = el('<button class="opt" type="button" data-i="' + i + '"><span class="letter">' + letter(i) + '</span><span>' + esc(text) + '</span></button>');
      if (revealed) {
        if (i === q.answer) b.classList.add("correct");
        if (i === chosen && chosen !== q.answer) b.classList.add("wrong");
      } else if (chosen === i) {
        b.classList.add("selected");
      }
      b.addEventListener("click", function () {
        s.answers[s.index] = i;
        s.revealed[s.index] = true;
        renderQuestion();
      });
      opts.appendChild(b);
    });

    if (revealed) {
      card.querySelector("#feedback").appendChild(el('<div class="explain"><strong>' +
        (chosen === q.answer ? "Correct." : "Incorrect.") + '</strong>' + answerExplanation(q) + '</div>'));
    }
    card.querySelector("#prev").addEventListener("click", function () { s.index--; renderQuestion(); });
    card.querySelector("#next").addEventListener("click", function () {
      if (s.index === s.questions.length - 1) renderPracticeSummary();
      else { s.index++; renderQuestion(); }
    });
  }

  function renderPracticeSummary() {
    var s = state.session;
    var correct = s.questions.reduce(function (n, q, i) { return n + (s.answers[i] === q.answer ? 1 : 0); }, 0);
    var attempted = s.answers.filter(function (a) { return a != null; }).length;
    saveAttempt({ at: new Date().toISOString(), mode: "practice", category: s.slug, total: s.questions.length, correct: correct, attempted: attempted });
    app.innerHTML = "";
    app.appendChild(el('<section class="card center">' +
      '<h1>Drill complete</h1>' +
      '<p class="score">' + correct + " / " + s.questions.length + '</p>' +
      '<p class="muted">You attempted ' + attempted + ' of ' + s.questions.length + ' questions in ' + esc(s.name) + '.</p>' +
      '<div class="toolbar" style="justify-content:center">' +
        '<button class="primary" id="again" type="button">Practise another set</button>' +
        '<button class="secondary" id="home" type="button">Back to home</button>' +
      '</div></section>'));
    document.getElementById("again").addEventListener("click", function () { viewPractice(s.slug); });
    document.getElementById("home").addEventListener("click", function () { location.hash = "#/"; });
  }

  function viewExamSetup() {
    app.innerHTML = "";
    app.appendChild(el('<section class="card">' +
      '<h1>40 question exam</h1>' +
      '<p class="muted">Every paper follows the competition rules: 40 questions, 40 minutes, +1 for a correct answer and 0.25 negative marking.</p>' +
      '<div class="row">' +
        '<div><label class="field" for="e-target">Target — class or exam</label><select id="e-target">' +
          targetOptions(state.target) +
        '</select></div>' +
      '</div>' +
      '<h3>Sections in this paper</h3><p class="muted small" id="sec-preview"></p>' +
      '<p class="muted small">Same pattern for every target: 40 questions, 40 minutes, +1 per correct answer and 0.25 negative marking.</p>' +
      '<button class="primary" id="begin" type="button">Begin exam</button>' +
    '</section>'));
    function preview() {
      var target = targetById(document.getElementById("e-target").value) || currentTarget();
      var sections = targetSections(target);
      document.getElementById("sec-preview").textContent = target.sections
        ? sections.map(sectionLabel).join(" · ")
        : "Balanced paper across all " + sections.length + " categories";
    }
    document.getElementById("e-target").addEventListener("change", function (e) {
      state.target = e.target.value; localStorage.setItem(TARGET_KEY, state.target); preview();
    });
    preview();
    document.getElementById("begin").addEventListener("click", beginExam);
  }

  function beginExam() {
    var target = currentTarget();
    var sections = targetSections(target);
    var levels = levelsForTarget(target);
    var perSection = Math.floor(QUESTIONS_PER_EXAM / sections.length);
    var extra = QUESTIONS_PER_EXAM - perSection * sections.length;
    var questions = [];
    sections.forEach(function (slug, i) {
      questions = questions.concat(pickQuestions([slug], perSection + (i < extra ? 1 : 0), levels));
    });
    /* Top up from the combined pool so thin sections never shrink the paper. */
    if (questions.length < QUESTIONS_PER_EXAM) {
      var spare = [];
      sections.forEach(function (slug) {
        questionsFor(slug).forEach(function (q) {
          if (questions.indexOf(q) === -1 && levels.indexOf(q.level) !== -1) spare.push(q);
        });
      });
      questions = questions.concat(shuffle(spare).slice(0, QUESTIONS_PER_EXAM - questions.length));
    }
    if (questions.length < 10) { alert("Not enough questions for this target yet. Try another target."); return; }
    state.mode = "exam";
    state.session = {
      target: target, name: target.name, questions: questions, index: 0,
      answers: new Array(questions.length).fill(null),
      start: Date.now(), left: MINUTES_PER_EXAM * 60
    };
    startTimer();
    renderExam();
  }

  function startTimer() {
    clearInterval(state.timer);
    state.timer = setInterval(function () {
      var s = state.session;
      if (!s || state.mode !== "exam") return;
      s.left--;
      var t = document.getElementById("clock");
      if (t) t.textContent = formatTime(s.left);
      if (s.left <= 0) { clearInterval(state.timer); finishExam(); }
    }, 1000);
  }
  function formatTime(sec) {
    sec = Math.max(0, sec);
    return String(Math.floor(sec / 60)).padStart(2, "0") + ":" + String(sec % 60).padStart(2, "0");
  }

  function renderExam() {
    var s = state.session;
    var q = s.questions[s.index];
    app.innerHTML = "";
    var card = el('<section class="card">' +
      '<div class="qhead">' +
        '<div><span class="badge">' + esc(s.name) + '</span> <span class="badge warn">Question ' + (s.index + 1) + ' / ' + s.questions.length + '</span></div>' +
        '<div class="timer">Time left <span id="clock">' + formatTime(s.left) + '</span></div>' +
      '</div>' +
      '<p class="qtext">' + esc(q.question) + '</p>' +
      '<div class="options" id="opts"></div>' +
      '<div class="palette" id="palette"></div>' +
      '<div class="toolbar">' +
        '<button class="secondary" id="prev" type="button"' + (s.index === 0 ? " disabled" : "") + '>Previous</button>' +
        '<button class="secondary" id="next" type="button"' + (s.index === s.questions.length - 1 ? " disabled" : "") + '>Next</button>' +
        '<button class="primary" id="submit" type="button" style="margin-left:auto">Submit paper</button>' +
      '</div>' +
      '<p class="muted small">' + esc(q.topic || "") + ' · level ' + q.level + '</p>' +
    '</section>');
    app.appendChild(card);

    var opts = card.querySelector("#opts");
    q.options.forEach(function (text, i) {
      var b = el('<button class="opt' + (s.answers[s.index] === i ? " selected" : "") + '" type="button"><span class="letter">' + letter(i) + '</span><span>' + esc(text) + '</span></button>');
      b.addEventListener("click", function () { s.answers[s.index] = i; renderExam(); });
      opts.appendChild(b);
    });

    var pal = card.querySelector("#palette");
    s.questions.forEach(function (_, i) {
      var b = el('<button type="button" class="' + (s.answers[i] != null ? "answered" : "") + (i === s.index ? " current" : "") + '">' + (i + 1) + '</button>');
      b.addEventListener("click", function () { s.index = i; renderExam(); });
      pal.appendChild(b);
    });

    card.querySelector("#prev").addEventListener("click", function () { s.index--; renderExam(); });
    card.querySelector("#next").addEventListener("click", function () { s.index++; renderExam(); });
    card.querySelector("#submit").addEventListener("click", function () {
      var left = s.answers.filter(function (a) { return a == null; }).length;
      if (left && !confirm(left + " question(s) are still unanswered. Submit anyway?")) return;
      finishExam();
    });
  }

  function finishExam() {
    clearInterval(state.timer);
    var s = state.session;
    var correct = 0, wrong = 0, skipped = 0;
    s.questions.forEach(function (q, i) {
      if (s.answers[i] == null) skipped++;
      else if (s.answers[i] === q.answer) correct++;
      else wrong++;
    });
    var score = correct - wrong * NEGATIVE_MARKING;
    var result = {
      at: new Date().toISOString(), mode: "exam", exam: s.target.name, target: s.target.id,
      total: s.questions.length, correct: correct, wrong: wrong, skipped: skipped,
      score: Math.round(score * 100) / 100,
      seconds: Math.round((Date.now() - s.start) / 1000)
    };
    saveAttempt(result);
    state.mode = "result";
    app.innerHTML = "";
    app.appendChild(el('<section class="card center">' +
      '<h1>Exam submitted</h1>' +
      '<p class="score">' + result.score + ' <span class="muted small">/ ' + s.questions.length + '</span></p>' +
      '<p class="muted">' + esc(result.exam) + ' · ' + correct + ' correct, ' + wrong + ' wrong, ' + skipped + ' skipped · time used ' + formatTime(result.seconds) + '</p>' +
      '<div class="toolbar" style="justify-content:center">' +
        '<button class="primary" id="review" type="button">Review answers</button>' +
        '<button class="secondary" id="again" type="button">Take another paper</button>' +
      '</div></section>'));
    document.getElementById("review").addEventListener("click", renderExamReview);
    document.getElementById("again").addEventListener("click", function () { location.hash = "#/exam"; });
  }

  function renderExamReview() {
    var s = state.session;
    app.innerHTML = "";
    var wrap = el('<section class="card"><h1>Review</h1><p class="muted">' + esc(s.name) + ' · 40 questions · 0.25 negative marking</p><div id="list"></div>' +
      '<div class="toolbar"><button class="primary" id="again" type="button">Take another paper</button></div></section>');
    app.appendChild(wrap);
    var list = wrap.querySelector("#list");
    s.questions.forEach(function (q, i) {
      var chosen = s.answers[i];
      var mark = chosen == null ? '<span class="badge warn">Skipped</span>' : (chosen === q.answer ? '<span class="badge good">Correct</span>' : '<span class="badge bad">Wrong</span>');
      var item = el('<div style="border-bottom:1px solid var(--line); padding:14px 0">' +
        '<div class="qhead"><strong>Q' + (i + 1) + '</strong> ' + mark + '</div>' +
        '<p style="font-weight:600;margin:8px 0">' + esc(q.question) + '</p>' +
        '<p class="small">' + q.options.map(function (o, oi) {
          var style = oi === q.answer ? "color:var(--good);font-weight:700" : (oi === chosen ? "color:var(--bad)" : "color:var(--muted)");
          return '<span style="' + style + '">' + letter(oi) + ". " + esc(o) + '</span>';
        }).join("<br>") + '</p>' +
        '<div class="explain small">' + answerExplanation(q) + '</div>' +
      '</div>');
      list.appendChild(item);
    });
    document.getElementById("again").addEventListener("click", function () { location.hash = "#/exam"; });
  }

  function viewProgress() {
    var p = loadProgress();
    var attempts = p.attempts || [];
    var avg = attempts.length
      ? Math.round((attempts.reduce(function (n, a) { return n + (a.score != null ? a.score : a.correct); }, 0) / attempts.length) * 100) / 100
      : 0;
    app.innerHTML = "";
    app.appendChild(el('<section class="card">' +
      '<h1>Your progress</h1>' +
      '<p class="muted">Attempts are stored in this browser only. Total attempts: <strong>' + attempts.length + '</strong> · average score: <strong>' + avg + '</strong></p>' +
      (attempts.length ? '<div class="table-scroll"><table><thead><tr><th>When</th><th>Mode</th><th>Paper</th><th>Correct</th><th>Wrong</th><th>Skipped</th><th>Score</th></tr></thead><tbody>' +
        attempts.map(function (a) {
          return '<tr><td>' + new Date(a.at).toLocaleString() + '</td><td>' + a.mode + '</td><td>' +
            esc(a.exam || a.category || "") + '</td><td>' + a.correct + '</td><td>' + (a.wrong || 0) + '</td><td>' +
            (a.skipped || 0) + '</td><td>' + (a.score != null ? a.score : a.correct + "/" + a.total) + '</td></tr>';
        }).join("") + '</tbody></table></div>'
        : '<p class="muted">No attempts yet. Start with a 40 question exam.</p>') +
    '</section>'));
  }

  /* ------------------------------------------------------------------ */
  /* routing                                                            */
  /* ------------------------------------------------------------------ */
  function route() {
    clearInterval(state.timer); state.timer = null;
    var hash = location.hash.replace(/^#\/?/, "");
    var parts = hash.split("/").filter(Boolean);
    document.querySelectorAll("[data-nav]").forEach(function (a) {
      a.classList.remove("active");
    });
    if (!parts.length) { setNav("home"); viewHome(); return; }
    if (parts[0] === "practice") { setNav("practice"); parts[1] ? viewPractice(parts[1]) : viewPracticeIndex(); return; }
    if (parts[0] === "exam") { setNav("exam"); viewExamSetup(); return; }
    if (parts[0] === "progress") { setNav("progress"); viewProgress(); return; }
    setNav("home"); viewHome();
  }
  function setNav(name) {
    var link = document.querySelector('[data-nav="' + name + '"]');
    if (link) link.classList.add("active");
  }

  function updateStats() {
    var el2 = document.getElementById("bank-stats");
    if (!el2) return;
    var n = totalQuestions();
    el2.textContent = "Loaded " + n.toLocaleString("en-IN") + " questions from " +
      (window.QBANK_MANIFEST || []).length + " categories.";
  }

  function boot() {
    updateStats();
    route();
    window.addEventListener("hashchange", route);
    document.getElementById("theme-toggle").addEventListener("click", function () {
      var root = document.documentElement;
      var dark = root.getAttribute("data-theme") === "dark";
      root.setAttribute("data-theme", dark ? "light" : "dark");
      this.textContent = dark ? "Dark" : "Light";
      localStorage.setItem("comp.theme", dark ? "light" : "dark");
    });
    if (localStorage.getItem("comp.theme") === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      document.getElementById("theme-toggle").textContent = "Light";
    }
  }

  window.addEventListener("qbank-ready", boot);
})();
