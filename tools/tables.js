"use strict";
/** Registry mapping every fact table to the categories that may draw from it. */
const countries = require("./data/countries");
const elements = require("./data/elements");
const india = require("./data/india");
const science = require("./data/science");
const history = require("./data/history");
const polity = require("./data/polity");
const gk = require("./data/gk-world");
const economics = require("./data/economics");
const geography = require("./data/geography");
const english = require("./data/english");
const currentAffairs = require("./data/current-affairs");
const computers = require("./data/computers");
const abbr = require("./data/abbreviations");
const environment = require("./data/environment");

/** helper: forms for a simple two column table */
const pair = (topic, rows, a, b, level, exp) => ({
  topic, rows, level, exp,
  forms: [
    { t: `What is the ${b} of {0}?`, a: 1, d: 1 },
    { t: `{1} is associated with which of the following?`, a: 0, d: 0, rev: false },
    { t: `Which of the following is the ${b} of {0}?`, a: 1, d: 1 },
    { st: `The ${b} of {0} is {1}.`, head: `Which of the following statements about {0} is correct?`, d: 1 }
  ]
});

const spec = [];

/* ------------------------------------------------------------------ */
/* Countries                                                          */
/* ------------------------------------------------------------------ */
spec.push({
  topic: "Countries, Capitals and Currencies",
  rows: countries,
  categories: ["general-knowledge", "gk-misc", "static-gk"],
  forms: [
    { t: "What is the capital of {0}?", a: 1, d: 1, level: 1, exp: "The capital of {0} is {1}." },
    { t: "{1} is the capital of which country?", a: 0, d: 0, rev: true, level: 1, exp: "{1} is the capital of {0}." },
    { t: "Which currency is used in {0}?", a: 2, d: 2, level: 2, exp: "The currency of {0} is {1}." },
    { t: "The currency {2} is used in which country?", a: 0, d: 0, level: 3, exp: "{2} is the currency of {0}." },
    { t: "In which continent is {0} located?", a: 3, d: 3, level: 1, exp: "{0} is located in {3}." },
    { t: "Which of the following countries is located in {3}?", a: 0, d: 0, level: 2, exp: "{0} is a country in {3}." }
  ]
});

/* ------------------------------------------------------------------ */
/* Elements                                                           */
/* ------------------------------------------------------------------ */
spec.push({
  topic: "Periodic Table",
  rows: elements,
  categories: ["general-science", "gk-misc", "static-gk"],
  forms: [
    { t: "Which element has the chemical symbol {1}?", a: 2, d: 2, level: 1, exp: "{1} is the symbol of {2}." },
    { t: "What is the chemical symbol of {2}?", a: 1, d: 1, level: 1, exp: "The symbol of {2} is {1}." },
    { t: "What is the atomic number of {2}?", a: 0, d: 0, level: 2, exp: "The atomic number of {2} is {0}." },
    { t: "Which element has atomic number {0}?", a: 2, d: 2, level: 2, exp: "Atomic number {0} belongs to {2}." },
    { t: "To which category of elements does {2} belong?", a: 3, d: 3, level: 3, exp: "{2} is classified as a {3}." }
  ]
});

