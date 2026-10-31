#!/usr/bin/env node
"use strict";
/**
 * News & competition question updater CLI: updates the question bank with
 * fresh real-world questions (default: 100 per day) from news feeds and
 * competitive exam sources — without generating random numerical arithmetic
 * or repeating questions already in the bank.
 *
 *   node tools/news.js                         # today (UTC), 100 questions + build
 *   node tools/news.js --date 2026-10-22       # specific date, 100 questions
 *   node tools/news.js --count 100             # number of questions (1 to 500)
 *   node tools/news.js --source gktoday        # pull from a named source or URL
 *   node tools/news.js --url https://...       # pull from a custom RSS/Atom/JSON URL
 *   node tools/news.js --file feed.xml         # import from a local XML/JSON feed
 *   node tools/news.js --offline               # use verified built-in pool only
 *   node tools/news.js --append                # top up an existing day file to --count
 *   node tools/news.js --force                 # regenerate even if the day exists
 *   node tools/news.js --no-build              # write day file without rebuilding bank
 *   node tools/news.js --dry-run               # preview questions without writing
 *   node tools/news.js --list-sources          # list configured news & competition sites
 */
const fs = require("fs");
const path = require("path");
const { Rand, options: buildOptions, txt } = require("./qcore");
const { tableQuestions } = require("./forms");
const { spec } = require("./tables");
const { CATEGORIES } = require("./spec");
const { assertQuestion, questionErrors } = require("./question-schema");
const { CURATED_NEWS_MCQS, NEWS_GROUPS } = require("./data/news-competition");
const { SUBJECT_GROUPS, SUBJECT_TABLE_SPECS } = require("./data/subject-competition");

const DAILY_DIR = process.env.DAILY_DIR || path.join(__dirname, "daily");
const DEFAULT_COUNT = 100;
const MAX_COUNT = 500;
const VALID_SLUGS = new Set(CATEGORIES.map((c) => c.slug).filter((s) => s !== "gk-misc"));

/**
 * Balanced 25-category wheel covering Science, Mathematics, Quantitative
 * Aptitude, Logical Reasoning, English & Grammar, Social Studies, Computer
 * Awareness, Static GK, Current Affairs and Competitive Exam subjects.
 * A 100-question daily run completes 4 full turns (4 questions per category).
 */
const SUBJECT_WHEEL = [
  "general-science",
  "mathematics",
  "english",
  "quantitative-aptitude",
  "reasoning",
  "physics",
  "chemistry",
  "biology",
  "general-english-grammar",
  "current-affairs",
  "indian-polity",
  "indian-history",
  "geography",
  "economics",
  "computer-awareness",
  "environmental-studies",
  "inventions-discoveries",
  "general-knowledge",
  "general-awareness",
  "static-gk",
  "sports",
  "awards-honours",
  "books-authors",
  "days-events",
  "abbreviations"
];

/**
 * Configured real-world news feeds and multi-subject competitive exam portals.
 */
const NEWS_SOURCES = [
  {
    id: "pib",
    name: "Press Information Bureau (Govt of India)",
    kind: "news",
    category: "current-affairs",
    url: "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3",
    format: "rss"
  },
  {
    id: "the-hindu",
    name: "The Hindu — National & Current Affairs",
    kind: "news",
    category: "current-affairs",
    url: "https://www.thehindu.com/news/national/feeder/default.rss",
    format: "rss"
  },
  {
    id: "the-hindu-scitech",
    name: "The Hindu — Science & Technology",
    kind: "news",
    category: "general-science",
    url: "https://www.thehindu.com/sci-tech/science/feeder/default.rss",
    format: "rss"
  },
  {
    id: "the-hindu-economy",
    name: "The Hindu — Economy & Banking",
    kind: "news",
    category: "economics",
    url: "https://www.thehindu.com/business/Economy/feeder/default.rss",
    format: "rss"
  },
  {
    id: "the-hindu-sport",
    name: "The Hindu — Sports",
    kind: "news",
    category: "sports",
    url: "https://www.thehindu.com/sport/feeder/default.rss",
    format: "rss"
  },
  {
    id: "indian-express",
    name: "The Indian Express — India & Explained",
    kind: "news",
    category: "current-affairs",
    url: "https://indianexpress.com/section/india/feed/",
    format: "rss"
  },
  {
    id: "gktoday",
    name: "GKToday — Current Affairs & Competitive Exams",
    kind: "competition",
    category: "current-affairs",
    url: "https://www.gktoday.in/feed/",
    format: "rss"
  },
  {
    id: "affairscloud",
    name: "AffairsCloud — Banking, SSC & Railways Current Affairs",
    kind: "competition",
    category: "current-affairs",
    url: "https://affairscloud.com/feed/",
    format: "rss"
  },
  {
    id: "jagran-josh",
    name: "Jagran Josh — Current Affairs & Competition Prep",
    kind: "competition",
    category: "general-awareness",
    url: "https://www.jagranjosh.com/rss/josh/current_affairs.xml",
    format: "rss"
  },
  {
    id: "opentdb",
    name: "Open Trivia Database — Competitive General Knowledge",
    kind: "competition",
    category: "general-knowledge",
    url: "https://opentdb.com/api.php?amount=25&category=9&type=multiple",
    format: "opentdb"
  },
  {
    id: "opentdb-science",
    name: "Open Trivia Database — Science & Nature (Physics, Chemistry, Biology)",
    kind: "competition",
    category: "general-science",
    url: "https://opentdb.com/api.php?amount=25&category=17&type=multiple",
    format: "opentdb"
  },
  {
    id: "opentdb-math",
    name: "Open Trivia Database — Competitive Mathematics",
    kind: "competition",
    category: "mathematics",
    url: "https://opentdb.com/api.php?amount=20&category=19&type=multiple",
    format: "opentdb"
  },
  {
    id: "opentdb-computers",
    name: "Open Trivia Database — Computer Science & IT",
    kind: "competition",
    category: "computer-awareness",
    url: "https://opentdb.com/api.php?amount=15&category=18&type=multiple",
    format: "opentdb"
  },
  {
    id: "opentdb-gadgets",
    name: "Open Trivia Database — Science Gadgets & Inventions",
    kind: "competition",
    category: "inventions-discoveries",
    url: "https://opentdb.com/api.php?amount=15&category=30&type=multiple",
    format: "opentdb"
  },
  {
    id: "opentdb-geography",
    name: "Open Trivia Database — World & Physical Geography",
    kind: "competition",
    category: "geography",
    url: "https://opentdb.com/api.php?amount=15&category=22&type=multiple",
    format: "opentdb"
  },
  {
    id: "opentdb-history",
    name: "Open Trivia Database — World & Indian History",
    kind: "competition",
    category: "indian-history",
    url: "https://opentdb.com/api.php?amount=15&category=23&type=multiple",
    format: "opentdb"
  },
  {
    id: "opentdb-books",
    name: "Open Trivia Database — Books, Literature & Authors",
    kind: "competition",
    category: "books-authors",
    url: "https://opentdb.com/api.php?amount=15&category=10&type=multiple",
    format: "opentdb"
  },
  {
    id: "opentdb-sports",
    name: "Open Trivia Database — Competitive Sports",
    kind: "competition",
    category: "sports",
    url: "https://opentdb.com/api.php?amount=15&category=21&type=multiple",
    format: "opentdb"
  }
];

