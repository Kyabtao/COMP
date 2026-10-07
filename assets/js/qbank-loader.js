"use strict";
/**
 * Loads every generated category file listed in tools/categories/index.js.
 * Files are plain <script> injections so the site also works from file://.
 */
(function () {
  var manifest = window.QBANK_MANIFEST || [];
  var files = [];

  manifest.forEach(function (entry) {
    if (entry.parts && entry.partDir) {
      for (var p = 1; p <= entry.parts; p++) {
        files.push(entry.partDir + "/part-" + (p < 10 ? "0" + p : p) + ".js");
      }
    } else if (entry.file) {
      files.push("tools/categories/" + entry.file + ".js");
    }
  });

  var bar = document.getElementById("load-bar");
  var status = document.getElementById("load-status");
  var total = files.length;
  var settled = 0;
  var failed = false;

  function tick() {
    settled++;
    if (bar) bar.style.width = Math.round((settled / total) * 100) + "%";
    if (status && !failed) {
      status.textContent = "Loaded " + settled + " of " + total + " category files…";
    }
    if (settled === total) finish();
  }

  function finish() {
    if (failed) return;
    if (bar) bar.style.width = "100%";
    if (status) status.textContent = "Question bank ready.";
    window.dispatchEvent(new Event("qbank-ready"));
  }

  /**
   * Every file registers itself into window.QBANK_CATEGORIES under its own slug,
   * so the order of injection does not matter and they can all be requested at
   * once. Browsers still queue them a few at a time per host, which is far
   * faster than waiting for each file in turn.
   */
  function start() {
    files.forEach(function (src) {
      var s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = tick;
      s.onerror = function () {
        failed = true;
        tick();
        if (status) status.textContent = "Could not load " + src + " — check that tools/categories exists.";
        window.dispatchEvent(new Event("qbank-error"));
      };
      document.head.appendChild(s);
    });
    if (!files.length) finish();
  }

  window.QBANK_LOADER = { files: files.slice(), start: start };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
