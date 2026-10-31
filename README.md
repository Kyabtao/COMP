<img src="assets/img/logo.svg" alt="ExamSathi logo" width="72" />

# ExamSathi — Competition Prep

Practice site for school and competitive exams, built around a generated question bank.

- **Single target list:** Classes 1 to 12, Graduation, SSC CGL, SSC CHSL, Banking (IBPS / SBI) and Railways (RRB NTPC / Group D) — classes and exams are merged into one list because they share the same paper pattern
- **Every paper:** you choose the questions, time and marking — the defaults are 40 questions in 40 minutes, +1 per correct answer, 0.25 negative marking
- **Question bank:** 33,957 questions in 26 categories (see below), growing by 100 fresh questions balanced across all 25 subjects (Science, Math, English, Current Affairs/News, History, Polity, Geography, Reasoning, etc.) per daily update
- **Instant load & Old Date Papers:** initial page load reads only the lightweight manifest (`tools/categories/index.js`), loading category files and old date papers (`#/daily/archive`, `#/daily/<date>/paper`) on demand so load times stay constant as the question bank grows
- **Merge-based version in footer:** the footer displays the application version based on how many git merges have been completed (`Version v<N>.0 (<N> merges done)`), synced at build time (`window.QBANK_META`) and live on GitHub Pages
- **No build step:** plain HTML, CSS and JavaScript, hosted straight from this repository

## Quick start

```bash
git clone https://github.com/Kyabtao/COMP.git
cd COMP
python3 -m http.server 8000     # then open http://localhost:8000
```

Opening `index.html` directly in a browser also works.

## Using the site

| Where | What it does |
| --- | --- |
| **Home** | Pick a target, search the 26 categories, see your saved paper settings, or jump straight into a paper or the Old Date Archive |
| **Practice** | A drill per category (5 to 30 questions, default 15) with the correct answer and explanation revealed at once |
| **Daily** | The daily challenge (`#/daily`) — 10 random questions across multiple subjects from the selected date paper, plus full date paper viewer (`#/daily/<date>/paper`) |
| **Old Archive** | Dedicated navigation (`#/daily/archive` or `#/archive`) accessible from anywhere on the site to view or practise any past or current date paper |
| **Exam** | You choose the paper: question count, time limit, marks per correct answer and the wrong-answer penalty |
| **Progress** | Every attempt stays in this browser: attempts, exams, drills, best score, the plan used and the full table |

### Designing the paper

The exam screen opens on the defaults — **40 questions, 40 minutes, +1 per correct
answer, −0.25 per wrong answer** — and every part can be changed before you begin:

* **Questions:** 10, 15, 20, 25, 30, 40, 50, 60, 75 or 100.
* **Time limit:** 5 to 120 minutes.
* **Marking:** +1 to +4 per correct answer, and 0 / −0.25 / −0.33 / −0.5 / −1 per wrong
  answer (0 switches negative marking off).
* **Quick presets:** Default, Quick sprint, SSC style, Railways style and School test;
  **Reset** puts the defaults back.
* The setup screen always shows the plan (for example `40 questions · 40 minutes ·
  +1 correct · −0.25 wrong`), the maximum score, how many questions the selected
  target can really supply, and it warns when a paper works out under 15 seconds per
  question.

The choices are saved in this browser (`examsathi.exam.settings`), so the next paper opens
with your settings. A target that cannot fill the requested length simply gets a
shorter paper, and the Begin button tells you the real number before you start. Drill
length is remembered separately (`examsathi.drill.length`).

Small things that make it quicker to use:

* The header toggle switches light and dark. On a first visit the site follows the
  operating system preference and it remembers your choice afterwards.
* The category search matches names, groups and descriptions — try `history`,
  `coding` or `chemistry`.
* In practice and exam views the keyboard works: <kbd>A</kbd>–<kbd>D</kbd> (or
  <kbd>1</kbd>–<kbd>4</kbd>) answer, arrow keys move between questions, <kbd>Enter</kbd>
  goes on, and the exam submits itself when the clock runs out.
* Everything is responsive down to phone width, honours `prefers-reduced-motion`, and
  the submitted review prints cleanly.

Rebuild the question bank. The build mints the day's fresh questions, stores them
and writes the category files, so one command keeps the bank growing:

```bash
node tools/build-qbank.js       # mints today's questions if they are missing, then writes tools/categories/*.js
node tools/validate.js          # checks counts, shapes and the spec checklist
```

