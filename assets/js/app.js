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
    return '<p class="explain-line"><strong>Correct answer: ' + letter(q.answer) + '. ' + esc(q.options[q.answer]) + '</strong></p>' +
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

  /* One accent hue per subject family keeps the category grid calm and scannable. */
  var GROUP_HUES = {
    "General Knowledge": 258, "Social Studies": 340, "Science": 168,
    "Language": 24, "Aptitude": 205, "Commerce": 40
  };
  var GROUP_ORDER = ["General Knowledge", "Social Studies", "Science", "Language", "Aptitude", "Commerce"];
  function groupOf(cat) { return (cat && cat.group) || "More"; }
  function hueFor(group) { return GROUP_HUES[group] != null ? GROUP_HUES[group] : 258; }

  /* ------------------------------------------------------------------ */
  /* theme                                                              */
  /* ------------------------------------------------------------------ */
  var THEME_KEY = "comp.theme";
  function systemPrefersDark() {
    return !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  }
  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }
  function applyTheme(theme, persist) {
    var dark = theme === "dark";
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    var btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.innerHTML = '<span class="theme-icon" aria-hidden="true">' + (dark ? "\u2600\uFE0F" : "\uD83C\uDF19") + '</span>' +
        '<span class="theme-label">' + (dark ? "Light" : "Dark") + '</span>';
      btn.setAttribute("aria-pressed", dark ? "true" : "false");
      btn.title = dark ? "Switch to the light theme" : "Switch to the dark theme";
    }
    if (persist) {
      try { localStorage.setItem(THEME_KEY, dark ? "dark" : "light"); } catch (e) {}
    }
  }
  function savedTheme() {
    try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; }
  }

  /* ------------------------------------------------------------------ */
  /* category grid (shared by home and the practice index)               */
  /* ------------------------------------------------------------------ */
  function categoryTile(cat, countFn) {
    var count = countFn ? countFn(cat) : Number(cat.count).toLocaleString("en-IN") + " questions";
    return el('<a class="tile" href="#/practice/' + esc(cat.slug) + '" style="--hue:' + hueFor(groupOf(cat)) + '">' +
      '<span class="tile-top">' +
        '<span class="tile-icon" aria-hidden="true">' + (CATEGORY_ICONS[cat.icon] || "\u2022") + '</span>' +
        '<span class="name">' + esc(cat.name) + '</span>' +
        '<span class="chev" aria-hidden="true">\u2192</span>' +
      '</span>' +
      '<span class="count">' + count + '</span>' +
      '<span class="desc">' + esc(cat.blurb || "") + '</span></a>');
  }

  /** Groups in display order, with any unknown group appended alphabetically. */
  function groupOrderFor(cats) {
    var present = [], seen = {};
    cats.forEach(function (c) {
      var g = groupOf(c);
      if (!seen[g]) { seen[g] = true; present.push(g); }
    });
    var ordered = GROUP_ORDER.filter(function (g) { return seen[g]; });
    var rest = present.filter(function (g) { return GROUP_ORDER.indexOf(g) === -1; }).sort();
    return ordered.concat(rest);
  }

  /** Renders the grouped, searchable category grid and returns how many matched. */
  function renderCategoryGrid(host, cats, countFn, query) {
    var q = String(query || "").trim().toLowerCase();
    var matches = cats.filter(function (c) {
      if (!q) return true;
      return (c.name + " " + groupOf(c) + " " + (c.blurb || "") + " " + c.slug).toLowerCase().indexOf(q) !== -1;
    });
    host.innerHTML = "";
    if (!matches.length) {
      host.appendChild(el('<p class="empty">No category matches \u201C' + esc(query) + '\u201D. Try \u201Chistory\u201D, \u201Ccoding\u201D or \u201Cscience\u201D.</p>'));
      return 0;
    }
    groupOrderFor(matches).forEach(function (group) {
      var inGroup = matches.filter(function (c) { return groupOf(c) === group; });
      var block = el('<section class="cat-group"><h3>' + esc(group) +
        ' <span class="chip">' + inGroup.length + '</span></h3><div class="grid cats"></div></section>');
      var grid = block.querySelector(".grid");
      inGroup.slice().sort(function (a, b) { return b.count - a.count; })
        .forEach(function (c) { grid.appendChild(categoryTile(c, countFn)); });
      host.appendChild(block);
    });
    return matches.length;
  }

  /** Wires a search box to a category grid and keeps the match note in sync. */
  function wireCategorySearch(inputId, noteId, host, cats, countFn, allLabel) {
    var input = document.getElementById(inputId);
    var note = document.getElementById(noteId);
    if (!input || !host) return;
    if (note) note.textContent = allLabel;
    input.addEventListener("input", function () {
      var n = renderCategoryGrid(host, cats, countFn, input.value);
      if (note) {
        note.textContent = input.value.trim()
          ? n + (n === 1 ? " category matches " : " categories match ") + "\u201C" + input.value.trim() + "\u201D"
          : allLabel;
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* views                                                             */
  /* ------------------------------------------------------------------ */
  function viewHome() {
    var bank = totalQuestions();
    var cats = manifest();
    var oneK = cats.filter(function (c) { return c.count >= 1000; }).length;
    var target = currentTarget();
    app.innerHTML = "";
    app.appendChild(el(
      '<section class="card hero">' +
        '<div class="hero-copy">' +
          '<span class="eyebrow">\uD83C\uDFAF ' + cats.length + ' categories \u00B7 40 question papers</span>' +
          '<h1>Practice for the competition</h1>' +
          '<p>One target list \u2014 Classes 1 to 12, Graduation, SSC CGL, SSC CHSL, Banking and Railways. Every paper is 40 questions in 40 minutes with 0.25 negative marking.</p>' +
          '<div class="kpis">' +
            '<div class="kpi"><b>' + bank.toLocaleString("en-IN") + '</b><span>questions</span></div>' +
            '<div class="kpi"><b>' + cats.length + '</b><span>categories</span></div>' +
            '<div class="kpi"><b>' + oneK + '</b><span>categories 1,000+</span></div>' +
            '<div class="kpi"><b>' + TARGETS.length + '</b><span>targets, one pattern</span></div>' +
          '</div>' +
        '</div>' +
        '<div class="picks">' +
          '<div>' +
            '<label class="field" for="pick-target">Your target \u2014 class or exam</label>' +
            '<select id="pick-target">' + targetOptions(state.target) + '</select>' +
          '</div>' +
          '<button class="primary" id="start-exam" type="button">\u25B6 Start 40 question exam</button>' +
          '<button class="secondary" id="browse-practice" type="button">Practise by category</button>' +
          '<p class="hint">40 questions \u00B7 40 minutes \u00B7 +1 correct, \u22120.25 wrong</p>' +
        '</div>' +
      '</section>'
    ));

    app.appendChild(el('<section class="card"><div class="card-head"><div>' +
      '<h2>Question bank</h2>' +
      '<p class="muted small">Generated by <code>tools/build-qbank.js</code>. Pick a category for a 15 question drill with instant explanations.</p>' +
      '</div><span class="badge plain" id="target-badge">\uD83C\uDFAF ' + esc(target.name) + '</span></div>' +
      '<div class="filter-bar">' +
        '<label class="search"><span aria-hidden="true">\uD83D\uDD0D</span>' +
          '<input type="search" id="cat-search" placeholder="Search categories \u2014 history, coding, chemistry\u2026" aria-label="Search categories" />' +
        '</label>' +
        '<span class="filter-note" id="cat-note"></span>' +
      '</div>' +
      '<div id="cat-sections"></div></section>'));

    var host = document.getElementById("cat-sections");
    var allLabel = "Showing all " + cats.length + " categories, biggest first.";
    renderCategoryGrid(host, cats, null, "");
    wireCategorySearch("cat-search", "cat-note", host, cats, null, allLabel);

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
      var badge = document.getElementById("target-badge");
      if (badge) badge.textContent = "\uD83C\uDFAF " + currentTarget().name;
    });
    document.getElementById("start-exam").addEventListener("click", function () { location.hash = "#/exam"; });
    document.getElementById("browse-practice").addEventListener("click", function () { location.hash = "#/practice"; });
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
    var cats = manifest();
    var target = currentTarget();
    var levels = levelsForTarget(target);
    var countFn = function (c) {
      var available = questionsFor(c.slug).filter(function (q) { return levels.indexOf(q.level) !== -1; }).length;
      return available.toLocaleString("en-IN") + " of " + Number(c.count).toLocaleString("en-IN") + " ready";
    };
    app.innerHTML = "";
    app.appendChild(el('<section class="card">' +
      '<div class="card-head"><div>' +
        '<h1>Practice by category</h1>' +
        '<p class="muted">A 15 question drill with instant explanations, drawn from the difficulty levels for <strong>' + esc(target.name) + '</strong>.</p>' +
      '</div><span class="badge plain">' + esc(target.name) + '</span></div>' +
      '<div class="filter-bar">' +
        '<label class="search"><span aria-hidden="true">\uD83D\uDD0D</span>' +
          '<input type="search" id="cat-search" placeholder="Search categories\u2026" aria-label="Search categories" />' +
        '</label>' +
        '<span class="filter-note" id="cat-note"></span>' +
      '</div>' +
      '<div id="cat-sections"></div></section>'));
    var host = document.getElementById("cat-sections");
    var allLabel = "Showing all " + cats.length + " categories for " + target.name + ".";
    renderCategoryGrid(host, cats, countFn, "");
    wireCategorySearch("cat-search", "cat-note", host, cats, countFn, allLabel);
  }

  function renderQuestion() {
    var s = state.session;
    if (!s) { viewHome(); return; }
    var q = s.questions[s.index];
    if (!q) { renderPracticeSummary(); return; }
    var chosen = s.answers[s.index];
    var revealed = s.revealed[s.index];

    app.innerHTML = "";
    var pct = Math.round(((s.index + 1) / s.questions.length) * 100);
    var card = el('<section class="card">' +
      '<div class="qhead">' +
        '<div class="left">' +
          '<span class="badge">' + esc(s.name) + '</span>' +
          '<span class="badge plain">Question ' + (s.index + 1) + ' of ' + s.questions.length + '</span>' +
        '</div>' +
        '<div class="qmeta">' +
          (q.topic ? '<span class="chip">' + esc(q.topic) + '</span>' : "") +
          '<span class="chip">Level ' + q.level + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="progress thin" role="presentation"><div class="bar" style="width:' + pct + '%"></div></div>' +
      '<p class="qtext">' + esc(q.question) + '</p>' +
      '<div class="options" id="opts"></div>' +
      '<div id="feedback" aria-live="polite"></div>' +
      '<div class="toolbar">' +
        '<button class="secondary" id="prev" type="button"' + (s.index === 0 ? " disabled" : "") + '>\u2190 Previous</button>' +
        '<button class="primary" id="next" type="button">' +
          (s.index === s.questions.length - 1 ? "Finish drill" : "Next question \u2192") + '</button>' +
        '<span class="kbd-hint spacer">Press <kbd>A</kbd>\u2013<kbd>D</kbd> to answer, <kbd>\u2190</kbd> <kbd>\u2192</kbd> to move</span>' +
      '</div>' +
    '</section>');
    app.appendChild(card);

    var opts = card.querySelector("#opts");
    q.options.forEach(function (text, i) {
      var b = el('<button class="opt" type="button" data-i="' + i + '" aria-pressed="' + (revealed && chosen === i ? "true" : "false") + '"><span class="letter">' + letter(i) + '</span><span>' + esc(text) + '</span></button>');
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
      var ok = chosen === q.answer;
      card.querySelector("#feedback").appendChild(el('<div class="explain ' + (ok ? "is-correct" : "is-wrong") + '">' +
        '<p class="explain-title">' + (ok ? "\u2705 Correct." : "\u274C Incorrect.") + '</p>' +
        answerExplanation(q) + '</div>'));
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
    var pct = s.questions.length ? Math.round((correct / s.questions.length) * 100) : 0;
    var verdict = pct >= 80 ? "Excellent — keep the streak going." : pct >= 50 ? "Solid. Review the explanations you missed." : "Good start — read the explanations and try another set.";
    state.mode = "result";
    app.innerHTML = "";
    app.appendChild(el('<section class="card center result-hero">' +
      '<h1>Drill complete</h1>' +
      scoreRing(pct, correct + " / " + s.questions.length, "correct") +
      '<p class="muted">' + esc(verdict) + '</p>' +
      '<div class="stat-grid">' +
        '<div class="stat good"><b>' + correct + '</b><span>Correct</span></div>' +
        '<div class="stat bad"><b>' + (attempted - correct) + '</b><span>Wrong</span></div>' +
        '<div class="stat warn"><b>' + (s.questions.length - attempted) + '</b><span>Skipped</span></div>' +
        '<div class="stat"><b>' + (attempted ? Math.round((correct / attempted) * 100) : 0) + '%</b><span>Accuracy</span></div>' +
      '</div>' +
      '<div class="toolbar center-x">' +
        '<button class="primary" id="again" type="button">Practise another set</button>' +
        '<button class="secondary" id="all-cats" type="button">All categories</button>' +
        '<button class="secondary" id="home" type="button">Back to home</button>' +
      '</div></section>'));
    document.getElementById("again").addEventListener("click", function () { viewPractice(s.slug); });
    document.getElementById("all-cats").addEventListener("click", function () { location.hash = "#/practice"; });
    document.getElementById("home").addEventListener("click", function () { location.hash = "#/"; });
  }

  /** Circular score gauge: 2πr ≈ 327 for r = 52. */
  function scoreRing(pct, big, label) {
    var cls = pct >= 70 ? "is-high" : pct >= 40 ? "is-mid" : "is-low";
    var compact = String(big).length > 4 ? " is-compact" : "";
    return '<div class="ring ' + cls + '" style="--pct:' + Math.max(0, Math.min(100, pct)) + '" role="img" aria-label="' + esc(pct + "% " + label) + '">' +
      '<svg viewBox="0 0 120 120" aria-hidden="true">' +
        '<circle class="ring-track" cx="60" cy="60" r="52"></circle>' +
        '<circle class="ring-value" cx="60" cy="60" r="52"></circle>' +
      '</svg>' +
      '<div class="ring-text' + compact + '"><b>' + esc(big) + '</b><span>' + esc(label) + '</span></div></div>';
  }

  function viewExamSetup() {
    app.innerHTML = "";
    app.appendChild(el('<section class="card">' +
      '<div class="card-head"><div>' +
        '<h1>40 question exam</h1>' +
        '<p class="muted">Every paper follows the competition rules \u2014 pick a target and begin.</p>' +
      '</div><span class="badge warn">Timed</span></div>' +
      '<div class="row">' +
        '<div><label class="field" for="e-target">Your target \u2014 class or exam</label><select id="e-target">' +
          targetOptions(state.target) +
        '</select></div>' +
      '</div>' +
      '<div class="stat-grid" style="margin-top:18px">' +
        '<div class="stat"><b>40</b><span>Questions</span></div>' +
        '<div class="stat"><b>40 min</b><span>Time limit</span></div>' +
        '<div class="stat good"><b>+1</b><span>Per correct</span></div>' +
        '<div class="stat bad"><b>&minus;0.25</b><span>Per wrong</span></div>' +
      '</div>' +
      '<h3>Sections in this paper</h3><p class="muted small" id="sec-preview"></p>' +
      '<div class="toolbar"><button class="primary" id="begin" type="button">\u25B6 Begin exam</button>' +
      '<span class="kbd-hint spacer">Keys <kbd>A</kbd>\u2013<kbd>D</kbd> answer \u00B7 <kbd>\u2190</kbd> <kbd>\u2192</kbd> move \u00B7 the paper submits itself when time runs out</span></div>' +
    '</section>'));
    function preview() {
      var target = targetById(document.getElementById("e-target").value) || currentTarget();
      var sections = targetSections(target);
      document.getElementById("sec-preview").textContent = target.sections
        ? sections.map(sectionLabel).join(" \u00B7 ")
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
      var box = document.getElementById("timer");
      if (box) box.classList.toggle("low", s.left <= 300);
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
    var answered = s.answers.filter(function (a) { return a != null; }).length;
    var card = el('<section class="card">' +
      '<div class="qhead">' +
        '<div class="left">' +
          '<span class="badge">' + esc(s.name) + '</span>' +
          '<span class="badge warn">Question ' + (s.index + 1) + ' / ' + s.questions.length + '</span>' +
          '<span class="badge plain">' + answered + ' answered</span>' +
        '</div>' +
        '<div class="timer' + (s.left <= 300 ? " low" : "") + '" id="timer">' +
          '<span class="timer-label">Time left</span> <span id="clock">' + formatTime(s.left) + '</span>' +
        '</div>' +
      '</div>' +
      '<p class="qtext">' + esc(q.question) + '</p>' +
      '<div class="options" id="opts"></div>' +
      '<div class="palette" id="palette"></div>' +
      '<div class="palette-legend">' +
        '<span><i class="swatch answered"></i> Answered</span>' +
        '<span><i class="swatch current"></i> Current question</span>' +
      '</div>' +
      '<div class="toolbar">' +
        '<button class="secondary" id="prev" type="button"' + (s.index === 0 ? " disabled" : "") + '>\u2190 Previous</button>' +
        '<button class="secondary" id="next" type="button"' + (s.index === s.questions.length - 1 ? " disabled" : "") + '>Next \u2192</button>' +
        '<button class="primary spacer" id="submit" type="button">Submit paper</button>' +
      '</div>' +
      '<p class="muted small">' + esc(q.topic || "") + ' \u00B7 level ' + q.level + ' \u00B7 explanations unlock after you submit</p>' +
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
      var b = el('<button type="button" title="Go to question ' + (i + 1) + '" class="' + (s.answers[i] != null ? "answered" : "") + (i === s.index ? " current" : "") + '">' + (i + 1) + '</button>');
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
    var pct = s.questions.length ? Math.round((Math.max(0, score) / s.questions.length) * 100) : 0;
    var accuracy = correct + wrong ? Math.round((correct / (correct + wrong)) * 100) : 0;
    var verdict = pct >= 70 ? "\uD83C\uDF89 Strong paper. Keep this pace."
      : pct >= 40 ? "\uD83D\uDC4D Decent attempt. Read the explanations you missed."
      : "\uD83D\uDCA1 Every wrong answer here is a fact learned \u2014 review and retry.";
    app.innerHTML = "";
    app.appendChild(el('<section class="card center result-hero">' +
      '<h1>Exam submitted</h1>' +
      scoreRing(pct, String(result.score), "of " + s.questions.length) +
      '<p class="muted">' + esc(result.exam) + ' \u00B7 time used ' + formatTime(result.seconds) + ' of ' + MINUTES_PER_EXAM + ':00</p>' +
      '<div class="stat-grid">' +
        '<div class="stat good"><b>' + correct + '</b><span>Correct</span></div>' +
        '<div class="stat bad"><b>' + wrong + '</b><span>Wrong</span></div>' +
        '<div class="stat warn"><b>' + skipped + '</b><span>Skipped</span></div>' +
        '<div class="stat"><b>' + accuracy + '%</b><span>Accuracy</span></div>' +
      '</div>' +
      '<p class="muted">' + esc(verdict) + '</p>' +
      '<div class="toolbar center-x">' +
        '<button class="primary" id="review" type="button">Review answers</button>' +
        '<button class="secondary" id="again" type="button">Take another paper</button>' +
        '<button class="secondary" id="home" type="button">Back to home</button>' +
      '</div></section>'));
    document.getElementById("review").addEventListener("click", renderExamReview);
    document.getElementById("again").addEventListener("click", function () { location.hash = "#/exam"; });
    document.getElementById("home").addEventListener("click", function () { location.hash = "#/"; });
  }

  function renderExamReview() {
    var s = state.session;
    var correct = 0, wrong = 0, skipped = 0;
    s.questions.forEach(function (q, i) {
      if (s.answers[i] == null) skipped++;
      else if (s.answers[i] === q.answer) correct++;
      else wrong++;
    });
    app.innerHTML = "";
    var wrap = el('<section class="card">' +
      '<div class="card-head"><div>' +
        '<h1>Review</h1>' +
        '<p class="muted">' + esc(s.name) + ' \u00B7 40 questions \u00B7 0.25 negative marking \u2014 every explanation is unlocked here.</p>' +
      '</div>' +
      '<span class="badge good">' + correct + ' correct</span> <span class="badge bad">' + wrong + ' wrong</span> <span class="badge warn">' + skipped + ' skipped</span>' +
      '</div>' +
      '<div class="filter-bar">' +
        '<span class="chips" id="review-filters">' +
          '<button class="secondary" data-filter="all" type="button">All 40</button>' +
          '<button class="secondary" data-filter="wrong" type="button">Wrong only</button>' +
          '<button class="secondary" data-filter="skipped" type="button">Skipped only</button>' +
        '</span>' +
        '<span class="filter-note spacer"></span>' +
      '</div>' +
      '<div id="list"></div>' +
      '<div class="toolbar"><button class="primary" id="again" type="button">Take another paper</button>' +
      '<button class="secondary" id="home" type="button">Back to home</button></div></section>');
    app.appendChild(wrap);
    var list = wrap.querySelector("#list");

    function paint(filter) {
      list.innerHTML = "";
      var shown = 0;
      s.questions.forEach(function (q, i) {
        var chosen = s.answers[i];
        var state2 = chosen == null ? "skipped" : (chosen === q.answer ? "correct" : "wrong");
        if (filter !== "all" && state2 !== filter) return;
        shown++;
        var mark = state2 === "skipped" ? '<span class="badge warn">Skipped</span>'
          : state2 === "correct" ? '<span class="badge good">Correct</span>' : '<span class="badge bad">Wrong</span>';
        var item = el('<div class="review-item">' +
          '<div class="qhead">' +
            '<div class="left"><span class="badge plain">Q' + (i + 1) + '</span> ' + mark +
            (q.topic ? ' <span class="chip">' + esc(q.topic) + '</span>' : "") + '</div>' +
          '</div>' +
          '<p class="qtext">' + esc(q.question) + '</p>' +
          '<div class="review-opts">' + q.options.map(function (o, oi) {
            var cls = oi === q.answer ? " is-answer" : (oi === chosen ? " is-chosen-wrong" : "");
            return '<span class="review-opt' + cls + '"><span class="letter">' + letter(oi) + '</span><span>' + esc(o) + '</span></span>';
          }).join("") + '</div>' +
          '<div class="explain small' + (state2 === "correct" ? " is-correct" : state2 === "wrong" ? " is-wrong" : "") + '">' +
            answerExplanation(q) + '</div>' +
        '</div>');
        list.appendChild(item);
      });
      if (!shown) list.appendChild(el('<p class="empty">Nothing in this filter \u2014 nice work.</p>'));
    }
    paint("all");
    wrap.querySelectorAll("#review-filters button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        wrap.querySelectorAll("#review-filters button").forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        paint(btn.getAttribute("data-filter"));
      });
    });
    document.getElementById("again").addEventListener("click", function () { location.hash = "#/exam"; });
    document.getElementById("home").addEventListener("click", function () { location.hash = "#/"; });
  }

  function viewProgress() {
    var p = loadProgress();
    var attempts = p.attempts || [];
    var avg = attempts.length
      ? Math.round((attempts.reduce(function (n, a) { return n + (a.score != null ? a.score : a.correct); }, 0) / attempts.length) * 100) / 100
      : 0;
    var best = attempts.length
      ? attempts.reduce(function (m, a) { var v = a.score != null ? a.score : a.correct; return Math.max(m, v); }, -Infinity)
      : 0;
    var exams = attempts.filter(function (a) { return a.mode === "exam"; }).length;
    var drills = attempts.length - exams;
    app.innerHTML = "";
    app.appendChild(el('<section class="card">' +
      '<div class="card-head"><div>' +
        '<h1>Your progress</h1>' +
        '<p class="muted">Attempts are stored in this browser only \u2014 nothing is uploaded anywhere.</p>' +
      '</div><span class="badge plain">Average score ' + avg + '</span></div>' +
      '<div class="stat-grid">' +
        '<div class="stat"><b>' + attempts.length + '</b><span>Attempts</span></div>' +
        '<div class="stat"><b>' + exams + '</b><span>Exams</span></div>' +
        '<div class="stat"><b>' + drills + '</b><span>Drills</span></div>' +
        '<div class="stat good"><b>' + best + '</b><span>Best score</span></div>' +
      '</div>' +
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
    /* Leaving a view drops its session so leftover keyboard shortcuts do nothing. */
    state.mode = null;
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

  /**
   * Keyboard shortcuts: A–D (or 1–4) answer, arrows move, Enter goes next.
   * Ignored while the focus is in a text field, so search stays usable.
   */
  function handleKeys(e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "SELECT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
    var s = state.session;
    if (!s || !s.questions) return;
    var key = e.key || "";
    var picked = key.length === 1 ? "abcd".indexOf(key.toLowerCase()) : -1;
    if (picked === -1 && key.length === 1) picked = "1234".indexOf(key);
    if (state.mode === "practice") {
      if (picked !== -1 && s.questions[s.index]) {
        s.answers[s.index] = picked; s.revealed[s.index] = true; renderQuestion(); e.preventDefault(); return;
      }
      if (key === "ArrowLeft" && s.index > 0) { s.index--; renderQuestion(); e.preventDefault(); }
      else if (key === "ArrowRight" || key === "Enter") {
        if (s.index === s.questions.length - 1) renderPracticeSummary();
        else { s.index++; renderQuestion(); }
        e.preventDefault();
      }
    } else if (state.mode === "exam") {
      if (picked !== -1 && s.questions[s.index]) { s.answers[s.index] = picked; renderExam(); e.preventDefault(); return; }
      if (key === "ArrowLeft" && s.index > 0) { s.index--; renderExam(); e.preventDefault(); }
      else if (key === "ArrowRight" && s.index < s.questions.length - 1) { s.index++; renderExam(); e.preventDefault(); }
    }
  }

  function boot() {
    updateStats();
    route();
    window.addEventListener("hashchange", route);
    document.addEventListener("keydown", handleKeys);

    /* Theme: saved choice wins, otherwise follow the operating system. */
    var saved = savedTheme();
    applyTheme(saved === "dark" || (!saved && systemPrefersDark()) ? "dark" : "light", false);
    var toggle = document.getElementById("theme-toggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        applyTheme(currentTheme() === "dark" ? "light" : "dark", true);
      });
    }
    if (window.matchMedia) {
      var mq = window.matchMedia("(prefers-color-scheme: dark)");
      var onSystemChange = function (e) {
        if (!savedTheme()) applyTheme(e.matches ? "dark" : "light", false);
      };
      if (mq.addEventListener) mq.addEventListener("change", onSystemChange);
      else if (mq.addListener) mq.addListener(onSystemChange);
    }
  }

  window.addEventListener("qbank-ready", boot);
})();