const norm = (s) => String(s == null ? "" : s).toLowerCase().replace(/\s+/g, " ").trim();
const stemOf = (question) => norm(question);
const keyOf = (question, options) =>
  norm(question) + "|" + norm((options || []).slice().sort().join("~"));

/** FNV-1a hash: stable uint32 seed from any string. */
function seedFor(text) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Decode HTML entities and strip markup tags from RSS/Atom/JSON strings. */
function cleanHtml(input) {
  if (input == null) return "";
  return String(input)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;|&apos;|&rsquo;|&lsquo;/gi, "'")
    .replace(/&ldquo;|&rdquo;/gi, '"')
    .replace(/&ndash;|&mdash;/gi, "–")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\s+/g, " ")
    .trim();
}

/** Infer the best ExamSathi category slug from source metadata and text keywords. */
function inferCategory(text, hintCategory) {
  const lower = norm(text) + " " + norm(hintCategory);
  if (/\b(ohm|snell|lenz|faraday|joule|archimedes|pascal|doppler|refraction|diffraction|lens|mirror|focal length|electric current|magnetic flux|voltage|resistor|capacitor|transformer|thermodynamics|si unit|velocity|acceleration|gravitation|escape velocity|newton|wavelength|frequency|hertz|dioptre)\b/.test(lower)) {
    return "physics";
  }
  if (/\b(periodic table|atomic number|valency|isotope|isobar|acid|alkali|ph scale|catalyst|polymer|alloy|metallurgy|oxidation|reduction|electrolysis|covalent|ionic bond|molar|alkane|alkene|benzene|chemical name|chemical formula|sodium|potassium|calcium|sulphuric|hydrochloric)\b/.test(lower)) {
    return "chemistry";
  }
  if (/\b(mitochondria|ribosome|lysosome|chloroplast|photosynthesis|mitosis|meiosis|chromosome|dna|rna|enzyme|hormone|vitamin|vaccine|virus|bacteria|pathogen|nephron|neuron|haemoglobin|blood group|xylem|phloem|botany|zoology|anatomy|physiology|genetics|crispr)\b/.test(lower)) {
    return "biology";
  }
  if (/\b(trigonometry|hypotenuse|sine|cosine|tangent|quadratic|polynomial|logarithm|matrix|determinant|calculus|derivative|integral|equilateral|isosceles|polygon|hexagon|octagon|circumradius|inradius|mensuration|cone|sphere|cylinder|coordinate geometry|centroid|probability|median|variance)\b/.test(lower)) {
    return "mathematics";
  }
  if (/\b(compound interest|simple interest|profit and loss|marked price|selling price|cost price|successive discount|alligation|cistern|upstream|downstream|train crosses|divisibility|hcf|lcm|mean proportional|work together in)\b/.test(lower)) {
    return "quantitative-aptitude";
  }
  if (/\b(syllogism|blood relation|coding-decoding|mirror image|odd days|leap year|clock hand|painted cube|standard die|direction sense|verbal analogy|logical reasoning|seating arrangement|contrapositive)\b/.test(lower)) {
    return "reasoning";
  }
  if (/\b(preposition|conjunction|subjunctive|gerund|participle|passive voice|active voice|indirect speech|question tag|superlative|comparative degree|plural of|feminine of|subject-verb agreement|grammar)\b/.test(lower)) {
    return "general-english-grammar";
  }
  if (/\b(synonym|antonym|idiom|one-word substitute|one word substitute|figure of speech|vocabulary|metaphor|oxymoron|hyperbole|spelt correctly)\b/.test(lower)) {
    return "english";
  }
  if (/\b(rbi|repo rate|gdp|inflation|fiscal|budget|gst|sebi|bank|nabard|msme|export|import|rupee|monetary|tax)\b/.test(lower)) {
    return "economics";
  }
  if (/\b(olympic|paralympic|cricket|chess|badminton|football|hockey|tennis|trophy|cup|medal|world cup|asian games|athlete|fifa|icc|bcci)\b/.test(lower)) {
    return "sports";
  }
  if (/\b(nobel|bharat ratna|padma|booker|oscar|award|prize|honour|khel ratna|dadasaheb|laureate|sahitya akademi)\b/.test(lower)) {
    return "awards-honours";
  }
  if (/\b(invented by|inventor of|discovered by|who is credited with|pioneering discovery)\b/.test(lower)) {
    return "inventions-discoveries";
  }
  if (/\b(isro|nasa|satellite|rocket|pslv|gslv|lvm3|space|lunar|moon|mars|solar|quantum|astronomy|planet)\b/.test(lower)) {
    return "general-science";
  }
  if (/\b(ramsar|wetland|tiger reserve|national park|climate|cop28|cop29|cop30|biodiversity|emission|forest|wildlife|pollution|biosphere)\b/.test(lower)) {
    return "environmental-studies";
  }
  if (/\b(constitution|supreme court|parliament|lok sabha|rajya sabha|amendment|article \d|bill|act|election commission|governor)\b/.test(lower)) {
    return "indian-polity";
  }
  if (/\b(author|novel|book|autobiography|memoir|wrote|published by)\b/.test(lower)) {
    return "books-authors";
  }
  if (/\b(day is observed|anniversary|divas|world .* day|national .* day|international .* day)\b/.test(lower)) {
    return "days-events";
  }
  if (/\b(full form of|acronym|abbreviation|stands for)\b/.test(lower)) {
    return "abbreviations";
  }
  if (/\b(cyber|software|ai\b|artificial intelligence|supercomputer|protocol|encryption|database|network|operating system|cpu|ram|rom|compiler|binary)\b/.test(lower)) {
    return "computer-awareness";
  }
  if (/\b(tunnel|bridge|port|river|mountain|pass|glacier|state|island|strait|highway|corridor|latitude|longitude|continent)\b/.test(lower)) {
    return "geography";
  }
  if (/\b(dynasty|inscription|empire|satyagraha|archaeological|harappan|chola|mughal|freedom fighter|viceroy|revolt of)\b/.test(lower)) {
    return "indian-history";
  }
  if (/\b(exercise|missile|submarine|frigate|aircraft|drdo|navy|air force|army|defence)\b/.test(lower)) {
    return "general-awareness";
  }
  if (hintCategory && VALID_SLUGS.has(hintCategory)) return hintCategory;
  return "current-affairs";
}