The build is deterministic — the same day always produces the same set, and a day
that is already stored is never minted again. Useful flags:

```bash
node tools/build-qbank.js --no-daily            # rebuild only, no new questions
node tools/build-qbank.js --date 2026-10-08     # mint that day instead of today
node tools/build-qbank.js --daily-count 15      # a bigger day (1 to 100 questions)
node tools/build-qbank.js --catch-up            # mint every day missing since the last stored one
```

Update the question bank with **100 real-world questions** from news feeds and
competitive exam sources (without random numerical arithmetic or repeated stems):

```bash
node tools/news.js              # mints tools/daily/YYYY-MM-DD.js (100 real-world questions)
                                # and publishes them in the question bank
node tools/news.js --list-sources            # list configured news & competition sites
node tools/news.js --source gktoday          # pull from a named source or feed URL
node tools/news.js --url https://...         # pull from a custom RSS, Atom or JSON feed
node tools/news.js --file feed.xml           # import from a local RSS, XML or JSON file
node tools/news.js --append --count 100      # top up an existing day file to 100 questions
node tools/validate.js                       # checks counts, shapes and the spec checklist
```

Publish a day's fresh questions via the daily generator or build:

```bash
node tools/daily.js             # mints tools/daily/YYYY-MM-DD.js (100 questions)
                                # and publishes them in the question bank
node tools/validate.js          # checks counts, shapes and the spec checklist
```

`node tools/news.js` and `node tools/daily.js` write the day **and** put the questions in the question bank
(rebuilding the categories, so they are in the bank the site is served from). Add
`--no-build` to mint the day without touching the bank, `--date YYYY-MM-DD` to mint
another day, `--count N` for a custom count and `--dry-run` to preview.

## Layout (Files & Folder Structure)

```
COMP/
├── index.html                        # Single-page app entry point (Home, Practice, Daily, Old Archive, Exam, Progress)
├── package.json                      # Scripts (build, news, daily, validate, workflows, test)
├── qbank.js                          # UMD entry point for the question bank (browser + Node)
├── qbank-report.json                 # Generated validation & category count report
├── site.webmanifest                  # Web app manifest
├── .github/
│   └── workflows/
│       ├── ci.yml                    # CI workflow (tests, validation, browser asset check)
│       ├── daily-question.yml        # 06:00 IST daily question scheduler
│       └── news-questions.yml        # 06:00 IST / manual news & competition question updater
├── assets/
│   ├── css/
│   │   └── style.css                 # Light and dark theme styles & responsive layout
│   ├── img/                          # Logos and favicons (svg, png, ico)
│   └── js/
│       ├── qbank-loader.js           # Instant O(1) manifest boot + on-demand category & old date paper loader
│       └── app.js                    # SPA router, practice drills, daily & old date archive, exam engine, footer version
├── temp/
│   ├── ci.yml                        # Tracked source of truth for .github/workflows/ci.yml
│   ├── daily-questions.yml           # Tracked source of truth for .github/workflows/daily-question.yml
│   └── news-questions.yml            # Tracked source of truth for .github/workflows/news-questions.yml
└── tools/
    ├── build-qbank.js                # Builds tools/categories/*.js, index.js (manifest + dailyIndex + version meta)
    ├── build-summary.json            # Generated build summary with version & mergeCount metadata
    ├── daily.js                      # Daily question generator CLI & UMD daily file writer
    ├── news.js                       # 100-question multi-subject & news updater CLI
    ├── validate.js                   # Bank validator and spec checklist runner
    ├── install-workflows.js          # Installs temp/*.yml into .github/workflows/
    ├── spec.js                       # Category, class, exam and merged target definitions
    ├── question-schema.js            # Question schema validator
    ├── qcore.js                      # Deterministic PRNG, option builder & helpers
    ├── forms.js                      # Fact-table -> MCQ generator engine
    ├── numeric.js                    # Numeric aptitude & reasoning stream generators
    ├── tables.js                     # Registry mapping fact tables to categories
    ├── authored/
    │   └── *.js                      # 26 hand-authored curated question files
    ├── data/
    │   ├── news-competition.js       # Real-world current affairs & competitive exam question pool
    │   ├── subject-competition.js    # 6,809 multi-subject competitive exam questions across all 25 categories
    │   └── *.js                      # Structured fact tables (science, history, polity, geography, english, etc.)
    ├── daily/
    │   └── YYYY-MM-DD.js             # Stored daily date papers (UMD: Node require + browser on-demand)
    ├── categories/
    │   ├── index.js                  # Startup manifest, daily dates index, latest daily set & version/merge metadata
    │   ├── *.js                      # 26 generated category files (loaded on demand)
    │   └── gk-misc/
    │       └── part-01.js..part-17.js # Sharded 1,000-question part files
    └── tests/
        ├── app.test.js               # DOM, routing, on-demand loader, old date archive & footer version tests
        ├── daily.test.js             # Daily generator unit tests
        ├── daily-build.test.js       # Build + daily integration tests
        ├── news.test.js              # Multi-subject 100-question news CLI tests
        ├── question-schema.test.js   # Schema validation tests
        └── workflows.test.js         # Workflow installer tests
```

