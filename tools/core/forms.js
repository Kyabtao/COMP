"use strict";
/** Generic form engine: turns fact tables into MCQ generators. */
const { options, txt, century, decade, similarity } = require("./qcore");

/** Friendly labels used by the automatic matched pair forms. */
const PAIR_LABELS = {
  "Countries, Capitals and Currencies": "country and capital",
  "Periodic Table": "element and symbol",
  "States and Capitals": "state and capital",
  "Folk Dances of India": "dance and state",
  "Festivals of India": "festival and state",
  "Rivers of India": "river and origin",
  "Dams of India": "dam and river",
  "National Parks and Tiger Reserves": "national park and state",
  "Mountain Passes of India": "pass and state",
  "SI Units": "quantity and SI unit",
  "Scientific Instruments": "instrument and use",
  "Human Body": "body part and function",
  "Vitamins and Deficiencies": "nutrient and deficiency disease",
  "Diseases and Causative Agents": "disease and causative agent",
  "Inventions and Discoveries": "invention and inventor",
  "Chemical Names": "common name and chemical name",
  "Branches of Science": "branch and subject",
  "Scientists": "scientist and contribution",
  "Indian History Events": "event and year",
  "World History Events": "event and year",
  "Dynasties": "dynasty and founder",
  "Freedom Fighters": "person and title",
  "Constitution Articles": "provision and article",
  "Institutions of India": "institution and description",
  "Important Days": "day and date",
  "Organisations and Headquarters": "organisation and headquarters",
  "Sports Teams": "sport and number of players",
  "Trophies and Cups": "trophy and sport",
  "Awards and Honours": "award and field",
  "Books and Authors": "book and author",
  "First in the World": "achievement and person",
  "Minerals and States": "mineral and state",
  "Environmental Agreements": "agreement and purpose",
  "Biosphere Reserves and Wetlands": "site and state",
  "Environmental Laws and Schemes": "law and purpose",
  "Abbreviations": "abbreviation and full form",
  "Computer Fundamentals": "term and description",
  "File Extensions": "extension and file type",
  "Climate and Atmosphere": "question and answer",
  "Soils of India": "soil and feature",
  "Pollutants and Effects": "pollutant and effect"
};

/** Automatic matched pair forms for structured fact tables. */
function autoPairs(spec, rows) {
  if (spec.pairs === false || rows.length < 8) return [];
  if ((spec.forms || []).some((f) => f.qa)) return [];
  const first = rows[0];
  if (!Array.isArray(first) || first.length < 2) return [];
  if (txt(first[1]).length > 70) return []; // long prose columns do not make good pairs
  const label = PAIR_LABELS[spec.topic];
  const okStem = label
    ? "Which of the following pairs of " + label + " is correctly matched?"
    : "Which of the following pairs is correctly matched?";
  const negStem = label
    ? "Which of the following pairs of " + label + " is NOT correctly matched?"
    : "Which of the following pairs is NOT correctly matched?";
  return [
    { t: okStem, pair: [0, 1], level: 3 },
    { t: negStem, pair: [0, 1], level: 3, negate: true }
  ];
}

function fill(template, row) {
  return template.replace(/\{(\d+)\}/g, (_, i) => txt(row[Number(i)]));
}

/** Rows that pass the spec filter. */
function usableRows(spec) {
  return spec.rows.filter((r) => (spec.filter ? spec.filter(r) : true));
}

/** Map of value -> number of rows sharing it, for a column. */
function valueCounts(rows, col) {
  const m = new Map();
  for (const r of rows) {
    const v = txt(r[col]).toLowerCase();
    m.set(v, (m.get(v) || 0) + 1);
  }
  return m;
}

/**
 * Build every question a table spec can produce.
 * Forms:
 *   { t, a, d }          plain forward question
 *   { t, a, d, rev:true} reverse question, only for unique answer values
 *   { st, head, d }      "which statement is correct" question
 *   { yn, a, d }         year based question (decade / century derived answers)
 *   { qa: true }         table already stores question, answer pairs
 */
