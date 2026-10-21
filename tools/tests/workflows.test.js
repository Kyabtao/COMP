"use strict";
/**
 * The workflow files are authored in temp/ and installed into
 * .github/workflows/ by tools/install-workflows.js, because the token that
 * builds the working branches cannot write under .github/workflows/.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const INSTALL = path.join(__dirname, "..", "install-workflows.js");
const ROOT = path.join(__dirname, "..", "..");

/** A throwaway copy of the repo layout the installer works on. */
function scratch() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "workflows-"));
  fs.mkdirSync(path.join(dir, "temp"), { recursive: true });
  fs.mkdirSync(path.join(dir, ".github", "workflows"), { recursive: true });
  fs.copyFileSync(path.join(ROOT, "temp", "ci.yml"), path.join(dir, "temp", "ci.yml"));
  fs.copyFileSync(path.join(ROOT, "temp", "daily-questions.yml"), path.join(dir, "temp", "daily-questions.yml"));
  fs.writeFileSync(path.join(dir, ".github", "workflows", "ci.yml"), "stale\n");
  fs.writeFileSync(path.join(dir, ".github", "workflows", "daily-question.yml"), "stale\n");
  return dir;
}

function install(dir, extra) {
  try {
    return execFileSync("node", [INSTALL, "--root", dir, ...(extra || [])], { encoding: "utf8", stdio: "pipe" });
  } catch (err) {
    /* the check mode exits non-zero when a workflow is out of date */
    return err.stdout || "";
  }
}

test("the installer copies the tracked copies into .github/workflows", () => {
  const dir = scratch();
  try {
    const out = install(dir);
    assert.match(out, /write \.github\/workflows\/ci\.yml/);
    assert.match(out, /write \.github\/workflows\/daily-question\.yml/);
    assert.equal(
      fs.readFileSync(path.join(dir, ".github", "workflows", "ci.yml"), "utf8"),
      fs.readFileSync(path.join(ROOT, "temp", "ci.yml"), "utf8")
    );
    assert.equal(
      fs.readFileSync(path.join(dir, ".github", "workflows", "daily-question.yml"), "utf8"),
      fs.readFileSync(path.join(ROOT, "temp", "daily-questions.yml"), "utf8")
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("the check mode reports what is out of date and writes nothing", () => {
  const dir = scratch();
  try {
    const out = install(dir, ["--check"]);
    assert.match(out, /stale \.github\/workflows\/ci\.yml/);
    assert.match(out, /stale \.github\/workflows\/daily-question\.yml/);
    assert.equal(fs.readFileSync(path.join(dir, ".github", "workflows", "ci.yml"), "utf8"), "stale\n");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("a workflow that is already installed is left alone", () => {
  const dir = scratch();
  try {
    install(dir);
    const out = install(dir);
    assert.match(out, /ok {4}\.github\/workflows\/ci\.yml — already up to date/);
    assert.match(out, /ok {4}\.github\/workflows\/daily-question\.yml — already up to date/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("every workflow file in .github/workflows has a tracked copy in temp/", () => {
  const live = fs.readdirSync(path.join(ROOT, ".github", "workflows"));
  const tracked = fs.readdirSync(path.join(ROOT, "temp"));
  assert.ok(live.length > 0, "there are live workflows");
  for (const file of live) {
    const name = file.replace(/^daily-question\.yml$/, "daily-questions.yml");
    assert.ok(tracked.includes(name), "temp/ holds a copy of " + file);
  }
});
