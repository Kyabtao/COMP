"use strict";
/**
 * Category, class and exam definitions for the competition prep site.
 *
 * 26 categories total:
 *  - "volume" categories carry the big generated bank (9 of them have 1,000+).
 *  - "authored" categories carry hand-written questions (~22 each, plus
 *    generated fill when a pool is available).
 */

const CLASSES = [
  "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6",
  "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12",
  "Graduation"
];

const EXAMS = [
  { id: "ssc-cgl", name: "SSC CGL", marksPerQ: 2, negative: 0.5,
    sections: ["general-intelligence-reasoning", "general-awareness", "quantitative-aptitude", "english-comprehension"],
    note: "Tier 1 style: 25 questions and 50 marks per section." },
  { id: "ssc-chsl", name: "SSC CHSL", marksPerQ: 2, negative: 0.5,
    sections: ["general-intelligence", "general-awareness", "quantitative-aptitude", "english-language"],
    note: "Tier 1 style paper with four sections." },
  { id: "banking", name: "Banking (IBPS / SBI)", marksPerQ: 1, negative: 0.25,
    sections: ["reasoning", "quantitative-aptitude", "english-language", "general-awareness", "computer-awareness"],
    note: "Prelims style paper with five sections." },
  { id: "railways", name: "Railways (RRB NTPC / Group D)", marksPerQ: 1, negative: 0.33,
    sections: ["mathematics", "general-intelligence-reasoning", "general-awareness"],
    note: "CBT style paper with three sections." }
];

/** Competition rules: every exam played on the site is 40 questions. */
const EXAM_RULES = {
  questionCount: 40,
  durationMinutes: 40,
  description: "40 questions in 40 minutes, +1 per correct answer and 0.25 negative marking, exactly like the site competition format."
};