/* ------------------------------------------------------------------ */
/* India                                                              */
/* ------------------------------------------------------------------ */
spec.push({
  topic: "States and Capitals",
  rows: india.STATES,
  categories: ["static-gk", "geography", "gk-misc", "general-awareness"],
  forms: [
    { t: "What is the capital of {0}?", a: 1, d: 1, level: 1, exp: "The capital of {0} is {1}." },
    { t: "{1} is the capital of which Indian state?", a: 0, d: 0, level: 2, exp: "{1} is the capital of {0}." },
    { t: "In which region of India is {0} located?", a: 2, d: 2, level: 3, exp: "{0} lies in the {2} region." }
  ]
});
spec.push({
  topic: "Union Territories",
  rows: india.UTS.filter((r) => !(r[3] && r[3].indexOf("skipCap") !== -1)),
  categories: ["static-gk", "gk-misc"],
  forms: [
    { t: "What is the capital of the Union Territory of {0}?", a: 1, d: 1, level: 2, exp: "The capital of {0} is {1}." },
    { t: "{1} is the capital of which Union Territory?", a: 0, d: 0, level: 3, exp: "{1} is the capital of {0}." }
  ]
});
spec.push({
  topic: "National Symbols",
  rows: india.NATIONAL_SYMBOLS,
  categories: ["static-gk", "general-awareness", "gk-misc"],
  forms: [
    { t: "Which of the following is the {0} of India?", a: 1, d: 1, level: 1, exp: "The {0} of India is {1}." },
    { t: "{1} holds which of the following positions in India?", a: 0, d: 0, level: 2, exp: "{1} is the {0} of India." }
  ]
});
spec.push({
  topic: "First in India",
  rows: india.FIRST_IN_INDIA,
  categories: ["general-awareness", "static-gk", "gk-misc"],
  forms: [
    { t: "{0} is associated with which of the following?", a: 1, d: 1, level: 2, exp: "{0} — {1}." },
    { t: "Which of the following descriptions matches {1}?", a: 0, d: 0, level: 3, exp: "{1} is associated with: {0}." }
  ]
});
spec.push({
  topic: "Folk Dances of India",
  rows: india.DANCES.filter((r) => !(r[2] && r[2].indexOf("skip") !== -1)),
  categories: ["static-gk", "gk-misc"],
  forms: [
    { t: "{0} is a folk or classical dance form of which state?", a: 1, d: 1, level: 2, exp: "{0} belongs to {1}." },
    { t: "Which of the following dances is associated with {1}?", a: 0, d: 0, level: 2, exp: "{0} is associated with {1}." }
  ]
});
spec.push({
  topic: "Festivals of India",
  rows: india.FESTIVALS.filter((r) => !(r[2] && r[2].indexOf("skip") !== -1)),
  categories: ["static-gk", "gk-misc"],
  forms: [
    { t: "{0} is a major festival of which state?", a: 1, d: 1, level: 2, exp: "{0} is celebrated mainly in {1}." },
    { t: "Which of the following festivals is associated with {1}?", a: 0, d: 0, level: 2, exp: "{0} is associated with {1}." }
  ]
});
spec.push({
  topic: "Rivers of India",
  rows: india.INDIA_RIVERS,
  categories: ["geography", "static-gk", "gk-misc"],
  forms: [
    { t: "The river {0} originates from which of the following?", a: 1, d: 1, level: 3, exp: "{0} originates from {1}." },
    { t: "{1} is the origin of which river?", a: 0, d: 0, rev: true, level: 3, exp: "{1} is the origin of the river {0}." }
  ]
});
spec.push({
  topic: "Dams of India",
  rows: india.DAMS,
  categories: ["static-gk", "geography", "gk-misc"],
  forms: [
    { t: "{0} is built on which river?", a: 1, d: 1, level: 2, exp: "{0} is built on the {1}." },
    { t: "Which of the following dams is built on the river {1}?", a: 0, d: 0, level: 3, exp: "{0} is built on the {1}." }
  ]
});
spec.push({
  topic: "National Parks and Tiger Reserves",
  rows: india.NATIONAL_PARKS,
  categories: ["environmental-studies", "static-gk", "gk-misc"],
  forms: [
    { t: "{0} is located in which state?", a: 1, d: 1, level: 2, exp: "{0} is located in {1}." },
    { t: "Which of the following national parks or tiger reserves is in {1}?", a: 0, d: 0, level: 2, exp: "{0} is in {1}." }
  ]
});
spec.push({
  topic: "Mountain Passes of India",
  rows: india.PASSES,
  categories: ["geography", "static-gk", "gk-misc"],
  forms: [
    { t: "{0} pass is located in which state or union territory?", a: 1, d: 1, level: 3, exp: "{0} is located in {1}." },
    { t: "Which of the following passes is located in {1}?", a: 0, d: 0, level: 3, exp: "{0} is a pass in {1}." }
  ]
});

