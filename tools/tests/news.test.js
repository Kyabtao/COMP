"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const news = require("../news");
const { questionErrors } = require("../question-schema");
const { CATEGORIES } = require("../spec");

const NEWS_CLI = path.join(__dirname, "..", "news.js");
const VALID_SLUGS = new Set(CATEGORIES.map((c) => c.slug).filter((s) => s !== "gk-misc"));

function tmpDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

test("news CLI defaults to 100 questions and parses all flags", () => {
  assert.equal(news.DEFAULT_COUNT, 100);
  const base = news.parseArgs(["node", "news.js"]);
  assert.equal(base.count, 100);
  assert.equal(base.build, true);
  assert.equal(base.offline, false);
  assert.match(base.date, /^\d{4}-\d{2}-\d{2}$/);

  const custom = news.parseArgs([
    "node", "news.js",
    "--date", "2026-11-10",
    "--count", "100",
    "--source", "gktoday",
    "--url", "https://example.com/feed.xml",
    "--file", "sample.json",
    "--offline",
    "--append",
    "--force",
    "--no-build",
    "--dry-run"
  ]);
  assert.equal(custom.date, "2026-11-10");
  assert.equal(custom.count, 100);
  assert.deepEqual(custom.sources, ["gktoday"]);
  assert.deepEqual(custom.urls, ["https://example.com/feed.xml"]);
  assert.deepEqual(custom.files, ["sample.json"]);
  assert.equal(custom.offline, true);
  assert.equal(custom.append, true);
  assert.equal(custom.force, true);
  assert.equal(custom.build, false);
  assert.equal(custom.dryRun, true);

  assert.throws(() => news.parseArgs(["node", "news.js", "--date", "bad-date"]), /date must look like/);
  assert.throws(() => news.parseArgs(["node", "news.js", "--count", "0"]), /count must be/);
  assert.throws(() => news.parseArgs(["node", "news.js", "--unknown"]), /unknown argument/);
});

test("generateNewsQuestions mints 100 real-world questions with no numeric arithmetic and no repeated stems", () => {
  const state = news.publishedBankState();
  const payload = news.generateNewsQuestions("2026-11-15", 100, state);
  assert.equal(payload.date, "2026-11-15");
  assert.equal(payload.questions.length, 100);

  const batchStems = new Set();
  for (const q of payload.questions) {
    assert.deepEqual(questionErrors(q), []);
    assert.ok(VALID_SLUGS.has(q.category), "published category: " + q.category);
    // Must not be random arithmetic or linear equations from numeric.js
    assert.doesNotMatch(q.question, /^What is \d+\s*[x+\-\/]\s*\d+\?$/i);
    assert.doesNotMatch(q.question, /^If \d+x\s*[+\-]\s*\d+\s*=\s*\d+/i);
    assert.doesNotMatch(q.question, /^Find the next number in the series:/i);

    const stem = news.stemOf(q.question);
    assert.ok(!batchStems.has(stem), "unique question stem within batch: " + q.question);
    batchStems.add(stem);
  }
});

