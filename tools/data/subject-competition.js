"use strict";
/**
 * Multi-subject competitive exam question pools and verified subject table
 * transforms covering Science (General Science, Physics, Chemistry, Biology,
 * Environment, Inventions), Mathematics, Quantitative Aptitude, Logical
 * Reasoning, English & Grammar, Social Studies (Polity, History, Geography,
 * Economics), Computer Awareness, Static GK, Sports, Awards, Books, Days and
 * Abbreviations.
 *
 * Every question is grounded in verified facts, theorems, formulas or language
 * rules from competitive exams (SSC CGL/CHSL, RRB NTPC, IBPS/SBI PO, UPSC/CDS,
 * NDA and State PSC) — never random arithmetic filler and never duplicating
 * stems already published by tools/tables.js.
 */
const countries = require("./countries");
const elements = require("./elements");
const india = require("./india");
const science = require("./science");
const history = require("./history");
const polity = require("./polity");
const gk = require("./gk-world");
const economics = require("./economics");
const geography = require("./geography");
const english = require("./english");
const currentAffairs = require("./current-affairs");
const computers = require("./computers");
const abbr = require("./abbreviations");
const environment = require("./environment");

/**
 * Rich multi-subject groups for Mathematics, Quantitative Aptitude, Reasoning,
 * Science (Physics, Chemistry, Biology), English & Grammar, and General Studies.
 */
