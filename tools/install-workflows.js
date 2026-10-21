#!/usr/bin/env node
"use strict";
/**
 * Installs the workflow files kept in temp/ into .github/workflows/.
 *
 * The workflow files are authored in temp/ because the token that builds the
 * working branches cannot create or update files under .github/workflows/:
 * GitHub refuses with "refusing to allow a GitHub App to create or update
 * workflow ... without workflows permission", and GitHub only runs workflows
 * from .github/workflows/. This script copies the tracked copies into place
 * so a maintainer with the right permission can commit and push them in one
 * go, without editing the same file twice.
 *
 *   node tools/install-workflows.js           # copy temp/*.yml into .github/workflows/
 *   node tools/install-workflows.js --check   # only report what is out of date
 *   node tools/install-workflows.js --root X  # work in another checkout
 */
const fs = require("fs");
const path = require("path");

/** The repository root to work in. */
function rootFrom(argv) {
  const at = argv.indexOf("--root");
  if (at === -1) return path.join(__dirname, "..");
  const value = argv[at + 1];
  if (!value || value.startsWith("--")) {
    console.error("--root needs the path of a checkout, e.g. --root ..");
    process.exit(1);
  }
  return path.resolve(value);
}

const ROOT = rootFrom(process.argv);
const CHECK_ONLY = process.argv.includes("--check");

/** The tracked copy and where it belongs once it is installed. */
const FILES = [
  { from: "temp/ci.yml", to: ".github/workflows/ci.yml" },
  { from: "temp/daily-questions.yml", to: ".github/workflows/daily-question.yml" }
];

function read(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
}

function main() {
  const changed = [];
  for (const entry of FILES) {
    const source = path.join(ROOT, entry.from);
    const target = path.join(ROOT, entry.to);
    const wanted = read(source);
    if (wanted === null) {
      console.log("skip  " + entry.from + " — not found");
      continue;
    }
    const installed = read(target);
    if (installed === wanted) {
      console.log("ok    " + entry.to + " — already up to date");
      continue;
    }
    if (CHECK_ONLY) {
      console.log("stale " + entry.to + " — differs from " + entry.from);
      changed.push(entry);
      continue;
    }
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, wanted);
    console.log("write " + entry.to + " — installed from " + entry.from);
    changed.push(entry);
  }
  if (CHECK_ONLY && changed.length) {
    console.log("\n" + changed.length + " workflow file(s) out of date — run: node tools/install-workflows.js");
    return 1;
  }
  if (!CHECK_ONLY && changed.length) {
    console.log("\nCommit and push the installed files from a machine (or token) that has the workflows permission.");
  }
  return 0;
}

if (require.main === module) {
  process.exitCode = main();
}

module.exports = { FILES, main };