/* ------------------------------------------------------------------ */
/* Science                                                            */
/* ------------------------------------------------------------------ */
spec.push({
  topic: "SI Units",
  rows: science.SI_UNITS,
  categories: ["general-science", "physics", "gk-misc", "static-gk"],
  forms: [
    { t: "What is the SI unit of {0}?", a: 1, d: 1, level: 1, exp: "The SI unit of {0} is the {1}." },
    { t: "Which physical quantity is measured in {1}?", a: 0, d: 0, rev: true, level: 2, exp: "{1} is the SI unit of {0}." }
  ]
});
spec.push({
  topic: "Scientific Instruments",
  rows: science.INSTRUMENTS,
  categories: ["general-science", "physics", "gk-misc", "static-gk"],
  forms: [
    { t: "Which instrument is used to measure {1}?", a: 0, d: 0, rev: true, level: 2, exp: "{0} is used to measure {1}." },
    { t: "{0} is used for which of the following purposes?", a: 1, d: 1, level: 2, exp: "{0} measures {1}." }
  ]
});
spec.push({
  topic: "Human Body",
  rows: science.BODY,
  categories: ["general-science", "biology", "gk-misc"],
  forms: [
    { t: "What is the main function of the {0} in the human body?", a: 1, d: 1, level: 2, exp: "The {0} is responsible for {1}." },
    { t: "Which body part performs the function of {1}?", a: 0, d: 0, level: 3, exp: "{1} is performed by the {0}." }
  ]
});
spec.push({
  topic: "Vitamins and Deficiencies",
  rows: science.VITAMINS,
  categories: ["general-science", "biology", "gk-misc", "static-gk"],
  forms: [
    { t: "Deficiency of which nutrient causes {1}?", a: 0, d: 0, rev: true, level: 2, exp: "Deficiency of {0} causes {1}." },
    { t: "Which disease is caused by the deficiency of {0}?", a: 1, d: 1, level: 2, exp: "Deficiency of {0} causes {1}." }
  ]
});
spec.push({
  topic: "Diseases and Causative Agents",
  rows: science.DISEASES,
  categories: ["general-science", "biology", "gk-misc"],
  forms: [
    { t: "Which of the following causes {0}?", a: 1, d: 1, level: 2, exp: "{0} is caused by {1}." },
    { t: "{1} causes which of the following diseases?", a: 0, d: 0, rev: true, level: 3, exp: "{1} causes {0}." }
  ]
});
spec.push({
  topic: "Inventions and Discoveries",
  rows: science.INVENTIONS,
  categories: ["general-science", "inventions-discoveries", "gk-misc", "static-gk"],
  forms: [
    { t: "Who is credited with {0}?", a: 1, d: 1, level: 2, exp: "{0} — {1}." },
    { t: "{1} is associated with which of the following?", a: 0, d: 0, rev: true, level: 3, exp: "{1} is associated with {0}." }
  ]
});
spec.push({
  topic: "Chemical Names",
  rows: science.CHEMICAL_NAMES,
  categories: ["general-science", "chemistry", "gk-misc", "static-gk"],
  forms: [
    { t: "What is the chemical name of {0}?", a: 1, d: 1, level: 2, exp: "{0} is {1}." },
    { t: "{1} is commonly known as which of the following?", a: 0, d: 0, rev: true, level: 3, exp: "{1} is commonly known as {0}." }
  ]
});
spec.push({
  topic: "Branches of Science",
  rows: science.BRANCHES,
  categories: ["general-science", "gk-misc", "static-gk"],
  forms: [
    { t: "Which branch of science deals with {1}?", a: 0, d: 0, rev: true, level: 2, exp: "{0} deals with {1}." },
    { t: "{0} is the study of which of the following?", a: 1, d: 1, level: 2, exp: "{0} is the study of {1}." }
  ]
});
spec.push({
  topic: "Astronomy",
  rows: science.ASTRONOMY,
  categories: ["general-science", "gk-misc", "static-gk"],
  forms: [
    { t: "Which planet or body is described as: {2}?", a: 0, d: 0, rev: true, level: 2, exp: "{0} — {2}." },
    { t: "Which of the following statements about {0} is correct?", a: 2, d: 2, level: 3, exp: "{0}: {2}." }
  ]
});
spec.push({
  topic: "Scientists",
  rows: science.SCIENTISTS,
  categories: ["general-science", "gk-misc", "static-gk"],
  forms: [
    { t: "{0} is known for which of the following?", a: 1, d: 1, rev: true, level: 2, exp: "{0} is known for {1}." },
    { t: "Which scientist is associated with {1}?", a: 0, d: 0, level: 3, exp: "{1} is associated with {0}." }
  ]
});