const CATEGORIES = [
  /* ---------------- the nine volume categories ---------------- */
  { slug: "gk-misc", name: "GK Misc (17 Parts)", file: "gk-misc", type: "volume", target: 17000, parts: 17,
    icon: "layers", group: "General Knowledge", exams: ["ssc-cgl", "ssc-chsl", "banking", "railways"],
    blurb: "Mixed general knowledge shipped as 17 part files of 1,000 questions each." },
  { slug: "general-knowledge", name: "General Knowledge", file: "general-knowledge", type: "volume", target: 1000,
    icon: "globe", group: "General Knowledge", exams: ["ssc-cgl", "ssc-chsl", "railways"],
    blurb: "Countries, capitals, currencies, days, organisations and world firsts." },
  { slug: "current-affairs", name: "Current Affairs", file: "current-affairs", type: "volume", target: 1000,
    icon: "newspaper", group: "General Knowledge", exams: ["ssc-cgl", "ssc-chsl", "banking", "railways"],
    blurb: "Recent schemes, missions, summits, awards and appointments." },
  { slug: "static-gk", name: "Static GK", file: "static-gk", type: "volume", target: 1000,
    icon: "bookmark", group: "General Knowledge", exams: ["ssc-cgl", "ssc-chsl", "banking", "railways"],
    blurb: "National symbols, dances, festivals, dams, parks, instruments and branches of science." },
  { slug: "indian-history", name: "Indian History", file: "indian-history", type: "volume", target: 1000,
    icon: "landmark", group: "Social Studies", exams: ["ssc-cgl", "ssc-chsl", "railways"],
    blurb: "Events, dynasties, rulers, movements and freedom fighters." },
  { slug: "indian-polity", name: "Indian Polity", file: "indian-polity", type: "volume", target: 1000,
    icon: "scale", group: "Social Studies", exams: ["ssc-cgl", "ssc-chsl", "railways"],
    blurb: "Constitution, articles, amendments and institutions." },
  { slug: "geography", name: "Geography", file: "geography", type: "volume", target: 1000,
    icon: "compass", group: "Social Studies", exams: ["ssc-cgl", "ssc-chsl", "railways"],
    blurb: "Physical, world and Indian geography with climate and minerals." },
  { slug: "general-science", name: "General Science", file: "general-science", type: "volume", target: 1000,
    icon: "atom", group: "Science", exams: ["ssc-cgl", "ssc-chsl", "railways"],
    blurb: "Physics, chemistry and biology facts combined." },
  { slug: "english", name: "English Language", file: "english", type: "volume", target: 1000,
    icon: "languages", group: "Language", exams: ["ssc-cgl", "ssc-chsl", "banking"],
    blurb: "Synonyms, antonyms, idioms, one-word substitutes, spellings and grammar." },

  /* ---------------- the seventeen authored categories ---------------- */
  { slug: "reasoning", name: "Reasoning", file: "reasoning", type: "authored", target: 1000,
    icon: "puzzle", group: "Aptitude", exams: ["ssc-cgl", "ssc-chsl", "banking", "railways"],
    blurb: "Series, coding, blood relations, directions and syllogisms." },
  { slug: "quantitative-aptitude", name: "Quantitative Aptitude", file: "quantitative-aptitude", type: "authored", target: 1000,
    icon: "calculator", group: "Aptitude", exams: ["ssc-cgl", "ssc-chsl", "banking"],
    blurb: "Arithmetic, percentages, interest, ratios and mensuration." },
  { slug: "mathematics", name: "Mathematics", file: "mathematics", type: "authored", target: 1000,
    icon: "sigma", group: "Aptitude", exams: ["railways", "ssc-chsl"],
    blurb: "Number work, algebra, geometry and speed-accuracy drills." },
  { slug: "general-awareness", name: "General Awareness", file: "general-awareness", type: "authored", target: 400,
    icon: "flag", group: "General Knowledge", exams: ["ssc-cgl", "ssc-chsl", "railways"],
    blurb: "Defence, awards, institutions and national facts." },
  { slug: "computer-awareness", name: "Computer Awareness", file: "computer-awareness", type: "authored", target: 400,
    icon: "monitor", group: "General Knowledge", exams: ["banking", "ssc-cgl"],
    blurb: "Hardware, software, internet and cyber security." },
  { slug: "economics", name: "Economics & Banking", file: "economics", type: "authored", target: 600,
    icon: "coins", group: "Commerce", exams: ["banking", "ssc-cgl"],
    blurb: "Banking, budget, taxes, trade and national income." },
  { slug: "general-english-grammar", name: "General English Grammar", file: "general-english-grammar", type: "authored", target: 400,
    icon: "spellcheck", group: "Language", exams: ["ssc-cgl", "ssc-chsl", "banking"],
    blurb: "Voice, narration, articles, prepositions and error spotting." },
  { slug: "environmental-studies", name: "Environmental Studies", file: "environmental-studies", type: "authored", target: 400,
    icon: "leaf", group: "Science", exams: ["ssc-cgl", "railways"],
    blurb: "Ecology, pollution, climate agreements and wildlife." },
  { slug: "physics", name: "Physics", file: "physics", type: "authored", target: 400,
    icon: "magnet", group: "Science", exams: ["ssc-cgl", "railways"],
    blurb: "Motion, energy, light, electricity and units." },
  { slug: "chemistry", name: "Chemistry", file: "chemistry", type: "authored", target: 400,
    icon: "flask", group: "Science", exams: ["ssc-cgl", "railways"],
    blurb: "Elements, acids, bases, salts and chemical names." },
  { slug: "biology", name: "Biology", file: "biology", type: "authored", target: 400,
    icon: "dna", group: "Science", exams: ["ssc-cgl", "railways"],
    blurb: "Human body, plants, diseases and nutrition." },
  { slug: "sports", name: "Sports", file: "sports", type: "authored", target: 400,
    icon: "trophy", group: "General Knowledge", exams: ["ssc-cgl", "ssc-chsl", "railways"],
    blurb: "Trophies, terms, players and tournaments." },
  { slug: "awards-honours", name: "Awards & Honours", file: "awards-honours", type: "authored", target: 400,
    icon: "medal", group: "General Knowledge", exams: ["ssc-cgl", "ssc-chsl", "railways"],
    blurb: "Civilian, gallantry, literary and international awards." },
  { slug: "books-authors", name: "Books & Authors", file: "books-authors", type: "authored", target: 400,
    icon: "book-open", group: "General Knowledge", exams: ["ssc-cgl", "ssc-chsl"],
    blurb: "Famous books and their authors." },
  { slug: "days-events", name: "Days & Events", file: "days-events", type: "authored", target: 400,
    icon: "calendar", group: "General Knowledge", exams: ["ssc-cgl", "ssc-chsl", "banking", "railways"],
    blurb: "Important national and international days." },
  { slug: "inventions-discoveries", name: "Inventions & Discoveries", file: "inventions-discoveries", type: "authored", target: 400,
    icon: "lightbulb", group: "Science", exams: ["ssc-cgl", "railways"],
    blurb: "Inventions, inventors and discoveries." },
  { slug: "abbreviations", name: "Abbreviations", file: "abbreviations", type: "authored", target: 400,
    icon: "type", group: "General Knowledge", exams: ["ssc-cgl", "ssc-chsl", "banking", "railways"],
    blurb: "Full forms of common abbreviations and acronyms." }
];

/** Which category a given exam section draws from. */
const SECTION_MAP = {
  "general-intelligence-reasoning": ["reasoning"],
  "general-intelligence": ["reasoning"],
  reasoning: ["reasoning"],
  "general-awareness": ["general-awareness", "static-gk", "indian-history", "indian-polity", "geography", "sports", "awards-honours", "days-events", "abbreviations"],
  "quantitative-aptitude": ["quantitative-aptitude", "mathematics"],
  mathematics: ["mathematics", "quantitative-aptitude"],
  "english-comprehension": ["english", "general-english-grammar"],
  "english-language": ["english", "general-english-grammar"],
  "computer-awareness": ["computer-awareness"]
};

/** Difficulty mix used when assembling a 40 question paper. */
const PAPER_MIX = { easy: 16, medium: 16, hard: 8 };

module.exports = { CLASSES, EXAMS, EXAM_RULES, CATEGORIES, SECTION_MAP, PAPER_MIX };