## Question bank

| Category | Questions |
| --- | ---: |
| GK Misc (17 part files) | 17,000 |
| Quantitative Aptitude | 1,510+ |
| Mathematics | 1,510+ |
| Reasoning | 1,509+ |
| English Language | 1,009+ |
| Current Affairs | 1,007+ |
| Static GK | 1,006+ |
| General Science | 1,005+ |
| General Knowledge | 1,004+ |
| Geography | 1,004+ |
| Indian History | 1,004+ |
| Indian Polity | 728+ |
| Economics & Banking | 285+ |
| thirteen smaller categories | 207 to 285 each |

Eleven categories carry 1,000 or more questions, and the GK Misc pool ships as 17 part
files of 1,000 questions each. Categories marked `+` grow with every daily update,
because the updater mints 100 fresh real-world questions and appends them to their categories.

### Daily questions & News CLI

`node tools/news.js` (`npm run news`) updates the question bank with **100 fresh
real-world questions** from news feeds (PIB, The Hindu, Indian Express) and competitive
exam sources (GKToday, AffairsCloud, Jagran Josh, OpenTDB, SSC/Banking/Railways pools)
without generating random numerical arithmetic or repeating any question stem already in
the bank. It stores the day's set as `tools/daily/YYYY-MM-DD.js` and rebuilds the
categories so the bank grows by 100 real-world questions at a time.

On the site, the **Daily** challenge (`#/daily`) randomly selects **10 questions** across
multiple subjects from that day's 100 published questions for a fast, replayable daily
drill with instant explanations. Visitors can also select any past date from the **Date
paper** dropdown, read the full question paper with subject filters and answer toggles
(`#/daily/<date>/paper`), or open the **Old Date Papers** archive (`#/daily/archive`) to
browse and practise any previous day's 10-question challenge (`#/daily/<date>`) or full
paper (`#/daily/<date>/all`).

Every morning at 6 AM IST the scheduler (`temp/daily-questions.yml`)
runs the same build and uploads the result as downloadable **temp files**. Nothing
is committed automatically; each day is reviewed and moved by hand:

1. Open the day's run in the repo's **Actions** tab and download the
   `daily-questions-YYYY-MM-DD` artifact.
2. Copy its contents over the repo (the day file, rebuilt categories, reports).
3. Run `node tools/validate.js`, then commit and push — Pages redeploys.

Each day is deterministic — re-running the same date against the same bank produces
the same set — and every candidate is checked against the published bank, so a daily
question is always new. Nothing is invented: answers are computed or come from fact rows.

* The day's set is saved as `tools/daily/YYYY-MM-DD.js` and appended to its
  categories by the build with stable ids (`reasoning-daily-2026-10-08-03`), so
  existing questions and diffs stay untouched.
* On the site, the home page shows a **Daily dose** strip and the **Daily** nav item
  drills the latest set with instant explanations.
* To publish manually: `node tools/daily.js --date 2026-10-08` (add `--count 15` for a
  bigger day, `--dry-run` to preview) — it mints the day and puts the questions in the
  question bank. The same happens with `node tools/build-qbank.js --date 2026-10-08
  --daily-count 15`, which mints and rebuilds in one go.
* A day that is already stored is never minted twice, so the build can run as often
  as you like: the second run of the day only rebuilds the categories.

### Where the questions come from

* **Curated (563 questions).** Hand written MCQs in `tools/authored/*.js`, one file per
  category (20 or more each), every one with an explanation. These cover the whole
  syllabus and are the quality core of the bank.
