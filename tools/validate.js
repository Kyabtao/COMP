#!/usr/bin/env node
"use strict";
/**
 * Validates the generated bank and prints a deliverable checklist.
 * Exit code is non zero when a hard check fails; soft spec misses are reported.
 */
const fs = require("fs");
const path = require("path");
const { CATEGORIES, CLASSES, EXAMS, EXAM_RULES } = require("./spec");
const manifest = require("./categories/index.js");

const checks = [];
const ok = (name, pass, detail) => { checks.push({ name, pass, detail }); };

const categories = manifest.map((m) => {
  const file = path.join(__dirname, "categories", m.file + ".js");
  const data = require(file);
  return { meta: m, data };
});

let total = 0;
const allIds = new Set();
const allQuestions = new Set();
let badShape = [];
let dupOptions = 0;
let answerOutOfRange = 0;

for (const { meta, data } of categories) {
  total += data.questions.length;
  for (const q of data.questions) {
    if (!q.q || !Array.isArray(q.o) || q.o.length !== 4) badShape.push(q.id);
    if (typeof q.a !== "number" || q.a < 0 || q.a > 3) answerOutOfRange++;
    if (new Set(q.o.map(String)).size !== 4) dupOptions++;
    if (allIds.has(q.id)) badShape.push("duplicate id " + q.id);
    allIds.add(q.id);
    allQuestions.add(String(q.q).toLowerCase().replace(/\s+/g, " ").trim());
  }
}

/* hard checks */
const gk = categories.find((c) => c.meta.slug === "gk-misc");
const gkParts = fs.readdirSync(path.join(__dirname, "categories", "gk-misc")).filter((f) => /^part-\d+\.js$/.test(f));
const partCounts = gkParts.map((f) => require(path.join(__dirname, "categories", "gk-misc", f)).questions.length);

ok("26 category files present", categories.length === 26, categories.length + " categories");
ok("GK Misc shipped as 17 part files", gkParts.length === 17, gkParts.length + " part files");
ok("every question has 4 options and text", badShape.length === 0, badShape.slice(0, 5).join(", ") || "clean");
ok("no duplicate option inside a question", dupOptions === 0, dupOptions + " questions affected");
ok("answer index always points to a real option", answerOutOfRange === 0, answerOutOfRange + " questions affected");
ok("question ids are unique", allIds.size === total, allIds.size + " unique ids for " + total + " questions");
ok("class selection covers 1-12 and Graduation", CLASSES.length === 13 && CLASSES[12] === "Graduation", CLASSES.join(", "));
ok("four exam tracks configured", EXAMS.length === 4, EXAMS.map((e) => e.name).join(", "));
ok("every exam is 40 questions", EXAM_RULES.questionCount === 40, "questionCount = " + EXAM_RULES.questionCount);

/* soft checks against the original deliverable list */
const oneK = categories.filter((c) => c.data.questions.length >= 1000).map((c) => c.meta.slug);
ok("[spec] total questions reach 25,000", total >= 25000, total + " questions built");
ok("[spec] GK Misc reaches 17,000", gk.data.questions.length >= 17000, gk.data.questions.length + " questions");
ok("[spec] nine categories hold 1,000+", oneK.length >= 9, oneK.length + " categories: " + oneK.join(", "));

const report = {
  totalQuestions: total,
  categoriesAt1000Plus: oneK,
  perCategory: categories.map((c) => ({ slug: c.meta.slug, name: c.meta.name, count: c.data.questions.length, target: CATEGORIES.find((x) => x.slug === c.meta.slug).target })),
  gkMiscParts: partCounts,
  checks
};
fs.writeFileSync(path.join(__dirname, "..", "qbank-report.json"), JSON.stringify(report, null, 2));

console.log("Question bank validation\n=========================");
for (const c of checks) console.log((c.pass ? "  PASS  " : "  MISS  ") + c.name + "  [" + c.detail + "]");
console.log("\nPer category:");
for (const row of report.perCategory) {
  const pad = row.slug === "gk-misc" ? "" : "";
  console.log("  " + pad + row.slug.padEnd(26) + String(row.count).padStart(6) + "  (target " + row.target + ")");
}
console.log("\nTotal questions: " + total);
const missed = checks.filter((c) => !c.pass && c.name.startsWith("[spec]"));
console.log("Spec items not met: " + (missed.length ? missed.length : 0));
process.exitCode = checks.filter((c) => !c.pass && !c.name.startsWith("[spec]")).length ? 1 : 0;