/**
 * Parse embedded MCQ blocks inside competition site text/HTML or RSS descriptions.
 * Matches patterns like:
 *   Q. Which ... ?
 *   (A) Opt1 (B) Opt2 (C) Opt3 (D) Opt4
 *   Answer: B / Explanation: ...
 */
function parseEmbeddedMcqs(rawText, defaultCategory, sourceName) {
  const out = [];
  const text = String(rawText || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h\d)>/gi, "\n")
    .replace(/<[^>]+>/g, " ");
  const blockRe = /(?:^|\n)\s*(?:Q(?:\d+)?[\.\)\:]|\d+[\.\)])\s*([^\n\?]+\?)[\s\S]*?(?:\(?[A1][\.\)]\s*([^\n\(]+))\s*(?:\(?[B2][\.\)]\s*([^\n\(]+))\s*(?:\(?[C3][\.\)]\s*([^\n\(]+))\s*(?:\(?[D4][\.\)]\s*([^\n\(]+))\s*(?:Answer|Ans|Correct(?:\s+Answer)?)[\s\:\-]*([A-D1-4])(?:[\s\S]*?(?:Explanation|Solution|Note)[\s\:\-]*([^\n]+))?/gi;
  let m;
  while ((m = blockRe.exec(text)) !== null) {
    const question = cleanHtml(m[1]);
    const opts = [cleanHtml(m[2]), cleanHtml(m[3]), cleanHtml(m[4]), cleanHtml(m[5])];
    const ansChar = m[6].toUpperCase();
    const answer = "ABCD".includes(ansChar) ? "ABCD".indexOf(ansChar) : Number(ansChar) - 1;
    const explanation = cleanHtml(m[7]) || (opts[answer] + " is the correct answer (" + (sourceName || "Competition source") + ").");
    const category = inferCategory(question + " " + explanation, defaultCategory);
    const candidate = {
      category,
      question,
      options: opts,
      answer,
      explanation,
      topic: sourceName || "Competition Update",
      level: 2
    };
    if (questionErrors(candidate).length === 0) out.push(candidate);
  }
  return out;
}

/**
 * Extract RSS <item> or Atom <entry> articles and convert them into real-world
 * Current Affairs / Competition MCQs.
 */
function parseXmlFeed(xmlText, options) {
  const opts = options || {};
  const defaultCategory = opts.category || "current-affairs";
  const sourceName = opts.sourceName || "News Feed";
  const rand = new Rand(seedFor("xml:" + sourceName + ":" + (opts.dateStr || "")));
  const out = [];

  const itemBlocks = [];
  const itemRe = /<(?:item|entry)\b[^>]*>([\s\S]*?)<\/(?:item|entry)>/gi;
  let match;
  while ((match = itemRe.exec(xmlText)) !== null) {
    itemBlocks.push(match[1]);
  }

  const tagValue = (block, tag) => {
    const re = new RegExp("<" + tag + "(?:\\s[^>]*)?>([\\s\\S]*?)<\\/" + tag + ">", "i");
    const m = re.exec(block);
    return m ? m[1] : "";
  };

  const articles = [];
  for (const block of itemBlocks) {
    const rawTitle = tagValue(block, "title");
    const rawDesc = tagValue(block, "content:encoded") || tagValue(block, "description") || tagValue(block, "summary") || tagValue(block, "content");
    const rawCat = tagValue(block, "category");
    const rawDate = tagValue(block, "pubDate") || tagValue(block, "published") || tagValue(block, "updated");

    // 1. Check if the item contains embedded competition MCQs
    const embedded = parseEmbeddedMcqs(rawDesc || rawTitle, defaultCategory, sourceName);
    if (embedded.length) {
      out.push(...embedded);
      continue;
    }

    const title = cleanHtml(rawTitle).replace(/\s+[-|]\s+(The Hindu|Indian Express|PIB|GKToday|Jagran Josh).*$/i, "").trim();
    const summary = cleanHtml(rawDesc);
    const catHint = cleanHtml(rawCat);
    const pubDate = cleanHtml(rawDate);

    if (title && title.length >= 18 && title.length <= 180) {
      articles.push({ title, summary, catHint, pubDate });
    }
  }

  // 2. Convert news articles into factual Current Affairs MCQs using fellow headlines as distractors
  const headlinePool = articles.map((a) => a.title);
  for (const art of articles) {
    if (!art.summary || art.summary.length < 25) continue;
    const shortSummary = art.summary.length > 220
      ? art.summary.slice(0, 217).replace(/\s+\S*$/, "") + "..."
      : art.summary;
    if (shortSummary.toLowerCase().includes(art.title.toLowerCase().slice(0, 25))) {
      // Avoid giving away the exact headline inside the question stem
    }
    const built = buildOptions(rand, art.title, headlinePool, 4);
    if (!built) continue;
    const stem = 'Which current affairs development was reported regarding: "' + shortSummary + '"?';
    const explanation = art.title + " — " + shortSummary + (art.pubDate ? " (" + sourceName + ", " + art.pubDate + ")." : " (" + sourceName + ").");
    const candidate = {
      category: "current-affairs",
      question: stem,
      options: built.opts,
      answer: built.ans,
      explanation,
      topic: sourceName + " Current Affairs",
      level: 2
    };
    if (questionErrors(candidate).length === 0) out.push(candidate);
  }

  return out;
}

/**
 * Parse JSON feeds: supports ExamSathi question arrays, generic competition
 * JSON objects, and Open Trivia DB ({ results: [...] }) responses.
 */
function parseJsonFeed(data, options) {
  const opts = options || {};
  const defaultCategory = opts.category || "current-affairs";
  const sourceName = opts.sourceName || "Competition Feed";
  const rand = new Rand(seedFor("json:" + sourceName + ":" + (opts.dateStr || "")));
  const parsed = typeof data === "string" ? JSON.parse(data) : data;
  const list = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed && parsed.questions)
      ? parsed.questions
      : Array.isArray(parsed && parsed.results)
        ? parsed.results
        : Array.isArray(parsed && parsed.items)
          ? parsed.items
          : [];

  const out = [];
  for (const item of list) {
    if (!item || typeof item !== "object") continue;

    // OpenTDB format: { question, correct_answer, incorrect_answers, category, difficulty }
    if (item.correct_answer && Array.isArray(item.incorrect_answers)) {
      const qText = cleanHtml(item.question);
      const correct = cleanHtml(item.correct_answer);
      const wrongs = item.incorrect_answers.map(cleanHtml);
      const built = buildOptions(rand, correct, wrongs, 4);
      if (!built) continue;
      const level = item.difficulty === "easy" ? 1 : item.difficulty === "hard" ? 3 : 2;
      const cat = inferCategory(qText + " " + (item.category || ""), defaultCategory);
      const candidate = {
        category: cat,
        question: qText,
        options: built.opts,
        answer: built.ans,
        explanation: cleanHtml(item.explanation) || (correct + " is the correct answer for: " + qText + " (" + cleanHtml(item.category || sourceName) + ")."),
        topic: cleanHtml(item.topic || item.category || sourceName),
        level
      };
      if (questionErrors(candidate).length === 0) out.push(candidate);
      continue;
    }

    // Direct or competition MCQ format
    const qText = cleanHtml(item.question || item.q || item.stem);
    const rawOpts = item.options || item.opts || item.choices;
    let ans = item.answer !== undefined ? item.answer : item.ans !== undefined ? item.ans : item.correctIndex;
    if (typeof ans === "string" && Array.isArray(rawOpts)) {
      const idx = rawOpts.findIndex((o) => cleanHtml(o).toLowerCase() === cleanHtml(ans).toLowerCase());
      if (idx !== -1) ans = idx;
      else if ("ABCD".includes(ans.toUpperCase())) ans = "ABCD".indexOf(ans.toUpperCase());
    }
    if (Array.isArray(rawOpts) && rawOpts.length === 4 && Number.isInteger(ans) && ans >= 0 && ans <= 3) {
      const cleanedOpts = rawOpts.map(cleanHtml);
      const exp = cleanHtml(item.explanation || item.e || item.solution || (cleanedOpts[ans] + " is the correct answer."));
      const cat = inferCategory(qText + " " + exp, item.category || defaultCategory);
      const level = [1, 2, 3].includes(Number(item.level)) ? Number(item.level) : 2;
      const candidate = {
        category: cat,
        question: qText,
        options: cleanedOpts,
        answer: ans,
        explanation: exp,
        topic: cleanHtml(item.topic || sourceName || "Current Affairs"),
        level
      };
      if (questionErrors(candidate).length === 0) out.push(candidate);
    }
  }
  return out;
}

/**
 * Parse any feed content (JSON, RSS 2.0 XML, Atom XML, or plain text with MCQs).
 */
function parseFeedContent(content, options) {
  const text = String(content == null ? "" : content).trim();
  if (!text) return [];
  if (text.startsWith("{") || text.startsWith("[")) {
    try {
      return parseJsonFeed(text, options);
    } catch (_) {
      // Fall through to XML/text parsers if JSON is malformed
    }
  }
  if (/<(?:rss|feed|item|entry)\b/i.test(text)) {
    return parseXmlFeed(text, options);
  }
  return parseEmbeddedMcqs(text, options && options.category, options && options.sourceName);
}

/**
 * Build the complete deterministic stream of real-world news & multi-subject
 * competitive exam questions from tools/data/news-competition.js and
 * tools/data/subject-competition.js for a given date seed.
 */
function buildPoolFromNewsData(dateStr, includeTableFallback) {
  const rand = new Rand(seedFor("examsathi:news-pool:" + dateStr));
  const pool = [];

  // 1. Curated news & competition MCQs (shuffle options deterministically so answer positions vary)
  const curatedStream = [];
  const curatedOrder = rand.shuffle(CURATED_NEWS_MCQS.slice());
  for (const item of curatedOrder) {
    const correctText = txt(item.options[item.answer]);
    const shuffledOpts = rand.shuffle(item.options.map(txt));
    const answer = shuffledOpts.indexOf(correctText);
    if (answer === -1) continue;
    curatedStream.push(assertQuestion({
      category: item.category,
      question: txt(item.question),
      options: shuffledOpts,
      answer,
      explanation: txt(item.explanation),
      topic: item.topic || "Current Affairs & News",
      level: item.level || 2
    }, "Curated news question"));
  }

  // 2. Structured real-world news & multi-subject competition groups (interleaved across groups and forms)
  const groupStreams = [curatedStream];
  const allGroups = NEWS_GROUPS.concat(SUBJECT_GROUPS);
  allGroups.forEach((group, gi) => {
    const gRand = new Rand(seedFor("examsathi:news-group:" + dateStr + ":" + gi));
    const rows = group.rows;
    const groupItems = [];
    const forms = group.forms.slice();
    // Add a reverse-lookup competition form when rows have distinct subjects in col 0 and descriptions in col 1
    if (rows.length >= 6 && rows[0].length >= 3) {
      forms.push({
        q: 'In the context of ' + group.topic + ', which of the following corresponds to: "{1}"?',
        a: 0,
        exp: "{0} — {1} ({2})."
      });
    }
    forms.forEach((form, fi) => {
      const candidates = rows.map((r) => txt(r[form.a]));
      const rowOrder = gRand.shuffle(rows.map((_, idx) => idx));
      rowOrder.forEach((ri) => {
        const row = rows[ri];
        const qText = form.q.replace(/\{(\d+)\}/g, (_, col) => txt(row[Number(col)]));
        const answerText = txt(row[form.a]);
        const built = buildOptions(gRand, answerText, candidates, 4);
        if (!built) return;
        const expText = form.exp.replace(/\{(\d+)\}/g, (_, col) => txt(row[Number(col)]));
        const cat = fi % 2 === 1 && group.secondaryCategory && VALID_SLUGS.has(group.secondaryCategory)
          ? group.secondaryCategory
          : group.category;
        groupItems.push(assertQuestion({
          category: cat,
          question: qText,
          options: built.opts,
          answer: built.ans,
          explanation: expText,
          topic: group.topic,
          level: group.level || 2
        }, "News group " + group.topic));
      });
    });
    groupStreams.push(groupItems);
  });

  // 3. Verified subject-table competitive exam transforms across Science, Math, English & General Studies
  if (includeTableFallback !== false) {
    SUBJECT_TABLE_SPECS.forEach((subSpec, si) => {
      if (!VALID_SLUGS.has(subSpec.category)) return;
      const sRand = new Rand(seedFor("examsathi:subject-spec:" + dateStr + ":" + si));
      const rows = (subSpec.rows || []).filter((r) => Array.isArray(r) && r.length >= 2 && txt(r[0]) && txt(r[1]));
      if (rows.length < 4) return;
      const specItems = [];
      (subSpec.forms || []).forEach((form) => {
        const candidates = rows.map((r) => txt(r[form.a])).filter(Boolean);
        const rowOrder = sRand.shuffle(rows.map((_, idx) => idx));
        rowOrder.forEach((ri) => {
          const row = rows[ri];
          const qText = form.q.replace(/\{(\d+)\}/g, (_, col) => txt(row[Number(col)]));
          const answerText = txt(row[form.a]);
          if (!qText || !answerText) return;
          const built = buildOptions(sRand, answerText, candidates, 4);
          if (!built) return;
          const expText = (form.exp || "{0} — {1}.").replace(/\{(\d+)\}/g, (_, col) => txt(row[Number(col)]));
          const item = {
            category: subSpec.category,
            question: qText,
            options: built.opts,
            answer: built.ans,
            explanation: expText,
            topic: subSpec.topic,
            level: subSpec.level || 2
          };
          if (questionErrors(item).length === 0) specItems.push(item);
        });
      });
      if (specItems.length) groupStreams.push(specItems);
    });
  }

  // Shuffle group order by dateStr and round-robin so every date and batch has a distinct, balanced category mix
  const shuffledStreams = rand.shuffle(groupStreams);
  const maxLen = shuffledStreams.reduce((m, s) => Math.max(m, s.length), 0);
  for (let i = 0; i < maxLen; i++) {
    for (const stream of shuffledStreams) {
      if (i < stream.length) pool.push(stream[i]);
    }
  }

  if (includeTableFallback === false) return pool;

  // 4. Also pull any un-published real-world fact-table questions (never numeric, never matched-pair stems)
  const nonNumericSpecs = rand.shuffle(spec.slice());
  for (let si = 0; si < nonNumericSpecs.length; si++) {
    const entry = nonNumericSpecs[si];
    const targetCat = (entry.categories || []).find((c) => VALID_SLUGS.has(c));
    if (!targetCat) continue;
    const gen = tableQuestions(entry, new Rand(seedFor("examsathi:news-table:" + dateStr + ":" + si)));
    let guard = 0;
    while (guard++ < 300) {
      const r = gen.next();
      if (r.done) break;
      const q = r.value;
      if (/^which of the following pairs/i.test(q.q)) continue;
      pool.push(assertQuestion({
        category: targetCat,
        question: q.q,
        options: q.opts,
        answer: q.ans,
        explanation: q.e,
        topic: q.topic,
        level: q.level || 2
      }, "Table fallback for " + targetCat));
    }
  }

  return pool;
}

/**
 * Read every published question key AND normalized question stem from the
 * built bank and stored daily files so no question is ever repeated.
 */
function publishedBankState(dir) {
  const keys = new Set();
  const stems = new Set();
  const manifestFile = path.join(__dirname, "categories", "index.js");
  let complete = true;

  if (fs.existsSync(manifestFile)) {
    try {
      const manifest = require(manifestFile);
      for (const entry of manifest) {
        const file = path.join(__dirname, "categories", entry.file + ".js");
        try {
          const data = require(file);
          for (const q of data.questions || []) {
            keys.add(keyOf(q.question, q.options));
            stems.add(stemOf(q.question));
          }
        } catch (_) {
          complete = false;
        }
      }
    } catch (_) {
      complete = false;
    }
  }

  const target = dir || DAILY_DIR;
  if (fs.existsSync(target)) {
    const files = fs.readdirSync(target).filter((f) => /^\d{4}-\d{2}-\d{2}\.js$/.test(f)).sort();
    for (const f of files) {
      try {
        const day = require(path.join(target, f));
        for (const q of day.questions || []) {
          keys.add(keyOf(q.question, q.options));
          stems.add(stemOf(q.question));
        }
      } catch (_) {}
    }
  }

  return { keys, stems, complete };
}

/**
 * Generate `count` (default 100) fresh real-world questions across all 25
 * subjects (Science, Math, English, Reasoning, Polity, History, Geography,
 * Economics, Computer Awareness, Static GK, Current Affairs, etc.) for
 * `dateStr`. Never uses random numerical streams and never repeats any
 * question stem or question+options already in `bankKeys` / `bankStems`.
 */
function generateNewsQuestions(dateStr, count, existingKeysOrState, extraCandidates) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr) || isNaN(new Date(dateStr + "T00:00:00Z").getTime())) {
    throw new Error('date must look like 2026-10-22, got "' + dateStr + '"');
  }
  const n = count === undefined ? DEFAULT_COUNT : Number(count);
  if (!Number.isInteger(n) || n < 1 || n > MAX_COUNT) {
    throw new Error("count must be a whole number from 1 to " + MAX_COUNT + ", got " + count);
  }

  const seenKeys = new Set();
  const seenStems = new Set();

  if (existingKeysOrState instanceof Set) {
    for (const entry of existingKeysOrState) {
      seenKeys.add(entry);
      const pipeIdx = String(entry).indexOf("|");
      if (pipeIdx !== -1) seenStems.add(String(entry).slice(0, pipeIdx));
      else seenStems.add(norm(entry));
    }
  } else if (existingKeysOrState && typeof existingKeysOrState === "object") {
    for (const k of existingKeysOrState.keys || []) seenKeys.add(k);
    for (const s of existingKeysOrState.stems || []) seenStems.add(s);
  }

  const isFresh = (question, options) => {
    const stem = stemOf(question);
    const key = keyOf(question, options);
    if (!stem || seenStems.has(stem) || seenKeys.has(key)) return false;
    seenStems.add(stem);
    seenKeys.add(key);
    return true;
  };

  // Build per-category queues so every daily run is balanced across Science, Math, English and all other subjects
  const byCategory = new Map();
  const cursorByCategory = new Map();
  for (const slug of SUBJECT_WHEEL) {
    byCategory.set(slug, []);
    cursorByCategory.set(slug, 0);
  }

  const enqueue = (q) => {
    if (!q || !VALID_SLUGS.has(q.category)) return;
    if (questionErrors(q).length !== 0) return;
    if (!byCategory.has(q.category)) {
      byCategory.set(q.category, []);
      cursorByCategory.set(q.category, 0);
    }
    byCategory.get(q.category).push({
      category: q.category,
      question: q.question,
      options: q.options,
      answer: q.answer,
      explanation: q.explanation,
      topic: q.topic || "Competitive Exam Update",
      level: q.level || 2
    });
  };

  for (const q of extraCandidates || []) enqueue(q);
  for (const q of buildPoolFromNewsData(dateStr, true)) enqueue(q);

  const pullNextFromSlug = (slug) => {
    const list = byCategory.get(slug) || [];
    let idx = cursorByCategory.get(slug) || 0;
    while (idx < list.length) {
      const candidate = list[idx++];
      if (isFresh(candidate.question, candidate.options)) {
        cursorByCategory.set(slug, idx);
        return candidate;
      }
    }
    cursorByCategory.set(slug, idx);
    return null;
  };

  // Ensure categories with explicit imported candidates are visited even when count < 25
  const wheel = SUBJECT_WHEEL.slice();
  if (extraCandidates && extraCandidates.length && n < wheel.length) {
    const importedSlugs = [];
    for (const q of extraCandidates) {
      if (q && VALID_SLUGS.has(q.category) && !importedSlugs.includes(q.category)) {
        importedSlugs.push(q.category);
      }
    }
    for (const impSlug of importedSlugs) {
      const pos = wheel.indexOf(impSlug);
      if (pos >= n) {
        wheel.splice(pos, 1);
        wheel.unshift(impSlug);
      }
    }
  }

  const fresh = [];
  let wheelCursor = 0;
  let guard = 0;
  while (fresh.length < n && guard++ < n * wheel.length * 2) {
    const targetSlug = wheel[wheelCursor % wheel.length];
    wheelCursor++;
    const picked = pullNextFromSlug(targetSlug);
    if (picked) {
      fresh.push(picked);
      continue;
    }
    // If the target category queue is exhausted, pull from the next category on the wheel that has fresh items
    for (let offset = 0; offset < wheel.length; offset++) {
      const fallbackSlug = wheel[(wheelCursor + offset) % wheel.length];
      const fallbackPicked = pullNextFromSlug(fallbackSlug);
      if (fallbackPicked) {
        fresh.push(fallbackPicked);
        break;
      }
    }
  }

  if (fresh.length < n) {
    throw new Error("could only find " + fresh.length + " unique real-world questions (wanted " + n + ")");
  }

  return { date: dateStr, questions: fresh };
}