* **Generated from facts.** `tools/forms.js` turns the fact tables in `tools/data/*.js`
  (countries, elements, Indian states, science, history, polity, sport, English word
  lists, schemes, computers, abbreviations and more) into exam style MCQs: direct
  questions, reverse questions, statement questions and matched pair questions. Every
  generated question carries `source: "generated"` and can be filtered out or replaced.
* **Generated numerically.** `tools/numeric.js` produces arithmetic, algebra, geometry,
  statistics, series, coding and direction questions with computed answers, which is what
  makes the aptitude categories unlimited. These are also tagged `source: "generated"`.

### Question format

Authored and published questions use this pattern:

```json
{
  "question": "The Harappan Civilisation belonged to which age?",
  "options": ["Iron Age", "Bronze Age", "Stone Age", "Copper Age"],
  "answer": 1,
  "explanation": "The Harappan (Indus Valley) Civilisation was a Bronze Age civilisation. Its mature urban phase dates to c. 2600–1900 BCE."
}
```

- `question`: non-empty question text.
- `options`: exactly four distinct, non-empty strings.
- `answer`: **0-based** integer index into `options` (0–3); `1` selects Bronze Age above.
- `explanation`: required, non-empty text explaining the correct answer.

Add objects in this format to the appropriate array in `tools/authored/*.js` and
rebuild. You may also supply `level` (1–3; defaults to 1) and `topic` (defaults to
`"Curated"`). Published questions additionally carry `id`, `topic`, `level` and
`source` (`"curated"` or `"generated"`) for filtering and class selection.

The descriptive fields replace the old published `q`, `o`, `a`, `e`, `t`, `l`, `s`
keys. Browser category scripts and the Node `require("./qbank.js")` API both expose
the new fields. Compact generator fields remain internal to the build only.

Practice reveals the correct option and a labelled explanation after an answer is
selected. Exams keep explanations hidden until the submitted paper is reviewed,
including for skipped questions. The build and validator reject missing explanations,
invalid option lists and out-of-range or fractional answer indexes.

Run the regression tests (including DOM rendering and scoring checks):

```bash
npm install              # test-only dependency; the site still needs no build step
npm test
node tools/validate.js
```

### Known gaps

The original spec asked for GK Misc to hold 17,000 questions on its own *and* for the
subject categories to hold 1,000 each, which together need more unique facts than the
current fact tables can support. The bank reaches 17,000 in GK Misc by giving it the
whole remaining fact pool, so the smaller categories sit in the 200 to 350 range and
Indian Polity is at 724. Add rows to `tools/data/*.js` and rerun the build to raise them.

## Deploying

GitHub Pages publishes this repository straight from `main` (branch source, root folder),
and the site needs no build step, so **every push to `main` goes live** at
<https://kyabtao.github.io/COMP/>. Nothing else has to run: the pages are served exactly
as committed.

Verification is the one piece that lives outside the browser. `temp/ci.yml`
runs the regression suite, validates the bank and checks that the files the browser asks
for are present — on pushes to `main`, on every pull request and on demand.

```bash
# the same checks locally, before pushing
npm install && npm test
node tools/validate.js
```

The workflow files are **authored in `temp/`**, so the Pages deploy — which serves this
repository straight from `main` — publishes them with the site. They cannot be
pushed under `.github/workflows/` from a working branch: the automation token that
builds those branches does not have GitHub's `workflow` permission, so the push
fails with `refusing to allow a GitHub App to create or update workflow ... without
workflows permission`, and GitHub only runs workflows from `.github/workflows/`.
The tracked copies therefore live in `temp/`, and one command installs them:

```bash
npm run workflows            # copies temp/*.yml into .github/workflows/
npm run workflows -- --check # only reports which files are out of date
```

Then commit and push the installed files from a machine (or with a token) that has
that permission — CI plus the daily scheduler start working on the next push:

```bash
npm run workflows
git add .github/workflows/ci.yml .github/workflows/daily-question.yml .github/workflows/news-questions.yml
git commit -m "Update the CI, daily and news scheduler workflows"
git push
```

(Until then the scheduler file is ready at `temp/daily-questions.yml` — merging this
branch without it only means no automatic 6 AM runs yet. Daily files can still be
minted by hand with `node tools/daily.js` or `node tools/build-qbank.js`.)

## Licence and credits

Content is compiled from standard school and competitive exam syllabi. Facts such as
capitals, currencies, atomic numbers and dates are cross checked by hand, but always
verify anything you plan to publish.