/* ------------------------------------------------------------------ */
/* History                                                            */
/* ------------------------------------------------------------------ */
const yearForms = (kind) => [
  { t: "In which year did the following event take place: {0}?", a: 1, d: 1, level: kind === 1 ? 1 : 2, exp: "{0} — {1}." },
  { t: "Which of the following events took place in {1}?", a: 0, d: 0, rev: true, level: 3, exp: "{0} took place in {1}." },
  { t: "In which decade did the following event take place: {0}?", a: 1, d: 1, yn: "decade", level: 3, exp: "{0} took place in the {1}s." },
  { t: "To which century does the following event belong: {0}?", a: 1, d: 1, yn: "century", level: 3, exp: "{0} belongs to the {1}." }
];
spec.push({
  topic: "Indian History Events",
  rows: history.INDIA_EVENTS,
  categories: ["indian-history", "gk-misc", "current-affairs"],
  forms: yearForms(2)
});
spec.push({
  topic: "World History Events",
  rows: history.WORLD_EVENTS,
  categories: ["indian-history", "gk-misc"],
  forms: yearForms(3)
});
spec.push({
  topic: "Dynasties",
  rows: history.DYNASTIES,
  categories: ["indian-history", "gk-misc"],
  forms: [
    { t: "Who founded the {0}?", a: 1, d: 1, rev: true, level: 2, exp: "The {0} was founded by {1}." },
    { t: "{1} founded which of the following?", a: 0, d: 0, level: 3, exp: "{1} founded the {0}." }
  ]
});
spec.push({
  topic: "Rulers",
  rows: history.RULERS,
  categories: ["indian-history", "gk-misc"],
  forms: [
    { t: "Which of the following is true about {0}?", a: 1, d: 1, level: 2, exp: "{0}: {1}." },
    { t: "Which ruler is associated with the following: {1}?", a: 0, d: 0, level: 3, exp: "{1} is associated with {0}." }
  ]
});
spec.push({
  topic: "Freedom Fighters",
  rows: history.FREEDOM_FIGHTERS,
  categories: ["indian-history", "gk-misc", "general-awareness"],
  forms: [
    { t: "{0} is known by which of the following titles or descriptions?", a: 1, d: 1, level: 2, exp: "{0} — {1}." },
    { t: "Which freedom fighter is described as {1}?", a: 0, d: 0, level: 3, exp: "{1} refers to {0}." }
  ]
});
spec.push({
  topic: "National Movements",
  rows: history.MOVEMENTS,
  categories: ["indian-history", "gk-misc"],
  forms: [
    { t: "In which year did the following movement or act begin: {0}?", a: 1, d: 1, level: 2, exp: "{0} — {1}." },
    { t: "Which movement or act is described as: {2}?", a: 0, d: 0, rev: true, level: 3, exp: "{0} — {2}." }
  ]
});

/* ------------------------------------------------------------------ */
/* Polity                                                             */
/* ------------------------------------------------------------------ */
spec.push({
  topic: "Constitution Articles",
  rows: polity.ARTICLES,
  categories: ["indian-polity", "gk-misc"],
  forms: [
    { t: "Which part of the Constitution deals with: {0}?", a: 1, d: 1, level: 2, exp: "{0} is covered under {1}." },
    { t: "{1} of the Constitution deals with which of the following?", a: 0, d: 0, rev: true, level: 3, exp: "{1} deals with {0}." }
  ]
});
spec.push({
  topic: "Constitutional Amendments",
  rows: polity.AMENDMENTS,
  categories: ["indian-polity", "gk-misc"],
  forms: [
    { t: "The {0} of the Constitution is related to which subject?", a: 2, d: 2, level: 3, exp: "The {0} ({1}) — {2}." },
    { t: "Which amendment is described as: {2}?", a: 0, d: 0, rev: true, level: 3, exp: "{0} — {2}." }
  ]
});
spec.push({
  topic: "Constitution Facts",
  rows: polity.CONSTITUTION_FACTS,
  categories: ["indian-polity", "gk-misc"],
  forms: [
    { t: "{0}?", a: 1, d: 1, level: 2, exp: "{0} — {1}." }
  ]
});
spec.push({
  topic: "Institutions of India",
  rows: polity.INSTITUTIONS,
  categories: ["indian-polity", "static-gk", "gk-misc", "general-awareness"],
  forms: [
    { t: "{0} is best described as which of the following?", a: 1, d: 1, rev: true, level: 2, exp: "{0} — {1}." },
    { t: "Which institution is described as: {1}?", a: 0, d: 0, level: 3, exp: "{1} describes {0}." }
  ]
});