function* tableQuestions(spec, rand) {
  const rows = usableRows(spec);
  if (!rows.length) return;
  const forms = (spec.forms || []).concat(autoPairs(spec, rows));
  for (let fi = 0; fi < forms.length; fi++) {
    const f = forms[fi];
    let order = rand.shuffle(rows.map((_, i) => i));
    const unique = f.rev || f.unique ? valueCounts(rows, f.a) : null;
    for (const ri of order) {
      const row = rows[ri];
      let answer, qtext, cands;

      if (f.pair) {
        // matched pair form: one correct pair and three cross paired wrong pairs
        const aCol = f.pair[0], bCol = f.pair[1];
        const valid = new Map();
        for (const r of rows) {
          const k = txt(r[aCol]).toLowerCase();
          if (!valid.has(k)) valid.set(k, new Set());
          valid.get(k).add(txt(r[bCol]).toLowerCase());
        }
        const correct = [txt(row[aCol]), txt(row[bCol])];
        const render = (p) => p[0] + " - " + p[1];
        if (!correct[0] || !correct[1]) continue;
        const variants = f.negate ? 1 : (f.variants || 2);
        for (let v = 0; v < variants; v++) {
          const uniqWrong = [];
          const seenPair = new Set();
          for (let t = 0; t < 24 && uniqWrong.length < 3; t++) {
            const rj = rows[rand.int(rows.length)];
            const a = txt(row[aCol]), b = txt(rj[bCol]);
            const k = a + "|" + b;
            if (!a || !b || seenPair.has(k)) continue;
            if ((valid.get(a.toLowerCase()) || new Set()).has(b.toLowerCase())) continue;
            seenPair.add(k);
            uniqWrong.push([a, b]);
          }
          if (uniqWrong.length < 3) continue;
          let pairs, answerPair, note;
          if (f.negate) {
            const others = [];
            for (let t = 0; t < 40 && others.length < 3; t++) {
              const rj = rows[rand.int(rows.length)];
              const ok = [txt(rj[aCol]), txt(rj[bCol])];
              if (ok[0] && ok[1] && ok[0] !== correct[0] && !others.some((o) => render(o) === render(ok))) others.push(ok);
            }
            if (others.length < 3) continue;
            answerPair = uniqWrong[0];
            pairs = rand.shuffle(others.concat([answerPair]));
            note = "The pair " + render(answerPair) + " is not correctly matched.";
          } else {
            answerPair = correct;
            pairs = rand.shuffle(uniqWrong.slice(0, 3).concat([correct]));
            note = "Only " + render(correct) + " is correctly matched.";
          }
          const answer = render(answerPair);
          const cands = pairs.map(render);
          const built2 = options(rand, answer, cands, 4);
          if (!built2) continue;
          yield { q: f.t, opts: built2.opts, ans: built2.ans, topic: spec.topic, level: f.level || 3, e: note };
        }
        continue;
      }

      if (f.qa) {
        answer = txt(row[1]);
        qtext = txt(row[0]);
        // Similarity guard: never let the answer of a near-identical question
        // be offered as a wrong option.
        cands = rows
          .filter((r) => similarity(txt(row[0]), txt(r[0])) < 0.6)
          .map((r) => txt(r[1]));
      } else if (f.st) {
        answer = fill(f.st, row);
        qtext = fill(f.head, row);
        cands = rows.map((r) => fill(f.st, r));
      } else if (f.yn) {
        const y = row[f.a];
        const derived = f.yn === "century" ? century(y) : decade(y);
        if (!derived) continue;
        answer = derived;
        qtext = fill(f.t, row);
        cands = rows.map((r) => (f.yn === "century" ? century(r[f.a]) : decade(r[f.a]))).filter(Boolean);
      } else {
        answer = txt(row[f.a]);
        if (!answer) continue;
        if (unique && unique.get(answer.toLowerCase()) > 1) continue;
        qtext = fill(f.t, row);
        cands = rows.map((r) => txt(r[f.d]));
      }

      if (!answer || !qtext) continue;
      const built = options(rand, answer, cands, 4);
      if (!built) continue;
      yield {
        q: qtext,
        opts: built.opts,
        ans: built.ans,
        topic: spec.topic,
        level: f.level || spec.level || 2,
        e: (f.exp || spec.exp || "").replace(/\{(\d+)\}/g, (_, i) => txt(row[Number(i)]))
      };
    }
  }
}

/** Estimate how many questions a spec can produce (upper bound). */
function capacity(spec) {
  const rows = usableRows(spec);
  if (!rows.length) return 0;
  let n = 0;
  for (const f of (spec.forms || []).concat(autoPairs(spec, rows))) {
    if (f.pair) { n += rows.length * (f.negate ? 1 : (f.variants || 2)); continue; }
    if (f.rev || f.unique) {
      const counts = valueCounts(rows, f.a);
      n += rows.filter((r) => counts.get(txt(r[f.a]).toLowerCase()) === 1).length;
    } else {
      n += rows.length;
    }
  }
  return n;
}

module.exports = { tableQuestions, capacity, fill, usableRows };