const SUBJECT_GROUPS = [
  /* ================================================================== */
  /* MATHEMATICS                                                        */
  /* ================================================================== */
  {
    topic: "Competitive Mathematics — Algebra, Trigonometry, Geometry & Mensuration",
    category: "mathematics",
    secondaryCategory: "quantitative-aptitude",
    level: 2,
    forms: [
      {
        q: "In competitive mathematics, what is the exact formula or value for '{0}'?",
        a: 1,
        exp: "{0}: {1} ({2})."
      },
      {
        q: "Which mathematical theorem, property or identity is stated as: '{1}' ({2})?",
        a: 0,
        exp: "{0} — {1} ({2})."
      }
    ],
    rows: [
      ["Pythagorean Trigonometric Identity for Cosecant and Cotangent", "cosec^2(theta) - cot^2(theta) = 1", "derived by dividing sin^2(theta) + cos^2(theta) = 1 throughout by sin^2(theta)"],
      ["Sine of Double Angle Identity (sin 2A)", "2 sin(A) cos(A) = 2 tan(A) / (1 + tan^2(A))", "expresses sin(2A) in terms of either sine and cosine or tangent of angle A"],
      ["Cosine of Double Angle Identity (cos 2A)", "cos^2(A) - sin^2(A) = 2 cos^2(A) - 1 = 1 - 2 sin^2(A)", "fundamental double-angle formula in trigonometry used across calculus and geometry"],
      ["Tangent of Double Angle Identity (tan 2A)", "2 tan(A) / (1 - tan^2(A))", "valid whenever tan(A) != +-1 in trigonometric simplification"],
      ["Law of Cosines in a Triangle with sides a, b, c", "c^2 = a^2 + b^2 - 2ab cos(C)", "generalizes the Pythagorean theorem to any triangle with included angle C"],
      ["Law of Sines in a Triangle with circumradius R", "a / sin(A) = b / sin(B) = c / sin(C) = 2R", "relates the sides of any triangle to the sines of its opposite angles and its circumradius R"],
      ["Area of an Equilateral Triangle of side 'a'", "(sqrt(3) / 4) * a^2", "derived from (1/2) * base * height where the altitude is (sqrt(3) / 2) * a"],
      ["Altitude (Height) of an Equilateral Triangle of side 'a'", "(sqrt(3) / 2) * a", "dividing an equilateral triangle along its altitude forms two 30-60-90 right triangles"],
      ["Inradius (r) and Circumradius (R) Ratio in an Equilateral Triangle", "R : r = 2 : 1 (where R = a / sqrt(3) and r = a / (2 * sqrt(3)))", "in an equilateral triangle the centroid, incentre, circumcentre and orthocentre coincide"],
      ["Inradius of any Triangle with Area Delta and Semi-perimeter s", "r = Delta / s", "relates the area Delta of a triangle to its semi-perimeter s = (a + b + c)/2 and inscribed circle radius r"],
      ["Circumradius of any Triangle with sides a, b, c and Area Delta", "R = (a * b * c) / (4 * Delta)", "gives the radius of the circumscribed circle passing through all three vertices"],
      ["Inradius of a Right-Angled Triangle with legs a, b and hypotenuse c", "r = (a + b - c) / 2", "special case of tangents from vertices to the incircle of a right-angled triangle"],
      ["Circumradius of a Right-Angled Triangle with hypotenuse c", "R = c / 2 (midpoint of the hypotenuse)", "by Thales' theorem, the angle in a semicircle is 90 degrees so the hypotenuse is the diameter"],
      ["Apollonius's Theorem for Median m_a to side a in a Triangle", "b^2 + c^2 = 2(m_a^2 + (a/2)^2)", "relates the length of a median of a triangle to the lengths of its three sides"],
      ["Sum of Interior Angles of an n-sided Convex Polygon", "(n - 2) * 180 degrees", "any n-gon can be partitioned into (n - 2) non-overlapping triangles from one vertex"],
      ["Each Interior Angle of a Regular n-sided Polygon", "[(n - 2) * 180] / n degrees (or 180 - 360/n degrees)", "since all interior angles are equal and each exterior angle is 360/n degrees"],
      ["Total Number of Diagonals in an n-sided Convex Polygon", "n(n - 3) / 2", "choosing any 2 of n vertices gives nC2 segments, minus the n sides of the polygon"],
      ["Euler's Polyhedral Formula for any Convex Polyhedron", "V - E + F = 2 (Vertices minus Edges plus Faces equals 2)", "topological invariant holding for all convex polyhedra such as tetrahedron, cube and icosahedron"],
      ["Curved Surface Area and Volume of a Right Circular Cone (radius r, height h, slant height l)", "CSA = pi * r * l and Volume = (1/3) * pi * r^2 * h, where l = sqrt(r^2 + h^2)", "cone volume is exactly one-third the volume of a cylinder with the same base and height"],
      ["Volume of a Frustum of a Right Circular Cone (radii R and r, height h)", "(1/3) * pi * h * (R^2 + r^2 + R*r)", "obtained by subtracting the smaller upper cone from the full original cone"],
      ["Total Surface Area of a Solid Hemisphere of radius r", "3 * pi * r^2 (2 * pi * r^2 curved surface + pi * r^2 circular base)", "includes both the dome-shaped curved surface and the flat circular base"],
      ["Length of the Longest Space Diagonal of a Cuboid (l x b x h)", "sqrt(l^2 + b^2 + h^2)", "found by applying the Pythagorean theorem twice in three dimensions"],
      ["Vieta's Formulas for Roots alpha and beta of ax^2 + bx + c = 0", "alpha + beta = -b/a and alpha * beta = c/a", "relates the sum and product of roots directly to the coefficients of the quadratic equation"],
      ["Algebraic Identity for a^3 + b^3 + c^3 - 3abc", "(a + b + c)(a^2 + b^2 + c^2 - ab - bc - ca)", "implies that whenever a + b + c = 0, a^3 + b^3 + c^3 is equal to 3abc"],
      ["Sum of an Infinite Geometric Progression (|r| < 1)", "S_infinity = a / (1 - r)", "converges when the absolute value of the common ratio r is strictly less than 1"],
      ["Nth Term and Sum of n Terms of an Arithmetic Progression (first term a, common difference d)", "T_n = a + (n - 1)d and S_n = (n/2)[2a + (n - 1)d]", "foundational progression formulas for evenly spaced sequences"],
      ["Centroid of a Triangle with vertices (x1, y1), (x2, y2) and (x3, y3)", "((x1 + x2 + x3) / 3, (y1 + y2 + y3) / 3)", "the centroid divides each median in the internal ratio 2 : 1"],
      ["Perpendicular Distance from Point (x0, y0) to Line Ax + By + C = 0", "|Ax0 + By0 + C| / sqrt(A^2 + B^2)", "standard coordinate geometry formula for point-to-line distance"],
      ["Empirical Relationship Connecting Mean, Median and Mode (Karl Pearson's Formula)", "Mode = 3 * Median - 2 * Mean", "approximates the relationship among central tendency measures for moderately skewed distributions"],
      ["Number of Subsets and Proper Subsets of a Finite Set with n Elements", "2^n total subsets and (2^n - 1) proper subsets", "each of the n elements can either be included or excluded independently"]
    ]
  },

  /* ================================================================== */
  /* QUANTITATIVE APTITUDE                                              */
  /* ================================================================== */
  {
    topic: "Quantitative Aptitude — Commercial Arithmetic, Work, Time & Numbers",
    category: "quantitative-aptitude",
    secondaryCategory: "mathematics",
    level: 2,
    forms: [
      {
        q: "In quantitative aptitude exams, how is '{0}' calculated or expressed?",
        a: 1,
        exp: "{0}: {1} ({2})."
      },
      {
        q: "Which quantitative aptitude rule or problem type yields the result '{1}' ({2})?",
        a: 0,
        exp: "{0} — {1} ({2})."
      }
    ],
    rows: [
      ["Difference Between Compound Interest and Simple Interest for 2 Years on Principal P at R% p.a.", "P * (R / 100)^2", "represents the interest earned in the second year on the first year's interest"],
      ["Difference Between Compound Interest and Simple Interest for 3 Years on Principal P at R% p.a.", "P * (R / 100)^2 * (3 + R / 100)", "standard shortcut used in banking and SSC aptitude papers for 3-year CI-SI problems"],
      ["Net Equivalent Single Discount for Two Successive Discounts of x% and y%", "(x + y - (x * y) / 100)%", "because the second discount y% applies to the already reduced price (100 - x)"],
      ["Dishonest Dealer Profit Percentage Using False Weight F instead of True Weight T (at cost price)", "[(T - F) / F] * 100%", "gain is always calculated on the actual quantity F parted with by the shopkeeper"],
      ["Selling Two Articles at the Same Selling Price, One at x% Profit and the Other at x% Loss", "Always a net loss of (x^2 / 100)%", "when selling prices are equal and profit% equals loss% = x, the transaction always results in (x/10)^2 % loss"],
      ["Percentage Reduction in Consumption Needed to Keep Expenditure Unchanged After an R% Price Rise", "[R / (100 + R)] * 100%", "since Price * Consumption = Constant, multiplying by 100/(100+R) offsets an R% increase"],
      ["Percentage Increase in Consumption Allowed to Keep Expenditure Unchanged After an R% Price Drop", "[R / (100 - R)] * 100%", "offsets a price factor of (100 - R)/100 so total outlay remains constant"],
      ["Combined Time Taken by A (alone in x days) and B (alone in y days) Working Together", "(x * y) / (x + y) days", "their combined 1-day work is 1/x + 1/y = (x + y)/(xy)"],
      ["Combined Time Taken by Three Workers A, B and C (alone in x, y and z days respectively)", "(x * y * z) / (xy + yz + zx) days", "the reciprocal of the sum of their individual daily work rates 1/x + 1/y + 1/z"],
      ["Ratio of Speeds of Two Trains Taking t1 and t2 Seconds to Reach Destination After Meeting Each Other", "Speed_1 : Speed_2 = sqrt(t2) : sqrt(t1)", "if two trains start simultaneously from A and B and take t1, t2 after crossing, S1/S2 = sqrt(t2/t1)"],
      ["Speed of Boat in Still Water (u) and Speed of Stream (v) from Downstream (D) and Upstream (U) Speeds", "u = (D + U) / 2 and v = (D - U) / 2", "since D = u + v and U = u - v, adding and subtracting gives boat speed and current speed"],
      ["Remaining Pure Liquid After n Repeated Replacements of r Litres from a Vessel of Capacity V", "V * (1 - r / V)^n units", "each draw removes a fraction r/V of the pure liquid remaining at that step"],
      ["Rule of Alligation for Mixing Cheaper (c) and Dearer (d) Ingredients to Obtain Mean Price (m)", "Quantity of Cheaper : Quantity of Dearer = (d - m) : (m - c)", "derived from the weighted average equation (q_c * c + q_d * d) / (q_c + q_d) = m"],
      ["Total Number of Positive Divisors (Factors) of N = p^a * q^b * r^c (where p, q, r are distinct primes)", "(a + 1)(b + 1)(c + 1)", "each prime factor p can be chosen from power 0 up to power a, giving (a + 1) choices"],
      ["Highest Power of a Prime p Dividing n! (Legendre's Formula)", "floor(n / p) + floor(n / p^2) + floor(n / p^3) + ...", "used to count trailing zeros in n! by finding the exponent of prime 5 in n!"],
      ["Mean Proportional and Third Proportional to Two Positive Numbers a and b", "Mean proportional = sqrt(a * b); Third proportional = b^2 / a", "from a : x :: x : b (so x^2 = ab) and a : b :: b : y (so y = b^2/a)"],
      ["Euler's Totient Function phi(N) for Count of Integers <= N Coprime to N", "N * (1 - 1/p1) * (1 - 1/p2) ... for distinct prime factors p1, p2, ...", "used in modular arithmetic to find remainders of large powers via Euler's theorem"],
      ["Average of the First n Consecutive Odd Natural Numbers (1, 3, 5, ..., 2n - 1)", "n (since their sum is n^2)", "the sum of the first n odd positive integers is n^2, so their arithmetic mean is n^2 / n = n"],
      ["Average of the First n Consecutive Even Natural Numbers (2, 4, 6, ..., 2n)", "n + 1 (since their sum is n(n + 1))", "the sum of the first n even positive integers is n(n + 1), giving an average of n + 1"],
      ["Time Taken by a Train of Length L_1 at Speed S to Cross a Platform or Bridge of Length L_2", "(L_1 + L_2) / S", "the train must cover its own length plus the full length of the platform"]
    ]
  },

  /* ================================================================== */
  /* LOGICAL & VERBAL REASONING                                         */
  /* ================================================================== */
  {
    topic: "Logical, Verbal & Analytical Reasoning in Competitive Exams",
    category: "reasoning",
    secondaryCategory: "general-awareness",
    level: 2,
    forms: [
      {
        q: "In competitive logical reasoning, what is the exact rule or answer for '{0}'?",
        a: 1,
        exp: "{0}: {1} ({2})."
      },
      {
        q: "Which logical reasoning concept or puzzle rule is defined by '{1}' ({2})?",
        a: 0,
        exp: "{0} — {1} ({2})."
      }
    ],
    rows: [
      ["Angle Between the Hour Hand and Minute Hand of a Clock at H hours and M minutes", "|30*H - (11/2)*M| degrees (or 360 minus that value for the reflex angle)", "the hour hand moves 0.5 degrees per minute while the minute hand moves 6 degrees per minute"],
      ["Number of Times the Hands of a Clock Coincide (0 degrees apart) in 12 Hours and 24 Hours", "11 times in 12 hours and 22 times in 24 hours", "between 11 o'clock and 1 o'clock the hands coincide only once, at 12:00"],
      ["Number of Times the Hands of a Clock Form a Right Angle (90 degrees) in 12 Hours and 24 Hours", "22 times in 12 hours and 44 times in 24 hours", "one right-angle position is shared in the 2-4 window and another in the 8-10 window"],
      ["Number of Times the Hands of a Clock Point in Opposite Directions (180 degrees) in 24 Hours", "22 times in 24 hours (11 times every 12 hours)", "between 5 o'clock and 7 o'clock they are opposite only once, at 6:00"],
      ["Mirror Image Time of a 12-Hour Clock Showing H : M", "Subtract the given time from 11:60 (or 23:60 when H = 12)", "lateral inversion across the vertical 12-6 axis maps time T to (12:00 - T)"],
      ["Number of Odd Days in 100, 200, 300 and 400 Consecutive Calendar Years", "5 odd days in 100 years, 3 in 200 years, 1 in 300 years, and 0 in 400 years", "100 years contain 76 ordinary years and 24 leap years = 124 odd days == 5 (mod 7)"],
      ["Calendar Year Repetition Rule for an Immediate Post-Leap Year (Leap + 1)", "Repeats after 6 years (whereas Leap + 2 and Leap + 3 repeat after 11 years, and a Leap year repeats after 28 years)", "because 6 years containing one leap year accumulate 6 + 1 = 7 == 0 (mod 7) odd days"],
      ["Number of Smaller Cubes with Exactly 3 Faces Painted When a Painted Cube is Cut into n^3 Cubes", "Always 8 (the 8 corner cubes, for any n >= 2)", "only the 8 vertices of a cube have three exposed outer faces"],
      ["Number of Smaller Cubes with Exactly 2 Faces Painted When a Painted Cube is Cut into n^3 Cubes", "12 * (n - 2)", "located along the 12 edges of the cube excluding the 2 corners on each edge"],
      ["Number of Smaller Cubes with Exactly 1 Face Painted When a Painted Cube is Cut into n^3 Cubes", "6 * (n - 2)^2", "located in the interior of each of the 6 faces of the cube"],
      ["Number of Smaller Cubes with 0 Faces Painted (Unpainted Inner Core) in an n x n x n Cut Cube", "(n - 2)^3", "forms an inner cube of side (n - 2) completely hidden from the surface"],
      ["Minimum Number of Straight Cuts Required to Divide a Cube into n^3 Identical Smaller Cubes", "3 * (n - 1) cuts (n - 1 cuts along each of the 3 mutually perpendicular axes)", "each axis requires (n - 1) parallel planar cuts to produce n layers"],
      ["Standard Die Rule in Dice Reasoning Problems", "The sum of numbers on any two opposite faces of a standard die is always 7 (1-6, 2-5, 3-4)", "therefore no two numbers summing to 7 can ever appear on adjacent visible faces of a standard die"],
      ["Total Persons in a Linear Row Given One Person's Rank from Left (L) and Right (R)", "Total = L + R - 1", "subtract 1 because the reference person is counted in both L and R"],
      ["Opposite Letter Pair Rule in English Alphabet Reasoning (A-Z, B-Y, C-X, ...)", "The sum of the forward alphabetical positions of any opposite letter pair is always 27", "for example, A(1) + Z(26) = 27, E(5) + V(22) = 27, and M(13) + N(14) = 27"],
      ["Logical Equivalence (Contrapositive) of the Conditional Statement 'If P then Q'", "'If not Q, then not P' (~Q -> ~P)", "a conditional statement is logically equivalent to its contrapositive, not its converse or inverse"],
      ["Complementary Pair ('Either-Or') Condition in Syllogism Conclusions", "Two conclusions sharing the same subject and predicate, both individually uncertain, forming 'Some A are B + No A is B' or 'All A are B + Some A are not B'", "at least one of the two complementary propositions must be true in every possible Venn diagram"],
      ["Shadow Direction Rule at Sunrise (Morning) in Direction Sense Problems", "At sunrise the Sun is in the East, so every shadow falls towards the West (to the left of a person facing North, and to the right of a person facing South)", "conversely, at sunset the Sun is in the West and shadows fall towards the East"],
      ["Number of Handshakes (or Round-Robin Matches) Among n Persons When Everyone Shakes Hands Once", "n(n - 1) / 2 (i.e., nC2)", "each of the n participants shakes hands with (n - 1) others, divided by 2 to avoid double counting"],
      ["Minimum Number of Colours Needed to Colour Any Planar Map (Four-Colour Theorem)", "4 colours", "no two adjacent regions sharing a boundary segment require a fifth colour on a plane or sphere"]
    ]
  },

  /* ================================================================== */
  /* PHYSICS                                                            */
  /* ================================================================== */
  {
    topic: "Core Physics Laws, Optics, Electricity & Mechanics in Competitive Exams",
    category: "physics",
    secondaryCategory: "general-science",
    level: 2,
    forms: [
      {
        q: "In physics, what does '{0}' state or explain?",
        a: 1,
        exp: "{0} — {1} ({2})."
      },
      {
        q: "Which physical law, principle or phenomenon accounts for '{2}'?",
        a: 0,
        exp: "{0}: {1} ({2})."
      }
    ],
    rows: [
      ["Snell's Law of Refraction", "The ratio of the sine of the angle of incidence to the sine of the angle of refraction is constant (n1 * sin(i) = n2 * sin(r))", "governs the bending of light rays when passing from one optical medium to another"],
      ["Lenz's Law of Electromagnetic Induction", "The direction of an induced electromotive force always opposes the change in magnetic flux that produces it", "represents a direct consequence of the law of conservation of energy in electromagnetism"],
      ["Faraday's First and Second Laws of Electromagnetic Induction", "An EMF is induced whenever magnetic flux changes, with magnitude E = -N * (dPhi / dt)", "forms the operating principle of AC electric generators and transformers"],
      ["Kirchhoff's Current Law (Junction Rule) and Voltage Law (Loop Rule)", "KCL (sum of currents at a node = 0) is based on conservation of electric charge; KVL (sum of EMFs and potential drops in a closed loop = 0) is based on conservation of energy", "fundamental laws for analysing complex electrical circuits"],
      ["Joule's Law of Heating in an Electric Conductor", "Heat produced H = I^2 * R * t (proportional to square of current, resistance and time)", "explains the working of electric heaters, irons and safety fuse wires"],
      ["Archimedes' Principle of Buoyancy", "A body wholly or partially immersed in a fluid experiences an upward buoyant force equal to the weight of the fluid displaced", "used in designing ships, submarines, hydrometers and lactometers"],
      ["Pascal's Law of Fluid Pressure", "Pressure applied to an enclosed incompressible fluid is transmitted undiminished to every portion of the fluid and the walls of the container", "working principle of hydraulic brakes, hydraulic lifts and hydraulic presses"],
      ["Surface Tension and Capillary Action", "Cohesive forces minimize liquid surface area, making raindrops spherical and allowing oil to rise in a lamp wick", "surface tension decreases when temperature increases or when detergent is added to water"],
      ["Doppler Effect in Sound and Light Waves", "Apparent shift in observed frequency of a wave due to relative motion between the source and the observer", "used in police radar speed guns, echocardiography and measuring astronomical redshift of galaxies"],
      ["Rayleigh Scattering of Sunlight", "Intensity of scattered light is inversely proportional to the fourth power of wavelength (I prop 1 / lambda^4)", "explains why the clear daytime sky appears blue and the Sun appears red at sunrise and sunset"],
      ["Myopia (Short-Sightedness) and Hypermetropia (Long-Sightedness) Correction", "Myopia (image forms in front of retina) is corrected using a concave (diverging) lens; Hypermetropia (image forms behind retina) is corrected using a convex (converging) lens", "Presbyopia in ageing eyes is corrected using a bifocal lens"],
      ["Convex Rear-View Mirror in Vehicles", "Always forms a virtual, erect and diminished image, providing a wider field of view of traffic behind", "concave mirrors are used instead in vehicle headlights, shaving mirrors and solar concentrators"],
      ["Step-Up and Step-Down Transformers", "Operate on mutual electromagnetic induction (AC only) to change voltage while keeping frequency and ideal power (V_p * I_p = V_s * I_s) constant", "laminated silicon-steel cores are used to minimize eddy current and hysteresis losses"],
      ["First Law of Thermodynamics", "Change in internal energy Delta_U = Q - W (heat supplied minus work done by the system)", "statement of the law of conservation of energy applied to thermal systems"],
      ["Wien's Displacement Law of Blackbody Radiation", "lambda_max * T = b (the wavelength of peak emission is inversely proportional to absolute temperature T)", "explains why hotter stars appear blue-white while cooler stars appear red"]
    ]
  },

  /* ================================================================== */
  /* CHEMISTRY                                                          */
  /* ================================================================== */
  {
    topic: "Core Chemistry — Reactions, Metallurgy, Polymers & Solutions",
    category: "chemistry",
    secondaryCategory: "general-science",
    level: 2,
    forms: [
      {
        q: "In chemistry, what is the key composition, catalyst or property of '{0}'?",
        a: 1,
        exp: "{0} — {1} ({2})."
      },
      {
        q: "Which chemical process, alloy or substance is characterised by '{2}'?",
        a: 0,
        exp: "{0}: {1} ({2})."
      }
    ],
    rows: [
      ["Haber-Bosch Process for Ammonia Synthesis", "Finely divided Iron (Fe) catalyst with Molybdenum (Mo) promoter at 450-500 C and 200 atm", "synthesizes ammonia (NH3) directly from nitrogen (N2) and hydrogen (H2) gas"],
      ["Contact Process for Sulphuric Acid (H2SO4) Manufacture", "Vanadium pentoxide (V2O5) catalyst", "oxidizes sulphur dioxide (SO2) to sulphur trioxide (SO3) to produce King of Chemicals H2SO4"],
      ["Ostwald Process for Nitric Acid (HNO3) Manufacture", "Platinum-Rhodium (Pt/Rh) gauze catalyst", "catalytically oxidizes ammonia (NH3) to nitric oxide (NO) en route to nitric acid"],
      ["Hydrogenation of Vegetable Oils to Vanaspati Ghee", "Finely divided Nickel (Ni) catalyst", "converts unsaturated liquid vegetable oils into saturated semi-solid fats by adding H2"],
      ["Bronze, Brass and German Silver Alloys", "Bronze = Copper + Tin (Cu + Sn); Brass = Copper + Zinc (Cu + Zn); German Silver = Copper + Zinc + Nickel (contains 0% silver)", "frequently tested alloy compositions in SSC and Railway science papers"],
      ["Solder and Fuse Wire Alloy Composition", "Alloy of Lead (Pb) and Tin (Sn)", "possesses a low melting point and high resistivity so fuse wire melts safely on overload"],
      ["Stainless Steel Alloy Composition", "Iron (Fe) alloyed with Chromium (Cr, ~18%), Nickel (Ni, ~8%) and Carbon (C)", "chromium forms a passive oxide layer that prevents rusting and corrosion"],
      ["Bauxite, Haematite, Galena, Cinnabar and Pitchblende Ores", "Bauxite = Aluminium (Al2O3.2H2O); Haematite = Iron (Fe2O3); Galena = Lead (PbS); Cinnabar = Mercury (HgS); Pitchblende = Uranium (UO2)", "principal metallic ores asked in competitive chemistry exams"],
      ["Aqua Regia ('Royal Water')", "Freshly prepared 3 : 1 molar mixture of concentrated Hydrochloric Acid (HCl) and concentrated Nitric Acid (HNO3)", "capable of dissolving noble metals such as gold (Au) and platinum (Pt)"],
      ["Vulcanization of Natural Rubber (cis-1,4-polyisoprene)", "Heating natural rubber with 3-5% Sulphur (discovered by Charles Goodyear)", "forms sulphur cross-links between polymer chains to improve elasticity and tensile strength"],
      ["Teflon (Polytetrafluoroethylene, PTFE) and Bakelite", "Teflon is a polymer of tetrafluoroethylene (CF2=CF2) used for non-stick cookware; Bakelite is a thermosetting phenol-formaldehyde resin used for electrical switches", "classic addition vs condensation polymers in everyday chemistry"],
      ["Permanent Hardness of Water and Clark's / Washing Soda Method", "Caused by dissolved chlorides and sulphates of Calcium (Ca2+) and Magnesium (Mg2+); removed using Washing Soda (Na2CO3) or Ion-Exchange resins", "temporary hardness is caused by bicarbonates of Ca and Mg and can be removed simply by boiling"],
      ["Isotopes, Isobars and Isotones in Nuclear Chemistry", "Isotopes have same atomic number Z (protons); Isobars have same mass number A (nucleons); Isotones have same number of neutrons (A - Z)", "e.g., 14C and 14N are isobars, whereas 14C and 16O (both with 8 neutrons) are isotones"],
      ["Anodising of Aluminium", "Electrolytic process forming a thick protective layer of Aluminium Oxide (Al2O3) on aluminium where the article acts as the anode", "increases corrosion resistance and allows dyeing of aluminium surfaces"],
      ["Boyle's Law, Charles's Law and Avogadro's Law (Ideal Gas PV = nRT)", "Boyle's: P prop 1/V (at constant T); Charles's: V prop T (at constant P); Avogadro's: V prop n (at constant T and P)", "One mole of any ideal gas occupies 22.4 litres at STP (273.15 K and 1 atm)"]
    ]
  },

  /* ================================================================== */
  /* BIOLOGY                                                            */
  /* ================================================================== */
  {
    topic: "Core Biology — Cell Biology, Genetics, Human & Plant Physiology",
    category: "biology",
    secondaryCategory: "general-science",
    level: 2,
    forms: [
      {
        q: "In biology, what is the primary function or characteristic of '{0}'?",
        a: 1,
        exp: "{0} — {1} ({2})."
      },
      {
        q: "Which biological structure, hormone or process is responsible for '{2}'?",
        a: 0,
        exp: "{0}: {1} ({2})."
      }
    ],
    rows: [
      ["Mitochondria and Chloroplasts (Semi-Autonomous Organelles)", "Both possess their own circular DNA and 70S ribosomes and can synthesize some of their own proteins", "mitochondria generate ATP via cellular respiration ('powerhouse of the cell') while chloroplasts perform photosynthesis"],
      ["Lysosomes ('Suicidal Bags' of the Cell)", "Membrane-bound organelles discovered by Christian de Duve containing hydrolytic enzymes (acid hydrolases)", "digest worn-out organelles (autophagy) and foreign pathogens, and can lyse damaged cells"],
      ["Ribosomes (Palade Particles)", "Non-membrane-bound ribonucleoprotein complexes (70S in prokaryotes, 80S in eukaryotes) that serve as the site of protein synthesis (translation)", "assemble amino acids into polypeptide chains according to mRNA codons"],
      ["Xylem and Phloem Vascular Tissues in Plants", "Xylem transports water and dissolved minerals unidirectionally upward from roots; Phloem translocates photosynthetic sugars bidirectionally from leaves", "discovered and named by Carl Nageli; ringing/girdling experiments demonstrate phloem transport"],
      ["Plant Hormones (Phytohormones): Auxin, Gibberellin, Cytokinin, Abscisic Acid and Ethylene", "Auxin promotes apical dominance and phototropism; Gibberellin promotes stem elongation and breaks seed dormancy; Cytokinin promotes cell division; Abscisic Acid (ABA) induces stomatal closure ('stress hormone'); Ethylene is a gaseous hormone that ripens fruit", "five classical phytohormone classes tested in competitive biology"],
      ["ABO Blood Grouping and Rh Factor (Karl Landsteiner)", "Blood group O-negative (O-) is the universal red-cell donor (lacks A, B and Rh antigens); AB-positive (AB+) is the universal recipient (lacks anti-A, anti-B and anti-Rh antibodies)", "erythroblastosis fetalis can occur when an Rh-negative mother carries an Rh-positive fetus"],
      ["Pacemaker of the Human Heart (Sinoatrial Node, SA Node)", "Located in the upper right wall of the right atrium, it initiates the cardiac action potential (70-75 beats/min)", "hence the SA node is called the natural pacemaker of the mammalian heart"],
      ["Nephron — Structural and Functional Unit of the Human Kidney", "Comprises Bowman's capsule, glomerulus, PCT, Loop of Henle and DCT; performs ultrafiltration, selective reabsorption and tubular secretion", "each human kidney contains approximately 1 million nephrons"],
      ["Endocrine Glands: Pituitary, Thyroid, Adrenal and Islets of Langerhans", "Pituitary is the 'Master Gland' (controlled by hypothalamus); Thyroid secretes thyroxine (requires iodine); Adrenal medulla secretes adrenaline ('fight-or-flight'); Pancreatic beta cells secrete insulin and alpha cells secrete glucagon", "pancreas is a heterocrine (mixed exocrine and endocrine) gland"],
      ["Mitosis (Equational Division) vs Meiosis (Reductional Division)", "Mitosis produces 2 genetically identical diploid (2n) somatic daughter cells; Meiosis produces 4 genetically diverse haploid (n) gametes with crossing-over in Prophase I (Pachytene)", "crossing-over at chiasmata introduces genetic recombination during meiosis"],
      ["Nitrogen Fixation by Rhizobium, Azotobacter and Cyanobacteria (Anabaena/Nostoc)", "Rhizobium forms symbiotic root nodules in leguminous plants using the enzyme nitrogenase (protected from oxygen by leghaemoglobin)", "converts atmospheric dinitrogen (N2) into plant-usable ammonia (NH3)"],
      ["Human Brain Divisions: Cerebrum, Cerebellum and Medulla Oblongata", "Cerebrum (forebrain) governs intelligence, memory and voluntary actions; Cerebellum (hindbrain) maintains posture, balance and muscular coordination; Medulla Oblongata controls involuntary reflexes like heartbeat, breathing and vomiting", "the hypothalamus regulates body temperature (thermoregulation), hunger and thirst"],
      ["DNA Double Helix (Watson & Crick) and Chargaff's Base-Pairing Rule", "Adenine (A) pairs with Thymine (T) via 2 hydrogen bonds (or Uracil in RNA), and Guanine (G) pairs with Cytosine (C) via 3 hydrogen bonds", "purines (A, G) always equal pyrimidines (T, C) in double-stranded DNA"],
      ["Human Dental Formula and Enamel", "Adult dental formula is 2-1-2-3 / 2-1-2-3 (= 32 teeth); tooth enamel (composed of calcium hydroxyapatite) is the hardest substance in the human body", "milk dentition in children has the formula 2-1-0-2 / 2-1-0-2 (= 20 teeth, lacking premolars)"],
      ["Bile Juice and Emulsification of Fats", "Produced by the liver and stored in the gallbladder, bile contains no digestive enzymes but emulsifies dietary fats using bile salts into micelles for pancreatic lipase action", "bilirubin and biliverdin are the bile pigments formed from haemoglobin breakdown"]
    ]
  },

  /* ================================================================== */
  /* ENGLISH & GRAMMAR                                                  */
  /* ================================================================== */
  {
    topic: "English Grammar — Voice, Narration, Tenses & Modifiers",
    category: "general-english-grammar",
    secondaryCategory: "english",
    level: 2,
    forms: [
      {
        q: "In competitive English grammar, what is the standard rule regarding '{0}'?",
        a: 1,
        exp: "{0}: {1} ({2})."
      },
      {
        q: "Which English grammar principle states that '{1}' ({2})?",
        a: 0,
        exp: "{0} — {1} ({2})."
      }
    ],
    rows: [
      ["No Sooner ... Than (Inversion Rule)", "'No sooner' is always followed by 'than' (never 'when'), and when placed at the start of a sentence it requires auxiliary-subject inversion (e.g., 'No sooner had the bell rung than the students left')", "contrasts with 'Hardly/Scarcely ... when'"],
      ["Lest ... Should (Negative Purpose Conjunction)", "The conjunction 'lest' means 'for fear that', is inherently negative (never takes 'not'), and is followed by the modal 'should' or bare subjunctive (e.g., 'Walk carefully lest you should fall')", "putting 'not' or 'will' after 'lest' is a common error-spotting trap"],
      ["Unless and Until (Negative Condition and Time Conjunctions)", "'Unless' (condition) and 'Until' (time) already carry a negative meaning, so the clause immediately following them must never contain 'not' or future tense 'will'", "for example: 'Wait here until I return' (not 'until I do not return')"],
      ["One of the + Plural Noun + Singular Verb vs Relative Pronoun Rule", "'One of the + plural noun' takes a singular verb ('One of the boys is absent'), but 'One of the + plural noun + who/that' takes a plural verb agreeing with the antecedent plural noun ('He is one of the players who have scored a century')", " unless 'the only one of' precedes 'who', which reverts to a singular verb"],
      ["Uncountable Nouns Taking Singular Verbs (Information, Advice, Furniture, Luggage, Scenery, Machinery)", "Nouns like information, advice, furniture, luggage, baggage, scenery, poetry, machinery and stationery are uncountable singulars; they never take '-s' or 'a/an' directly", "quantified using 'a piece of advice' or 'items of furniture'"],
      ["Plural-Looking Subjects that are Singular (Mathematics, Physics, Economics, Politics, Measles, Billiards, News)", "Take a singular verb when referring to the academic discipline, disease, game or 'news' (e.g., 'Physics is a fascinating subject; The news is true')", "when preceded by a possessive like 'His mathematics are weak', they refer to calculations and take a plural verb"],
      ["Collective Nouns Always Plural (Cattle, Poultry, Police, Gentry, Peasantry, Clergy, Vermin, Cavalry)", "Always take a plural verb without adding '-s' (e.g., 'The cattle are grazing in the field; The police have arrested the suspect')", "'People' meaning persons is also plural"],
      ["Paired Instrument and Garment Nouns (Scissors, Trousers, Spectacles, Binoculars, Tongs, Pliers)", "Take a plural verb ('My spectacles are missing'), unless preceded by 'A pair of', which takes a singular verb ('A pair of spectacles was bought')", "bipartite nouns consist of two inseparable parts"],
      ["Question Tag Rule for Imperatives and 'Let's' / 'I am'", "The question tag for 'I am ...' is 'aren't I?' (negative) or 'am I?' (for 'I am not'); the tag for 'Let us / Let's ...' is 'shall we?'", "words like hardly, scarcely, rarely, seldom and nobody make a statement negative, so it takes a positive question tag"],
      ["Direct to Indirect Speech (Narration) — Universal Truth and Past Reporting Verb", "When the reported clause expresses a universal truth, scientific fact, proverb or habitual action, its present tense remains unchanged even if the reporting verb is 'said'", "otherwise Present Simple shifts to Past Simple, and Past Simple shifts to Past Perfect"],
      ["Active to Passive Voice with Prepositional Verbs and 'By' Exceptions", "Verbs like 'know', 'oblige' take 'to' ('He is known to me'), 'surprise/astonish/alarm' take 'at', 'satisfy/please/throng' take 'with', and 'contain/interest' take 'in' instead of 'by'", "intransitive verbs cannot be turned into passive voice"],
      ["Order of Personal Pronouns (231 Rule vs 123 Rule)", "For positive or neutral statements with singular pronouns, the order is Second person -> Third person -> First person (2-3-1: 'You, he and I are partners'); for confessing a fault or plural pronouns, the order is 1-2-3 ('I, you and he are to blame')", "standard pronoun ordering rule in SSC and Banking English"],
      ["Gerund Preceded by a Possessive Adjective or Noun", "A noun or pronoun preceding a gerund (-ing verbal noun) must be in the possessive case (e.g., 'I appreciate your helping me', not 'you helping me')", "because the gerund functions as a noun, it is modified by a possessive determiner"],
      ["Subjunctive Mood After 'As if', 'As though' and 'I wish'", "Uses 'were' for all persons to express an unreal present state ('He talks as if he were the boss; I wish I were a bird') and 'had + V3' for an unreal past state", "standard unreal subjunctive in formal English"],
      ["Difference Between 'Few / A few / The few' and 'Little / A little / The little'", "'Few/Little' = hardly any (negative); 'A few/A little' = some (positive); 'The few/The little' = not many/much, but all that is available ('Few' for countable plural nouns, 'Little' for uncountable nouns)", "determiner distinction tested across competitive English papers"]
    ]
  }
];