/* ------------------------------------------------------------------ */
/* World GK                                                           */
/* ------------------------------------------------------------------ */
spec.push({
  topic: "Important Days",
  rows: gk.DAYS,
  categories: ["days-events", "general-knowledge", "current-affairs", "gk-misc", "static-gk"],
  forms: [
    { t: "On which date is {0} observed?", a: 1, d: 1, level: 1, exp: "{0} is observed on {1}." },
    { t: "Which of the following days is observed on {1}?", a: 0, d: 0, rev: true, level: 3, exp: "{1} is observed as {0}." },
    { t: "{0} falls in which month?", a: 1, d: 1, level: 3, exp: "{0} is observed on {1}." }
  ]
});
spec.push({
  topic: "Organisations and Headquarters",
  rows: gk.ORGANISATIONS,
  categories: ["general-knowledge", "static-gk", "gk-misc", "current-affairs"],
  forms: [
    { t: "Where is the headquarters of {0}?", a: 1, d: 1, level: 2, exp: "{0} is headquartered at {1}." },
    { t: "Which of the following organisations has its headquarters at {1}?", a: 0, d: 0, level: 3, exp: "{0} is headquartered at {1}." }
  ]
});
spec.push({
  topic: "Sports Teams",
  rows: gk.SPORTS_PLAYERS,
  categories: ["sports", "general-knowledge", "gk-misc"],
  forms: [
    { t: "How many players are there in a {0} team?", a: 1, d: 1, level: 2, exp: "A {0} team has {1} players." },
    { t: "Which sport uses teams of {1} players?", a: 0, d: 0, rev: true, level: 3, exp: "Teams of {1} players play {0}." }
  ]
});
spec.push({
  topic: "Trophies and Cups",
  rows: gk.TROPHIES,
  categories: ["sports", "general-knowledge", "gk-misc", "static-gk"],
  forms: [
    { t: "{0} is associated with which sport?", a: 1, d: 1, level: 2, exp: "{0} is associated with {1}." },
    { t: "Which trophy or cup is associated with {1}?", a: 0, d: 0, level: 2, exp: "{0} is associated with {1}." }
  ]
});
spec.push({
  topic: "Awards and Honours",
  rows: gk.AWARDS,
  categories: ["awards-honours", "general-knowledge", "gk-misc", "static-gk"],
  forms: [
    { t: "{0} is associated with which of the following?", a: 1, d: 1, level: 2, exp: "{0} — {1}." },
    { t: "Which award is described as: {1}?", a: 0, d: 0, level: 3, exp: "{1} describes {0}." }
  ]
});
spec.push({
  topic: "Books and Authors",
  rows: gk.BOOKS,
  categories: ["books-authors", "general-knowledge", "gk-misc"],
  forms: [
    { t: "Who is the author of {0}?", a: 1, d: 1, level: 2, exp: "{0} is written by {1}." },
    { t: "Which of the following books was written by {1}?", a: 0, d: 0, level: 3, exp: "{0} was written by {1}." }
  ]
});
spec.push({
  topic: "First in the World",
  rows: gk.WORLD_FIRSTS,
  categories: ["general-knowledge", "gk-misc", "static-gk"],
  forms: [
    { t: "{0} is associated with which of the following?", a: 1, d: 1, level: 2, exp: "{0} — {1}." },
    { t: "Which of the following achievements belongs to {1}?", a: 0, d: 0, level: 3, exp: "{0} belongs to {1}." }
  ]
});
spec.push({
  topic: "Superlatives and World Facts",
  rows: gk.SUPERLATIVES,
  categories: ["general-knowledge", "geography", "gk-misc", "static-gk"],
  forms: [
    { qa: true, level: 2, exp: "World and India facts of the 'first, largest, longest' type." }
  ]
});

