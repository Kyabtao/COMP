# COMP — Competition Prep

Practice site for school and competitive exams, built around a generated question bank.

- **Class selection:** Class 1 to Class 12 and Graduation
- **Exam selection:** SSC CGL, SSC CHSL, Banking (IBPS / SBI) and Railways (RRB NTPC / Group D)
- **Every paper:** 40 questions in 40 minutes, +1 per correct answer, 0.25 negative marking
- **Question bank:** 32,907 questions in 26 categories (see below)
- **No build step:** plain HTML, CSS and JavaScript, hosted straight from this repository

## Quick start

```bash
git clone https://github.com/Kyabtao/COMP.git
cd COMP
python3 -m http.server 8000     # then open http://localhost:8000
```

Opening `index.html` directly in a browser also works.

Rebuild the question bank (deterministic — same output every run):

```bash
node tools/build-qbank.js       # writes tools/categories/*.js
node tools/validate.js          # checks counts, shapes and the spec checklist
```

## Layout

```
index.html                     the site (single page app)
assets/css/style.css           styling, light and dark themes
assets/js/qbank-loader.js      loads every category file at start up
assets/js/app.js               routing, practice drills, 40 question exam engine
qbank.js                       UMD entry point for the bank (browser + Node)

tools/build-qbank.js           generates the category files
tools/validate.js              validates the bank and prints the checklist
tools/spec.js                  category, class and exam definitions
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
| Reasoning | 1,500 |
| Quantitative Aptitude | 1,500 |
| Mathematics | 1,500 |
| English Language | 1,000 |
| General Knowledge | 1,000 |
| Static GK | 1,000 |
| Geography | 1,000 |
| Indian History | 1,000 |
| General Science | 1,000 |
| Current Affairs | 1,000 |
| Indian Polity | 704 |
| fourteen smaller categories | 201 to 280 each |

Eleven categories carry 1,000 or more questions, and the GK Misc pool ships as 17 part
files of 1,000 questions each.

### Where the questions come from

* **Curated (382 questions).** Hand written MCQs in `tools/authored/*.js`, one file per
  category, each with an explanation. These cover the whole syllabus and are the quality
  core of the bank.
* **Generated from facts.** `tools/forms.js` turns the fact tables in `tools/data/*.js`
  (countries, elements, Indian states, science, history, polity, sport, English word
  lists, schemes, computers, abbreviations and more) into exam style MCQs: direct
  questions, reverse questions, statement questions and matched pair questions. Every
  generated question carries `s: "generated"` and can be filtered out or replaced.
* **Generated numerically.** `tools/numeric.js` produces arithmetic, algebra, geometry,
  statistics, series, coding and direction questions with computed answers, which is what
  makes the aptitude categories unlimited. These are also tagged `s: "generated"`.

Every question is an object with `q` (stem), `o` (four options), `a` (answer index),
`t` (topic), `l` (level 1 to 3), `e` (explanation) and `s` (source). Use the source tag
to show only curated content if you prefer.

### Known gaps

The original spec asked for GK Misc to hold 17,000 questions on its own *and* for the
subject categories to hold 1,000 each, which together need more unique facts than the
current fact tables can support. The bank reaches 17,000 in GK Misc by giving it the
whole remaining fact pool, so the smaller categories sit in the 200 to 350 range and
Indian Polity is at 704. Add rows to `tools/data/*.js` and rerun the build to raise them.

## Deploying

`.github/workflows/deploy.yml` validates the bank, stages the static site and publishes
it to GitHub Pages on every push to `main`. Enable Pages in the repository settings and
choose **GitHub Actions** as the source.

Note: the workflow file ships in the working tree, but the automation token used to build
this branch does not have GitHub's `workflow` permission, so it could not be committed.
Add it from a machine that can push workflow files:

```bash
mkdir -p .github/workflows
cp /path/to/deploy.yml .github/workflows/deploy.yml
git add .github/workflows/deploy.yml && git commit -m "Add GitHub Pages workflow" && git push
```

## Licence and credits

Content is compiled from standard school and competitive exam syllabi. Facts such as
capitals, currencies, atomic numbers and dates are cross checked by hand, but always
verify anything you plan to publish.
