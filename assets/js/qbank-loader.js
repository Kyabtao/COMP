"use strict";
/**
 * Fast, future-proof question bank loader for ExamSathi.
 *
 * 1. Boots the UI immediately from the lightweight manifest (`tools/categories/index.js`,
 *    which carries category counts, per-level counts and the latest 100-question daily
 *    set) so Home, Daily Challenge, Practice Index, Exam Setup and Progress render in
 *    < 50ms regardless of how many tens or hundreds of thousands of questions exist.
 * 2. Provides `QBANK_LOADER.ensure(slugs, callback)` to load any requested category
 *    (or a single 1,000-question shard of a multi-part category) on demand when starting
 *    a practice drill or exam.
 * 3. Gently prefetches remaining category files during browser idle time (max 2 at a
 *    time) so subsequent navigation is instantaneous.
 * 4. Uses plain `<script>` injection so the site also works from `file://`.
 */
(function () {
  var manifest = window.QBANK_MANIFEST || [];
  var files = [];
  var bySlug = {};
  var fileState = {}; // src -> "loading" | "loaded" | "error"
  var fileWaiters = {}; // src -> [fn]

  manifest.forEach(function (entry) {
    if (entry.parts && entry.partDir) {
      var partFiles = [];
      for (var p = 1; p <= entry.parts; p++) {
        var partPath = entry.partDir + "/part-" + (p < 10 ? "0" + p : p) + ".js";
        files.push(partPath);
        partFiles.push(partPath);
      }
      bySlug[entry.slug] = { entry: entry, files: partFiles, multiPart: true };
    } else if (entry.file) {
      var singlePath = "tools/categories/" + entry.file + ".js";
      files.push(singlePath);
      bySlug[entry.slug] = { entry: entry, files: [singlePath], multiPart: false };
    }
  });

  var bar = document.getElementById("load-bar");
  var status = document.getElementById("load-status");
  var booted = false;

  function store() {
    return (window.QBANK_CATEGORIES = window.QBANK_CATEGORIES || {});
  }

  /** True when `slug` (or at least one shard of a multi-part category) is in memory. */
  function isSlugLoaded(slug) {
    var s = store();
    if (s[slug] && Array.isArray(s[slug].questions) && s[slug].questions.length > 0) return true;
    var prefix = slug + ":part-";
    var keys = Object.keys(s);
    for (var i = 0; i < keys.length; i++) {
      if (keys[i].indexOf(prefix) === 0 && s[keys[i]] && Array.isArray(s[keys[i]].questions)) {
        return true;
      }
    }
    return false;
  }

  /** Load a single script file once, coalescing concurrent callers. */
  function loadFile(src, done) {
    if (fileState[src] === "loaded") {
      if (done) done(null);
      return;
    }
    if (fileState[src] === "error") {
      if (done) done(new Error("Failed to load " + src));
      return;
    }
    if (done) {
      fileWaiters[src] = fileWaiters[src] || [];
      fileWaiters[src].push(done);
    }
    if (fileState[src] === "loading") return;

    fileState[src] = "loading";
    var s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = function () {
      fileState[src] = "loaded";
      var list = (fileWaiters[src] || []).slice();
      fileWaiters[src] = [];
      for (var i = 0; i < list.length; i++) list[i](null);
      window.dispatchEvent(new Event("qbank-progress"));
    };
    s.onerror = function () {
      fileState[src] = "error";
      var err = new Error("Could not load " + src);
      var list = (fileWaiters[src] || []).slice();
      fileWaiters[src] = [];
      for (var i = 0; i < list.length; i++) list[i](err);
      if (status) status.textContent = "Could not load " + src + " — check that tools/categories exists.";
      window.dispatchEvent(new Event("qbank-error"));
    };
    document.head.appendChild(s);
  }

  /**
   * Ensure all requested category `slugs` are loaded before running `callback`.
   * If already in memory, invokes `callback` synchronously (0ms).
   * For multi-part categories (e.g. 17-part `gk-misc` or future large categories),
   * loads a single 1,000-question shard by default so drills and exams start fast.
   */
  function ensure(slugs, callback, options) {
    var opts = options || {};
    var neededFiles = [];
    (slugs || []).forEach(function (slug) {
      if (!opts.allParts && isSlugLoaded(slug)) return;
      var info = bySlug[slug];
      if (!info || !info.files.length) return;
      if (info.multiPart && !opts.allParts) {
        // Pick one deterministic or random shard (1,000 questions) so we never block on all parts
        var pickIdx = Math.floor(Math.random() * info.files.length);
        var chosen = info.files[pickIdx];
        if (neededFiles.indexOf(chosen) === -1) neededFiles.push(chosen);
      } else {
        info.files.forEach(function (f) {
          if (fileState[f] !== "loaded" && neededFiles.indexOf(f) === -1) neededFiles.push(f);
        });
      }
    });

    if (!neededFiles.length) {
      if (callback) callback(null);
      return;
    }

    var remaining = neededFiles.length;
    var firstErr = null;
    neededFiles.forEach(function (src) {
      loadFile(src, function (err) {
        if (err && !firstErr) firstErr = err;
        remaining--;
        if (remaining === 0 && callback) callback(firstErr);
      });
    });
  }

  /**
   * Polite background prefetch queue: after the initial UI renders from the
   * manifest, warms up category files 2 at a time during idle frames.
   * Multi-part categories only prefetch their first shard (`part-01.js`) in the
   * background so bandwidth stays low no matter how large the bank grows.
   */
  function startBackgroundPrefetch() {
    var priorityOrder = [
      "reasoning", "quantitative-aptitude", "mathematics", "english",
      "general-awareness", "computer-awareness", "general-science",
      "current-affairs", "indian-polity", "indian-history", "geography",
      "economics", "static-gk", "general-knowledge"
    ];
    var queue = [];
    var seen = {};

    function enqueueSlug(slug) {
      if (seen[slug] || isSlugLoaded(slug)) return;
      seen[slug] = true;
      var info = bySlug[slug];
      if (!info || !info.files.length) return;
      // Only prefetch the first shard of multi-part categories in the background
      var targetFile = info.files[0];
      if (fileState[targetFile] !== "loaded") queue.push(targetFile);
    }

    priorityOrder.forEach(enqueueSlug);
    manifest.forEach(function (entry) { enqueueSlug(entry.slug); });

    var active = 0;
    var concurrency = 2;
    var cursor = 0;

    function scheduleNext() {
      while (active < concurrency && cursor < queue.length) {
        var nextSrc = queue[cursor++];
        if (fileState[nextSrc] === "loaded" || fileState[nextSrc] === "loading") continue;
        active++;
        loadFile(nextSrc, function () {
          active--;
          if (typeof window.requestIdleCallback === "function") {
            window.requestIdleCallback(scheduleNext, { timeout: 300 });
          } else {
            setTimeout(scheduleNext, 30);
          }
        });
      }
    }

    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(scheduleNext, { timeout: 200 });
    } else {
      setTimeout(scheduleNext, 40);
    }
  }

  function finish() {
    if (booted) return;
    booted = true;
    if (bar) bar.style.width = "100%";
    if (status) status.textContent = "Question bank ready.";
    window.dispatchEvent(new Event("qbank-ready"));
    startBackgroundPrefetch();
  }

  function start() {
    // Boot immediately from the manifest + daily index in tools/categories/index.js
    finish();
  }

  /**
   * Load a specific date's daily paper (`tools/daily/YYYY-MM-DD.js`) on demand.
   * If already in memory (in `QBANK_DAILY_SETS` or `QBANK_DAILY_INDEX`), invokes
   * `callback` synchronously (0ms).
   */
  function ensureDailyDate(dateStr, callback) {
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      if (callback) callback(new Error("Invalid date " + dateStr));
      return;
    }
    var sets = (window.QBANK_DAILY_SETS = window.QBANK_DAILY_SETS || {});
    if (sets[dateStr] && Array.isArray(sets[dateStr].questions)) {
      if (callback) callback(null);
      return;
    }
    var dailyIdx = window.QBANK_DAILY_INDEX;
    if (dailyIdx && dailyIdx.date === dateStr && Array.isArray(dailyIdx.questions) && dailyIdx.questions.length) {
      if (callback) callback(null);
      return;
    }
    loadFile("tools/daily/" + dateStr + ".js", callback);
  }

  window.QBANK_LOADER = {
    files: files.slice(),
    start: start,
    ensure: ensure,
    ensureDailyDate: ensureDailyDate,
    loadFile: loadFile,
    isSlugLoaded: isSlugLoaded
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