/* ------------------------------------------------------------------ */
/* Geography                                                          */
/* ------------------------------------------------------------------ */
spec.push({
  topic: "Geography Questions",
  rows: geography.GEO_QA,
  categories: ["geography", "gk-misc", "general-knowledge"],
  forms: [{ qa: true, level: 2, exp: "Geography fact." }]
});
spec.push({
  topic: "Climate and Atmosphere",
  rows: geography.CLIMATE,
  categories: ["geography", "general-science", "gk-misc"],
  forms: [
    { t: "{0}?", a: 1, d: 1, level: 2, exp: "{0} — {1}." }
  ]
});
spec.push({
  topic: "Soils of India",
  rows: geography.SOILS,
  categories: ["geography", "gk-misc", "static-gk"],
  forms: [
    { t: "Which soil is described as: {1}?", a: 0, d: 0, level: 3, exp: "{0} — {1}." },
    { t: "Which of the following is true about {0}?", a: 1, d: 1, level: 3, exp: "{0}: {1}." }
  ]
});
spec.push({
  topic: "Minerals and States",
  rows: geography.MINERALS,
  categories: ["geography", "static-gk", "gk-misc"],
  forms: [
    { t: "Which Indian state is a major producer of {0}?", a: 1, d: 1, level: 3, exp: "{0} is produced in large quantities in {1}." },
    { t: "Which mineral is found in large quantities in {1}?", a: 0, d: 0, level: 3, exp: "{0} is found in {1}." }
  ]
});

/* ------------------------------------------------------------------ */
/* Economics                                                          */
/* ------------------------------------------------------------------ */
spec.push({
  topic: "Economics and Banking",
  rows: economics.ECON_QA,
  categories: ["economics", "general-awareness", "general-knowledge", "gk-misc", "current-affairs"],
  forms: [{ qa: true, level: 2, exp: "Economics and banking fact." }]
});