/**
 * Competitive-exam question generators built over the verified subject datasets
 * in tools/data/*.js using distinct competitive-exam stems that never collide
 * with the base bank stems in tools/tables.js.
 */
const MATH_EXAM_ROWS = [
  ["Regular Pentagon (5 sides): Sum of Interior Angles and Measure of Each Interior Angle", "Sum = 540 degrees; Each interior angle = 108 degrees (5 diagonals)", "For n = 5, (n - 2) * 180 = 540 degrees, 540 / 5 = 108 degrees, and n(n - 3)/2 = 5 diagonals."],
  ["Regular Hexagon (6 sides): Sum of Interior Angles and Measure of Each Interior Angle", "Sum = 720 degrees; Each interior angle = 120 degrees (9 diagonals)", "For n = 6, (n - 2) * 180 = 720 degrees, 720 / 6 = 120 degrees, and 6(3)/2 = 9 diagonals."],
  ["Regular Octagon (8 sides): Sum of Interior Angles and Measure of Each Interior Angle", "Sum = 1080 degrees; Each interior angle = 135 degrees (20 diagonals)", "For n = 8, (n - 2) * 180 = 1080 degrees, 1080 / 8 = 135 degrees, and 8(5)/2 = 20 diagonals."],
  ["Regular Decagon (10 sides): Sum of Interior Angles and Measure of Each Interior Angle", "Sum = 1440 degrees; Each interior angle = 144 degrees (35 diagonals)", "For n = 10, (n - 2) * 180 = 1440 degrees, 1440 / 10 = 144 degrees, and 10(7)/2 = 35 diagonals."],
  ["Regular Dodecagon (12 sides): Sum of Interior Angles and Measure of Each Interior Angle", "Sum = 1800 degrees; Each interior angle = 150 degrees (54 diagonals)", "For n = 12, (n - 2) * 180 = 1800 degrees, 1800 / 12 = 150 degrees, and 12(9)/2 = 54 diagonals."],
  ["Area of a Regular Hexagon of Side Length 'a'", "(3 * sqrt(3) / 2) * a^2 (equal to 6 equilateral triangles of side a)", "A regular hexagon is composed of 6 congruent equilateral triangles, each of area (sqrt(3)/4) * a^2."],
  ["Exact Value of sin(15 degrees) and cos(75 degrees)", "(sqrt(6) - sqrt(2)) / 4  (or (sqrt(3) - 1) / (2 * sqrt(2)))", "Using sin(45 - 30) = sin(45)cos(30) - cos(45)sin(30) = (sqrt(3) - 1) / (2 * sqrt(2))."],
  ["Exact Value of cos(15 degrees) and sin(75 degrees)", "(sqrt(6) + sqrt(2)) / 4  (or (sqrt(3) + 1) / (2 * sqrt(2)))", "Using cos(45 - 30) = cos(45)cos(30) + sin(45)sin(30) = (sqrt(3) + 1) / (2 * sqrt(2))."],
  ["Exact Value of tan(15 degrees) and cot(75 degrees)", "2 - sqrt(3)", "Using tan(45 - 30) = (tan 45 - tan 30) / (1 + tan 45 * tan 30) = (sqrt(3) - 1)/(sqrt(3) + 1) = 2 - sqrt(3)."],
  ["Exact Value of tan(75 degrees) and cot(15 degrees)", "2 + sqrt(3)", "Using tan(45 + 30) = (sqrt(3) + 1)/(sqrt(3) - 1) = 2 + sqrt(3)."],
  ["Maximum and Minimum Values of a*sin(theta) + b*cos(theta)", "Maximum = +sqrt(a^2 + b^2) and Minimum = -sqrt(a^2 + b^2)", "By expressing a*sin(theta) + b*cos(theta) as R*sin(theta + alpha) where R = sqrt(a^2 + b^2)."],
  ["Minimum Value of a*tan^2(theta) + b*cot^2(theta) for Positive a and b", "2 * sqrt(a * b) (by the AM-GM inequality)", "Since tan^2(theta) * cot^2(theta) = 1, AM >= GM gives a*tan^2 + b*cot^2 >= 2*sqrt(ab)."],
  ["Minimum Value of a*sin^2(theta) + b*cosec^2(theta) when a >= b > 0", "a + b (achieved at sin^2(theta) = 1, since sin^2(theta) <= 1)", "When sqrt(b/a) <= 1, the minimum is 2*sqrt(ab); when a >= b, sin^2(theta) cannot exceed 1 so the minimum is a + b."],
  ["Ptolemy's Theorem for a Cyclic Quadrilateral ABCD with Diagonals AC and BD", "AC * BD = (AB * CD) + (BC * DA)", "In any cyclic quadrilateral, the product of the diagonals equals the sum of the products of opposite sides."],
  ["Brahmagupta's Formula for the Area of a Cyclic Quadrilateral with Sides a, b, c, d", "sqrt[(s - a)(s - b)(s - c)(s - d)] where s = (a + b + c + d) / 2", "Generalizes Heron's triangle area formula to any quadrilateral inscribed in a circle."],
  ["Intersecting Chords Theorem (Internal and External Secant-Tangent Power of a Point)", "PA * PB = PC * PD (for chords/secants) and PT^2 = PA * PB (for tangent PT and secant PAB)", "Classic circle geometry theorem tested in SSC CGL Tier-II and CDS mathematics."],
  ["Alternate Segment Theorem in Circle Geometry", "The angle between a tangent and a chord through the point of contact equals the angle subtended by the chord in the alternate segment", "Fundamental circle tangent property in Euclidean geometry."],
  ["Relation Between Centroid (G), Orthocentre (H) and Circumcentre (O) — Euler Line", "G divides the segment joining Orthocentre (H) and Circumcentre (O) internally in the ratio HG : GO = 2 : 1", "On the Euler line of any non-equilateral triangle, H, G and O are collinear with HG = 2 * GO."],
  ["Angle Bisector Theorem (Internal) in Triangle ABC with AD Bisecting Angle A", "BD / DC = AB / AC", "An internal angle bisector divides the opposite side in the ratio of the adjacent sides."],
  ["Area Ratio of Two Similar Triangles ABC and DEF", "Area(ABC) / Area(DEF) = (AB / DE)^2 = (BC / EF)^2 = (AC / DF)^2 (square of the ratio of corresponding sides, medians or altitudes)", "Linear dimensions scale as k while areas scale as k^2 and volumes scale as k^3."],
  ["Condition for a System of Linear Equations a1*x + b1*y + c1 = 0 and a2*x + b2*y + c2 = 0 to Have Infinitely Many Solutions", "a1 / a2 = b1 / b2 = c1 / c2 (coincident lines)", "Unique solution when a1/a2 != b1/b2; no solution (parallel lines) when a1/a2 = b1/b2 != c1/c2."],
  ["Quadratic Equation Constructed from Given Sum of Roots (S) and Product of Roots (P)", "x^2 - S*x + P = 0", "Directly follows from factoring a(x - alpha)(x - beta) = 0."],
  ["If x + (1 / x) = k, then the Values of x^2 + (1 / x^2) and x^3 + (1 / x^3)", "x^2 + (1 / x^2) = k^2 - 2  and  x^3 + (1 / x^3) = k^3 - 3k", "High-frequency algebraic shortcut identity in SSC CGL, CHSL and Railway exams."],
  ["If x - (1 / x) = k, then the Values of x^2 + (1 / x^2) and x^3 - (1 / x^3)", "x^2 + (1 / x^2) = k^2 + 2  and  x^3 - (1 / x^3) = k^3 + 3k", "Obtained by squaring and cubing (x - 1/x) = k respectively."],
  ["Relationship Between Arithmetic Mean (A), Geometric Mean (G) and Harmonic Mean (H) of Two Positive Numbers", "G^2 = A * H  and  A >= G >= H", "For two positive numbers a and b, A = (a+b)/2, G = sqrt(ab) and H = 2ab/(a+b), so A * H = ab = G^2."],
  ["Change of Base Formula and Product/Quotient Laws of Logarithms", "log_b(a) = log(a) / log(b);  log(xy) = log(x) + log(y);  log(x/y) = log(x) - log(y)", "Valid for positive arguments and base b > 0, b != 1."],
  ["Determinant and Inverse of a 2x2 Matrix [[a, b], [c, d]]", "det(A) = ad - bc;  A^(-1) = (1 / (ad - bc)) * [[d, -b], [-c, a]] (exists iff ad - bc != 0)", "A square matrix is invertible (non-singular) if and only if its determinant is non-zero."],
  ["Probability of Drawing an Ace or a King from a Standard 52-Card Deck", "P(Ace) = 4/52 = 1/13;  P(Ace or King) = 8/52 = 2/13", "A standard deck has 4 suits of 13 ranks each, containing 4 Aces, 4 Kings and 12 face cards."],
  ["Total Outcomes and Probability of Getting a Sum of 7 When Two Fair Dice Are Rolled", "6 favourable outcomes out of 36 total outcomes, so Probability = 6/36 = 1/6 (the most likely sum)", "The pairs summing to 7 are (1,6), (2,5), (3,4), (4,3), (5,2) and (6,1)."],
  ["Variance and Standard Deviation Under Linear Transformation Y = aX + b", "SD(aX + b) = |a| * SD(X)  and  Var(aX + b) = a^2 * Var(X) (independent of shift b)", "Adding a constant b shifts every observation equally without changing dispersion."]
];

