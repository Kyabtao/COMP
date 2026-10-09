<img src="assets/img/logo.svg" alt="ExamSathi logo" width="72" />

# ExamSathi — Competition Prep

Practice site for school and competitive exams, built around a generated question bank.

- **Single target list:** Classes 1 to 12, Graduation, SSC CGL, SSC CHSL, Banking (IBPS / SBI) and Railways (RRB NTPC / Group D) — classes and exams are merged into one list because they share the same paper pattern
- **Every paper:** you choose the questions, time and marking — the defaults are 40 questions in 40 minutes, +1 per correct answer, 0.25 negative marking
- **Question bank:** 32,937 questions in 26 categories (see below), growing by 10 fresh questions every morning
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
| **Home** | Pick a target, search the 26 categories, see your saved paper settings, or jump straight into a paper |
| **Practice** | A drill per category (5 to 30 questions, default 15) with the correct answer and explanation revealed at once |
| **Daily** | The daily dose: that morning's freshly published questions as one mixed drill with instant explanations |
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

Rebuild the question bank (deterministic — same output every run):

```bash
node tools/build-qbank.js       # writes tools/categories/*.js
node tools/validate.js          # checks counts, shapes and the spec checklist
```

Publish a day's fresh questions by hand (the scheduler below does this daily):

```bash
node tools/daily.js             # mints tools/daily/YYYY-MM-DD.js (10 questions)
node tools/build-qbank.js       # appends them to their categories
node tools/validate.js          # checks counts, shapes and the spec checklist
```

## Layout

```
index.html                     the site (single page app)
assets/css/style.css           styling, light and dark themes
assets/js/qbank-loader.js      loads every category file at start up
assets/js/app.js               routing, practice drills, configurable exam engine (one target list)
qbank.js                       UMD entry point for the bank (browser + Node)

tools/build-qbank.js           generates the category files
tools/daily.js                 mints one day's fresh questions (the scheduler runs this)
tools/daily/*.js               one committed file per published day (do not edit by hand)
temp/                          stores the workflow files (tracked — the Pages deploy serves them)
temp/ci.yml                    CI workflow: regression suite, bank validation, browser file check
temp/daily-questions.yml       daily scheduler: mint, rebuild, validate, upload temp files
tools/validate.js              validates the bank and prints the checklist
tools/spec.js                  category, class, exam and merged target definitions
tools/qcore.js                 deterministic PRNG, option builder, helpers
tools/forms.js                 form engine: fact tables -> MCQs
tools/numeric.js               numeric generators for the aptitude categories
tools/tables.js                registry mapping fact tables to categories
tools/data/*.js                the source fact tables
tools/authored/*.js            hand written MCQs
tools/categories/*.js          GENERATED question bank (do not edit by hand)
tools/categories/gk-misc/      GENERATED GK Misc parts 01 to 17
```

## Question bank

| Category | Questions |
| --- | ---: |
| GK Misc (17 part files) | 17,000 |
| Reasoning | 1,502+ |
| Quantitative Aptitude | 1,502+ |
| Mathematics | 1,502+ |
| English Language | 1,002+ |
| General Knowledge | 1,000+ |
| Static GK | 1,001+ |
| Geography | 1,000+ |
| Indian History | 1,000+ |
| General Science | 1,000+ |
| Current Affairs | 1,000 |
| Indian Polity | 724 |
| Economics & Banking | 281+ |
| thirteen smaller categories | 201 to 280 each |

Eleven categories carry 1,000 or more questions, and the GK Misc pool ships as 17 part
files of 1,000 questions each. Categories marked `+` grow by a few questions every
morning through the daily scheduler.

### Daily questions

Every morning at 6 AM IST the scheduler (`temp/daily-questions.yml`)
mints **10 fresh questions** — computed aptitude questions (quantitative aptitude,
mathematics, reasoning), English vocabulary, Static GK and one rotating category —
and uploads them as downloadable **temp files**. Nothing is committed automatically;
each day is reviewed and moved by hand:

1. Open the day's run in the repo's **Actions** tab and download the
   `daily-questions-YYYY-MM-DD` artifact.
2. Copy its contents over the repo (the day file, rebuilt categories, reports).
3. Run `node tools/validate.js`, then commit and push — Pages redeploys.

Each day is deterministic — re-running the same date produces the same set — and
every candidate is checked against the published bank, so a daily question is always
new. Nothing is invented: answers are computed or come from fact rows.

* The day's set is saved as `tools/daily/YYYY-MM-DD.js` and appended to its
  categories by the build with stable ids (`reasoning-daily-2026-10-08-03`), so
  existing questions and diffs stay untouched.
* On the site, the home page shows a **Daily dose** strip and the **Daily** nav item
  drills the latest set with instant explanations.
* To publish manually: `node tools/daily.js --date 2026-10-08` (add `--count 15` for a
  bigger day, `--dry-run` to preview), then rebuild and validate as above.

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

The workflow files are **committed in `temp/`**, so the Pages deploy — which serves
this repository straight from `main` — publishes them with the site. They cannot be
pushed under `.github/workflows/`: the automation token used to build these branches
does not have GitHub's `workflow` permission, so a push fails with `refusing to allow
a GitHub App to create or update workflow ... without workflows permission`, and
GitHub only runs workflows from `.github/workflows/`. Move them into place and commit
once from a machine (or with a token) that has that permission — CI plus the daily
scheduler start working on the next push:

```bash
mv temp/ci.yml temp/daily-questions.yml .github/workflows/
git add .github/workflows/ci.yml .github/workflows/daily-questions.yml
git commit -m "Add CI and daily scheduler workflows"
git push
```

(Until then the scheduler file is ready at `temp/daily-questions.yml` — merging this
branch without it only means no automatic 6 AM runs yet. Daily files can still be
minted by hand with `node tools/daily.js`.)

## Licence and credits

Content is compiled from standard school and competitive exam syllabi. Facts such as
capitals, currencies, atomic numbers and dates are cross checked by hand, but always
verify anything you plan to publish.