/* ------------------------------------------------------------------ */
/* English                                                            */
/* ------------------------------------------------------------------ */
spec.push({
  topic: "Synonyms",
  rows: english.SYNONYMS,
  categories: ["english", "general-english-grammar", "gk-misc"],
  forms: [
    { t: "Choose the word most similar in meaning to {0}.", a: 1, d: 1, level: 1, exp: "{0} means {1}." },
    { t: "{1} is a synonym of which of the following words?", a: 0, d: 0, rev: true, level: 2, exp: "{1} is a synonym of {0}." }
  ]
});
spec.push({
  topic: "Antonyms",
  rows: english.ANTONYMS,
  categories: ["english", "general-english-grammar", "gk-misc"],
  forms: [
    { t: "Choose the word most opposite in meaning to {0}.", a: 1, d: 1, level: 1, exp: "The opposite of {0} is {1}." },
    { t: "{1} is an antonym of which of the following words?", a: 0, d: 0, rev: true, level: 2, exp: "{1} is the opposite of {0}." }
  ]
});
spec.push({
  topic: "Idioms and Phrases",
  rows: english.IDIOMS,
  categories: ["english", "general-english-grammar", "gk-misc"],
  forms: [
    { t: "What is the meaning of the idiom '{0}'?", a: 1, d: 1, level: 2, exp: "'{0}' means {1}." }
  ]
});
spec.push({
  topic: "One Word Substitution",
  rows: english.ONE_WORD,
  categories: ["english", "general-english-grammar", "gk-misc"],
  forms: [
    { t: "Choose the one word substitute for: {0}", a: 1, d: 1, level: 2, exp: "{0} — {1}." },
    { t: "The word {1} means which of the following?", a: 0, d: 0, rev: true, level: 3, exp: "{1} means: {0}." }
  ]
});
spec.push({
  topic: "Spellings",
  rows: english.SPELLINGS,
  categories: ["english", "general-english-grammar", "gk-misc"],
  forms: [
    { t: "Which of the following words is spelt correctly?", a: 0, d: 0, level: 1, exp: "The correct spelling is {0}." },
    { t: "Which of the following words is spelt incorrectly?", a: 1, d: 1, level: 2, exp: "The incorrect spelling shown is {1}; the correct form is {0}." }
  ]
});
spec.push({
  topic: "Plurals",
  rows: english.PLURALS,
  categories: ["english", "general-english-grammar", "gk-misc"],
  forms: [
    { t: "What is the plural of {0}?", a: 1, d: 1, level: 1, exp: "The plural of {0} is {1}." },
    { t: "Which of the following is the plural form of {0}?", a: 1, d: 1, rev: true, level: 2, exp: "The plural of {0} is {1}." }
  ]
});
spec.push({
  topic: "Genders",
  rows: english.GENDERS,
  categories: ["english", "general-english-grammar", "gk-misc"],
  forms: [
    { t: "What is the feminine form of {0}?", a: 1, d: 1, level: 2, exp: "The feminine of {0} is {1}." },
    { t: "The masculine form of {1} is which of the following?", a: 0, d: 0, rev: true, level: 3, exp: "{1} is the feminine of {0}." }
  ]
});
spec.push({
  topic: "Degrees of Comparison",
  rows: english.DEGREES,
  categories: ["english", "general-english-grammar", "gk-misc"],
  forms: [
    { t: "What is the comparative degree of {0}?", a: 1, d: 1, level: 1, exp: "{0} — {1} — {2}." },
    { t: "What is the superlative degree of {0}?", a: 2, d: 2, level: 2, exp: "{0} — {1} — {2}." },
    { t: "Fill in the blank correctly: {0}, ____, {2}", a: 1, d: 1, level: 2, exp: "The correct sequence is {0}, {1}, {2}." },
    { t: "Fill in the blank correctly: {0}, {1}, ____", a: 2, d: 2, level: 2, exp: "The correct sequence is {0}, {1}, {2}." },
    { t: "{1} is the comparative degree of which word?", a: 0, d: 0, rev: true, level: 3, exp: "{1} is the comparative of {0}." }
  ]
});
spec.push({
  topic: "Prepositions",
  rows: english.PREPOSITIONS,
  categories: ["english", "general-english-grammar", "gk-misc"],
  forms: [
    { t: "Fill in the blank with the correct preposition: {0}", a: 1, d: 1, level: 2, exp: "The correct preposition is '{1}'." }
  ]
});
spec.push({
  topic: "English Grammar",
  rows: english.GRAMMAR_QA,
  categories: ["english", "general-english-grammar", "gk-misc"],
  forms: [{ qa: true, level: 2, exp: "English grammar rule." }]
});

/* ------------------------------------------------------------------ */
/* Current affairs                                                    */
/* ------------------------------------------------------------------ */
spec.push({
  topic: "Current Affairs",
  rows: currentAffairs.CURRENT_QA,
  categories: ["current-affairs", "general-knowledge", "gk-misc", "general-awareness"],
  forms: [{ qa: true, level: 2, exp: "Recent events and schemes." }]
});
spec.push({
  topic: "Schemes and Programmes",
  rows: currentAffairs.SCHEMES,
  categories: ["current-affairs", "general-awareness", "economics", "gk-misc"],
  forms: [
    { t: "The scheme {0} was launched with which objective?", a: 1, d: 1, level: 2, exp: "{0} — {1}." },
    { t: "Which scheme is described as: {1}?", a: 0, d: 0, level: 3, exp: "{1} describes {0}." }
  ]
});
spec.push({
  topic: "Missions and Programmes",
  rows: currentAffairs.MISSIONS,
  categories: ["current-affairs", "general-science", "gk-misc"],
  forms: [
    { t: "{0} is associated with which of the following?", a: 1, d: 1, level: 2, exp: "{0} — {1}." },
    { t: "Which mission is described as: {1}?", a: 0, d: 0, level: 3, exp: "{1} describes {0}." }
  ]
});

