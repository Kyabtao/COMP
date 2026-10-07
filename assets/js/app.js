"use strict";
/**
 * ExamSathi — competition prep app.
 * Modes: home, practice (category drill), exam (configurable paper), progress.
 * Paper shape (questions, minutes, marks, penalty) is user selectable and
 * defaults to 40 questions, 40 minutes, +1 / -0.25.
 */
(function () {
  var STORE_KEY = "examsathi.progress.v1";
  var TARGET_KEY = "examsathi.target";
  /**
   * Merged target list: school classes and competitive exams live in one list
   * because every paper follows the same shape by default (40 questions,
   * 40 minutes, +1 per correct answer, 0.25 negative marking) and can be
   * reshaped on the setup screen. Class targets draw a balanced paper from
   * every category and filter by age band; exam targets draw from their own
   * sections at every difficulty level.
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
  /* Defaults for every new paper — the exam screen can change all three. */
  var QUESTIONS_PER_EXAM = 40;
  var MINUTES_PER_EXAM = 40;
  var NEGATIVE_MARKING = 0.25;
  var DEFAULT_SETTINGS = {
    questions: QUESTIONS_PER_EXAM,
    minutes: MINUTES_PER_EXAM,
    marks: 1,
    penalty: NEGATIVE_MARKING
  };
  var SETTINGS_KEY = "examsathi.exam.settings";
  var DRILL_KEY = "examsathi.drill.length";
  var THEME_KEY = "examsathi.theme";
  var DRILL_DEFAULT = 15;
  var QUESTION_CHOICES = [10, 15, 20, 25, 30, 40, 50, 60, 75, 100];
  var TIME_CHOICES = [5, 10, 15, 20, 25, 30, 40, 45, 60, 75, 90, 120];
  var MARK_CHOICES = [1, 2, 3, 4];
  var PENALTY_CHOICES = [0, 0.25, 0.33, 0.5, 1];
  var DRILL_CHOICES = [5, 10, 15, 20, 25, 30];
  /* One tap setups that mirror how the big exams are actually marked. */
  var PRESETS = [
    { id: "default", name: "Default", note: "40 Q \u00B7 40 min \u00B7 +1 / \u22120.25", settings: { questions: 40, minutes: 40, marks: 1, penalty: 0.25 } },
    { id: "sprint", name: "Quick sprint", note: "10 Q \u00B7 10 min \u00B7 +1 / no penalty", settings: { questions: 10, minutes: 10, marks: 1, penalty: 0 } },
    { id: "ssc", name: "SSC style", note: "60 Q \u00B7 60 min \u00B7 +2 / \u22120.5", settings: { questions: 60, minutes: 60, marks: 2, penalty: 0.5 } },
    { id: "railways", name: "Railways style", note: "100 Q \u00B7 90 min \u00B7 +1 / \u22120.33", settings: { questions: 100, minutes: 90, marks: 1, penalty: 0.33 } },
    { id: "school", name: "School test", note: "25 Q \u00B7 30 min \u00B7 +1 / no penalty", settings: { questions: 25, minutes: 30, marks: 1, penalty: 0 } }
  ];

  function trimNumber(n) { return String(Math.round(Number(n) * 100) / 100); }
  function round2(n) { return Math.round(n * 100) / 100; }

  /* Storage can throw (private browsing, blocked cookies) — never let it break the app. */
  function storeGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function storeSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) {}
  }
  function storeRemove(key) {
    try { localStorage.removeItem(key); } catch (e) {}
  }

  /**
   * The site was renamed from COMP to ExamSathi: copy saved progress, target,
   * paper settings, drill length and theme from the old comp.* keys to the new
   * examsathi.* keys so returning visitors keep everything.
   */
  function migrateStorage() {
    var pairs = [
      [STORE_KEY, "comp.progress.v1"],
      [TARGET_KEY, "comp.target"],
      [SETTINGS_KEY, "comp.exam.settings"],
      [DRILL_KEY, "comp.drill.length"],
      [THEME_KEY, "comp.theme"]
    ];
    pairs.forEach(function (pair) {
      if (storeGet(pair[0]) == null) {
        var old = storeGet(pair[1]);
        if (old != null) storeSet(pair[0], old);
      }
    });
  }
  migrateStorage();

  /** Saved paper settings, always merged over the defaults so bad values cannot leak in. */
  function examSettings() {
    var out = {
      questions: DEFAULT_SETTINGS.questions,
      minutes: DEFAULT_SETTINGS.minutes,
      marks: DEFAULT_SETTINGS.marks,
      penalty: DEFAULT_SETTINGS.penalty
    };
    var raw = null;
    try { raw = JSON.parse(storeGet(SETTINGS_KEY)); } catch (e) { raw = null; }
    if (raw && typeof raw === "object") {
      ["questions", "minutes", "marks", "penalty"].forEach(function (key) {
        var value = Number(raw[key]);
        if (isFinite(value) && value >= 0) out[key] = value;
      });
    }
    if (out.questions < 5 || out.questions > 500) out.questions = DEFAULT_SETTINGS.questions;
    if (out.minutes < 1 || out.minutes > 360) out.minutes = DEFAULT_SETTINGS.minutes;
    return out;
  }
  function saveExamSettings(settings) {
    storeSet(SETTINGS_KEY, JSON.stringify(settings));
  }
  function markingText(settings) {
    return "+" + trimNumber(settings.marks) + " correct \u00B7 " +
      (settings.penalty > 0 ? "\u2212" + trimNumber(settings.penalty) + " wrong" : "no penalty for wrong answers");
  }
  function drillLength() {
    var saved = Number(storeGet(DRILL_KEY));
    if (!isFinite(saved)) saved = 0;
    return DRILL_CHOICES.indexOf(saved) !== -1 ? saved : DRILL_DEFAULT;
  }
  function saveDrillLength(n) {
    storeSet(DRILL_KEY, String(n));
  }
  /** Keeps a saved value visible in its <select> even when it is not one of the usual choices. */
  function choicesFor(list, value) {
    var number = Number(value);
    return list.indexOf(number) !== -1 ? list.slice() : list.concat([number]).sort(function (a, b) { return a - b; });
  }
  function optionsHtml(values, selected, labelFn) {
    return values.map(function (value) {
      return '<option value="' + value + '"' + (String(value) === String(selected) ? " selected" : "") + '>' +
        (labelFn ? labelFn(value) : value) + '</option>';
    }).join("");
  }

  function targetById(id) {
    for (var i = 0; i < TARGETS.length; i++) if (TARGETS[i].id === id) return TARGETS[i];
    return null;
  }

  /** Reads the merged target, upgrading old builds that stored class + exam separately. */
  function migrateTarget() {
    var stored = storeGet(TARGET_KEY);
    if (stored && targetById(stored)) return stored;
    var legacyExam = storeGet("comp.exam");
    var legacyClass = storeGet("comp.class");
    var next = "ssc-cgl";
    if (legacyExam && targetById(legacyExam)) next = legacyExam;
    else if (legacyClass) {
      var idx = CLASS_NAMES.indexOf(legacyClass);
      if (idx !== -1) next = TARGETS[idx].id;
    }
    storeSet(TARGET_KEY, next);
    storeRemove("comp.exam");
    storeRemove("comp.class");
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
    try { return JSON.parse(storeGet(STORE_KEY)) || { attempts: [] }; }
    catch (e) { return { attempts: [] }; }
  }
  function saveAttempt(attempt) {
    var p = loadProgress();
    p.attempts.unshift(attempt);
    p.attempts = p.attempts.slice(0, 60);
    saveProgress(p);
  }
  function saveProgress(progress) {
    storeSet(STORE_KEY, JSON.stringify(progress));
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
  /* theme (THEME_KEY lives with the other storage keys above)            */
  /* ------------------------------------------------------------------ */
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
    if (persist) storeSet(THEME_KEY, dark ? "dark" : "light");
  }
  function savedTheme() {
    return storeGet(THEME_KEY);
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
  /* daily dose (fresh questions published every morning)               */
  /* ------------------------------------------------------------------ */
  function dailySets() {
    var sets = {};
    Object.keys(store()).forEach(function (key) {
      ((store()[key] || {}).questions || []).forEach(function (q) {
        if (q.source === "daily" && q.dailyDate) {
          (sets[q.dailyDate] = sets[q.dailyDate] || []).push(q);
        }
      });
    });
    return sets;
  }
  function latestDailyDate(sets) {
    var dates = Object.keys(sets).sort();
    return dates.length ? dates[dates.length - 1] : null;
  }
  function todayLocal() {
    var d = new Date();
    function pad(n) { return String(n).padStart(2, "0"); }
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }
  function prettyDate(dateStr) {
    var d = new Date(dateStr + "T00:00:00");
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }
  /** Today\u2019s set when it has published, otherwise the latest available day. */
  function dailyDateToShow(sets) {
    var today = todayLocal();
    return sets[today] ? today : latestDailyDate(sets);
  }

  /* ------------------------------------------------------------------ */
  /* views                                                             */
  /* ------------------------------------------------------------------ */
  function viewHome() {
    var bank = totalQuestions();
    var cats = manifest();
    var oneK = cats.filter(function (c) { return c.count >= 1000; }).length;
    var target = currentTarget();
    var plan = examSettings();
    var length = drillLength();
    app.innerHTML = "";
    app.appendChild(el(
      '<section class="card hero">' +
        '<div class="hero-copy">' +
          '<span class="eyebrow">\uD83C\uDFAF ' + cats.length + ' categories \u00B7 papers you design</span>' +
          '<h1>Practice for the competition</h1>' +
          '<p>One target list \u2014 Classes 1 to 12, Graduation, SSC CGL, SSC CHSL, Banking and Railways. The default paper is 40 questions in 40 minutes with 0.25 negative marking, and you can change the length, time and marking before you start.</p>' +
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
          '<button class="primary" id="start-exam" type="button">\u25B6 Set up a paper</button>' +
          '<button class="secondary" id="browse-practice" type="button">Practise by category</button>' +
          '<p class="hint" id="home-plan">' + plan.questions + ' questions \u00B7 ' + plan.minutes + ' minutes \u00B7 ' + esc(markingText(plan)) + ' \u00B7 ' + length + ' question drills</p>' +
        '</div>' +
      '</section>'
    ));

    var sets = dailySets();
    var dailyDate = dailyDateToShow(sets);
    if (dailyDate) {
      var fresh = sets[dailyDate].length;
      app.appendChild(el('<section class="card daily-strip"><div>' +
        '<span class="badge good">\uD83D\uDCC5 New ' + (dailyDate === todayLocal() ? "today" : prettyDate(dailyDate)) + '</span>' +
        '<h2>Daily dose \u2014 ' + fresh + ' fresh question' + (fresh === 1 ? "" : "s") + '</h2>' +
        '<p class="muted small">Published ' + prettyDate(dailyDate) + ' \u00B7 mixed subjects and levels, with instant explanations.</p>' +
        '</div><button class="primary" id="start-daily" type="button">\u25B6 Start the drill</button></section>'));
      document.getElementById("start-daily").addEventListener("click", function () { location.hash = "#/daily"; });
    }

    app.appendChild(el('<section class="card"><div class="card-head"><div>' +
      '<h2>Question bank</h2>' +
      '<p class="muted small">Generated by <code>tools/build-qbank.js</code>. Pick a category for a drill with instant explanations.</p>' +
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

    app.appendChild(el('<section class="card"><div class="card-head"><div>' +
      '<h2>Paper defaults</h2>' +
      '<p class="muted small">Every target starts from the same settings, kept in this browser. Change them on the setup screen \u2014 they stay for next time.</p>' +
      '</div><span class="badge plain">' + plan.questions + ' Q \u00B7 ' + plan.minutes + ' min</span></div>' +
      '<div class="stat-grid">' +
        '<div class="stat"><b>' + plan.questions + '</b><span>Questions</span></div>' +
        '<div class="stat"><b>' + plan.minutes + ' min</b><span>Time limit</span></div>' +
        '<div class="stat good"><b>+' + trimNumber(plan.marks) + '</b><span>Per correct</span></div>' +
        '<div class="stat bad"><b>' + (plan.penalty > 0 ? "\u2212" + trimNumber(plan.penalty) : "0") + '</b><span>Per wrong</span></div>' +
      '</div>' +
      '<div class="toolbar"><button class="secondary" id="edit-plan" type="button">Change these settings</button>' +
      '<button class="secondary" id="edit-drill" type="button">Drill length: ' + length + '</button></div>' +
      '<h3>How each target draws its paper</h3>' +
      '<div class="table-scroll"><table><thead><tr><th>Target</th><th>Type</th><th>Sections</th><th>Paper</th></tr></thead><tbody>' +
      TARGETS.map(function (t) {
        var sections = t.sections ? t.sections.length + " sections" : "All categories";
        return '<tr><td>' + esc(t.name) + '</td><td>' + t.type + '</td><td>' + sections + '</td><td>' +
          plan.questions + ' Q \u00B7 ' + plan.minutes + ' min \u00B7 ' + esc(markingText(plan)) + '</td></tr>';
      }).join("") +
      '</tbody></table></div></section>'));

    document.getElementById("pick-target").addEventListener("change", function (e) {
      state.target = e.target.value;
      storeSet(TARGET_KEY, state.target);
      var badge = document.getElementById("target-badge");
      if (badge) badge.textContent = "\uD83C\uDFAF " + currentTarget().name;
    });
    document.getElementById("start-exam").addEventListener("click", function () { location.hash = "#/exam"; });
    document.getElementById("browse-practice").addEventListener("click", function () { location.hash = "#/practice"; });
    document.getElementById("edit-plan").addEventListener("click", function () { location.hash = "#/exam"; });
    document.getElementById("edit-drill").addEventListener("click", function () { location.hash = "#/practice"; });
  }

  function viewPractice(slug) {
    var meta = manifest().filter(function (c) { return c.slug === slug; })[0];
    if (!meta) { location.hash = "#/practice"; return; }
    var levels = levelsForTarget(currentTarget());
    var pool = questionsFor(slug).filter(function (q) { return levels.indexOf(q.level) !== -1; });
    var length = drillLength();
    var set = shuffle(pool).slice(0, length);
    state.mode = "practice";
    state.session = { slug: slug, name: meta.name, questions: set, index: 0, answers: [], revealed: [], length: length };
    renderQuestion();
  }

  function viewDaily() {
    var sets = dailySets();
    var date = dailyDateToShow(sets);
    if (!date) {
      state.mode = null;
      state.session = null;
      app.innerHTML = "";
      app.appendChild(el('<section class="card center">' +
        '<h1>Daily dose</h1>' +
        '<p class="muted">Fresh questions publish every morning at 6 AM. Nothing has been published yet \u2014 check back soon.</p>' +
        '<div class="toolbar center-x"><button class="secondary" id="daily-home" type="button">Back to home</button></div></section>'));
      document.getElementById("daily-home").addEventListener("click", function () { location.hash = "#/"; });
      return;
    }
    state.mode = "practice";
    state.session = {
      kind: "daily", slug: "daily", name: "Daily Dose \u2014 " + prettyDate(date), date: date,
      questions: sets[date].slice(), index: 0, answers: [], revealed: [], length: sets[date].length
    };
    renderQuestion();
  }

  function viewPracticeIndex() {
    var cats = manifest();
    var target = currentTarget();
    var levels = levelsForTarget(target);
    var length = drillLength();
    var countFn = function (c) {
      var available = questionsFor(c.slug).filter(function (q) { return levels.indexOf(q.level) !== -1; }).length;
      return available.toLocaleString("en-IN") + " of " + Number(c.count).toLocaleString("en-IN") + " ready";
    };
    app.innerHTML = "";
    app.appendChild(el('<section class="card">' +
      '<div class="card-head"><div>' +
        '<h1>Practice by category</h1>' +
        '<p class="muted">Instant explanations, drawn from the difficulty levels for <strong>' + esc(target.name) + '</strong>.</p>' +
      '</div><span class="badge plain">' + esc(target.name) + '</span></div>' +
      '<div class="filter-bar">' +
        '<label class="field inline" for="drill-length">Drill length</label>' +
        '<select id="drill-length" class="compact-select">' +
          optionsHtml(choicesFor(DRILL_CHOICES, length), length, function (v) { return v + " questions"; }) +
        '</select>' +
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
    document.getElementById("drill-length").addEventListener("change", function (e) {
      saveDrillLength(Number(e.target.value));
      var note = document.getElementById("cat-note");
      if (note) note.textContent = "Drills now run " + Number(e.target.value) + " questions \u2014 pick a category to start.";
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
      '<h1 class="sr-only">' + esc(s.name) + ' drill, question ' + (s.index + 1) + ' of ' + s.questions.length + '</h1>' +
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
      '<p class="muted">' + esc(s.name) + ' \u00B7 ' + s.questions.length + ' question drill \u00B7 ' + esc(verdict) + '</p>' +
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
    document.getElementById("again").addEventListener("click", function () {
      if (s.kind === "daily") viewDaily(); else viewPractice(s.slug);
    });
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
    var settings = examSettings();
    state.draft = settings;
    app.innerHTML = "";
    app.appendChild(el('<section class="card">' +
      '<div class="card-head"><div>' +
        '<h1>Set up your paper</h1>' +
        '<p class="muted">Pick how many questions, how long you get and how it is marked \u2014 the defaults are already filled in.</p>' +
      '</div><span class="badge warn">\u23F1 Timed</span></div>' +
      '<div class="row">' +
        '<div><label class="field" for="e-target">Your target \u2014 class or exam</label><select id="e-target">' +
          targetOptions(state.target) +
        '</select></div>' +
        '<div><label class="field" for="e-questions">Questions</label><select id="e-questions">' +
          optionsHtml(choicesFor(QUESTION_CHOICES, settings.questions), settings.questions, function (v) { return v + " questions"; }) +
        '</select></div>' +
        '<div><label class="field" for="e-minutes">Time limit</label><select id="e-minutes">' +
          optionsHtml(choicesFor(TIME_CHOICES, settings.minutes), settings.minutes, function (v) { return v + " minutes"; }) +
        '</select></div>' +
        '<div><label class="field" for="e-marks">Marks per correct answer</label><select id="e-marks">' +
          optionsHtml(MARK_CHOICES, settings.marks, function (v) { return "+" + v; }) +
        '</select></div>' +
        '<div><label class="field" for="e-penalty">Penalty per wrong answer</label><select id="e-penalty">' +
          optionsHtml(PENALTY_CHOICES, settings.penalty, function (v) { return v === 0 ? "No penalty" : "\u2212" + trimNumber(v); }) +
        '</select></div>' +
      '</div>' +
      '<h3>Quick presets</h3>' +
      '<div class="preset-row" id="presets">' +
        PRESETS.map(function (p) {
          return '<button class="ghost" type="button" data-preset="' + p.id + '" title="' + esc(p.note) + '">' + esc(p.name) + '</button>';
        }).join("") +
        '<button class="ghost" type="button" id="reset-settings">\u21BA Reset</button>' +
      '</div>' +
      '<div class="plan">' +
        '<div class="chips" id="plan-chips"></div>' +
        '<p class="muted small" id="plan-note"></p>' +
      '</div>' +
      '<h3>Sections in this paper</h3><p class="muted small" id="sec-preview"></p>' +
      '<div class="toolbar"><button class="primary" id="begin" type="button">\u25B6 Begin exam</button>' +
      '<span class="kbd-hint spacer">Keys <kbd>A</kbd>\u2013<kbd>D</kbd> answer \u00B7 <kbd>\u2190</kbd> <kbd>\u2192</kbd> move \u00B7 the paper submits itself when time runs out</span></div>' +
    '</section>'));

    var FIELD_IDS = { questions: "e-questions", minutes: "e-minutes", marks: "e-marks", penalty: "e-penalty" };
    function labelFor(id) {
      if (id === "e-questions") return function (v) { return v + " questions"; };
      if (id === "e-minutes") return function (v) { return v + " minutes"; };
      if (id === "e-marks") return function (v) { return "+" + v; };
      return function (v) { return v === 0 ? "No penalty" : "\u2212" + trimNumber(v); };
    }
    function readSettings() {
      var out = {};
      Object.keys(FIELD_IDS).forEach(function (key) {
        out[key] = Number(document.getElementById(FIELD_IDS[key]).value);
      });
      return out;
    }
    function currentTargetValue() {
      return targetById(document.getElementById("e-target").value) || currentTarget();
    }
    /** How many questions the current target can actually supply at its levels. */
    function poolSize(target) {
      var levels = levelsForTarget(target);
      return targetSections(target).reduce(function (n, slug) {
        return n + questionsFor(slug).filter(function (q) { return levels.indexOf(q.level) !== -1; }).length;
      }, 0);
    }

    /** @param {boolean} persist only user edits are written to storage */
    function paint(persist) {
      var chosen = readSettings();
      state.draft = chosen;
      if (persist) saveExamSettings(chosen);
      var target = currentTargetValue();
      var available = poolSize(target);
      var usable = Math.max(1, Math.min(chosen.questions, available));
      document.getElementById("plan-chips").innerHTML =
        '<span class="chip">' + chosen.questions + ' questions</span>' +
        '<span class="chip">' + chosen.minutes + ' minutes</span>' +
        '<span class="chip">' + esc(markingText(chosen)) + '</span>' +
        '<span class="chip">Max score ' + trimNumber(chosen.questions * chosen.marks) + '</span>';
      var note = "Available for " + target.name + ": " + available.toLocaleString("en-IN") + " questions.";
      if (usable < chosen.questions) {
        note += " The paper will use " + usable.toLocaleString("en-IN") + " of them \u2014 lower the count or pick another target to use the full length.";
      }
      if ((chosen.minutes * 60) / usable < 15) note += " That is under 15 seconds per question.";
      document.getElementById("plan-note").textContent = note;
      var tooThin = available < 5;
      if (tooThin) {
        document.getElementById("plan-note").textContent =
          "Only " + available + " question" + (available === 1 ? "" : "s") + " for " + target.name +
          " \u2014 there is not enough for a paper. Pick another target.";
      }
      var begin = document.getElementById("begin");
      begin.textContent = tooThin ? "\u25B6 Not enough questions" : "\u25B6 Begin " + usable + " question exam";
      begin.disabled = tooThin;
      var sections = targetSections(target);
      document.getElementById("sec-preview").textContent = target.sections
        ? sections.map(sectionLabel).join(" \u00B7 ")
        : "Balanced paper across all " + sections.length + " categories";
      var active = PRESETS.filter(function (p) {
        return p.settings.questions === chosen.questions && p.settings.minutes === chosen.minutes &&
          p.settings.marks === chosen.marks && p.settings.penalty === chosen.penalty;
      })[0];
      document.querySelectorAll("#presets [data-preset]").forEach(function (b) {
        b.classList.toggle("is-active", !!active && b.getAttribute("data-preset") === active.id);
      });
    }

    Object.keys(FIELD_IDS).forEach(function (key) {
      document.getElementById(FIELD_IDS[key]).addEventListener("change", function () { paint(true); });
    });
    document.getElementById("e-target").addEventListener("change", function (e) {
      state.target = e.target.value;
      storeSet(TARGET_KEY, state.target);
      paint(true);
    });
    document.querySelectorAll("#presets [data-preset]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var preset = PRESETS.filter(function (p) { return p.id === btn.getAttribute("data-preset"); })[0];
        if (!preset) return;
        Object.keys(FIELD_IDS).forEach(function (key) {
          var select = document.getElementById(FIELD_IDS[key]);
          /* keep any custom value already in the list so preset taps never lose it */
          var values = choicesFor(Array.prototype.map.call(select.options, function (o) { return Number(o.value); }), preset.settings[key]);
          select.innerHTML = optionsHtml(values, preset.settings[key], labelFor(select.id));
        });
        paint(true);
      });
    });
    document.getElementById("reset-settings").addEventListener("click", function () {
      Object.keys(FIELD_IDS).forEach(function (key) {
        document.getElementById(FIELD_IDS[key]).value = DEFAULT_SETTINGS[key];
      });
      paint(true);
    });
    paint(false);
    document.getElementById("begin").addEventListener("click", beginExam);
  }

  function beginExam() {
    var target = currentTarget();
    var sections = targetSections(target);
    var levels = levelsForTarget(target);
    var settings = state.draft || examSettings();
    var wanted = settings.questions;
    var perSection = Math.floor(wanted / sections.length);
    var extra = wanted - perSection * sections.length;
    var questions = [];
    sections.forEach(function (slug, i) {
      questions = questions.concat(pickQuestions([slug], perSection + (i < extra ? 1 : 0), levels));
    });
    /* Top up from the combined pool so thin sections never shrink the paper. */
    if (questions.length < wanted) {
      var spare = [];
      sections.forEach(function (slug) {
        questionsFor(slug).forEach(function (q) {
          if (questions.indexOf(q) === -1 && levels.indexOf(q.level) !== -1) spare.push(q);
        });
      });
      questions = questions.concat(shuffle(spare).slice(0, wanted - questions.length));
    }
    if (questions.length < 5) { alert("Not enough questions for this target yet. Try another target."); return; }
    state.mode = "exam";
    state.session = {
      target: target, name: target.name, questions: questions, index: 0,
      answers: new Array(questions.length).fill(null),
      settings: {
        questions: wanted, minutes: settings.minutes,
        marks: settings.marks, penalty: settings.penalty
      },
      start: Date.now(), left: Math.max(1, settings.minutes) * 60,
      warnAt: Math.min(300, Math.max(30, Math.round(settings.minutes * 60 * 0.25)))
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
      if (box) box.classList.toggle("low", s.left <= (s.warnAt || 300));
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
        '<div class="timer' + (s.left <= (s.warnAt || 300) ? " low" : "") + '" id="timer">' +
          '<span class="timer-label">Time left</span> <span id="clock">' + formatTime(s.left) + '</span>' +
        '</div>' +
      '</div>' +
      '<h1 class="sr-only">' + esc(s.name) + ' exam, question ' + (s.index + 1) + ' of ' + s.questions.length + '</h1>' +
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
      '<p class="muted small">' + esc(q.topic || "") + ' \u00B7 level ' + q.level + ' \u00B7 ' + esc(markingText(s.settings || DEFAULT_SETTINGS)) + ' \u00B7 explanations unlock after you submit</p>' +
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
    var limits = s.settings || DEFAULT_SETTINGS;
    var correct = 0, wrong = 0, skipped = 0;
    s.questions.forEach(function (q, i) {
      if (s.answers[i] == null) skipped++;
      else if (s.answers[i] === q.answer) correct++;
      else wrong++;
    });
    var score = correct * limits.marks - wrong * limits.penalty;
    var maxScore = s.questions.length * limits.marks;
    var result = {
      at: new Date().toISOString(), mode: "exam", exam: s.target.name, target: s.target.id,
      total: s.questions.length, correct: correct, wrong: wrong, skipped: skipped,
      score: round2(score), max: round2(maxScore), marks: limits.marks, penalty: limits.penalty,
      minutes: limits.minutes,
      seconds: Math.round((Date.now() - s.start) / 1000)
    };
    saveAttempt(result);
    state.mode = "result";
    var pct = maxScore ? Math.round((Math.max(0, score) / maxScore) * 100) : 0;
    var accuracy = correct + wrong ? Math.round((correct / (correct + wrong)) * 100) : 0;
    var verdict = pct >= 70 ? "\uD83C\uDF89 Strong paper. Keep this pace."
      : pct >= 40 ? "\uD83D\uDC4D Decent attempt. Read the explanations you missed."
      : "\uD83D\uDCA1 Every wrong answer here is a fact learned \u2014 review and retry.";
    app.innerHTML = "";
    app.appendChild(el('<section class="card center result-hero">' +
      '<h1>Exam submitted</h1>' +
      scoreRing(pct, trimNumber(result.score), "of " + trimNumber(maxScore)) +
      '<p class="muted">' + esc(result.exam) + ' \u00B7 ' + s.questions.length + ' questions \u00B7 ' + esc(markingText(limits)) +
        ' \u00B7 time used ' + formatTime(result.seconds) + ' of ' + formatTime(limits.minutes * 60) + '</p>' +
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
    var limits = s.settings || DEFAULT_SETTINGS;
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
        '<p class="muted">' + esc(s.name) + ' \u00B7 ' + s.questions.length + ' questions \u00B7 ' + esc(markingText(limits)) + ' \u2014 every explanation is unlocked here.</p>' +
      '</div>' +
      '<span class="badge good">' + correct + ' correct</span> <span class="badge bad">' + wrong + ' wrong</span> <span class="badge warn">' + skipped + ' skipped</span>' +
      '</div>' +
      '<div class="filter-bar">' +
        '<span class="chips" id="review-filters">' +
          '<button class="secondary" data-filter="all" type="button">All ' + s.questions.length + '</button>' +
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
    /** Percentage of the maximum, so papers of different lengths stay comparable. */
    function percentOf(a) {
      if (a.mode === "exam" && a.max) return Math.round((Math.max(0, a.score) / a.max) * 100);
      if (a.total) return Math.round(((a.correct || 0) / a.total) * 100);
      return 0;
    }
    var avg = attempts.length
      ? Math.round(attempts.reduce(function (n, a) { return n + percentOf(a); }, 0) / attempts.length)
      : 0;
    var best = attempts.length ? attempts.reduce(function (m, a) { return Math.max(m, percentOf(a)); }, 0) : 0;
    var exams = attempts.filter(function (a) { return a.mode === "exam"; }).length;
    var drills = attempts.length - exams;
    app.innerHTML = "";
    app.appendChild(el('<section class="card">' +
      '<div class="card-head"><div>' +
        '<h1>Your progress</h1>' +
        '<p class="muted">Attempts are stored in this browser only \u2014 nothing is uploaded anywhere.</p>' +
      '</div><span class="badge plain">Average ' + avg + '%</span></div>' +
      '<div class="stat-grid">' +
        '<div class="stat"><b>' + attempts.length + '</b><span>Attempts</span></div>' +
        '<div class="stat"><b>' + exams + '</b><span>Exams</span></div>' +
        '<div class="stat"><b>' + drills + '</b><span>Drills</span></div>' +
        '<div class="stat good"><b>' + best + '%</b><span>Best</span></div>' +
      '</div>' +
      (attempts.length ? '<h3>Recent attempts</h3><div class="table-scroll"><table><thead><tr><th>When</th><th>Mode</th><th>Paper</th><th>Plan</th><th>Correct</th><th>Wrong</th><th>Skipped</th><th>Score</th><th></th></tr></thead><tbody>' +
        attempts.map(function (a, i) {
          var plan = a.mode === "exam" && a.marks != null
            ? a.total + " Q \u00B7 " + (a.minutes || DEFAULT_SETTINGS.minutes) + " min \u00B7 +" + trimNumber(a.marks) + " / " + (a.penalty ? "\u2212" + trimNumber(a.penalty) : "0")
            : a.total + " Q drill";
          return '<tr><td>' + new Date(a.at).toLocaleString() + '</td><td>' + a.mode + '</td><td>' +
            esc(a.exam || a.category || "") + '</td><td>' + plan + '</td><td>' + a.correct + '</td><td>' + (a.wrong || 0) + '</td><td>' +
            (a.skipped || 0) + '</td><td>' + (a.score != null ? trimNumber(a.score) + (a.max != null ? " / " + trimNumber(a.max) : "") : a.correct + "/" + a.total) +
            '</td><td>' + percentOf(a) + '%</td></tr>';
        }).join("") + '</tbody></table></div>' +
        '<div class="toolbar"><button class="secondary" id="clear-progress" type="button">Clear history</button>' +
        '<span class="filter-note spacer">Clearing only affects this browser.</span></div>'
        : '<p class="empty">No attempts yet. Set up a paper \u2014 the default is 40 questions in 40 minutes.</p>') +
    '</section>'));
    var clear = document.getElementById("clear-progress");
    if (clear) clear.addEventListener("click", function () {
      if (!confirm("Delete every saved attempt in this browser?")) return;
      saveProgress({ attempts: [] });
      viewProgress();
    });
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
    if (parts[0] === "daily") { setNav("daily"); viewDaily(); return; }
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