test("parseFeedContent parses RSS news articles, embedded competition MCQs and OpenTDB JSON", () => {
  const rssArticles = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0"><channel>
      <item>
        <title>ISRO launches INSAT-3DS meteorological satellite aboard GSLV-F14</title>
        <description>The Indian Space Research Organisation launched the advanced weather satellite INSAT-3DS from Sriharikota to enhance cyclone and monsoon forecasting.</description>
        <pubDate>17 Feb 2024</pubDate>
      </item>
      <item>
        <title>Reserve Bank of India launches Project Nexus for instant cross-border retail payments</title>
        <description>RBI joined the Bank for International Settlements initiative to link UPI with fast payment systems of ASEAN nations.</description>
        <pubDate>01 Jul 2024</pubDate>
      </item>
      <item>
        <title>Moidams of Assam inscribed as India's 43rd UNESCO World Heritage Site</title>
        <description>The royal mound-burial system of the Ahom dynasty at Charaideo in Assam received UNESCO World Heritage recognition.</description>
        <pubDate>26 Jul 2024</pubDate>
      </item>
      <item>
        <title>India wins both Open and Women team gold medals at 45th FIDE Chess Olympiad</title>
        <description>Indian chess teams clinched historic double gold medals at the 45th FIDE Chess Olympiad held in Budapest, Hungary.</description>
        <pubDate>22 Sep 2024</pubDate>
      </item>
    </channel></rss>`;
  const fromRss = news.parseFeedContent(rssArticles, { sourceName: "PIB", dateStr: "2026-10-22" });
  assert.equal(fromRss.length, 4);
  for (const q of fromRss) {
    assert.deepEqual(questionErrors(q), []);
  }

  const embeddedCompetition = `
    Q1. Which city hosted the 45th FIDE Chess Olympiad in September 2024?
    (A) Budapest
    (B) Chennai
    (C) Baku
    (D) Astana
    Answer: A
    Explanation: Budapest, Hungary hosted the 45th FIDE Chess Olympiad where India won double gold.
  `;
  const fromEmbedded = news.parseFeedContent(embeddedCompetition, { sourceName: "GKToday" });
  assert.equal(fromEmbedded.length, 1);
  assert.equal(fromEmbedded[0].category, "sports");
  assert.equal(fromEmbedded[0].options[fromEmbedded[0].answer], "Budapest");

  const openTdb = JSON.stringify({
    response_code: 0,
    results: [
      {
        category: "Science &amp; Nature",
        type: "multiple",
        difficulty: "medium",
        question: "Which space agency developed the &quot;Europa Clipper&quot; spacecraft?",
        correct_answer: "NASA",
        incorrect_answers: ["CNSA", "Roscosmos", "KARI"]
      }
    ]
  });
  const fromJson = news.parseFeedContent(openTdb, { sourceName: "OpenTDB" });
  assert.equal(fromJson.length, 1);
  assert.equal(fromJson[0].question, 'Which space agency developed the "Europa Clipper" spacecraft?');
  assert.equal(fromJson[0].options[fromJson[0].answer], "NASA");
  assert.deepEqual(questionErrors(fromJson[0]), []);
});

test("news CLI imports from a local competition file, tops up with --append, and publishes to the bank", () => {
  const out = tmpDir("news-out-");
  const days = tmpDir("news-days-");
  const summary = path.join(out, "build-summary.json");
  const feedFile = path.join(days, "custom-competition.json");
  try {
    fs.writeFileSync(feedFile, JSON.stringify([
      {
        category: "current-affairs",
        question: "Which Indian naval vessel completed the historic Navika Sagar Parikrama II circumnavigation expedition?",
        options: ["INSV Tarini", "INS Vikrant", "INS Sumedha", "INS Tir"],
        answer: 0,
        explanation: "Indian Naval Sailing Vessel (INSV) Tarini undertook the Navika Sagar Parikrama II global circumnavigation expedition.",
        topic: "Defence Current Affairs",
        level: 2
      }
    ]));

    // 1. Mint 15 questions from custom file + built-in pool without building categories
    execFileSync("node", [
      NEWS_CLI,
      "--date", "2026-11-20",
      "--count", "15",
      "--file", feedFile,
      "--offline",
      "--no-build"
    ], {
      env: Object.assign({}, process.env, { QBANK_OUT: out, DAILY_DIR: days, QBANK_SUMMARY: summary }),
      stdio: "pipe"
    });

    const dayFile = path.join(days, "2026-11-20.js");
    assert.ok(fs.existsSync(dayFile));
    const firstRun = require(dayFile);
    assert.equal(firstRun.questions.length, 15);
    assert.ok(firstRun.questions.some((q) => q.question.includes("Navika Sagar Parikrama II")));

    // 2. Top up the same day from 15 to 25 questions with --append and publish to the bank
    delete require.cache[require.resolve(dayFile)];
    execFileSync("node", [
      NEWS_CLI,
      "--date", "2026-11-20",
      "--count", "25",
      "--append",
      "--offline"
    ], {
      env: Object.assign({}, process.env, { QBANK_OUT: out, DAILY_DIR: days, QBANK_SUMMARY: summary }),
      stdio: "pipe"
    });

    delete require.cache[require.resolve(dayFile)];
    const secondRun = require(dayFile);
    assert.equal(secondRun.questions.length, 25);

    const published = fs.readdirSync(out)
      .filter((f) => f.endsWith(".js") && f !== "index.js")
      .flatMap((f) => require(path.join(out, f)).questions || []);
    const added = published.filter((q) => q.source === "daily" && q.dailyDate === "2026-11-20");
    assert.equal(added.length, 25);
  } finally {
    fs.rmSync(out, { recursive: true, force: true });
    fs.rmSync(days, { recursive: true, force: true });
  }
});