const QUANT_APTITUDE_ROWS = [
  ["Fractional Equivalent of 16 2/3 % (16.67%) and 83 1/3 % (83.33%)", "16 2/3 % = 1/6  and  83 1/3 % = 5/6", "Standard fraction-to-percentage conversion used for rapid commercial arithmetic."],
  ["Fractional Equivalent of 14 2/7 % (14.28%) and 28 4/7 % (28.57%)", "14 2/7 % = 1/7  and  28 4/7 % = 2/7", "Derived from 100 / 7 = 14 2/7."],
  ["Fractional Equivalent of 12.5%, 37.5%, 62.5% and 87.5%", "12.5% = 1/8,  37.5% = 3/8,  62.5% = 5/8,  87.5% = 7/8", "Multiples of one-eighth (12.5%) in percentage calculations."],
  ["Fractional Equivalent of 11 1/9 % (11.11%) and 9 1/11 % (9.09%)", "11 1/9 % = 1/9  and  9 1/11 % = 1/11", "Reciprocal percentage pair based on 9 * 11 = 99."],
  ["Divisibility Rule for 11 in Number System", "The difference between the sum of digits at odd places and the sum of digits at even places is 0 or a multiple of 11", "Because 10 == -1 (mod 11), alternating powers of 10 alternate in sign modulo 11."],
  ["Divisibility Rule for 8 and 16 in Number System", "Divisible by 8 if the last 3 digits form a number divisible by 8; divisible by 16 if the last 4 digits are divisible by 16", "Because 10^3 = 1000 is divisible by 8 and 10^4 = 10000 is divisible by 16."],
  ["Divisibility Rule for 9 and 3 in Number System", "A number is divisible by 9 (or 3) if and only if the sum of its digits is divisible by 9 (or 3)", "Follows from 10^k == 1 (mod 9) for all non-negative integers k."],
  ["Unit Digit Cyclicity of Powers of 2, 3, 7 and 8", "Period of 4 (unit digits repeat every 4th power; divide exponent by 4 to find the cycle position)", "Whereas digits 0, 1, 5, 6 always retain the same unit digit, and 4 and 9 have a cyclicity of 2."],
  ["Markup Percentage Needed to Earn p% Profit After Allowing d% Discount on Marked Price", "Marked Price : Cost Price = (100 + p) : (100 - d)", "Since SP = MP * (100 - d)/100 = CP * (100 + p)/100, the ratio MP/CP is always (100 + p)/(100 - d)."],
  ["Profit Percentage When the Cost Price of x Articles Equals the Selling Price of y Articles", "[(x - y) / y] * 100% (profit when x > y; loss when x < y)", "Because CP * x = SP * y implies SP / CP = x / y, so gain% = (x - y)/y * 100%."],
  ["Simple Interest Doubling and k-Fold Rule", "If a sum doubles in T years under Simple Interest, it becomes k times of itself in (k - 1) * T years", "Under Simple Interest, interest earned is constant each year; doubling adds 1P in T years, so (k-1)P takes (k-1)T years."],
  ["Compound Interest Doubling and Power-of-2 Rule", "If a sum becomes 2 times in T years under Compound Interest, it becomes 2^m times of itself in (m * T) years", "Under Compound Interest, the principal multiplies by the same factor every T-year period."],
  ["Effective Annual Rate for r% Nominal Interest Compounded Half-Yearly", "(r + (r^2 / 400))% per annum (since the half-yearly rate is r/2 % applied twice)", "Two successive compoundings of (r/2)% yield r/2 + r/2 + (r/2)^2 / 100 = r + r^2/400 %."],
  ["Inlet Pipe (Fills in x Hours) and Outlet Leak (Empties in y Hours) Operating Together", "Net time to fill the cistern = (x * y) / (y - x) hours (when y > x)", "In 1 hour, net fraction filled is (1/x) - (1/y) = (y - x)/(xy)."],
  ["Chain Rule of Work Equivalence (M1 Men, D1 Days, H1 Hours/Day, Work W1)", "(M1 * D1 * H1) / W1 = (M2 * D2 * H2) / W2", "Total man-hours expended is directly proportional to the amount of work completed."],
  ["Relative Speed of Two Bodies Moving with Speeds S1 and S2", "(S1 + S2) when moving in opposite directions; |S1 - S2| when moving in the same direction", "Used for train overtaking, crossing and circular track meeting problems."],
  ["Conversion Between Speed in km/hr and m/s", "1 km/hr = 5/18 m/s  and  1 m/s = 18/5 km/hr", "Because 1000 metres / 3600 seconds simplifies to 5/18 m/s."],
  ["New Average When a Member of Value 'Old' is Replaced by 'New' in a Group of n Members", "New Average = Old Average + (New - Old) / n", "Total sum changes by (New - Old), which distributes equally across all n members."],
  ["Compound Ratio and Duplicate / Sub-duplicate Ratios of a : b", "Duplicate ratio = a^2 : b^2;  Sub-duplicate ratio = sqrt(a) : sqrt(b);  Triplicate ratio = a^3 : b^3", "Standard ratio terminology tested in competitive aptitude exams."],
  ["Sum of All Positive Divisors of N = p^a * q^b (for Distinct Primes p, q)", "[(p^(a+1) - 1) / (p - 1)] * [(q^(b+1) - 1) / (q - 1)]", "Product of geometric series sums (1 + p + ... + p^a)(1 + q + ... + q^b)."]
];

