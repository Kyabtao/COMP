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
  var done = 0;

  function tick() {
    done++;
    if (bar) bar.style.width = Math.round((done / files.length) * 100) + "%";
    if (status) status.textContent = "Loaded " + done + " of " + files.length + " category files…";
  }

  function loadNext() {
    if (!files.length) {
      if (bar) bar.style.width = "100%";
      if (status) status.textContent = "Question bank ready.";
      window.dispatchEvent(new Event("qbank-ready"));
      return;
    }
    var src = files.shift();
    var s = document.createElement("script");
    s.src = src;
    s.async = false;
    s.onload = function () { tick(); loadNext(); };
    s.onerror = function () {
      if (status) status.textContent = "Could not load " + src + " — check that tools/categories exists.";
      window.dispatchEvent(new Event("qbank-error"));
    };
    document.head.appendChild(s);
  }

  window.QBANK_LOADER = { files: files.slice(), start: loadNext };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadNext);
  } else {
    loadNext();
  }
})();
