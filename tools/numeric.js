"use strict";
/**
 * Deterministic numeric / logic generators. These produce an unlimited stream of
 * unique practice questions for the aptitude categories (reasoning, quantitative
 * aptitude, mathematics). Every question is self-consistent, so the answer can
 * be verified arithmetically.
 */
const { options, txt } = require("./qcore");

const r2 = (n) => Math.round(n * 100) / 100;
const rup = (n, unit) => `${r2(n)} ${unit}`;

/** Build a question from a stem, numeric answer and near-miss distractor maker. */
function numQ(rand, q, answer, unit, mk, level, topic, exp) {
  const ans = unit ? rup(answer, unit) : txt(answer);
  const cands = mk().map((v) => (unit ? rup(v, unit) : txt(v)));
  const built = options(rand, ans, cands, 4);
  if (!built) return null;
  return { q, opts: built.opts, ans: built.ans, topic, level, e: exp };
}

const uniq = (arr) => {
  const seen = new Set();
  return arr.filter((v) => {
    const k = String(v);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

/* ------------------------------------------------------------------ */
/* Quantitative aptitude                                              */
/* ------------------------------------------------------------------ */
const QUANT = [
  (rand) => {
    const a = 12 + rand.int(88), b = 12 + rand.int(88);
    return numQ(rand, `What is ${a} x ${b}?`, a * b, "", () => uniq([a * b + a, a * b - b, a * b + b, (a + 1) * b, a * b - 4]), 1, "Multiplication", `${a} x ${b} = ${a * b}.`);
  },
  (rand) => {
    const p = [5, 10, 12, 15, 20, 25, 30, 40, 50, 60, 75][rand.int(11)], n = 20 * (1 + rand.int(40));
    const ans = (p * n) / 100;
    return numQ(rand, `What is ${p} per cent of ${n}?`, ans, "", () => uniq([ans * 2, ans / 2, ans + n / 100, ans * 1.5, ans - 1]), 1, "Percentage", `${p} per cent of ${n} = ${r2(ans)}.`);
  },
  (rand) => {
    const pr = 100 * (1 + rand.int(20)), rate = 2 + rand.int(12), t = 1 + rand.int(6);
    const si = (pr * rate * t) / 100;
    return numQ(rand, `What is the simple interest on ${pr} rupees at ${rate} per cent per annum for ${t} years?`, si, "rupees", () => uniq([si + pr / 10, si * 1.2, si - rate, si + rate, si / 2]), 2, "Simple Interest", `SI = P x R x T / 100 = ${pr} x ${rate} x ${t} / 100 = ${r2(si)}.`);
  },
  (rand) => {
    const nums = [rand.int(40) + 5];
    for (let i = 1; i < 5; i++) nums.push(nums[i - 1] + rand.int(9) + 1);
    const avg = nums.reduce((a, b) => a + b, 0) / 5;
    return numQ(rand, `What is the average of ${nums.join(", ")}?`, avg, "", () => uniq([avg + 1, avg - 1, avg + 2, avg - 2, avg + 0.5]), 1, "Average", `Sum = ${nums.reduce((a, b) => a + b, 0)}, average = ${r2(avg)}.`);
  },
  (rand) => {
    const total = 100 + rand.int(400), parts = [1 + rand.int(5), 1 + rand.int(5)];
    const sumParts = parts[0] + parts[1], unit = total / sumParts;
    if (!Number.isInteger(unit)) return null;
    const ans = unit * parts[0];
    return numQ(rand, `A sum of ${total} rupees is divided between two people in the ratio ${parts[0]}:${parts[1]}. What is the larger share?`, Math.max(ans, unit * parts[1]), "rupees", () => uniq([ans, unit * parts[1], unit * 2, total / 2, ans + unit]), 2, "Ratio", `One part is ${unit} rupees, so the shares are ${unit * parts[0]} and ${unit * parts[1]}.`);
  },
  (rand) => {
    const cp = 100 * (1 + rand.int(15)), gain = 5 + rand.int(40);
    const sp = cp * (1 + gain / 100);
    return numQ(rand, `An article bought for ${cp} rupees is sold at a profit of ${gain} per cent. What is the selling price?`, sp, "rupees", () => uniq([cp, cp * (1 - gain / 100), cp + gain, sp + 10, sp - 5]), 2, "Profit and Loss", `Selling price = ${cp} x (1 + ${gain}/100) = ${r2(sp)}.`);
  },
  (rand) => {
    const speed = 20 + rand.int(60), time = 2 + rand.int(6);
    const dist = speed * time;
    return numQ(rand, `A vehicle travels at ${speed} km per hour for ${time} hours. What distance does it cover?`, dist, "km", () => uniq([dist + speed, dist - speed, dist / 2, dist + 10, dist * 1.25]), 1, "Speed and Distance", `Distance = speed x time = ${speed} x ${time} = ${dist} km.`);
  },
  (rand) => {
    const len = 50 * (1 + rand.int(6)), speed = 10 + rand.int(20);
    const t = len / speed;
    return numQ(rand, `A train ${len} metres long runs at ${speed} metres per second. How long will it take to cross a pole?`, t, "seconds", () => uniq([t * 2, t + 5, t - 2, t + 10, t / 2]), 2, "Trains", `Time = length / speed = ${len} / ${speed} = ${r2(t)} seconds.`);
  },
  (rand) => {
    const a = 6 + rand.int(18), b = 6 + rand.int(18);
    const together = 1 / (1 / a + 1 / b);
    return numQ(rand, `A can finish a piece of work in ${a} days and B in ${b} days. Working together, in how many days will they finish it?`, together, "days", () => uniq([(a + b) / 2, a < b ? a : b, a + b, together * 2, together + 1]), 3, "Time and Work", `Combined rate = 1/${a} + 1/${b}, so time = ${r2(together)} days.`);
  },
  (rand) => {
    const x = 6 + rand.int(30), y = 6 + rand.int(30);
    const hcf = (a, b) => (b ? hcf(b, a % b) : a);
    const h = hcf(x, y);
    return numQ(rand, `What is the HCF of ${x} and ${y}?`, h, "", () => uniq([h * 2, h + 1, h - 1, (x * y) / h, h * 3]), 2, "HCF and LCM", `The highest common factor of ${x} and ${y} is ${h}.`);
  },
  (rand) => {
    const x = 4 + rand.int(20), y = 4 + rand.int(20);
    const lcm = (a, b) => (a * b) / (function g(p, q) { return q ? g(q, p % q) : p; })(a, b);
    const l = lcm(x, y);
    return numQ(rand, `What is the LCM of ${x} and ${y}?`, l, "", () => uniq([x * y, l / 2, l + x, l - y, l * 2]), 2, "HCF and LCM", `The least common multiple of ${x} and ${y} is ${l}.`);
  },
  (rand) => {
    const r = 2 + rand.int(20);
    return numQ(rand, `What is the area of a circle of radius ${r} cm? (take pi = 22/7)`, (22 / 7) * r * r, "sq cm", () => uniq([2 * (22 / 7) * r, (22 / 7) * r, (22 / 7) * r * r * 2, r * r]), 2, "Mensuration", `Area = pi x r^2 = 22/7 x ${r} x ${r} = ${r2((22 / 7) * r * r)} square centimetres.`);
  },
  (rand) => {
    const l = 5 + rand.int(20), b = 5 + rand.int(20);
    return numQ(rand, `What is the perimeter of a rectangle ${l} m long and ${b} m wide?`, 2 * (l + b), "m", () => uniq([l * b, l + b, 2 * l + b, 4 * l, l * b / 2]), 1, "Mensuration", `Perimeter = 2 x (length + breadth) = 2 x (${l} + ${b}) = ${2 * (l + b)} m.`);
  },
  (rand) => {
    const principal = 1000 * (1 + rand.int(10)), rate = 5 + rand.int(10);
    const amt = principal * Math.pow(1 + rate / 100, 2);
    const ci = amt - principal;
    return numQ(rand, `What is the compound interest on ${principal} rupees at ${rate} per cent per annum for 2 years?`, ci, "rupees", () => uniq([(principal * rate * 2) / 100, ci * 2, ci + principal / 10, ci - rate, ci / 2]), 3, "Compound Interest", `Amount = ${principal} x (1 + ${rate}/100)^2, so CI = ${r2(ci)} rupees.`);
  },
  (rand) => {
    const cost = 200 * (1 + rand.int(10)), disc = [5, 10, 15, 20, 25][rand.int(5)];
    const price = cost * (1 - disc / 100);
    return numQ(rand, `The marked price of an item is ${cost} rupees and a discount of ${disc} per cent is given. What is the selling price?`, price, "rupees", () => uniq([cost, cost - disc, price - 10, price + 10, cost * (1 + disc / 100)]), 2, "Discount", `Selling price = ${cost} x (1 - ${disc}/100) = ${r2(price)} rupees.`);
  },
  (rand) => {
    const x = 5 + rand.int(25), y = 5 + rand.int(25);
    return numQ(rand, `A sum becomes ${x + y} when ${x} is added to another number ${y}. What is the value of ${x} + ${y}?`, x + y, "", () => uniq([x + y + 1, x * y, x + y - 1, x - y, x + y + 2]), 1, "Arithmetic", `${x} + ${y} = ${x + y}.`);
  },
  (rand) => {
    const n = 2 + rand.int(12);
    return numQ(rand, `What is ${n} cubed?`, n * n * n, "", () => uniq([n * n, n * n * n + n, n * n * n - n, n * n * n * 2, (n + 1) * (n + 1) * (n + 1)]), 1, "Squares and Cubes", `${n}^3 = ${n * n * n}.`);
  },
  (rand) => {
    const men = 5 + rand.int(20), days = 4 + rand.int(15), men2 = 5 + rand.int(20);
    const ans = (men * days) / men2;
    if (!Number.isFinite(ans)) return null;
    return numQ(rand, `If ${men} workers can complete a job in ${days} days, how long will ${men2} workers take (work at the same rate)?`, ans, "days", () => uniq([(men * days) / Math.max(1, men2 + 3), days, men / men2 * days + 1, days + 2, days / 2]), 3, "Time and Work", `Men and time are inversely related: ${men} x ${days} / ${men2} = ${r2(ans)} days.`);
  },
  (rand) => {
    const marks = [rand.int(30) + 40, rand.int(30) + 40, rand.int(30) + 40, rand.int(30) + 40];
    const total = marks.reduce((a, b) => a + b, 0), max = 400;
    const pct = (total / max) * 100;
    return numQ(rand, `A student scores ${marks.join(", ")} out of 100 in four subjects. What is the overall percentage?`, pct, "per cent", () => uniq([pct / 2, pct + 5, pct - 5, 100 - pct, pct + 2.5]), 2, "Percentage", `Total marks = ${total} out of ${max}, so the percentage is ${r2(pct)}.`);
  }
];

/* ------------------------------------------------------------------ */
/* Mathematics                                                        */
/* ------------------------------------------------------------------ */
const MATHS = [
  (rand) => {
    const a = 2 + rand.int(9), x = 2 + rand.int(12), b = rand.int(20);
    const c = a * x + b;
    return numQ(rand, `If ${a}x + ${b} = ${c}, what is the value of x?`, x, "", () => uniq([x + 1, x - 1, x + 2, c / a, x * 2]), 2, "Simple Equations", `${a}x = ${c} - ${b} = ${c - b}, so x = ${x}.`);
  },
  (rand) => {
    const a = 2 + rand.int(11);
    return numQ(rand, `What is the square of ${a}?`, a * a, "", () => uniq([a * a + a, a * a - a, a * 2, (a + 1) * (a + 1), a * a * 2]), 1, "Squares and Cubes", `${a}^2 = ${a * a}.`);
  },
  (rand) => {
    const n = 10 + rand.int(120);
    const isPrime = (v) => { for (let i = 2; i * i <= v; i++) if (v % i === 0) return false; return v > 1; };
    const target = isPrime(n) ? n : (() => { let k = n; while (!isPrime(k)) k++; return k; })();
    const others = [n + 2, n + 4, n + 6].map((v) => (isPrime(v) ? v + 2 : v));
    return numQ(rand, `Which of the following numbers is prime?`, target, "", () => uniq(others), 2, "Number System", `${target} has no factor other than 1 and itself.`);
  },
  (rand) => {
    const deg = [30, 45, 60, 90, 0][rand.int(5)];
    const names = { 0: "0", 30: "1/2", 45: "1/root 2", 60: "root 3/2", 90: "1" };
    const others = Object.keys(names).filter((d) => d !== String(deg)).map((d) => names[d]);
    return numQ(rand, `What is the value of sin ${deg} degrees?`, names[deg], "", () => uniq(others), 3, "Trigonometry", `Sin ${deg} degrees = ${names[deg]}.`);
  },
  (rand) => {
    const n = 2 + rand.int(8), r = 1 + rand.int(n - 1);
    const fact = (v) => { let f = 1; for (let i = 2; i <= v; i++) f *= i; return f; };
    const ans = fact(n) / fact(n - r);
    return numQ(rand, `In how many ways can ${r} distinct items be arranged in order out of ${n} available items? (nPr)`, ans, "", () => uniq([fact(n), fact(r), ans / 2, ans + n, fact(n) / (fact(r) * fact(n - r))]), 3, "Permutations", `nPr = ${n}! / (${n} - ${r})! = ${ans}.`);
  },
  (rand) => {
    const data = [rand.int(20) + 1, rand.int(20) + 1, rand.int(20) + 1, rand.int(20) + 1, rand.int(20) + 1].sort((a, b) => a - b);
    const median = data[2];
    return numQ(rand, `What is the median of the numbers ${data.join(", ")}?`, median, "", () => uniq([data[0], data[4], (data.reduce((a, b) => a + b, 0) / 5), median + 1]), 2, "Statistics", `The middle value of ${data.join(", ")} is ${median}.`);
  },
  (rand) => {
    const n = 3 + rand.int(12), r = 2 + rand.int(3);
    const p = Math.pow(n, r);
    return numQ(rand, `What is ${n} to the power ${r}?`, p, "", () => uniq([Math.pow(n, r + 1), Math.pow(n + 1, r), p / n, p * 2, p + n]), 1, "Indices", `${n}^${r} = ${p}.`);
  },
  (rand) => {
    const a = 2 + rand.int(10), b = 2 + rand.int(10), h = 2 + rand.int(10);
    const area = (1 / 2) * (a + b) * h;
    return numQ(rand, `What is the area of a trapezium with parallel sides ${a} cm and ${b} cm and height ${h} cm?`, area, "sq cm", () => uniq([a * b * h, area * 2, (a + b) * h, area + h, area / 2]), 3, "Mensuration", `Area = 1/2 x (sum of parallel sides) x height = 1/2 x ${a + b} x ${h} = ${r2(area)}.`);
  },
  (rand) => {
    const x1 = rand.int(10), y1 = rand.int(10), x2 = rand.int(10), y2 = rand.int(10);
    const d = Math.hypot(x2 - x1, y2 - y1);
    return numQ(rand, `What is the distance between the points (${x1}, ${y1}) and (${x2}, ${y2})?`, d, "units", () => uniq([Math.abs(x2 - x1) + Math.abs(y2 - y1), d * 2, Math.abs(x2 - x1), Math.abs(y2 - y1), d + 1]), 3, "Coordinate Geometry", `Distance = sqrt((${x2 - x1})^2 + (${y2 - y1})^2) = ${r2(d)}.`);
  },
  (rand) => {
    const p = 1 + rand.int(9), total = p * 2;
    return numQ(rand, `A bag contains ${p} red and ${p} blue balls. What is the probability of drawing a red ball?`, 0.5, "", () => uniq([p / (total - 1), 0.25, 0.75, p / (total + 2), 1]), 3, "Probability", `Favourable outcomes ${p} of ${total}, so the probability is 1/2.`, );
  },
];

/* ------------------------------------------------------------------ */
/* Reasoning                                                          */
/* ------------------------------------------------------------------ */
function seriesGen(rand, kind) {
  const count = 5 + rand.int(2);           // visible terms
  const start = 2 + rand.int(8), step = 2 + rand.int(8);
  const seq = [];
  if (kind === "ap") {
    for (let i = 0; i < count; i++) seq.push(start + i * step);
  } else if (kind === "gp") {
    for (let i = 0; i < count; i++) seq.push(start * Math.pow(2, i));
  } else if (kind === "sq") {
    for (let i = 0; i < count; i++) seq.push((start + i) * (start + i));
  } else if (kind === "cube") {
    for (let i = 0; i < count; i++) seq.push(Math.pow(start + i + 1, 3));
  } else {
    let term = start;
    for (let i = 0; i < count; i++) { seq.push(term); term += (i + 2) * step; }
  }
  let answer;
  if (kind === "ap") answer = seq[count - 1] + step;
  else if (kind === "gp") answer = seq[count - 1] * 2;
  else if (kind === "sq") answer = (start + count) * (start + count);
  else if (kind === "cube") answer = Math.pow(start + count + 1, 3);
  else answer = seq[count - 1] + (count + 2) * step;
  return numQ(rand, `Find the next number in the series: ${seq.join(", ")}, ?`, answer, "",
    () => uniq([answer + step, answer - step, answer * 2, answer + 1, answer - 1]), 2, "Number Series",
    `The pattern continues in the same way, so the next term is ${answer}.`);
}

const REASONING = [
  (rand) => seriesGen(rand, "ap"),
  (rand) => seriesGen(rand, "gp"),
  (rand) => seriesGen(rand, "sq"),
  (rand) => seriesGen(rand, "cube"),
  (rand) => seriesGen(rand, "mix"),
  (rand) => {
    const shift = 1 + rand.int(5), words = ["CAT", "DOG", "FAN", "JAR", "MAN", "PEN", "RAT", "SUN", "TOP", "VAN"];
    const w = words[rand.int(words.length)];
    const coded = w.split("").map((c) => String.fromCharCode(((c.charCodeAt(0) - 65 + shift) % 26) + 65)).join("");
    const wrong = [];
    for (let s = 1; s <= 4; s++) if (s !== shift) wrong.push(w.split("").map((c) => String.fromCharCode(((c.charCodeAt(0) - 65 + s) % 26) + 65)).join(""));
    return numQ(rand, `In a code language each letter is shifted ${shift} place(s) forward. How is ${w} written?`, coded, "", () => uniq(wrong), 2, "Coding Decoding", `Shifting each letter of ${w} by ${shift} gives ${coded}.`);
  },
  (rand) => {
    const nums = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => n * n);
    const pick = rand.int(nums.length);
    const answer = nums[pick];
    const others = nums.filter((v) => v !== answer).filter((v, i) => i % 2 === 0).slice(0, 6);
    return numQ(rand, `Which of the following is a perfect square?`, answer, "", () => uniq(others.map((v) => v + 1).concat(others)), 2, "Odd One Out", `${answer} is a perfect square.`);
  },
  (rand) => {
    const names = ["Amit", "Bina", "Chetan", "Divya", "Esha", "Farhan"];
    const [a, b, c, d, e, f] = names;
    const position = 2 + rand.int(4);
    const left = position - 1, right = names.length - position;
    return numQ(rand, `In a row of ${names.length} children, ${names[position - 1]} is standing at position ${position} from the left. What is the position from the right?`, names.length - position + 1, "", () => uniq([position, names.length - position, right + 2, left, position + 2]), 2, "Ranking", `Position from right = total - position from left + 1 = ${names.length - position + 1}.`);
  },
  (rand) => {
    const daysAway = 10 + rand.int(60);
    const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const startIdx = rand.int(7);
    const ansIdx = (startIdx + daysAway) % 7;
    const others = dayNames.filter((d) => d !== dayNames[ansIdx]);
    return numQ(rand, `If today is ${dayNames[startIdx]}, what day will it be after ${daysAway} days?`, dayNames[ansIdx], "", () => uniq(others.slice(0, 4)), 3, "Calendar", `${daysAway} days later gives ${dayNames[ansIdx]} (${daysAway} mod 7 = ${daysAway % 7}).`);
  },
  (rand) => {
    const a = 3 + rand.int(10), d = 2 + rand.int(9);
    const north = a, east = d;
    const dist = Math.hypot(north, east);
    return numQ(rand, `A person walks ${north} km north and then ${east} km east. What is the straight line distance from the starting point?`, dist, "km", () => uniq([north + east, Math.abs(north - east), dist * 2, north * 2, dist + 1]), 3, "Direction Sense", `Distance = sqrt(${north}^2 + ${east}^2) = ${r2(dist)} km.`);
  },
  (rand) => {
    const h = 1 + rand.int(12), m = rand.int(12) * 5;
    const angle = Math.abs(30 * h - 5.5 * m);
    const ans = Math.min(angle, 360 - angle);
    return numQ(rand, `What is the angle between the hour and minute hands at ${h}:${String(m).padStart(2, "0")}?`, ans, "degrees", () => uniq([ans + 30, ans - 30, 360 - ans, ans / 2, ans + 15]), 3, "Clocks", `Angle = |30H - 5.5M| = ${r2(ans)} degrees.`);
  },
  (rand) => {
    const n = 3 + rand.int(5);
    const fib = [1, 1];
    while (fib.length < n + 1) fib.push(fib[fib.length - 1] + fib[fib.length - 2]);
    const answer = fib.pop();
    return numQ(rand, `Find the next term of the series: ${fib.join(", ")}, ?`, answer, "", () => uniq([answer + 1, answer - 1, answer * 2, answer + 3, answer + 5]), 3, "Number Series", `Each term is the sum of the previous two terms, so the next term is ${answer}.`);
  },
  (rand) => {
    const x = 20 + rand.int(60);
    return numQ(rand, `Which of the following is divisible by 3?`, x - (x % 3), "", () => uniq([x - (x % 3) + 1, x - (x % 3) + 2, x - (x % 3) + 4, x - (x % 3) + 5]), 2, "Divisibility", `A number is divisible by 3 when the sum of its digits is a multiple of 3.`);
  },
  (rand) => {
    const book = 3 + rand.int(5), pen = 3 + rand.int(5);
    const cost = 2 * book + 3 * pen;
    return numQ(rand, `Two books and three pens cost ${cost} rupees. If a book costs ${book} rupees, what is the cost of one pen?`, pen, "rupees", () => uniq([pen + 1, pen - 1, book, cost / 5, pen * 2]), 3, "Arithmetic Reasoning", `2 x ${book} = ${2 * book}, so 3 pens cost ${cost - 2 * book} and one pen costs ${pen} rupees.`);
  }
];

/** Stream factories -------------------------------------------------- */
function makeStream(list, topicSet, seed) {
  const { Rand } = require("./qcore");
  const rand = new Rand(seed);
  let i = 0;
  return {
    next() {
      // try generators round-robin; skip nulls, cap duplicates with fresh randomness
      for (let tries = 0; tries < 40; tries++) {
        const gen = list[(i++) % list.length];
        const q = gen(rand);
        if (q) return q;
      }
      return null;
    }
  };
}

/**
 * An explicit seed starts the same generators from a different point, which is
 * how the daily scheduler (tools/daily.js) mints fresh questions. No argument
 * keeps the historic seeds, so the main bank never changes.
 */
module.exports = {
  quantStream: (seed) => makeStream(QUANT.filter((g, i) => i !== QUANT.length - 1), "quant", seed === undefined ? 20240501 : seed),
  mathsStream: (seed) => makeStream(MATHS.filter((g, i) => i !== MATHS.length - 1), "maths", seed === undefined ? 987654321 : seed),
  reasoningStream: (seed) => makeStream(REASONING, "reasoning", seed === undefined ? 13579 : seed)
};