const SUBJECT_TABLE_SPECS = [
  /* ---- MATHEMATICS ---- */
  {
    category: "mathematics",
    topic: "Mathematics — Geometry, Trigonometry, Algebra & Statistics",
    rows: MATH_EXAM_ROWS,
    forms: [
      { q: "In competitive mathematics, what is the exact result or formula for '{0}'?", a: 1, exp: "{0}: {1}. {2}" },
      { q: "Which mathematical theorem, identity or configuration gives '{1}'?", a: 0, exp: "{0} — {1}. {2}" }
    ]
  },
  /* ---- QUANTITATIVE APTITUDE ---- */
  {
    category: "quantitative-aptitude",
    topic: "Quantitative Aptitude — Percentages, Interest, Work, Speed & Number Rules",
    rows: QUANT_APTITUDE_ROWS,
    forms: [
      { q: "In quantitative aptitude, what is the standard formula or value for '{0}'?", a: 1, exp: "{0}: {1}. {2}" },
      { q: "Which quantitative aptitude rule or conversion is expressed by '{1}'?", a: 0, exp: "{0} — {1}. {2}" }
    ]
  },
  /* ---- LOGICAL & VERBAL REASONING ---- */
  {
    category: "reasoning",
    topic: "Verbal Reasoning — Scientific Branch & Subject Analogies",
    rows: science.BRANCHES,
    forms: [
      { q: "In verbal analogy reasoning, if 'Birds' is related to 'Ornithology', then '{1}' is analogously related to which discipline?", a: 0, exp: "Just as Ornithology is the study of birds, {0} is the study of {1}." }
    ]
  },
  {
    category: "reasoning",
    topic: "Verbal Reasoning — Instrument & Measurement Analogies",
    rows: science.INSTRUMENTS,
    forms: [
      { q: "In logical analogy reasoning, if 'Thermometer : Temperature', then '{0} : ?'", a: 1, exp: "Just as a Thermometer measures Temperature, a {0} measures {1}." }
    ]
  },
  {
    category: "reasoning",
    topic: "Verbal Reasoning — Country & Currency Analogies",
    rows: countries.slice(0, 60),
    forms: [
      { q: "In verbal analogy reasoning, if 'Japan : Yen', then '{0} : ?'", a: 2, exp: "Just as the Yen is the national currency of Japan, the {2} is the currency of {0} (capital: {1})." }
    ]
  },
  /* ---- SCIENCE: PHYSICS ---- */
  {
    category: "physics",
    topic: "Physics — SI Units & Physical Quantities",
    rows: science.SI_UNITS,
    forms: [
      { q: "In physics and metrology, which SI unit is used to express the physical quantity '{0}'?", a: 1, exp: "In the International System of Units (SI), {0} is measured in {1}." },
      { q: "In competitive physics exams, the standard unit '{1}' measures which physical quantity?", a: 0, exp: "{1} is the SI unit of {0}." }
    ]
  },
  {
    category: "physics",
    topic: "Physics — Scientific Instruments & Measurements",
    rows: science.INSTRUMENTS,
    forms: [
      { q: "In experimental physics and instrumentation, what is the device '{0}' designed to measure or detect?", a: 1, exp: "{0} is used for measuring {1}." },
      { q: "Which scientific apparatus is used in physics laboratories to measure '{1}'?", a: 0, exp: "To measure {1}, the instrument used is the {0}." }
    ]
  },
  {
    category: "physics",
    topic: "Astrophysics & Planetary Science",
    rows: science.ASTRONOMY,
    forms: [
      { q: "In planetary science and astrophysics, which solar system body is characterised by the fact: '{2}'?", a: 0, exp: "{0} ({1}) — {2}." }
    ]
  },
  /* ---- SCIENCE: CHEMISTRY ---- */
  {
    category: "chemistry",
    topic: "Chemistry — Modern Periodic Table & Elements",
    rows: elements,
    forms: [
      { q: "In the Modern Periodic Table, what is the atomic number (Z) of the chemical element {2} (symbol: {1})?", a: 0, exp: "{2} ({1}) has atomic number {0} and is classified as a {3}." },
      { q: "In inorganic chemistry, which element of the '{3}' series has atomic number {0} and chemical symbol '{1}'?", a: 2, exp: "Atomic number {0} (symbol {1}) belongs to the {3} element {2}." },
      { q: "By which chemical symbol is the '{3}' element {2} (atomic number {0}) represented in the periodic table?", a: 1, exp: "The chemical symbol of {2} (Z = {0}) is {1}." }
    ]
  },
  {
    category: "chemistry",
    topic: "Chemistry — Systematic & Common Chemical Names",
    rows: science.CHEMICAL_NAMES,
    forms: [
      { q: "In chemical nomenclature, what is the chemical name and formula corresponding to '{0}'?", a: 1, exp: "In chemistry, {0} is {1}." },
      { q: "In industrial and everyday chemistry, which common substance is chemically identified as '{1}'?", a: 0, exp: "{1} is the chemical composition of {0}." }
    ]
  },
  /* ---- SCIENCE: BIOLOGY ---- */
  {
    category: "biology",
    topic: "Biology — Human Anatomy & Organ Physiology",
    rows: science.BODY,
    forms: [
      { q: "In human physiology, what is the primary biological function performed by the '{0}'?", a: 1, exp: "In the human body, the {0} is responsible for {1}." },
      { q: "Which human organ or anatomical structure carries out the physiological function of '{1}'?", a: 0, exp: "The physiological function of {1} is carried out by the {0}." }
    ]
  },
  {
    category: "biology",
    topic: "Biology — Vitamins, Minerals & Deficiency Disorders",
    rows: science.VITAMINS,
    forms: [
      { q: "In human nutrition and medical biology, a clinical deficiency of '{0}' leads to which disorder?", a: 1, exp: "A deficiency of {0} causes {1}." },
      { q: "In clinical nutrition, the deficiency condition '{1}' results from an inadequate intake of which nutrient?", a: 0, exp: "{1} is caused by the deficiency of {0}." }
    ]
  },
  {
    category: "biology",
    topic: "Biology — Human Diseases & Pathogens",
    rows: science.DISEASES,
    forms: [
      { q: "In medical microbiology and pathology, what is the causative agent or cause of '{0}'?", a: 1, exp: "In medical biology, {0} is caused by {1}." },
      { q: "Which human disease or medical condition is caused by '{1}'?", a: 0, exp: "{1} is the causative agent of {0}." }
    ]
  },
  /* ---- SCIENCE: GENERAL SCIENCE ---- */
  {
    category: "general-science",
    topic: "General Science — Scientific Disciplines & Branches",
    rows: science.BRANCHES,
    forms: [
      { q: "In general science classification, which specialized scientific discipline studies '{1}'?", a: 0, exp: "{0} is the scientific branch dedicated to the study of {1}." },
      { q: "In competitive general science, what is the subject of study of '{0}'?", a: 1, exp: "{0} deals with the scientific study of {1}." }
    ]
  },
  {
    category: "general-science",
    topic: "General Science — Space & Scientific Missions",
    rows: currentAffairs.MISSIONS,
    forms: [
      { q: "In space and science technology, what is the primary scientific objective of '{0}'?", a: 1, exp: "{0} — {1}." },
      { q: "Which scientific or space programme is described as: '{1}'?", a: 0, exp: "{1} refers to {0}." }
    ]
  },
  {
    category: "general-science",
    topic: "General Science — Atmospheric & Earth Science",
    rows: geography.CLIMATE,
    forms: [
      { q: "In atmospheric and earth science: {0}?", a: 1, exp: "{0} — {1}." }
    ]
  },
  /* ---- SCIENCE: ENVIRONMENTAL STUDIES ---- */
  {
    category: "environmental-studies",
    topic: "Environmental Studies — National Parks & Wildlife Sanctuaries",
    rows: india.NATIONAL_PARKS,
    forms: [
      { q: "In Indian ecology and wildlife conservation, in which state or UT is '{0}' situated?", a: 1, exp: "{0} is located in {1}." },
      { q: "Which of the following protected national parks or tiger reserves is situated in {1}?", a: 0, exp: "{0} is a protected wildlife area in {1}." }
    ]
  },
  {
    category: "environmental-studies",
    topic: "Environmental Studies — Global Conventions, Biosphere & Pollution",
    rows: [].concat(environment.ENV_AGREEMENTS, environment.POLLUTION, environment.ENV_SCHEMES),
    forms: [
      { q: "In environmental studies and ecology, what is '{0}' associated with?", a: 1, exp: "{0} — {1}." },
      { q: "In environmental science exams, which convention, pollutant or law corresponds to: '{1}'?", a: 0, exp: "{1} is associated with {0}." }
    ]
  },
  {
    category: "environmental-studies",
    topic: "Environmental Studies — Biosphere Reserves & Ramsar Wetlands",
    rows: environment.BIOSPHERE,
    forms: [
      { q: "In biodiversity conservation, the biosphere reserve or wetland site '{0}' is located in which Indian state?", a: 1, exp: "{0} is located in {1}." }
    ]
  },
  /* ---- SCIENCE: INVENTIONS & DISCOVERIES ---- */
  {
    category: "inventions-discoveries",
    topic: "Inventions, Discoveries & Scientific Pioneers",
    rows: science.INVENTIONS,
    forms: [
      { q: "In the history of science and technology, who is credited with '{0}'?", a: 1, exp: "{0} is credited to {1}." },
      { q: "Which landmark scientific invention or discovery is attributed to {1}?", a: 0, exp: "{1} is credited with {0}." }
    ]
  },
  {
    category: "inventions-discoveries",
    topic: "Eminent Scientists & Breakthrough Contributions",
    rows: science.SCIENTISTS,
    forms: [
      { q: "In the history of science, which pioneering discovery or theory was formulated by {0}?", a: 1, exp: "{0} is renowned for {1}." },
      { q: "Which scientist is celebrated in the history of science for '{1}'?", a: 0, exp: "{1} was pioneered by {0}." }
    ]
  },
  /* ---- ENGLISH & GRAMMAR ---- */
  {
    category: "english",
    topic: "Competitive English — Synonyms & Vocabulary",
    rows: english.SYNONYMS.slice(0, 140),
    forms: [
      { q: "In competitive English vocabulary, which word is closest in meaning (synonym) to '{0}'?", a: 1, exp: "The word '{0}' is synonymous with '{1}'." }
    ]
  },
  {
    category: "english",
    topic: "Competitive English — Antonyms & Opposites",
    rows: english.ANTONYMS.slice(0, 120),
    forms: [
      { q: "In competitive English usage, which word is most nearly opposite in meaning (antonym) to '{0}'?", a: 1, exp: "The antonym (opposite) of '{0}' is '{1}'." }
    ]
  },
  {
    category: "english",
    topic: "Competitive English — Idioms & Phrases",
    rows: english.IDIOMS.slice(0, 120),
    forms: [
      { q: "In English comprehension and competitive exams, what does the idiom '{0}' mean?", a: 1, exp: "The idiom '{0}' means {1}." }
    ]
  },
  {
    category: "english",
    topic: "Competitive English — One-Word Substitutions",
    rows: english.ONE_WORD.slice(0, 120),
    forms: [
      { q: "In English vocabulary, which single word substitutes for the phrase '{0}'?", a: 1, exp: "The one-word substitute for '{0}' is '{1}'." }
    ]
  },
  {
    category: "general-english-grammar",
    topic: "General English Grammar — Rules & Sentence Correction",
    rows: english.GRAMMAR_QA,
    forms: [
      { q: "In standard English grammar for competitive exams: {0}", a: 1, exp: "Grammar rule: {0} — {1}." }
    ]
  },
  {
    category: "general-english-grammar",
    topic: "General English Grammar — Prepositional Usage",
    rows: english.PREPOSITIONS,
    forms: [
      { q: "In English grammar, choose the appropriate preposition to complete the sentence: '{0}'", a: 1, exp: "The grammatically correct preposition in '{0}' is '{1}'." }
    ]
  },
  {
    category: "general-english-grammar",
    topic: "General English Grammar — Degrees of Comparison, Plurals & Gender",
    rows: english.DEGREES,
    forms: [
      { q: "In English grammar, what is the superlative form of the adjective '{0}' (comparative: '{1}')?", a: 2, exp: "Positive: {0}, Comparative: {1}, Superlative: {2}." },
      { q: "In English grammar, what is the comparative form of the adjective '{0}' (superlative: '{2}')?", a: 1, exp: "Positive: {0}, Comparative: {1}, Superlative: {2}." }
    ]
  },
  {
    category: "general-english-grammar",
    topic: "General English Grammar — Singular & Plural Nouns",
    rows: english.PLURALS,
    forms: [
      { q: "In standard English grammar, what is the correct plural form of the singular noun '{0}'?", a: 1, exp: "The plural form of '{0}' is '{1}'." }
    ]
  },
  /* ---- INDIAN POLITY ---- */
  {
    category: "indian-polity",
    topic: "Indian Polity — Constitutional Articles & Provisions",
    rows: polity.ARTICLES,
    forms: [
      { q: "Under the Constitution of India, which article or part deals with '{0}'?", a: 1, exp: "In the Indian Constitution, {0} is governed by {1}." },
      { q: "In Indian Polity, what subject is specifically covered under '{1}' of the Constitution?", a: 0, exp: "{1} of the Indian Constitution deals with {0}." }
    ]
  },
  {
    category: "indian-polity",
    topic: "Indian Polity — Constitutional Governance & Facts",
    rows: polity.CONSTITUTION_FACTS,
    forms: [
      { q: "In Indian Constitutional Polity: {0}?", a: 1, exp: "{0} — {1}." }
    ]
  },
  {
    category: "indian-polity",
    topic: "Indian Polity — Constitutional & Statutory Bodies",
    rows: polity.INSTITUTIONS,
    forms: [
      { q: "In Indian governance and polity, how is '{0}' constitutionally or statutorily described?", a: 1, exp: "{0} — {1}." },
      { q: "Which Indian constitutional or statutory body is described as: '{1}'?", a: 0, exp: "{1} refers to {0}." }
    ]
  },
  /* ---- INDIAN HISTORY ---- */
  {
    category: "indian-history",
    topic: "Indian History — Landmark Historical Events & Chronology",
    rows: [].concat(history.INDIA_EVENTS, history.WORLD_EVENTS),
    forms: [
      { q: "In historical chronology, in which year did '{0}' take place?", a: 1, exp: "{0} occurred in the year {1}." },
      { q: "Which landmark historical event took place in the year {1}?", a: 0, exp: "In {1}, the historical event that occurred was: {0}." }
    ]
  },
  {
    category: "indian-history",
    topic: "Indian History — Dynasties, Rulers & Freedom Struggle",
    rows: [].concat(history.DYNASTIES, history.RULERS, history.FREEDOM_FIGHTERS),
    forms: [
      { q: "In Indian history, what is '{0}' historically known for or associated with?", a: 1, exp: "{0} — {1}." },
      { q: "In Indian historical studies, who or which dynasty is associated with '{1}'?", a: 0, exp: "{1} is associated with {0}." }
    ]
  },
  /* ---- GEOGRAPHY ---- */
  {
    category: "geography",
    topic: "Indian & World Geography — Physical & Regional Facts",
    rows: geography.GEO_QA.slice(0, 150),
    forms: [
      { q: "In physical and regional geography: {0}", a: 1, exp: "{0} — {1}." }
    ]
  },
  {
    category: "geography",
    topic: "Geography of India — Rivers, Dams, Mountain Passes & Minerals",
    rows: [].concat(india.INDIA_RIVERS, india.DAMS, india.PASSES, geography.MINERALS),
    forms: [
      { q: "In the geography of India, '{0}' is associated with which origin, river, state or region?", a: 1, exp: "In Indian geography, {0} is associated with {1}." }
    ]
  },
  /* ---- ECONOMICS ---- */
  {
    category: "economics",
    topic: "Economics, Banking & Public Finance in Competitive Exams",
    rows: economics.ECON_QA.slice(0, 150),
    forms: [
      { q: "In Indian economy, banking and financial awareness: {0}", a: 1, exp: "{0} — {1}." }
    ]
  },
  /* ---- COMPUTER AWARENESS ---- */
  {
    category: "computer-awareness",
    topic: "Computer Awareness — Architecture, Networking & Software",
    rows: computers.COMPUTER_FACTS,
    forms: [
      { q: "In computer science and information technology, what does '{0}' refer to?", a: 1, exp: "{0} — {1}." },
      { q: "Which computer science term or component is defined as: '{1}'?", a: 0, exp: "{1} defines {0}." }
    ]
  },
  {
    category: "computer-awareness",
    topic: "Computer Awareness — Keyboard Shortcuts & File Extensions",
    rows: [].concat(computers.SHORTCUTS, computers.EXTENSIONS),
    forms: [
      { q: "In computing and office software, what is '{0}' used for?", a: 1, exp: "In computing, {0} corresponds to {1}." }
    ]
  },
  /* ---- CURRENT AFFAIRS ---- */
  {
    category: "current-affairs",
    topic: "Current Affairs — National & International Developments",
    rows: currentAffairs.CURRENT_QA.slice(0, 150),
    forms: [
      { q: "In competitive current affairs: {0}", a: 1, exp: "{0} — {1}." }
    ]
  },
  {
    category: "current-affairs",
    topic: "Current Affairs — Flagship Government Schemes",
    rows: currentAffairs.SCHEMES,
    forms: [
      { q: "In government policy and current affairs, what is the core objective of '{0}'?", a: 1, exp: "{0} — {1}." }
    ]
  },
  /* ---- GENERAL KNOWLEDGE ---- */
  {
    category: "general-knowledge",
    topic: "World General Knowledge — Countries, Capitals & Currencies",
    rows: countries.slice(0, 120),
    forms: [
      { q: "In world general knowledge, what is the national capital of {0} (currency: {2})?", a: 1, exp: "The capital of {0} is {1} and its official currency is the {2}." },
      { q: "In international general knowledge, which official currency is used in {0} (capital: {1})?", a: 2, exp: "{0} (capital {1}) uses the {2} as its currency." }
    ]
  },
  {
    category: "general-knowledge",
    topic: "General Knowledge — Global Superlatives & World Firsts",
    rows: gk.SUPERLATIVES,
    forms: [
      { q: "In world and Indian general knowledge: {0}", a: 1, exp: "{0} — {1}." }
    ]
  },
  /* ---- GENERAL AWARENESS ---- */
  {
    category: "general-awareness",
    topic: "General Awareness — Firsts in India, National Symbols & Institutions",
    rows: [].concat(india.FIRST_IN_INDIA, india.NATIONAL_SYMBOLS, gk.WORLD_FIRSTS),
    forms: [
      { q: "In competitive general awareness, who or what is recognised as '{0}'?", a: 1, exp: "{0} — {1}." },
      { q: "In general awareness exams, which distinction or national symbol corresponds to '{1}'?", a: 0, exp: "{1} is recognised as {0}." }
    ]
  },
  {
    category: "general-awareness",
    topic: "General Awareness — International Organisations & Headquarters",
    rows: gk.ORGANISATIONS,
    forms: [
      { q: "In international general awareness, where is the permanent headquarters of '{0}' located?", a: 1, exp: "The headquarters of {0} is located at {1}." },
      { q: "Which international organisation has its headquarters at '{1}'?", a: 0, exp: "{0} is headquartered at {1}." }
    ]
  },
  /* ---- STATIC GK ---- */
  {
    category: "static-gk",
    topic: "Static GK — Classical & Folk Dances and Festivals of India",
    rows: [].concat(
      india.DANCES.filter((r) => !(r[2] && r[2].indexOf("skip") !== -1)),
      india.FESTIVALS.filter((r) => !(r[2] && r[2].indexOf("skip") !== -1))
    ),
    forms: [
      { q: "In Indian cultural Static GK, '{0}' is a traditional dance form or festival of which state or UT?", a: 1, exp: "In Indian culture, {0} belongs to {1}." },
      { q: "Which traditional dance form or cultural festival is celebrated in {1}?", a: 0, exp: "{0} is a traditional cultural heritage of {1}." }
    ]
  },
  {
    category: "static-gk",
    topic: "Static GK — Indian States, Capitals & Regions",
    rows: india.STATES,
    forms: [
      { q: "In Indian Static GK, what is the capital city of {0} (in {2} India)?", a: 1, exp: "The capital of {0} ({2} India) is {1}." }
    ]
  },
  /* ---- SPORTS ---- */
  {
    category: "sports",
    topic: "Sports — Major Trophies, Cups & Team Formats",
    rows: gk.TROPHIES,
    forms: [
      { q: "In competitive sports awareness, with which sport is the '{0}' associated?", a: 1, exp: "The {0} is a major tournament or trophy in {1}." },
      { q: "Which of the following championship trophies or cups is contested in {1}?", a: 0, exp: "In sports, the {0} is contested in {1}." }
    ]
  },
  {
    category: "sports",
    topic: "Sports — Players per Team in Official Disciplines",
    rows: gk.SPORTS_PLAYERS,
    forms: [
      { q: "Under official sporting regulations, how many players take the field on one side in '{0}'?", a: 1, exp: "In official rules, a {0} team fields {1} players per side." },
      { q: "Which sport officially fields a team of '{1}' players per side?", a: 0, exp: "{0} is played with {1} players per team." }
    ]
  },
  /* ---- AWARDS & HONOURS ---- */
  {
    category: "awards-honours",
    topic: "Awards & Honours — National & International Distinctions",
    rows: gk.AWARDS,
    forms: [
      { q: "In awards and honours awareness, for excellence in which field is the '{0}' conferred?", a: 1, exp: "{0} is conferred for {1}." },
      { q: "Which prestigious national or international honour is described as: '{1}'?", a: 0, exp: "{1} describes the {0}." }
    ]
  },
  /* ---- BOOKS & AUTHORS ---- */
  {
    category: "books-authors",
    topic: "Books & Authors — Classic & Modern Literary Works",
    rows: gk.BOOKS,
    forms: [
      { q: "In literature and competitive exams, who is the author of the celebrated work '{0}'?", a: 1, exp: "The book '{0}' was written by {1}." },
      { q: "Which of the following notable books was authored by {1}?", a: 0, exp: "{1} is the author of '{0}'." }
    ]
  },
  /* ---- DAYS & EVENTS ---- */
  {
    category: "days-events",
    topic: "Important National & International Days and Observances",
    rows: gk.DAYS,
    forms: [
      { q: "In national and international observances, on which date is '{0}' celebrated every year?", a: 1, exp: "{0} is observed annually on {1}." },
      { q: "Which important national or international day is observed annually on {1}?", a: 0, exp: "On {1}, {0} is observed." }
    ]
  },
  /* ---- ABBREVIATIONS ---- */
  {
    category: "abbreviations",
    topic: "Abbreviations & Acronyms in Governance, Banking, Science & IT",
    rows: abbr.ABBR,
    forms: [
      { q: "In competitive exams, what does the abbreviation or acronym '{0}' stand for?", a: 1, exp: "The abbreviation {0} stands for {1}." },
      { q: "Which standard abbreviation or acronym represents '{1}'?", a: 0, exp: "{1} is abbreviated as {0}." }
    ]
  }
];

module.exports = {
  SUBJECT_GROUPS,
  SUBJECT_TABLE_SPECS
};