/* ------------------------------------------------------------------ */
/* Computer awareness                                                 */
/* ------------------------------------------------------------------ */
spec.push({
  topic: "Computer Fundamentals",
  rows: computers.COMPUTER_FACTS,
  categories: ["computer-awareness", "general-science", "gk-misc"],
  forms: [
    { t: "{0} is best described as which of the following?", a: 1, d: 1, rev: true, level: 2, exp: "{0} — {1}." },
    { t: "Which computer term is described as: {1}?", a: 0, d: 0, level: 3, exp: "{1} describes {0}." }
  ]
});
spec.push({
  topic: "Computer Shortcuts",
  rows: computers.SHORTCUTS,
  categories: ["computer-awareness", "gk-misc"],
  forms: [
    { t: "What is the purpose of the shortcut {0}?", a: 1, d: 1, level: 2, exp: "{0} is used to {1}." }
  ]
});
spec.push({
  topic: "File Extensions",
  rows: computers.EXTENSIONS,
  categories: ["computer-awareness", "gk-misc"],
  forms: [
    { t: "Which type of file uses the {0} extension?", a: 1, d: 1, rev: true, level: 2, exp: "{0} is a {1}." },
    { t: "Which file extension is used for a {1}?", a: 0, d: 0, level: 3, exp: "{1} uses the extension {0}." }
  ]
});
spec.push({
  topic: "Computer Generations",
  rows: computers.GENERATIONS,
  categories: ["computer-awareness", "general-science", "gk-misc"],
  forms: [
    { t: "Which technology was the main feature of the {0} of computers?", a: 1, d: 1, level: 2, exp: "The {0} used {1}." },
    { t: "Which generation of computers used {1}?", a: 0, d: 0, rev: true, level: 3, exp: "{1} were used in the {0}." }
  ]
});

/* ------------------------------------------------------------------ */
/* Abbreviations                                                      */
/* ------------------------------------------------------------------ */
spec.push({
  topic: "Abbreviations",
  rows: abbr.ABBR,
  categories: ["abbreviations", "general-awareness", "gk-misc", "current-affairs"],
  forms: [
    { t: "What is the full form of {0}?", a: 1, d: 1, rev: true, level: 2, exp: "{0} stands for {1}." },
    { t: "Which of the following abbreviations stands for {1}?", a: 0, d: 0, level: 3, exp: "{1} is abbreviated as {0}." }
  ]
});

/* ------------------------------------------------------------------ */
/* Environment                                                        */
/* ------------------------------------------------------------------ */
spec.push({
  topic: "Environmental Agreements",
  rows: environment.ENV_AGREEMENTS,
  categories: ["environmental-studies", "gk-misc", "general-awareness"],
  forms: [
    { t: "What is the main purpose of the {0}?", a: 1, d: 1, rev: true, level: 3, exp: "{0} — {1}." },
    { t: "Which agreement or organisation is described as: {1}?", a: 0, d: 0, level: 3, exp: "{1} describes the {0}." }
  ]
});
spec.push({
  topic: "Pollutants and Effects",
  rows: environment.POLLUTION,
  categories: ["environmental-studies", "general-science", "gk-misc"],
  forms: [
    { t: "Which of the following is an effect or source of {0}?", a: 1, d: 1, level: 3, exp: "{0} — {1}." },
    { t: "Which pollutant is described as: {1}?", a: 0, d: 0, rev: true, level: 3, exp: "{1} is linked to {0}." }
  ]
});
spec.push({
  topic: "Biosphere Reserves and Wetlands",
  rows: environment.BIOSPHERE,
  categories: ["environmental-studies", "gk-misc", "static-gk"],
  forms: [
    { t: "{0} is located in which state?", a: 1, d: 1, level: 3, exp: "{0} is in {1}." },
    { t: "Which biosphere reserve or wetland is located in {1}?", a: 0, d: 0, level: 3, exp: "{0} is located in {1}." }
  ]
});
spec.push({
  topic: "Environmental Laws and Schemes",
  rows: environment.ENV_SCHEMES,
  categories: ["environmental-studies", "gk-misc"],
  forms: [
    { t: "{0} is associated with which purpose?", a: 1, d: 1, level: 3, exp: "{0} — {1}." },
    { t: "Which law or scheme is described as: {1}?", a: 0, d: 0, level: 3, exp: "{1} refers to {0}." }
  ]
});



module.exports = { spec };
