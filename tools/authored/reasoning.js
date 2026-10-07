"use strict";
/** Curated MCQs: Reasoning */
module.exports = [
  { q: "Find the next number in the series: 2, 6, 12, 20, 30, ?", opts: ["36", "40", "42", "44"], ans: 2, level: 1, exp: "Differences are 4, 6, 8, 10, so the next difference is 12 and 30 + 12 = 42." },
  { q: "Find the next term: 1, 4, 9, 16, 25, ?", opts: ["30", "36", "42", "49"], ans: 1, level: 1, exp: "These are perfect squares: 1^2, 2^2, 3^2, 4^2, 5^2, so the next is 6^2 = 36." },
  { q: "Find the missing term: 3, 7, 15, 31, ?", opts: ["63", "62", "48", "55"], ans: 0, level: 2, exp: "Each term is double the previous term plus one: 31 x 2 + 1 = 63." },
  { q: "Complete the series: A, C, F, J, ?", opts: ["N", "O", "P", "M"], ans: 1, level: 2, exp: "Gaps increase by one letter: +2, +3, +4, so the next jump is +5, giving O." },
  { q: "If CAT is coded as 3-1-20, how is DOG coded?", opts: ["4-15-7", "4-14-7", "3-15-7", "4-15-6"], ans: 0, level: 1, exp: "Letters are replaced by their positions in the alphabet: D=4, O=15, G=7." },
  { q: "If in a code language MONKEY is written as XDJMNL, how is TIGER written?", opts: ["SFDHU", "QDFHS", "SFDHT", "RFDFH"], ans: 1, level: 3, exp: "Each letter is replaced by the letter two places before it in the alphabet after reversing the word." },
  { q: "Pointing to a photograph, a man said, 'She is the daughter of my grandfather's only son.' How is she related to him?", opts: ["Cousin", "Sister", "Aunt", "Niece"], ans: 1, level: 2, exp: "The grandfather's only son is the man's father, so the girl is his sister." },
  { q: "A is the brother of B. B is the sister of C. C is the father of D. How is A related to D?", opts: ["Father", "Uncle", "Brother", "Grandfather"], ans: 1, level: 2, exp: "A is the brother of D's father C, so A is D's uncle." },
  { q: "Ravi walks 5 km north, then turns right and walks 3 km, then turns right and walks 5 km. How far is he from the starting point?", opts: ["3 km", "5 km", "8 km", "13 km"], ans: 0, level: 2, exp: "The two north-south legs cancel out, leaving a displacement of 3 km east." },
  { q: "A man facing north turns 90 degrees clockwise, then 180 degrees anticlockwise. Which direction is he facing now?", opts: ["North", "South", "East", "West"], ans: 3, level: 2, exp: "North plus 90 degrees clockwise is East; 180 degrees anticlockwise from East is West." },
  { q: "Which one is the odd one out: 3, 5, 11, 14, 17?", opts: ["11", "14", "17", "5"], ans: 1, level: 1, exp: "All the numbers are prime except 14." },
  { q: "Which one does not belong: Circle, Square, Triangle, Cube?", opts: ["Circle", "Square", "Triangle", "Cube"], ans: 3, level: 1, exp: "Cube is a three-dimensional solid while the others are plane figures." },
  { q: "Statements: All roses are flowers. Some flowers fade quickly. Conclusion: Some roses fade quickly.", opts: ["Definitely true", "Definitely false", "Cannot be determined", "Partly true"], ans: 2, level: 3, exp: "The quick-fading flowers need not be roses, so the conclusion does not follow." },
  { q: "Statements: All men are mortal. Socrates is a man. Conclusion: Socrates is mortal.", opts: ["Follows logically", "Does not follow", "Cannot be determined", "Contradicts the premise"], ans: 0, level: 1, exp: "This is a valid syllogism, so the conclusion follows from the premises." },
  { q: "Find the next number: 5, 11, 23, 47, ?", opts: ["95", "94", "96", "90"], ans: 0, level: 2, exp: "Each term is double the previous term plus one: 47 x 2 + 1 = 95." },
  { q: "Which letter comes next: Z, X, V, T, ?", opts: ["S", "R", "Q", "P"], ans: 1, level: 1, exp: "The series skips one letter backwards each time, so after T comes R." },
  { q: "If SOUTH is written as TPVUI, how is EAST written?", opts: ["FBTU", "FBUT", "FATU", "EBTU"], ans: 0, level: 2, exp: "Each letter is replaced by the next letter of the alphabet: E-A-S-T becomes F-B-T-U." },
  { q: "In a row of 40 students, Ravi is 12th from the left. What is his position from the right?", opts: ["28th", "29th", "27th", "30th"], ans: 1, level: 2, exp: "Position from the right = 40 - 12 + 1 = 29." },
  { q: "Five friends sit in a row. A is to the left of B but to the right of C. Who is in the middle if B is at the extreme right and C at the extreme left of the group of three?", opts: ["A", "B", "C", "Cannot be determined"], ans: 0, level: 3, exp: "With C at the left and B at the right, A sits between them." },
  { q: "Which number replaces the question mark: 8, 27, 64, 125, ?", opts: ["216", "200", "196", "225"], ans: 0, level: 2, exp: "These are cubes: 2^3, 3^3, 4^3, 5^3, so the next is 6^3 = 216." },
  { q: "A clock shows 3 o'clock. What is the angle between the hour and minute hands?", opts: ["45 degrees", "60 degrees", "90 degrees", "120 degrees"], ans: 2, level: 1, exp: "Each hour mark is 30 degrees apart, so 3 marks give 90 degrees." },
  { q: "If 'blue' means 'green', 'green' means 'yellow' and 'yellow' means 'red', what is the colour of fresh grass?", opts: ["Green", "Yellow", "Blue", "Red"], ans: 1, level: 3, exp: "Grass is green, and in the code 'green' is called 'yellow'." }
];