/**
 * Fetch live news/competition feeds over HTTP(S) with a fast timeout.
 * Gracefully returns whatever succeeded so offline/sandboxed runs never fail.
 */
async function fetchLiveQuestions(options) {
  const opts = options || {};
  if (opts.offline || process.env.NEWS_OFFLINE === "1") return { questions: [], fetchedSources: [] };

  const targets = [];
  if (opts.urls && opts.urls.length) {
    opts.urls.forEach((u, idx) => {
      targets.push({ id: "custom-" + (idx + 1), name: u, category: "current-affairs", url: u });
    });
  } else if (opts.sources && opts.sources.length) {
    for (const src of opts.sources) {
      const match = NEWS_SOURCES.find((s) => s.id === src || s.kind === src);
      if (match) targets.push(match);
      else if (/^https?:\/\//i.test(src)) {
        targets.push({ id: "custom", name: src, category: "current-affairs", url: src });
      } else {
        throw new Error('unknown news source "' + src + '" (try --list-sources)');
      }
    }
  } else {
    targets.push(...NEWS_SOURCES);
  }

  const timeoutMs = opts.timeoutMs || 2500;
  const results = await Promise.allSettled(
    targets.map(async (target) => {
      const res = await fetch(target.url, {
        signal: AbortSignal.timeout(timeoutMs),
        headers: {
          "User-Agent": "ExamSathi-QuestionBank-Updater/1.0",
          Accept: "application/rss+xml, application/xml, application/atom+xml, application/json, text/xml, */*"
        }
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const body = await res.text();
      const parsed = parseFeedContent(body, {
        category: target.category,
        sourceName: target.name,
        dateStr: opts.dateStr
      });
      return { source: target.id, name: target.name, questions: parsed };
    })
  );

  const questions = [];
  const fetchedSources = [];
  for (const r of results) {
    if (r.status === "fulfilled" && r.value.questions.length) {
      questions.push(...r.value.questions);
      fetchedSources.push({ id: r.value.source, name: r.value.name, count: r.value.questions.length });
    }
  }
  return { questions, fetchedSources };
}

function dailyFile(dateStr, dir) {
  return path.join(dir || DAILY_DIR, dateStr + ".js");
}

function saveNewsDaily(payload, dir) {
  const target = dir || DAILY_DIR;
  fs.mkdirSync(target, { recursive: true });
  const file = dailyFile(payload.date, target);
  const body = [
    '"use strict";',
    "/** Daily questions for " + payload.date + " — generated by tools/news.js. Do not edit by hand. */",
    "(function () {",
    "  var data = " + JSON.stringify(payload, null, 2) + ";",
    "  if (typeof module !== \"undefined\" && module.exports) module.exports = data;",
    "  if (typeof window !== \"undefined\") {",
    "    window.QBANK_DAILY_SETS = window.QBANK_DAILY_SETS || {};",
    "    window.QBANK_DAILY_SETS[data.date] = data;",
    "  }",
    "})();",
    ""
  ].join("\n");
  fs.writeFileSync(file, body);
  return file;
}

function todayUTC() {
  return new Date().toISOString().slice(0, 10);
}

function publishToBank() {
  const { execFileSync } = require("child_process");
  execFileSync(process.execPath, [path.join(__dirname, "build-qbank.js"), "--no-daily"], { stdio: "inherit" });
}

function parseArgs(argv) {
  const opts = {
    date: todayUTC(),
    count: DEFAULT_COUNT,
    sources: [],
    urls: [],
    files: [],
    offline: false,
    force: false,
    append: false,
    dryRun: false,
    build: true,
    listSources: false
  };
  const args = (argv || []).slice(2);
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--date" && args[i + 1]) opts.date = args[++i];
    else if ((a === "--count" || a === "--daily-count") && args[i + 1]) opts.count = Number(args[++i]);
    else if (a === "--source" && args[i + 1]) opts.sources.push(args[++i]);
    else if (a === "--url" && args[i + 1]) opts.urls.push(args[++i]);
    else if (a === "--file" && args[i + 1]) opts.files.push(args[++i]);
    else if (a === "--offline") opts.offline = true;
    else if (a === "--force") opts.force = true;
    else if (a === "--append") opts.append = true;
    else if (a === "--dry-run") opts.dryRun = true;
    else if (a === "--no-build") opts.build = false;
    else if (a === "--list-sources") opts.listSources = true;
    else if (a === "--help" || a === "-h") {
      usage();
      return null;
    } else {
      throw new Error("unknown argument " + a + " (try --help)");
    }
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(opts.date) || isNaN(new Date(opts.date + "T00:00:00Z").getTime())) {
    throw new Error('date must look like 2026-10-22, got "' + opts.date + '"');
  }
  if (!Number.isInteger(opts.count) || opts.count < 1 || opts.count > MAX_COUNT) {
    throw new Error("count must be a whole number from 1 to " + MAX_COUNT + ", got " + opts.count);
  }
  return opts;
}

function usage() {
  console.log("Usage: node tools/news.js [--date YYYY-MM-DD] [--count N] [--source ID|URL] [--url URL] [--file PATH] [--offline] [--append] [--force] [--dry-run] [--no-build] [--list-sources]");
  console.log("");
  console.log("  (no flag)        update today's set with 100 real-world news & competition questions and publish to the bank");
  console.log("  --date D         target date instead of today (UTC)");
  console.log("  --count N        number of questions to add (1 to " + MAX_COUNT + ", default " + DEFAULT_COUNT + ")");
  console.log("  --source S       pull from a named source (pib, the-hindu, indian-express, gktoday, affairscloud, jagran-josh, opentdb) or URL");
  console.log("  --url U          fetch questions/articles from a custom RSS, Atom or JSON URL");
  console.log("  --file F         import questions/articles from a local JSON, RSS or XML file");
  console.log("  --offline        use only the built-in verified news & competition pool");
  console.log("  --append         top up an existing day file with fresh questions up to --count");
  console.log("  --force          regenerate the day file even if it already exists");
  console.log("  --no-build       write tools/daily/YYYY-MM-DD.js without rebuilding the category files");
  console.log("  --dry-run        print the set without writing any files");
  console.log("  --list-sources   list configured news and competition site feeds");
}

/**
 * Ensure a day has its real-world news & competition questions stored.
 */
function ensureNewsDaily(dateStr, count, options) {
  const opts = options || {};
  const dir = opts.dir || DAILY_DIR;
  const file = dailyFile(dateStr, dir);
  if (fs.existsSync(file) && !opts.force) {
    const stored = require(file);
    return { date: dateStr, file, created: false, questions: stored.questions || [] };
  }
  const state = opts.state || publishedBankState(dir);
  const payload = generateNewsQuestions(dateStr, count === undefined ? DEFAULT_COUNT : count, state, opts.extraCandidates);
  saveNewsDaily(payload, dir);
  return { date: dateStr, file, created: true, questions: payload.questions };
}

async function main(argv) {
  const opts = parseArgs(argv);
  if (!opts) return;

  if (opts.listSources) {
    console.log("Configured news & competition sources:");
    for (const s of NEWS_SOURCES) {
      console.log("  " + s.id.padEnd(20) + " [" + s.kind.padEnd(11) + "] " + s.name + " (" + s.url + ")");
    }
    return;
  }

  const file = dailyFile(opts.date);
  let existingQuestions = [];
  if (fs.existsSync(file)) {
    if (!opts.force && !opts.append && !opts.dryRun) {
      console.log("Daily file already exists for " + opts.date + " (" + file + "). Use --append or --force to update it.");
      if (opts.build) {
        console.log("Publishing it in the question bank…");
        publishToBank();
      }
      return;
    }
    if (opts.append) {
      const existing = require(file);
      existingQuestions = Array.isArray(existing.questions) ? existing.questions : [];
      if (existingQuestions.length >= opts.count && !opts.force) {
        console.log("Daily file for " + opts.date + " already holds " + existingQuestions.length + " questions.");
        if (opts.build && !opts.dryRun) publishToBank();
        return;
      }
    }
  }

  console.log("Scanning the published bank to prevent repeated questions…");
  const state = publishedBankState();
  console.log("Bank holds " + state.keys.size.toLocaleString("en-IN") + " published questions (" +
    state.stems.size.toLocaleString("en-IN") + " unique question stems).");

  const importedCandidates = [];
  for (const filePath of opts.files) {
    const resolved = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(resolved)) throw new Error("file not found: " + filePath);
    const content = fs.readFileSync(resolved, "utf8");
    const parsed = parseFeedContent(content, { sourceName: path.basename(filePath), dateStr: opts.date });
    console.log("Imported " + parsed.length + " candidate question(s) from " + filePath + ".");
    importedCandidates.push(...parsed);
  }

  if (!opts.offline) {
    const live = await fetchLiveQuestions({
      sources: opts.sources,
      urls: opts.urls,
      dateStr: opts.date,
      offline: opts.offline
    });
    if (live.fetchedSources.length) {
      console.log("Fetched live items from: " + live.fetchedSources.map((s) => s.id + " (" + s.count + ")").join(", "));
      importedCandidates.push(...live.questions);
    } else {
      console.log("Live feeds unreachable or offline — drawing from verified news & competition pool.");
    }
  }

  const needed = Math.max(1, opts.count - existingQuestions.length);
  const generated = generateNewsQuestions(opts.date, needed, state, importedCandidates);
  const payload = {
    date: opts.date,
    questions: existingQuestions.concat(generated.questions)
  };

  if (opts.dryRun) {
    console.log("Dry run — " + payload.questions.length + " real-world news & competition questions for " + opts.date + ":");
    payload.questions.forEach((q, i) => {
      console.log("  " + (i + 1) + ". [" + q.category + " | " + q.topic + "] " + q.question);
    });
    return;
  }

  saveNewsDaily(payload);
  const mix = {};
  payload.questions.forEach((q) => { mix[q.category] = (mix[q.category] || 0) + 1; });
  console.log("Wrote " + payload.questions.length + " real-world news & competition questions for " + opts.date + " to " + file);
  console.log("Mix: " + Object.keys(mix).map((k) => k + " x" + mix[k]).join(", "));

  if (!opts.build) {
    console.log("Next: node tools/build-qbank.js && node tools/validate.js");
    return;
  }
  console.log("Publishing the " + payload.questions.length + " questions in the question bank…");
  publishToBank();
  console.log("The question bank now holds the " + payload.questions.length + " questions of " + opts.date + ".");
  console.log("Next: node tools/validate.js");
}

module.exports = {
  NEWS_SOURCES,
  SUBJECT_WHEEL,
  DEFAULT_COUNT,
  MAX_COUNT,
  norm,
  stemOf,
  keyOf,
  cleanHtml,
  inferCategory,
  parseEmbeddedMcqs,
  parseXmlFeed,
  parseJsonFeed,
  parseFeedContent,
  buildPoolFromNewsData,
  publishedBankState,
  generateNewsQuestions,
  fetchLiveQuestions,
  ensureNewsDaily,
  saveNewsDaily,
  dailyFile,
  parseArgs,
  todayUTC,
  publishToBank,
  main
};

if (require.main === module) {
  main(process.argv).catch((err) => {
    console.error("tools/news.js: " + err.message);
    process.exitCode = 1;
  });
}
