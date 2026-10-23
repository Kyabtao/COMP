"use strict";
/**
 * Real-world news & competitive exam question pool for tools/news.js.
 *
 * Sources represented:
 *  - Press Information Bureau (PIB) & Government of India releases
 *  - National & international news (The Hindu, Indian Express, BBC)
 *  - Competitive exam portals & papers (GKToday, AffairsCloud, Jagran Josh,
 *    SSC CGL, SSC CHSL, IBPS/SBI Banking, RRB NTPC, UPSC/CDS)
 *
 * Every entry is grounded in verified real-world facts (no random arithmetic
 * generation and no recycled question stems from the base fact tables).
 */

/**
 * Direct curated MCQs from recent news and competitive exam papers.
 */
const CURATED_NEWS_MCQS = [
  {
    category: "current-affairs",
    question: "On which date does India observe National Space Day to commemorate the landing of Chandrayaan-3 on the Moon?",
    options: ["15 August", "23 August", "28 February", "4 October"],
    answer: 1,
    explanation: "The Government of India declared 23 August as National Space Day to mark the successful soft landing of Chandrayaan-3's Vikram lander at Shiv Shakti Point on 23 August 2023.",
    topic: "Space & National Days in News",
    level: 1,
    sourceSite: "PIB"
  },
  {
    category: "current-affairs",
    question: "Which historical burial mounds of the Ahom dynasty in Assam were inscribed on the UNESCO World Heritage List in 2024?",
    options: ["Moidams of Charaideo", "Majuli River Island", "Kamakhya Temple Complex", "Rang Ghar Pavilion"],
    answer: 0,
    explanation: "The Moidams — the mound-burial system of the Ahom dynasty at Charaideo in Assam — were inscribed as India's 43rd UNESCO World Heritage Site in July 2024.",
    topic: "UNESCO Heritage in News",
    level: 2,
    sourceSite: "PIB"
  },
  {
    category: "current-affairs",
    question: "Which five Indian languages were granted Classical Language status by the Union Cabinet in October 2024?",
    options: [
      "Marathi, Pali, Prakrit, Assamese and Bengali",
      "Bhojpuri, Maithili, Dogri, Konkani and Manipuri",
      "Gujarati, Punjabi, Kashmiri, Sindhi and Urdu",
      "Santali, Bodo, Nepali, Konkani and Tulu"
    ],
    answer: 0,
    explanation: "In October 2024, the Union Cabinet approved Classical Language status for Marathi, Pali, Prakrit, Assamese and Bengali, taking the total number of classical languages in India to eleven.",
    topic: "Culture & Cabinet Decisions",
    level: 2,
    sourceSite: "PIB"
  },
  {
    category: "indian-polity",
    question: "Which new criminal code replaced the Indian Penal Code (IPC), 1860 with effect from 1 July 2024?",
    options: [
      "Bharatiya Nagarik Suraksha Sanhita",
      "Bharatiya Nyaya Sanhita",
      "Bharatiya Sakshya Adhiniyam",
      "Bharatiya Dand Sanhita"
    ],
    answer: 1,
    explanation: "The Bharatiya Nyaya Sanhita (BNS), 2023 replaced the Indian Penal Code, 1860 on 1 July 2024, alongside the Bharatiya Nagarik Suraksha Sanhita (replacing CrPC) and Bharatiya Sakshya Adhiniyam (replacing the Indian Evidence Act).",
    topic: "Criminal Law Reforms",
    level: 2,
    sourceSite: "The Hindu"
  },
  {
    category: "indian-polity",
    question: "Which new legislation replaced the Code of Criminal Procedure (CrPC), 1973 in India from 1 July 2024?",
    options: [
      "Bharatiya Nagarik Suraksha Sanhita",
      "Bharatiya Nyaya Sanhita",
      "Bharatiya Sakshya Adhiniyam",
      "Bharatiya Vidhi Sanhita"
    ],
    answer: 0,
    explanation: "The Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023 replaced the Code of Criminal Procedure (CrPC), 1973 with effect from 1 July 2024.",
    topic: "Criminal Law Reforms",
    level: 2,
    sourceSite: "The Hindu"
  },
  {
    category: "indian-polity",
    question: "Which Act replaced the Indian Evidence Act, 1872 with effect from 1 July 2024?",
    options: [
      "Bharatiya Sakshya Adhiniyam",
      "Bharatiya Pramana Sanhita",
      "Bharatiya Nyaya Sanhita",
      "Bharatiya Nagarik Suraksha Sanhita"
    ],
    answer: 0,
    explanation: "The Bharatiya Sakshya Adhiniyam (BSA), 2023 replaced the colonial-era Indian Evidence Act, 1872 and recognises electronic and digital records as primary evidence.",
    topic: "Criminal Law Reforms",
    level: 2,
    sourceSite: "Indian Express"
  },
  {
    category: "indian-polity",
    question: "The 106th Constitutional Amendment Act, 2023 (Nari Shakti Vandan Adhiniyam) provides what percentage of reservation for women in the Lok Sabha and State Legislative Assemblies?",
    options: ["25 per cent", "33 per cent", "40 per cent", "50 per cent"],
    answer: 1,
    explanation: "The 106th Constitutional Amendment Act, 2023 reserves one-third (33 per cent) of all seats for women in the Lok Sabha, State Legislative Assemblies and the Legislative Assembly of NCT of Delhi.",
    topic: "Constitutional Amendments",
    level: 1,
    sourceSite: "SSC CGL"
  },
  {
    category: "indian-polity",
    question: "Who was appointed as the Chairman of the 16th Finance Commission of India?",
    options: ["N. K. Singh", "Arvind Panagariya", "Urjit Patel", "Raghuram Rajan"],
    answer: 1,
    explanation: "Economist and former NITI Aayog Vice-Chairman Dr Arvind Panagariya was appointed Chairman of the 16th Finance Commission constituted under Article 280 of the Constitution.",
    topic: "Constitutional Bodies in News",
    level: 2,
    sourceSite: "GKToday"
  },
  {
    category: "sports",
    question: "Who became the first Indian athlete since Independence to win two medals in a single edition of the Olympic Games at Paris 2024?",
    options: ["Neeraj Chopra", "Manu Bhaker", "P. V. Sindhu", "Sarabjot Singh"],
    answer: 1,
    explanation: "Shooter Manu Bhaker won two bronze medals at the Paris 2024 Olympics — in the women's 10m air pistol individual and the 10m air pistol mixed team event with Sarabjot Singh.",
    topic: "Paris 2024 Olympics",
    level: 1,
    sourceSite: "The Hindu"
  },
  {
    category: "sports",
    question: "With which partner did Manu Bhaker win the bronze medal in the 10m air pistol mixed team event at the Paris 2024 Olympics?",
    options: ["Swapnil Kusale", "Sarabjot Singh", "Saurabh Chaudhary", "Arjun Babuta"],
    answer: 1,
    explanation: "Manu Bhaker and Sarabjot Singh defeated South Korea in the bronze medal match of the 10m air pistol mixed team event at the Paris 2024 Olympics.",
    topic: "Paris 2024 Olympics",
    level: 2,
    sourceSite: "Indian Express"
  },
  {
    category: "sports",
    question: "Which Indian shooter won the bronze medal in the men's 50m rifle 3 positions event at the Paris 2024 Olympics?",
    options: ["Swapnil Kusale", "Aishwary Pratap Singh Tomar", "Divyansh Singh Panwar", "Rudrankksh Patil"],
    answer: 0,
    explanation: "Swapnil Kusale won India's first-ever Olympic medal in the men's 50m rifle 3 positions event by claiming bronze at Paris 2024.",
    topic: "Paris 2024 Olympics",
    level: 2,
    sourceSite: "GKToday"
  },
  {
    category: "sports",
    question: "Which Indian wrestler won the bronze medal in the men's 57 kg freestyle category at the Paris 2024 Olympics, becoming India's youngest individual Olympic medallist?",
    options: ["Aman Sehrawat", "Ravi Kumar Dahiya", "Bajrang Punia", "Deepak Punia"],
    answer: 0,
    explanation: "At 21 years and 24 days, Aman Sehrawat won the bronze medal in the men's 57 kg freestyle wrestling event at Paris 2024, becoming India's youngest individual Olympic medallist.",
    topic: "Paris 2024 Olympics",
    level: 2,
    sourceSite: "AffairsCloud"
  },
  {
    category: "sports",
    question: "In which city did India win both the Open and Women's team gold medals at the 45th FIDE Chess Olympiad in September 2024?",
    options: ["Budapest", "Chennai", "Baku", "Tashkent"],
    answer: 0,
    explanation: "India made history at the 45th FIDE Chess Olympiad in Budapest, Hungary in September 2024 by winning gold medals in both the Open section and the Women's section.",
    topic: "Chess in News",
    level: 2,
    sourceSite: "The Hindu"
  },
  {
    category: "sports",
    question: "Whom did D. Gukesh defeat in Singapore in December 2024 to become the 18th World Chess Champion?",
    options: ["Ding Liren", "Ian Nepomniachtchi", "Magnus Carlsen", "Fabiano Caruana"],
    answer: 0,
    explanation: "18-year-old Indian Grandmaster D. Gukesh defeated defending champion Ding Liren of China 7.5–6.5 in Singapore to become the youngest undisputed World Chess Champion in history.",
    topic: "Chess in News",
    level: 1,
    sourceSite: "The Hindu"
  },
  {
    category: "sports",
    question: "Against which team did India win the ICC Men's T20 World Cup 2024 final at Bridgetown, Barbados?",
    options: ["Australia", "England", "South Africa", "New Zealand"],
    answer: 2,
    explanation: "India defeated South Africa by 7 runs in the final at Kensington Oval, Bridgetown, Barbados on 29 June 2024 to claim their second ICC Men's T20 World Cup title.",
    topic: "Cricket Tournaments",
    level: 1,
    sourceSite: "Jagran Josh"
  },
  {
    category: "sports",
    question: "Who was named Player of the Tournament in the ICC Men's T20 World Cup 2024?",
    options: ["Virat Kohli", "Jasprit Bumrah", "Rohit Sharma", "Hardik Pandya"],
    answer: 1,
    explanation: "Indian fast bowler Jasprit Bumrah was named Player of the Tournament in the ICC Men's T20 World Cup 2024 after taking 15 wickets at an economy rate of 4.17, while Virat Kohli won Player of the Match in the final.",
    topic: "Cricket Tournaments",
    level: 2,
    sourceSite: "SSC CHSL"
  },
  {
    category: "awards-honours",
    question: "Which South Korean author won the 2024 Nobel Prize in Literature?",
    options: ["Han Kang", "Shin Kyung-sook", "Bora Chung", "Kim Ji-young"],
    answer: 0,
    explanation: "South Korean author Han Kang, known for novels such as The Vegetarian and Human Acts, was awarded the 2024 Nobel Prize in Literature for her intense poetic prose.",
    topic: "Nobel Prizes",
    level: 2,
    sourceSite: "The Hindu"
  },
  {
    category: "awards-honours",
    question: "Which Japanese grassroots organisation of atomic bomb survivors (Hibakusha) was awarded the 2024 Nobel Peace Prize?",
    options: ["Nihon Hidankyo", "ICAN", "Pugwash Conferences", "Mayors for Peace"],
    answer: 0,
    explanation: "Nihon Hidankyo, the Japanese confederation of A- and H-bomb sufferers' organisations founded in 1956, received the 2024 Nobel Peace Prize for its efforts to achieve a world free of nuclear weapons.",
    topic: "Nobel Prizes",
    level: 2,
    sourceSite: "Indian Express"
  },
  {
    category: "awards-honours",
    question: "John J. Hopfield and Geoffrey E. Hinton were awarded the 2024 Nobel Prize in Physics for foundational discoveries enabling which field?",
    options: [
      "Artificial neural networks and machine learning",
      "Attosecond light pulses in electron dynamics",
      "Quantum entanglement and Bell inequalities",
      "Topological phase transitions of matter"
    ],
    answer: 0,
    explanation: "John Hopfield and Geoffrey Hinton received the 2024 Nobel Prize in Physics for foundational discoveries and inventions that enable machine learning with artificial neural networks.",
    topic: "Nobel Prizes",
    level: 2,
    sourceSite: "The Hindu"
  },
  {
    category: "awards-honours",
    question: "David Baker, Demis Hassabis and John M. Jumper shared the 2024 Nobel Prize in Chemistry for work on which scientific breakthrough?",
    options: [
      "Computational protein design and protein structure prediction",
      "Discovery and synthesis of quantum dots",
      "Click chemistry and bioorthogonal chemistry",
      "CRISPR-Cas9 genome editing"
    ],
    answer: 0,
    explanation: "David Baker was honoured for computational protein design, while Demis Hassabis and John Jumper (creators of AlphaFold2) were honoured for protein structure prediction.",
    topic: "Nobel Prizes",
    level: 2,
    sourceSite: "GKToday"
  },
  {
    category: "awards-honours",
    question: "Victor Ambros and Gary Ruvkun received the 2024 Nobel Prize in Physiology or Medicine for the discovery of what?",
    options: [
      "microRNA and its role in post-transcriptional gene regulation",
      "Nucleoside base modifications for mRNA vaccines",
      "Receptors for temperature and touch",
      "Genomes of extinct hominins and human evolution"
    ],
    answer: 0,
    explanation: "Victor Ambros and Gary Ruvkun won the 2024 Nobel Prize in Physiology or Medicine for discovering microRNA and its crucial role in how genes are regulated.",
    topic: "Nobel Prizes",
    level: 2,
    sourceSite: "AffairsCloud"
  },
  {
    category: "awards-honours",
    question: "Daron Acemoglu, Simon Johnson and James A. Robinson were awarded the 2024 Nobel Memorial Prize in Economic Sciences for their studies of what?",
    options: [
      "How institutions are formed and affect national prosperity",
      "Women's labour market outcomes through history",
      "The role of banks and financial crises",
      "Experimental approaches to alleviating global poverty"
    ],
    answer: 0,
    explanation: "Acemoglu, Johnson and Robinson received the 2024 Economics Nobel for demonstrating the importance of inclusive societal institutions for a country's long-term prosperity.",
    topic: "Nobel Prizes",
    level: 2,
    sourceSite: "IBPS PO"
  },
  {
    category: "books-authors",
    question: "Which novel by British author Samantha Harvey, set aboard the International Space Station, won the 2024 Booker Prize?",
    options: ["Orbital", "Prophet Song", "Creation Lake", "James"],
    answer: 0,
    explanation: "Samantha Harvey won the 2024 Booker Prize for her novel 'Orbital', which follows six astronauts aboard the International Space Station over a single 24-hour period.",
    topic: "Booker Prize & Literature",
    level: 2,
    sourceSite: "The Hindu"
  },
  {
    category: "awards-honours",
    question: "Who was conferred the Dadasaheb Phalke Lifetime Achievement Award at the 70th National Film Awards in 2024?",
    options: ["Mithun Chakraborty", "Waheeda Rehman", "Asha Parekh", "Rajinikanth"],
    answer: 0,
    explanation: "Veteran actor Mithun Chakraborty, who made his debut with the National Award-winning film Mrigayaa (1976), was honoured with the Dadasaheb Phalke Award at the 70th National Film Awards.",
    topic: "National Film Awards",
    level: 1,
    sourceSite: "PIB"
  },
  {
    category: "awards-honours",
    question: "Which Malayalam film won the Best Feature Film award at the 70th National Film Awards announced in 2024?",
    options: ["Aattam", "Kantara", "2018", "Aadujeevitham"],
    answer: 0,
    explanation: "The Malayalam drama 'Aattam' (The Play), directed by Anand Ekarshi, won Best Feature Film and Best Screenplay at the 70th National Film Awards.",
    topic: "National Film Awards",
    level: 2,
    sourceSite: "PIB"
  },
  {
    category: "awards-honours",
    question: "How many eminent personalities were conferred the Bharat Ratna by the Government of India in the year 2024?",
    options: ["Three", "Four", "Five", "Two"],
    answer: 2,
    explanation: "In 2024, a record five personalities were awarded the Bharat Ratna: Karpoori Thakur, L. K. Advani, P. V. Narasimha Rao, Chaudhary Charan Singh and Dr M. S. Swaminathan.",
    topic: "Civilian Awards",
    level: 1,
    sourceSite: "SSC CGL"
  },
  {
    category: "general-science",
    question: "Which ISRO mission launched on 30 December 2024 successfully demonstrated autonomous spacecraft rendezvous and docking in orbit?",
    options: ["SpaDeX", "XPoSat", "EOS-08", "INSAT-3DS"],
    answer: 0,
    explanation: "ISRO's Space Docking Experiment (SpaDeX), using two satellites SDX01 (Chaser) and SDX02 (Target) launched aboard PSLV-C60, made India the fourth country to achieve autonomous space docking.",
    topic: "ISRO Space Missions",
    level: 2,
    sourceSite: "PIB"
  },
  {
    category: "general-science",
    question: "Around which Sun-Earth Lagrange point was ISRO's Aditya-L1 solar observatory inserted into a halo orbit in January 2024?",
    options: ["Lagrange Point L1", "Lagrange Point L2", "Lagrange Point L4", "Lagrange Point L5"],
    answer: 0,
    explanation: "Aditya-L1 was inserted into a halo orbit around the Sun-Earth Lagrange Point 1 (L1), located about 1.5 million km from Earth, offering an uninterrupted view of the Sun.",
    topic: "ISRO Space Missions",
    level: 1,
    sourceSite: "RRB NTPC"
  },
  {
    category: "general-science",
    question: "What is the name of the female-looking half-humanoid robot developed by ISRO to fly on an uncrewed Gaganyaan test flight?",
    options: ["Vyommitra", "Daksh", "Mitra", "Shakti"],
    answer: 0,
    explanation: "Vyommitra (meaning 'friend in space' in Sanskrit) is a female half-humanoid robot built by ISRO to monitor module parameters and simulate human functions ahead of the crewed Gaganyaan flight.",
    topic: "ISRO Space Missions",
    level: 1,
    sourceSite: "SSC CGL"
  },
  {
    category: "general-science",
    question: "NISAR, a dual-frequency synthetic aperture radar Earth observation satellite, is a joint mission between ISRO and which space agency?",
    options: ["NASA", "ESA", "JAXA", "Roscosmos"],
    answer: 0,
    explanation: "NISAR (NASA-ISRO Synthetic Aperture Radar) is a joint Earth-observing mission between NASA and ISRO using L-band and S-band radars to measure crustal deformation, ice-sheet dynamics and ecosystems.",
    topic: "ISRO Space Missions",
    level: 1,
    sourceSite: "GKToday"
  },
  {
    category: "general-awareness",
    question: "Which indigenous light tank, developed jointly by DRDO and Larsen & Toubro for high-altitude operations in Ladakh, underwent trials in 2024?",
    options: ["Zorawar", "Arjun Mk-1A", "Bhishma", "Karna"],
    answer: 0,
    explanation: "Named after legendary Dogra general Zorawar Singh Kahluria, the 25-tonne Zorawar light tank was developed by DRDO's CVRDE and L&T for rapid deployment in high-altitude mountain warfare.",
    topic: "Defence & Indigenous Systems",
    level: 2,
    sourceSite: "PIB"
  },
  {
    category: "general-awareness",
    question: "In October 2024, India inaugurated its first private-sector final assembly line for the C-295 military transport aircraft in which city?",
    options: ["Vadodara", "Bengaluru", "Hyderabad", "Kanpur"],
    answer: 0,
    explanation: "The Tata Advanced Systems–Airbus C-295 aircraft manufacturing complex was inaugurated in Vadodara, Gujarat in October 2024 to produce 40 C-295 transport aircraft in India for the Indian Air Force.",
    topic: "Defence & Indigenous Systems",
    level: 2,
    sourceSite: "PIB"
  },
  {
    category: "economics",
    question: "Which public sector defence company became India's 14th Maharatna Central Public Sector Enterprise (CPSE) in October 2024?",
    options: [
      "Hindustan Aeronautics Limited (HAL)",
      "Bharat Electronics Limited (BEL)",
      "Mazagon Dock Shipbuilders Limited",
      "Bharat Dynamics Limited"
    ],
    answer: 0,
    explanation: "The Department of Public Enterprises upgraded Hindustan Aeronautics Limited (HAL) from Navratna to the 14th Maharatna CPSE in October 2024.",
    topic: "Public Sector Undertakings",
    level: 2,
    sourceSite: "IBPS PO"
  },
  {
    category: "economics",
    question: "Which multilateral initiative launched by the Bank for International Settlements (BIS) did the Reserve Bank of India join in 2024 to link domestic fast payment systems like UPI for cross-border retail payments?",
    options: ["Project Nexus", "Project mBridge", "Project Dunbar", "Project Icebreaker"],
    answer: 0,
    explanation: "RBI joined BIS's Project Nexus alongside the central banks of Malaysia, Philippines, Singapore and Thailand to interlink domestic instant payment systems for seamless cross-border retail payments.",
    topic: "RBI & Digital Payments",
    level: 2,
    sourceSite: "AffairsCloud"
  },
  {
    category: "economics",
    question: "At which iconic monument in Paris was India's Unified Payments Interface (UPI) formally launched in February 2024, making France the first European country to accept UPI?",
    options: ["Eiffel Tower", "Louvre Museum", "Arc de Triomphe", "Palace of Versailles"],
    answer: 0,
    explanation: "NPCI International Payments Limited (NIPL) partnered with French e-commerce and proximity payment provider Lyra to launch UPI acceptance at the Eiffel Tower in Paris in February 2024.",
    topic: "RBI & Digital Payments",
    level: 1,
    sourceSite: "PIB"
  },
  {
    category: "current-affairs",
    question: "Which city in Russia hosted the 16th BRICS Summit in October 2024 under the theme 'Strengthening Multilateralism for Just Global Development and Security'?",
    options: ["Kazan", "Saint Petersburg", "Sochi", "Vladivostok"],
    answer: 0,
    explanation: "Kazan, Russia hosted the 16th BRICS Summit in October 2024, which was also the first summit attended by new members Egypt, Ethiopia, Iran and the United Arab Emirates.",
    topic: "International Summits",
    level: 1,
    sourceSite: "The Hindu"
  },
  {
    category: "current-affairs",
    question: "Which Brazilian city hosted the G20 Leaders' Summit in November 2024, where the Global Alliance Against Hunger and Poverty was launched?",
    options: ["Rio de Janeiro", "Brasilia", "Sao Paulo", "Salvador"],
    answer: 0,
    explanation: "Brazil hosted the 19th G20 Summit in Rio de Janeiro in November 2024 under President Luiz Inacio Lula da Silva, launching the Global Alliance Against Hunger and Poverty.",
    topic: "International Summits",
    level: 1,
    sourceSite: "Indian Express"
  },
  {
    category: "environmental-studies",
    question: "Which capital city hosted the 29th UN Climate Change Conference (COP29) in November 2024, often called the 'Finance COP'?",
    options: ["Baku, Azerbaijan", "Dubai, UAE", "Belem, Brazil", "Sharm El-Sheikh, Egypt"],
    answer: 0,
    explanation: "COP29 of the UNFCCC was held in Baku, Azerbaijan in November 2024, where parties agreed on a New Collective Quantified Goal (NCQG) to triple climate finance for developing countries to USD 300 billion annually by 2035.",
    topic: "Climate Summits in News",
    level: 1,
    sourceSite: "The Hindu"
  },
  {
    category: "environmental-studies",
    question: "Where is the headquarters of the International Big Cat Alliance (IBCA), established by treaty to conserve seven big cat species of the world?",
    options: ["India", "Kenya", "South Africa", "Brazil"],
    answer: 0,
    explanation: "Launched by India in 2023 and established as a treaty-based intergovernmental organisation in 2024 with its headquarters in India, the IBCA focuses on conserving Tiger, Lion, Leopard, Snow Leopard, Puma, Jaguar and Cheetah.",
    topic: "Wildlife Conservation",
    level: 1,
    sourceSite: "PIB"
  },
  {
    category: "environmental-studies",
    question: "Guru Ghasidas-Tamor Pingla, notified as India's 56th Tiger Reserve in November 2024, is located in which state?",
    options: ["Chhattisgarh", "Madhya Pradesh", "Odisha", "Jharkhand"],
    answer: 0,
    explanation: "Guru Ghasidas-Tamor Pingla Tiger Reserve in Chhattisgarh was notified as India's 56th Tiger Reserve, becoming the third-largest tiger reserve in the country after Nagarjunasagar-Srisailam and Manas.",
    topic: "Tiger Reserves in News",
    level: 2,
    sourceSite: "PIB"
  },
  {
    category: "environmental-studies",
    question: "Ratapani Wildlife Sanctuary, which was notified as India's 57th Tiger Reserve in December 2024, lies in which state?",
    options: ["Madhya Pradesh", "Rajasthan", "Maharashtra", "Uttarakhand"],
    answer: 0,
    explanation: "Ratapani Tiger Reserve in Raisen district of Madhya Pradesh was notified as India's 57th Tiger Reserve (and the 8th in Madhya Pradesh) in December 2024.",
    topic: "Tiger Reserves in News",
    level: 2,
    sourceSite: "GKToday"
  },
  {
    category: "geography",
    question: "Atal Setu (Mumbai Trans Harbour Link), inaugurated in January 2024 as India's longest sea bridge at 21.8 km, connects Sewri in Mumbai to which location in Raigad district?",
    options: ["Nhava Sheva (Chirle)", "Alibaug", "Panvel", "Uran"],
    answer: 0,
    explanation: "Atal Bihari Vajpayee Sewri–Nhava Sheva Atal Setu is a 21.8 km six-lane bridge connecting Sewri in South Mumbai with Chirle near Nhava Sheva in Navi Mumbai/Raigad.",
    topic: "Infrastructure & Geography",
    level: 2,
    sourceSite: "PIB"
  },
  {
    category: "geography",
    question: "The Sela Tunnel, inaugurated in March 2024 as the world's longest bi-lane tunnel at an altitude above 13,000 feet, provides all-weather connectivity to which town in Arunachal Pradesh?",
    options: ["Tawang", "Ziro", "Pasighat", "Roing"],
    answer: 0,
    explanation: "Built by the Border Roads Organisation (BRO) on the Balipara–Chariduar–Tawang road, the Sela Tunnel provides all-weather connectivity to Tawang in Arunachal Pradesh.",
    topic: "Infrastructure & Geography",
    level: 2,
    sourceSite: "PIB"
  },
  {
    category: "geography",
    question: "Vizhinjam International Seaport, commissioned as India's first deep-water container transshipment port in 2024, is located in which state?",
    options: ["Kerala", "Tamil Nadu", "Andhra Pradesh", "Karnataka"],
    answer: 0,
    explanation: "Vizhinjam International Seaport near Thiruvananthapuram in Kerala is India's first automated deep-water container transshipment port, located just 10 nautical miles from the international East–West shipping route.",
    topic: "Ports & Transport",
    level: 1,
    sourceSite: "The Hindu"
  },
  {
    category: "current-affairs",
    question: "Which European country formally became the 32nd member of the North Atlantic Treaty Organization (NATO) in March 2024?",
    options: ["Sweden", "Finland", "Ukraine", "Austria"],
    answer: 0,
    explanation: "Sweden officially joined NATO as its 32nd member on 7 March 2024, following Finland which joined as the 31st member in April 2023.",
    topic: "International Organisations",
    level: 1,
    sourceSite: "BBC"
  },
  {
    category: "current-affairs",
    question: "Under the PM Surya Ghar: Muft Bijli Yojana launched in February 2024, up to how many units of free monthly electricity are targeted for 1 crore households through rooftop solar installations?",
    options: ["300 units", "100 units", "200 units", "500 units"],
    answer: 0,
    explanation: "PM Surya Ghar: Muft Bijli Yojana has an outlay of Rs 75,021 crore to install rooftop solar systems in 1 crore households, providing up to 300 units of free electricity every month.",
    topic: "Government Schemes",
    level: 1,
    sourceSite: "PIB"
  },
  {
    category: "current-affairs",
    question: "What is the primary aim of the 'One Nation One Subscription' (ONOS) scheme approved by the Union Cabinet in November 2024?",
    options: [
      "Nationwide access to international scholarly research journals for government higher education and R&D institutions",
      "A single toll pass for national highways across all states",
      "A unified OTT streaming platform operated by Prasar Bharati",
      "Single registration for agricultural mandi traders across India"
    ],
    answer: 0,
    explanation: "One Nation One Subscription (ONOS), with an allocation of Rs 6,000 crore for 2025–2027, provides students, faculty and researchers in government universities and R&D labs nationwide access to over 13,000 international scholarly journals.",
    topic: "Education & Science Policy",
    level: 2,
    sourceSite: "PIB"
  },
  {
    category: "general-science",
    question: "The BioE3 Policy approved by the Union Cabinet in August 2024 stands for Biotechnology for which three pillars?",
    options: [
      "Economy, Environment and Employment",
      "Energy, Ecology and Education",
      "Exports, Enterprise and Ethics",
      "Engineering, Evolution and Ecology"
    ],
    answer: 0,
    explanation: "The BioE3 (Biotechnology for Economy, Environment and Employment) Policy promotes high-performance biomanufacturing across bio-based chemicals, smart proteins, precision biotherapeutics and climate-resilient agriculture.",
    topic: "Science & Technology Policy",
    level: 2,
    sourceSite: "PIB"
  },
  {
    category: "computer-awareness",
    question: "What is the total financial outlay approved by the Union Cabinet for the IndiaAI Mission to build sovereign AI compute infrastructure and indigenous foundation models?",
    options: ["Rs 10,371.92 crore", "Rs 5,000 crore", "Rs 25,000 crore", "Rs 1,500 crore"],
    answer: 0,
    explanation: "Approved in March 2024 with an outlay of Rs 10,371.92 crore over five years, the IndiaAI Mission deploys more than 10,000 GPUs and supports indigenous large multimodal models and AI datasets.",
    topic: "AI & Digital India",
    level: 2,
    sourceSite: "PIB"
  },
  {
    category: "computer-awareness",
    question: "Which open-source multilingual AI initiative launched under Digital India provides voice-based language translation across Indian languages?",
    options: ["Bhashini", "MeghRaj", "DigiYatra", "Pramaan"],
    answer: 0,
    explanation: "Digital India BHASHINI (Bhasha Interface for India) is India's AI-led language translation platform that enables citizens to access digital services in their own Indian languages through voice and text.",
    topic: "AI & Digital India",
    level: 1,
    sourceSite: "SSC CGL"
  },
  {
    category: "awards-honours",
    question: "Which four sportspersons were conferred the Major Dhyan Chand Khel Ratna Award announced in January 2025 for the 2024 sporting cycle?",
    options: [
      "D. Gukesh, Manu Bhaker, Harmanpreet Singh and Praveen Kumar",
      "Neeraj Chopra, Satwiksairaj Rankireddy, Chirag Shetty and Mohammed Shami",
      "Rohan Bopanna, Avani Lekhara, Sumit Antil and Nikhat Zareen",
      "Lakshya Sen, Aman Sehrawat, Swapnil Kusale and Sreejesh P. R."
    ],
    answer: 0,
    explanation: "World Chess Champion D. Gukesh, Olympic medallist shooter Manu Bhaker, Indian men's hockey captain Harmanpreet Singh and Paralympic high-jump gold medallist Praveen Kumar received the Major Dhyan Chand Khel Ratna Award.",
    topic: "National Sports Awards",
    level: 2,
    sourceSite: "PIB"
  },
  {
    category: "sports",
    question: "Who became the first Indian woman to win two gold medals at the Paralympic Games after defending her 10m air rifle standing SH1 title at Paris 2024?",
    options: ["Avani Lekhara", "Mona Agarwal", "Sheetal Devi", "Rubina Francis"],
    answer: 0,
    explanation: "Para-shooter Avani Lekhara won gold in the women's 10m air rifle standing SH1 event at both Tokyo 2020 and Paris 2024, setting a new Paralympic record of 249.7 points.",
    topic: "Paris 2024 Paralympics",
    level: 1,
    sourceSite: "The Hindu"
  },
  {
    category: "sports",
    question: "How many total medals did India win at the Paris 2024 Paralympic Games, marking its best-ever Paralympic haul?",
    options: ["29 medals (7 gold, 9 silver, 13 bronze)", "19 medals (5 gold, 8 silver, 6 bronze)", "24 medals (6 gold, 8 silver, 10 bronze)", "35 medals (10 gold, 12 silver, 13 bronze)"],
    answer: 0,
    explanation: "India achieved its highest-ever tally at the Paris 2024 Paralympics with 29 medals — 7 gold, 9 silver and 13 bronze — finishing 18th in the medal standings.",
    topic: "Paris 2024 Paralympics",
    level: 2,
    sourceSite: "PIB"
  },
  {
    category: "sports",
    question: "Who won India's first-ever Paralympic gold medal in archery at the Paris 2024 Paralympic Games?",
    options: ["Harvinder Singh", "Rakesh Kumar", "Sheetal Devi", "Shyam Sundar Swami"],
    answer: 0,
    explanation: "Harvinder Singh won gold in the men's individual recurve open archery event at Paris 2024, after previously winning bronze at the Tokyo 2020 Paralympics.",
    topic: "Paris 2024 Paralympics",
    level: 2,
    sourceSite: "Indian Express"
  }
];

/**
 * Structured real-world news & competitive exam rows.
 * Each group defines specific question templates that embed the subject row[0]
 * or row[1] directly into the stem so that every generated question has a
 * 100% unique, human-readable question stem and a detailed explanation.
 */
const NEWS_GROUPS = [
  {
    topic: "Recent Government Schemes & Initiatives",
    category: "current-affairs",
    secondaryCategory: "economics",
    sourceSite: "PIB",
    level: 2,
    forms: [
      {
        q: "What is the primary objective of the '{0}' scheme or initiative of the Government of India?",
        a: 1,
        exp: "{0} was launched under the {2} with the objective of: {1}."
      },
      {
        q: "Which Union Ministry or nodal body implements the '{0}' programme?",
        a: 2,
        exp: "{0} ({1}) is implemented by the {2}."
      }
    ],
    rows: [
      ["PM-JANMAN (Pradhan Mantri Janjati आदिवासी Nyaya Maha Abhiyan)", "Delivering saturation of basic housing, water, road and health facilities to 75 Particularly Vulnerable Tribal Groups (PVTGs)", "Ministry of Tribal Affairs"],
      ["PM Vidyalaxmi Scheme", "Providing collateral-free and guarantor-free education loans to meritorious students admitted to top quality higher education institutions", "Ministry of Education"],
      ["Lakhpati Didi Initiative", "Empowering three crore women in Self-Help Groups to earn a sustainable annual household income of at least Rs 1 lakh", "Ministry of Rural Development"],
      ["Namo Drone Didi Scheme", "Providing agricultural drones to 15,000 women Self-Help Groups for rental services to farmers for foliar fertiliser and pesticide spraying", "Ministry of Agriculture and Farmers Welfare"],
      ["PM E-DRIVE Scheme", "Accelerating the adoption of electric two-wheelers, three-wheelers, e-ambulances, e-trucks and public charging infrastructure", "Ministry of Heavy Industries"],
      ["NPS Vatsalya Scheme", "Allowing parents and guardians to open a contributory pension account for minor children that converts into a regular NPS account at age 18", "Ministry of Finance and PFRDA"],
      ["Dharti Aaba Janjatiya Gram Utkarsh Abhiyan", "Holistic socio-economic development of over 63,000 tribal-majority villages across 30 states and union territories", "Ministry of Tribal Affairs"],
      ["Clean Plant Programme", "Providing farmers access to virus-free, high-quality horticulture planting material through Clean Plant Centres", "Ministry of Agriculture and ADB"],
      ["Digital Agriculture Mission", "Building AgriStack digital public infrastructure including farmer registries, crop-sown registries and georeferenced village maps", "Ministry of Agriculture and Farmers Welfare"],
      ["Vivad se Vishwas Scheme 2024", "Resolving pending direct tax appeals and reducing income-tax litigation through simplified settlement terms", "Ministry of Finance (CBDT)"],
      ["UNNATI 2024 (Uttar Poorva Transformative Industrialization Scheme)", "Promoting industrial development, manufacturing and service sector employment across the eight North Eastern states", "Ministry of Commerce and Industry"],
      ["Cruise Bharat Mission", "Doubling cruise passenger traffic and developing sea, river and island cruise tourism terminals across India by 2029", "Ministry of Ports, Shipping and Waterways"],
      ["Bima Sugam Portal", "Creating a unified one-stop digital marketplace for buying, servicing and settling claims across life, health and general insurance", "Insurance Regulatory and Development Authority of India (IRDAI)"],
      ["e-Shram One-Stop-Shop Portal", "Integrating welfare schemes for unorganised workers onto a single Aadhaar-seeded national database", "Ministry of Labour and Employment"],
      ["ULLAS (New India Literacy Programme)", "Imparting foundational literacy, numeracy and critical life skills to non-literate adults aged 15 years and above", "Ministry of Education"]
    ]
  },
  {
    topic: "Joint Military Exercises in News",
    category: "general-awareness",
    secondaryCategory: "current-affairs",
    sourceSite: "PIB",
    level: 2,
    forms: [
      {
        q: "With which country does India conduct the joint military or defence exercise '{0}'?",
        a: 1,
        exp: "'{0}' is a joint {2} conducted between India and {1}."
      },
      {
        q: "What branch of the armed forces participates in the bilateral exercise '{0}' between India and {1}?",
        a: 2,
        exp: "'{0}' between India and {1} is a {2}."
      }
    ],
    rows: [
      ["Shakti", "France", "joint army exercise focused on semi-urban and mountainous counter-insurgency operations"],
      ["Garuda Shakti", "Indonesia", "joint special forces military exercise"],
      ["Dharma Guardian", "Japan", "joint army exercise for tactical counter-terrorism operations"],
      ["Veer Guardian", "Japan", "bilateral air defence exercise between the Indian Air Force and JASDF"],
      ["Dustlik", "Uzbekistan", "joint military training exercise for semi-urban counter-terrorism"],
      ["Kazind", "Kazakhstan", "joint army and air force counter-insurgency exercise"],
      ["Surya Kiran", "Nepal", "battalion-level joint army exercise in jungle and mountain warfare"],
      ["Mitra Shakti", "Sri Lanka", "joint army exercise for sub-conventional operations"],
      ["SLINEX", "Sri Lanka", "bilateral naval maritime exercise"],
      ["SIMBEX", "Singapore", "annual bilateral naval exercise in the Indo-Pacific"],
      ["Bongosagar", "Bangladesh", "bilateral naval maritime patrol and exercise"],
      ["Sampriti", "Bangladesh", "joint military tactical defence exercise"],
      ["Nomadic Elephant", "Mongolia", "joint military exercise for high-altitude and peacekeeping operations"],
      ["Al Najah", "Oman", "joint army counter-terrorism exercise in desert terrain"],
      ["Eastern Bridge", "Oman", "bilateral air force operational exercise"],
      ["Cyclone", "Egypt", "joint special forces exercise in desert warfare"],
      ["Sada Tanseeq", "Saudi Arabia", "joint army tactical training exercise"],
      ["Harimau Shakti", "Malaysia", "joint bilateral army jungle warfare exercise"],
      ["Vajra Prahar", "United States of America", "joint special forces exercise between India and the USA"],
      ["Tarkash", "United States of America", "joint counter-terrorism exercise by NSG and US Special Operations Forces"],
      ["Ajeya Warrior", "United Kingdom", "biennial joint army company-level training exercise"],
      ["Konkan", "United Kingdom", "bilateral naval maritime exercise between the Indian Navy and Royal Navy"],
      ["AustraHind", "Australia", "joint bilateral multi-domain army exercise"],
      ["Lamitiye", "Seychelles", "joint military defence exercise held in the Indian Ocean region"],
      ["Khanjar", "Kyrgyzstan", "joint special forces high-altitude counter-terrorism exercise"]
    ]
  },
  {
    topic: "Science, Space & Defence Missions",
    category: "general-science",
    secondaryCategory: "inventions-discoveries",
    sourceSite: "The Hindu",
    level: 2,
    forms: [
      {
        q: "What is the primary scientific or strategic purpose of the '{0}' mission or platform recently in the news?",
        a: 1,
        exp: "{0}, developed or launched by {2}, is designed for: {1}."
      },
      {
        q: "Which space agency or defence organisation developed the '{0}' mission or system?",
        a: 2,
        exp: "{0} ({1}) was developed by {2}."
      }
    ],
    rows: [
      ["Europa Clipper", "Investigating whether Jupiter's icy moon Europa has conditions suitable for life beneath its subsurface ocean", "NASA"],
      ["JUICE (Jupiter Icy Moons Explorer)", "Studying Jupiter and its three large ocean-bearing moons Ganymede, Callisto and Europa", "European Space Agency (ESA)"],
      ["Chang'e-6", "Returning the world's first rock and soil samples from the far side of the Moon (South Pole–Aitken Basin)", "China National Space Administration (CNSA)"],
      ["SLIM (Smart Lander for Investigating Moon)", "Demonstrating pinpoint lunar landing accuracy within 100 metres of the target site", "JAXA (Japan Aerospace Exploration Agency)"],
      ["BepiColombo", "Comprehensive study of Mercury's magnetic field, magnetosphere and interior structure", "ESA and JAXA"],
      ["Psyche Mission", "Exploring the metal-rich asteroid 16 Psyche in the main asteroid belt between Mars and Jupiter", "NASA"],
      ["PROBA-3", "Demonstrating precision formation flying of two satellites to create artificial solar eclipses for studying the Sun's corona", "European Space Agency (ESA) launched by ISRO's PSLV-C59"],
      ["LUPEX (Lunar Polar Exploration)", "Joint lunar rover and lander mission to explore water ice in the permanently shadowed regions of the Moon's south pole", "ISRO and JAXA"],
      ["Shukrayaan (Venus Orbiter Mission)", "Studying the dense atmosphere, surface geology and solar wind interaction of planet Venus", "ISRO"],
      ["INS Arighaat", "Strengthening India's sea-based nuclear triad as the second Arihant-class nuclear-powered ballistic missile submarine (SSBN)", "Indian Navy and Ship Building Centre, Visakhapatnam"],
      ["INS Vaghsheer", "Operating as the sixth and final Kalvari-class (Scorpene) diesel-electric attack submarine under Project 75", "Mazagon Dock Shipbuilders Limited (MDL) for the Indian Navy"],
      ["INS Sandhayak", "Conducting full-scale coastal and deep-water hydrographic surveys as the lead ship of the Sandhayak-class survey vessels", "Garden Reach Shipbuilders & Engineers (GRSE) for the Indian Navy"],
      ["Agni-Prime (Agni-P)", "Serving as a canisterised new-generation medium-range ballistic missile with a range between 1,000 and 2,000 km", "DRDO (Defence Research and Development Organisation)"],
      ["RudraM-II", "Neutralising enemy radar and communication installations as an indigenously developed air-to-surface anti-radiation missile", "DRDO"],
      ["Astra Mk-I and Mk-II", "Engaging manoeuvring supersonic aerial targets as an indigenous Beyond Visual Range Air-to-Air Missile (BVRAAM)", "DRDO"],
      ["Kavach 4.0", "Preventing train collisions automatically as India's indigenous Automatic Train Protection (ATP) system approved by RDSO", "Research Designs and Standards Organisation (RDSO) and Indian Railways"],
      ["Param Rudra Supercomputers", "Providing high-performance computing for astronomy, physics and earth sciences deployed under the National Supercomputing Mission", "C-DAC (Centre for Development of Advanced Computing)"],
      ["Arka and Arunika", "Running high-resolution numerical weather prediction models for cyclone, heavy rainfall and heatwave forecasting", "Ministry of Earth Sciences (IITM Pune and NCMRWF Noida)"]
    ]
  },
  {
    topic: "GI Tags & Regional Heritage in News",
    category: "static-gk",
    secondaryCategory: "geography",
    sourceSite: "PIB",
    level: 2,
    forms: [
      {
        q: "The Geographical Indication (GI) tagged product '{0}' belongs to which Indian state or union territory?",
        a: 1,
        exp: "'{0}' ({2}) holds a Geographical Indication (GI) tag from {1}."
      },
      {
        q: "How is the GI-tagged item '{0}' from {1} best described?",
        a: 2,
        exp: "'{0}' from {1} is known as a {2}."
      }
    ],
    rows: [
      ["Similipal Kai Chutney", "Odisha", "traditional savoury chutney prepared by tribal communities using red weaver ants"],
      ["Kachchhi Kharek", "Gujarat", "indigenous variety of sweet dates harvested at the crisp Khalal stage in Kutch"],
      ["Ramban Anardana", "Jammu and Jammu & Kashmir", "sun-dried sour pomegranate seeds grown wild in hilly tracts"],
      ["Adi Kekir", "Arunachal Pradesh", "aromatic indigenous ginger variety cultivated in East Siang and Upper Siang districts"],
      ["Wancho Wooden Craft", "Arunachal Pradesh", "ethnic wood carving tradition depicting human and zoomorphic motifs"],
      ["Majuli Mask Making", "Assam", "handmade bamboo, clay and cloth masks used in Sattriya Bhaona theatrical performances"],
      ["Cuttack Rupa Tarakasi", "Odisha", "intricate silver filigree craft dating back over five centuries"],
      ["Narasapur Crochet Lace", "Andhra Pradesh", "delicate hand-knotted cotton lace craft practised by women artisans in the Godavari region"],
      ["Miraj Tanpura and Sitar", "Maharashtra", "handcrafted classical stringed musical instruments made from seasoned gourd and tun wood"],
      ["Bundelkhand Kathiya Gehu", "Uttar Pradesh", "drought-resistant indigenous durum wheat variety rich in protein and micronutrients"],
      ["Banaras Thandai", "Uttar Pradesh", "traditional spiced almond, fennel, rose petal and saffron beverage of Varanasi"],
      ["Tiranga Barfi", "Uttar Pradesh", "tricolour milk sweet prepared in Varanasi during the freedom movement using saffron, khoya and pistachio"],
      ["Lakadong Turmeric", "Meghalaya", "high-curcumin turmeric variety grown in the Jaintia Hills with over 7 per cent curcumin content"],
      ["Sea Buckthorn of Ladakh", "Ladakh", "cold-desert berry rich in vitamins and antioxidants known locally as Leh Berry or Tsestarlulu"],
      ["Mankurad Mango", "Goa", "prized golden-yellow coastal mango variety introduced during the Portuguese era"]
    ]
  },
  {
    topic: "Ecology, Ramsar Wetlands & Biosphere Reserves",
    category: "environmental-studies",
    secondaryCategory: "geography",
    sourceSite: "The Hindu",
    level: 2,
    forms: [
      {
        q: "In which Indian state is the Ramsar wetland or conservation site '{0}' located?",
        a: 1,
        exp: "'{0}' ({2}) is a notified Ramsar wetland site located in {1}."
      },
      {
        q: "Which ecological feature characterizes the Ramsar wetland '{0}' in {1}?",
        a: 2,
        exp: "{0} in {1} is known as a {2}."
      }
    ],
    rows: [
      ["Ankasamudra Bird Conservation Reserve", "Karnataka", "human-made village irrigation tank supporting over 240 species of resident and migratory waterbirds"],
      ["Aghanashini Estuary", "Karnataka", "brackish-water coastal estuary at the confluence of the Aghanashini river with the Arabian Sea, known for mangrove crabs and bivalves"],
      ["Magadi Kere Conservation Reserve", "Karnataka", "rainwater-fed wetland in Gadag district that serves as a major wintering ground for the Bar-headed Goose"],
      ["Karaivetti Bird Sanctuary", "Tamil Nadu", "freshwater irrigation tank in Ariyalur district hosting thousands of congregating waterbirds in winter"],
      ["Longwood Shola Reserve Forest", "Tamil Nadu", "high-altitude montane tropical shola forest and wetland ecosystem in the Nilgiris hills"],
      ["Nanjarayan Bird Sanctuary", "Tamil Nadu", "ancient restored ecosystem tank in Tiruppur district supporting migratory Eurasian waterbirds"],
      ["Kazhuveli Bird Sanctuary", "Tamil Nadu", "brackish shallow coastal lake connected to the Bay of Bengal north of Pondicherry"],
      ["Tawa Reservoir", "Madhya Pradesh", "reservoir formed at the confluence of the Tawa and Denwa rivers inside the Satpura landscape"],
      ["Nagi Bird Sanctuary", "Bihar", "human-made reservoir in Jamui district surrounded by dry deciduous hills hosting winter Indo-Gangetic waterfowl"],
      ["Nakti Bird Sanctuary", "Bihar", "freshwater habitat in Jamui district supporting over 150 bird species and Indian smooth-coated otters"],
      ["Sirpur Wetland", "Madhya Pradesh", "historic Holkar-era freshwater lake in Indore recognised for rich macrophytes and avifauna"],
      ["Yashwant Sagar", "Madhya Pradesh", "dam reservoir on the Gambhir river near Indore serving as a stronghold of the vulnerable Sarus Crane"],
      ["Ansupa Lake", "Odisha", "horseshoe-shaped oxbow freshwater lake on the bank of the Mahanadi river in Cuttack district"],
      ["Tampara Lake", "Odisha", "natural freshwater depression near the Rushikulya river basin in Ganjam district"],
      ["Hirakud Reservoir", "Odisha", "earthen dam reservoir across the Mahanadi river supporting diverse fish fauna and wintering waterbirds"],
      ["Thane Creek Flamingo Sanctuary", "Maharashtra", "mangrove-fringed tidal inlet hosting tens of thousands of Lesser and Greater Flamingos"],
      ["Shallbugh Wetland Conservation Reserve", "Jammu & Kashmir", "reed-marsh flood absorption basin in Ganderbal district feeding the Jhelum floodplain"],
      ["Hygam Wetland Conservation Reserve", "Jammu & Kashmir", "freshwater marsh in Baramulla district downstream of Wular Lake along the Central Asian Flyway"]
    ]
  },
  {
    topic: "Indian Polity & Constitutional Governance",
    category: "indian-polity",
    secondaryCategory: "general-awareness",
    sourceSite: "SSC CGL",
    level: 2,
    forms: [
      {
        q: "Under the Constitution of India, what does '{0}' specifically provide for?",
        a: 1,
        exp: "{0} of the Indian Constitution deals with {1} ({2})."
      },
      {
        q: "Which constitutional category or parliamentary context is associated with '{0}' ({1})?",
        a: 2,
        exp: "{0} ({1}) falls under {2}."
      }
    ],
    rows: [
      ["Article 279A", "Constitution of the Goods and Services Tax (GST) Council chaired by the Union Finance Minister", "Part XII — Finance, Property, Contracts and Suits inserted by the 101st Amendment"],
      ["Article 263", "Establishment of an Inter-State Council by the President to inquire into and advise upon disputes between states", "Part XI — Centre-State Administrative Relations"],
      ["Article 280", "Constitution of a Finance Commission every five years to recommend distribution of net tax proceeds between the Union and States", "Part XII — Constitutional Financial Bodies"],
      ["Article 315", "Establishment of Public Service Commissions for the Union (UPSC) and for the States (SPSC)", "Part XIV — Services Under the Union and the States"],
      ["Article 324", "Superintendence, direction and control of elections vested in the Election Commission of India", "Part XV — Elections"],
      ["Article 338B", "National Commission for Backward Classes (NCBC) with constitutional status to investigate safeguards for socially and educationally backward classes", "Part XVI — Inserted by the 102nd Constitutional Amendment Act, 2018"],
      ["Article 243D", "Reservation of seats for Scheduled Castes, Scheduled Tribes and not less than one-third seats for women in Panchayats", "Part IX — The Panchayats (73rd Constitutional Amendment)"],
      ["Article 243ZD", "Constitution of a District Planning Committee in every state to consolidate plans prepared by Panchayats and Municipalities", "Part IXA — The Municipalities (74th Constitutional Amendment)"],
      ["Article 108", "Joint sitting of both Houses of Parliament summoned by the President and presided over by the Speaker of the Lok Sabha to resolve a deadlock on an ordinary bill", "Part V — Legislative Procedure in Parliament"],
      ["Article 110", "Definition of a Money Bill and the final authority of the Speaker of the Lok Sabha to certify whether a bill is a Money Bill", "Part V — Financial Procedure in Parliament"],
      ["Article 112", "Annual Financial Statement (Union Budget) showing estimated receipts and expenditure of the Government of India for a financial year", "Part V — Parliamentary Budgetary Control"],
      ["Article 123", "Power of the President of India to promulgate Ordinances during the recess of Parliament", "Part V — Legislative Powers of the President"],
      ["Article 143", "Advisory jurisdiction empowering the President to consult the Supreme Court on questions of law or fact of public importance", "Part V — The Union Judiciary"],
      ["Article 226", "Power of High Courts to issue writs for the enforcement of Fundamental Rights as well as for any other legal right", "Part VI — The High Courts in the States"],
      ["Article 352", "Proclamation of National Emergency on grounds of war, external aggression or armed rebellion upon written cabinet recommendation", "Part XVIII — Emergency Provisions (44th Amendment safeguard)"],
      ["Sixth Schedule", "Autonomous District and Regional Councils for the administration of tribal areas in Assam, Meghalaya, Tripura and Mizoram", "Articles 244(2) and 275(1) — Tribal Self-Governance"],
      ["Tenth Schedule", "Disqualification of legislators on the ground of defection from one political party to another", "Inserted by the 52nd Constitutional Amendment Act, 1985"],
      ["Eleventh Schedule", "Twenty-nine functional items placed within the purview of Panchayati Raj Institutions", "Article 243G — 73rd Constitutional Amendment Act, 1992"]
    ]
  },
  {
    topic: "Economics, Banking & Financial Awareness",
    category: "economics",
    secondaryCategory: "current-affairs",
    sourceSite: "IBPS PO",
    level: 2,
    forms: [
      {
        q: "In banking and macroeconomic policy, how is '{0}' defined?",
        a: 1,
        exp: "{0} refers to: {1} (regulated or measured under {2})."
      },
      {
        q: "Which regulatory framework or institution governs '{0}' in India?",
        a: 2,
        exp: "{0} ({1}) is governed or monitored by {2}."
      }
    ],
    rows: [
      ["Standing Deposit Facility (SDF)", "An uncollateralised liquidity absorption tool introduced by the RBI at 25 basis points below the policy Repo Rate", "Reserve Bank of India Act, 1934 (Section 17 amendment)"],
      ["Marginal Standing Facility (MSF)", "An overnight emergency liquidity window allowing scheduled commercial banks to borrow from the RBI by dipping into their SLR portfolio up to a specified limit", "Reserve Bank of India Monetary Policy Framework"],
      ["Prompt Corrective Action (PCA) Framework", "Supervisory intervention triggered when a bank breaches risk thresholds on Capital Adequacy, Net Non-Performing Assets and Leverage Ratio", "Reserve Bank of India Department of Supervision"],
      ["Incremental Cash Reserve Ratio (I-CRR)", "Temporary additional reserve requirement imposed on scheduled banks to absorb surplus banking system liquidity", "Reserve Bank of India Monetary Operations"],
      ["Sovereign Green Bonds", "Debt instruments issued on behalf of the Government of India whose proceeds are deployed exclusively in public-sector green infrastructure projects", "Ministry of Finance and Reserve Bank of India"],
      ["Account Aggregator (AA) Framework", "Consent-based financial data-sharing network regulated as an NBFC-AA that lets individuals securely share bank, tax and investment records", "Reserve Bank of India and ReBIT technical standards"],
      ["T+0 Rolling Settlement Cycle", "Same-day settlement of equity trades where funds and securities are credited on the exact day of the transaction", "Securities and Exchange Board of India (SEBI)"],
      ["ASBA (Application Supported by Blocked Amount)", "IPO application mechanism where bid money remains blocked in the investor's bank account until shares are allotted", "Securities and Exchange Board of India (SEBI)"],
      ["Priority Sector Lending (PSL) Norms", "Mandate requiring domestic scheduled commercial banks and foreign banks with 20+ branches to direct 40% of Adjusted Net Bank Credit to agriculture, MSMEs and weaker sections", "Reserve Bank of India Financial Inclusion and Development Department"],
      ["Lead Bank Scheme", "District-level credit planning framework where a designated commercial bank coordinates credit deployment across all financial institutions in a district", "Reserve Bank of India (introduced following the Gadgil Study Group and Nariman Committee)"],
      ["NARCL (National Asset Reconstruction Company Limited)", "Bad bank established by public and private sector banks to aggregate and resolve large stressed legacy NPA accounts above Rs 500 crore", "SARFAESI Act, 2002 and IDRCL operational structure"],
      ["DICGC Deposit Insurance Cover", "Insurance protection guaranteeing up to Rs 5 lakh per depositor per insured bank covering principal and interest in the event of bank failure or moratorium", "Deposit Insurance and Credit Guarantee Corporation Act, 1961 (wholly owned RBI subsidiary)"],
      ["UDGAM Portal (Unclaimed Deposits Gateway to Access inforMation)", "Centralised web portal enabling citizens to search for unclaimed bank deposits across multiple banks in one place", "Reserve Bank of India"],
      ["PRAVAAH Portal", "Secure centralised web platform for individuals and entities to apply online for regulatory authorisations, licences and approvals", "Reserve Bank of India"],
      ["FinTech Repository and EmTech Repository", "Regulatory databases tracking Indian fintech firms and the adoption of emerging technologies like AI, cloud and DLT by regulated entities", "Reserve Bank Innovation Hub (RBIH)"]
    ]
  },
  {
    topic: "Books & Authors in Recent News",
    category: "books-authors",
    secondaryCategory: "general-knowledge",
    sourceSite: "The Hindu",
    level: 2,
    forms: [
      {
        q: "Who is the author of the book '{0}', which was recently featured in literary news and competitive exams?",
        a: 1,
        exp: "'{0}' ({2}) was written by {1}."
      },
      {
        q: "Which theme or subject is explored in the book '{0}' by {1}?",
        a: 2,
        exp: "'{0}' by {1} is a {2}."
      }
    ],
    rows: [
      ["Knife: Meditations After an Attempted Murder", "Salman Rushdie", "memoir recounting the 2022 attack on the author in New York and his recovery through art and resilience"],
      ["Why Bharat Matters", "S. Jaishankar", "foreign-policy analysis examining India's diplomatic rise in a turbulent multipolar world through the lens of the Ramayana"],
      ["Four Stars of Destiny", "General Manoj Mukund Naravane", "autobiographical account by the 28th Chief of the Army Staff covering military leadership and border challenges"],
      ["A Fly on the RBI Wall", "Alpna Killawala", "inside chronicle of 25 years of communications and policy evolution at the Reserve Bank of India"],
      ["Just a Mercenary?: Notes from My Life and Career", "Duvvuri Subbarao", "memoir by the former RBI Governor reflecting on civil service, finance ministry work and central bank autonomy"],
      ["The Winner's Mindset", "Shane Watson", "sports psychology and cricket leadership book by the former Australian all-rounder"],
      ["The Scientist Entrepreneur: Empowering Millions of Women", "Kalpana Sankar", "autobiography documenting microfinance and grassroots women's empowerment in rural India"],
      ["Breaking the Mould: Reimagining India's Economic Future", "Raghuram Rajan and Rohit Lamba", "economic treatise proposing human-capital and high-value services-led growth for India"],
      ["Prophet Song", "Paul Lynch", "Booker Prize-winning dystopian novel depicting a Dublin family navigating a slide into totalitarianism"],
      ["Kairos", "Jenny Erpenbeck (translated by Michael Hofmann)", "International Booker Prize-winning novel set in East Berlin during the collapse of the German Democratic Republic"],
      ["Western Lane", "Chetna Maroo", "Booker-shortlisted debut novel following an eleven-year-old British Gujarati girl processing grief through squash"],
      ["Victory City", "Salman Rushdie", "epic historical fiction retelling the rise and fall of the medieval Vijayanagara-inspired Bisnaga empire"],
      ["Smoke and Ashes: A Writer's Journey Through Opium's Hidden Histories", "Amitav Ghosh", "non-fiction exploration of how the colonial opium trade shaped modern Asia and the global economy"],
      ["Ambedkar: A Life", "Shashi Tharoor", "biographical study of Dr B. R. Ambedkar's constitutional philosophy, social reform struggles and intellectual legacy"],
      ["Tomb of Sand (Ret Samadhi)", "Geetanjali Shree (translated by Daisy Rockwell)", "first Hindi-language novel to win the International Booker Prize, following an 80-year-old woman's journey after Partition"]
    ]
  },
  {
    topic: "Important National & International Days in News",
    category: "days-events",
    secondaryCategory: "current-affairs",
    sourceSite: "PIB",
    level: 2,
    forms: [
      {
        q: "On which date is '{0}' observed in India or internationally?",
        a: 1,
        exp: "{0} is observed on {1} ({2})."
      },
      {
        q: "Why is '{0}' commemorated on {1}?",
        a: 2,
        exp: "Observed on {1}, {0} marks {2}."
      }
    ],
    rows: [
      ["Janjatiya Gaurav Divas", "15 November", "the birth anniversary of tribal freedom fighter Bhagwan Birsa Munda honouring tribal contributions to Indian history"],
      ["Veer Baal Divas", "26 December", "the martyrdom of Sahibzada Zorawar Singh and Sahibzada Fateh Singh, the younger sons of Guru Gobind Singh"],
      ["Parakram Divas", "23 January", "the birth anniversary of Netaji Subhas Chandra Bose celebrating his indomitable spirit and service to the nation"],
      ["Samvidhan Hatya Divas", "25 June", "remembrance of those who suffered abuse of power during the imposition of the Emergency on 25 June 1975"],
      ["Good Governance Day (Susashan Divas)", "25 December", "the birth anniversary of former Prime Minister Atal Bihari Vajpayee promoting transparent citizen-centric administration"],
      ["National Dolphin Day", "5 October", "awareness and conservation of the Gangetic River Dolphin, India's National Aquatic Animal"],
      ["National Startup Day", "16 January", "the anniversary of the launch of the Startup India initiative celebrating India's innovation ecosystem"],
      ["National Handloom Day", "7 August", "commemoration of the Swadeshi Movement launched on 7 August 1905 in Calcutta to promote indigenous weavers"],
      ["National Javelin Day", "7 August", "commemoration of Neeraj Chopra's historic Tokyo Olympic gold medal in men's javelin throw on 7 August 2021"],
      ["Partition Horrors Remembrance Day (Vibhajan Vibhishika Smriti Divas)", "14 August", "tribute to the resilience and sacrifices of millions displaced during the Partition of 1947"],
      ["International Day of Zero Waste", "30 March", "UN observance led by UNEP and UN-Habitat promoting sustainable consumption and circular economy practices"],
      ["World Pulses Day", "10 February", "UN Food and Agriculture Organization observance recognising the nutritional and soil-nitrogen fixing value of pulses"],
      ["World Basketball Day", "21 December", "UN observance marking the day Dr James Naismith introduced the game of basketball in Springfield in 1891"],
      ["International Day of Clean Energy", "26 January", "UN observance coinciding with the founding date of the International Renewable Energy Agency (IRENA)"]
    ]
  },
  {
    topic: "Competitive Exam Science — Physics, Chemistry & Biology",
    category: "physics",
    secondaryCategory: "chemistry",
    sourceSite: "RRB NTPC",
    level: 2,
    forms: [
      {
        q: "In competitive science exams, which principle or phenomenon explains '{0}'?",
        a: 1,
        exp: "{0} is explained by {1} ({2})."
      },
      {
        q: "What is a practical application or consequence of '{1}' seen in '{0}'?",
        a: 2,
        exp: "{1} ({0}) is applied in: {2}."
      }
    ],
    rows: [
      ["Transmission of light signals through optical fibres with negligible loss", "Total Internal Reflection (TIR)", "high-speed broadband telecom cables and medical endoscopes"],
      ["Blue appearance of the clear daytime sky", "Rayleigh Scattering of shorter-wavelength light by atmospheric molecules", "scattering inversely proportional to the fourth power of wavelength"],
      ["Apparent shift in frequency of sound or light waves due to relative motion between source and observer", "Doppler Effect", "police speed radar guns, echocardiography and measuring redshift of distant galaxies"],
      ["Rise of sap in plant xylem capillaries and oil in a lamp wick", "Capillary Action driven by surface tension and adhesive forces", "absorption of water by blotting paper and soil moisture movement"],
      ["Upward lift experienced by a spinning ball or an aerofoil wing in fluid flow", "Bernoulli's Principle of pressure-velocity trade-off", "atomisers, aircraft wing design and Bunsen burner air intake"],
      ["Induced electromotive force opposing the change in magnetic flux that produces it", "Lenz's Law of Electromagnetic Induction", "eddy-current braking in high-speed trains and induction cooktops"],
      ["Splitting of spectral lines when an atom is placed in an external static magnetic field", "Zeeman Effect", "measuring magnetic fields of sunspots and distant stars in astrophysics"],
      ["Emission of photoelectrons from a metal surface only when incident light exceeds a threshold frequency", "Photoelectric Effect explained by Einstein's photon theory", "solar photovoltaic cells, light meters and automatic door sensors"],
      ["Constant ratio of sine of angle of incidence to sine of angle of refraction for two given media", "Snell's Law of Refraction", "designing corrective lenses, prisms and refractometers"],
      ["Production of a potential difference across an electrical conductor when a magnetic field is applied perpendicular to current flow", "Hall Effect", "brushless DC motor sensors, automotive wheel-speed sensors and magnetometers"]
    ]
  },
  {
    topic: "Chemistry in Everyday Life & Industry",
    category: "chemistry",
    secondaryCategory: "general-science",
    sourceSite: "SSC CGL",
    level: 2,
    forms: [
      {
        q: "Which chemical compound or substance is specifically used for '{0}'?",
        a: 1,
        exp: "{1} ({2}) is used for {0}."
      },
      {
        q: "What is the chemical nature or formula description of '{1}' used in '{0}'?",
        a: 2,
        exp: "{1}, used for {0}, is {2}."
      }
    ],
    rows: [
      ["Artificial cloud seeding to induce rainfall in drought-prone regions", "Silver Iodide (AgI)", "a crystalline inorganic compound whose hexagonal lattice mimics natural ice crystals"],
      ["Indelible voter ink applied on the finger during Indian elections", "Silver Nitrate (AgNO3)", "a photosensitive salt that reacts with skin chloride and darkens upon exposure to ultraviolet light"],
      ["Odorant added to domestic LPG cylinders to detect gas leaks immediately", "Ethyl Mercaptan (Ethanethiol)", "a volatile organosulfur compound with a pungent smell added to odourless propane-butane gas"],
      ["Airbag rapid inflation in automobiles during a collision impact", "Sodium Azide (NaN3)", "an inorganic salt that decomposes thermally on impact to release harmless nitrogen gas within milliseconds"],
      ["De-icing snow-covered airport runways and mountain roads in sub-zero temperatures", "Calcium Chloride (CaCl2)", "a hygroscopic exothermic salt that depresses the freezing point of water down to minus 29 degrees Celsius"],
      ["Fireproofing fabrics and acting as a mordant in textile dyeing", "Potash Alum (K2SO4.Al2(SO4)3.24H2O)", "a double sulfate salt of potassium and aluminium also used for water coagulation"],
      ["Non-stick coating applied to modern cookware surfaces", "Polytetrafluoroethylene (PTFE / Teflon)", "a synthetic fluoropolymer of tetrafluoroethylene with high thermal stability and chemical inertness"],
      ["Bulletproof vests and high-tensile aerospace armour fibres", "Kevlar (Poly-paraphenylene terephthalamide)", "a heat-resistant para-aramid synthetic polymer with five times the tensile strength of steel by weight"],
      ["Antacid suspension (Milk of Magnesia) used to neutralise excess stomach acid", "Magnesium Hydroxide (Mg(OH)2)", "a mild alkaline suspension that reacts with hydrochloric acid in gastric juice without producing carbon dioxide"],
      ["Preservation of biological specimens in pathology and anatomy laboratories", "Formalin (aqueous Formaldehyde solution)", "a 37 to 40 per cent aqueous solution of methanal that cross-links proteins to prevent decay"]
    ]
  },
  {
    topic: "Biology, Health & Medical Science in News",
    category: "biology",
    secondaryCategory: "general-science",
    sourceSite: "SSC CHSL",
    level: 2,
    forms: [
      {
        q: "In human biology and public health news, what is '{0}' known for?",
        a: 1,
        exp: "{0} is associated with: {1} ({2})."
      },
      {
        q: "Which biological mechanism or clinical context applies to '{0}'?",
        a: 2,
        exp: "{0} ({1}) involves {2}."
      }
    ],
    rows: [
      ["Cervavac", "India's first indigenously developed quadrivalent Human Papillomavirus (qHPV) vaccine against cervical cancer", "developed by Serum Institute of India in partnership with the Department of Biotechnology"],
      ["Casgevy", "World's first regulator-approved CRISPR-Cas9 gene-editing therapy for Sickle Cell Disease and Beta-Thalassemia", "edits the BCL11A gene in patient bone-marrow stem cells to restore fetal haemoglobin production"],
      ["NexCAR19", "India's first indigenous CAR-T cell therapy approved for treating B-cell lymphomas and leukaemia", "developed jointly by IIT Bombay, Tata Memorial Centre and ImmunoAct"],
      ["R21/Matrix-M", "High-efficacy malaria vaccine recommended by the WHO for prevention of Plasmodium falciparum malaria in children", "developed by the University of Oxford and manufactured by Serum Institute of India"],
      ["Qdenga (TAK-003)", "Live-attenuated tetravalent vaccine prequalified by the WHO against all four serotypes of Dengue virus", "designed around a Dengue serotype-2 backbone providing broad immunological protection"],
      ["National Sickle Cell Anaemia Elimination Mission", "Eliminating sickle cell genetic transmission as a public health problem in India by 2047 through screening 7 crore people in tribal districts", "screens individuals aged 0 to 40 years for inherited haemoglobin beta-globin point mutation"],
      ["Wolbachia Method", "Biological control technique introducing symbiotic Wolbachia bacteria into Aedes aegypti mosquitoes to block dengue and Zika transmission", "endorsed by the World Mosquito Program to reduce arboviral replication inside vectors"],
      ["iNCOVACC (BBV154)", "World's first intranasal COVID-19 vaccine approved for primary and heterologous booster immunisation", "adenoviral vector vaccine developed by Bharat Biotech eliciting mucosal IgA immunity in the upper respiratory tract"],
      ["Nikshay Poshan Yojana", "Direct benefit transfer nutrition support scheme for all notified Tuberculosis (TB) patients under the National TB Elimination Programme", "supports recovery from Mycobacterium tuberculosis infection through high-protein dietary supplementation"],
      ["Mitochondrial Replacement Therapy (Three-Parent Baby Technique)", "Assisted reproductive procedure replacing defective maternal mitochondria with healthy donor ooplasm mitochondria", "prevents transmission of maternally inherited mitochondrial DNA disorders"]
    ]
  },
  {
    topic: "Indian History & Culture in Competitive Exams",
    category: "indian-history",
    secondaryCategory: "static-gk",
    sourceSite: "SSC CGL",
    level: 2,
    forms: [
      {
        q: "In Indian history, what is the historical significance of '{0}'?",
        a: 1,
        exp: "{0} is significant for: {1} ({2})."
      },
      {
        q: "Which ruler, leader or historical context is linked with '{0}'?",
        a: 2,
        exp: "{0} ({1}) is associated with {2}."
      }
    ],
    rows: [
      ["Uttaramerur Inscriptions of Chingleput", "Detailed stone temple inscriptions recording the 'Kudavolai' ballot system of village sabha local self-government", "reign of Chola Emperor Parantaka I in the 10th century CE"],
      ["Battle of Saraighat (1671)", "Decisive naval battle on the Brahmaputra river where the Ahom forces defeated the Mughal imperial fleet", "led by Ahom commander Lachit Borphukan near Guwahati"],
      ["Maratha Military Landscapes of India", "Network of twelve hill, coastal and island forts showcasing strategic Maratha fortification architecture", "Chhatrapati Shivaji Maharaj's 17th-century defensive network including Raigad, Sindhudurg, Pratapgad and Gingee"],
      ["Vaikom Satyagraha (1924–25)", "Temple-entry and anti-untouchability movement demanding the right of oppressed castes to walk on roads around Vaikom Mahadeva Temple", "led by K. Kelappan, T. K. Madhavan and E. V. Ramasamy 'Periyar' in Travancore"],
      ["Tebhaga Movement (1946–47)", "Peasant uprising in Bengal demanding that sharecroppers (bargadars) retain two-thirds of the harvest instead of half", "organised by the Bangiya Pradeshik Kisan Sabha"],
      ["Hoysala Sacred Ensembles", "Star-shaped soapstone temple complexes famed for hyper-realistic sculptural friezes and lathe-turned pillars", "Belur, Halebidu and Somanathapura built in 12th–13th century Karnataka under Vishnuvardhana and Narasimha III"],
      ["Kakatiya Rudreshwara (Ramappa) Temple", "13th-century sandbox-foundation temple whose vimana is built with porous 'floating bricks' that reduce structural weight", "built in 1213 CE by general Recharla Rudra during the reign of Kakatiya king Ganapati Deva in Telangana"],
      ["Ghadar Party (1913)", "Revolutionary anti-colonial organisation founded by Indian expatriates on the Pacific Coast of North America with its newspaper 'The Ghadar'", "headquartered at Yugantar Ashram in San Francisco under Sohan Singh Bhakna and Lala Har Dayal"],
      ["Poona Pact (24 September 1932)", "Agreement replacing separate electorates for the Depressed Classes with reserved seats within the general electorate", "signed at Yerwada Central Jail, Pune between Dr B. R. Ambedkar and Madan Mohan Malaviya"],
      ["Cabinet Mission Plan (1946)", "Three-tier constitutional proposal that set up the Constituent Assembly of India while rejecting the demand for a separate sovereign Pakistan", "composed of Lord Pethick-Lawrence, Sir Stafford Cripps and A. V. Alexander"]
    ]
  },
  {
    topic: "Competitive English & Grammar Usage",
    category: "english",
    secondaryCategory: "general-english-grammar",
    sourceSite: "SSC CGL",
    level: 2,
    forms: [
      {
        q: "In competitive English usage, what does the expression or literary term '{0}' mean?",
        a: 1,
        exp: "'{0}' means: {1}. ({2})"
      },
      {
        q: "Which example or grammatical note correctly illustrates '{0}'?",
        a: 2,
        exp: "For '{0}' ({1}): {2}."
      }
    ],
    rows: [
      ["Pyrrhic victory", "A victory won at such a devastating cost that it is tantamount to defeat", "Named after King Pyrrhus of Epirus following the Battle of Asculum against Rome"],
      ["Hobson's choice", "An apparently free choice where there is in reality only one option offered: take it or leave it", "Originates from Cambridge stable owner Thomas Hobson, who made customers take the horse nearest the door"],
      ["Sword of Damocles", "An ever-present and imminent peril hanging over someone in a position of power", "Alludes to the courtier Damocles seated beneath a sword suspended by a single horsehair"],
      ["Cut the Gordian knot", "Solve an intractably complex problem through bold, decisive and direct action", "Refers to Alexander the Great slicing the intricate knot at Gordium with his sword"],
      ["Cross the Rubicon", "Take an irrevocable step that commits a person to a definite course of action with no turning back", "Refers to Julius Caesar leading his legion across the Rubicon river in 49 BCE"],
      ["White elephant", "A costly possession that is burdensome to maintain and yields little practical value", "Derived from the sacred white elephants gifted by monarchs in Southeast Asia"],
      ["Barking up the wrong tree", "Pursuing a mistaken line of inquiry or directing blame at the wrong person", "Metaphor drawn from hunting dogs baying at the base of a tree after the quarry has escaped"],
      ["Subjunctive mood after 'lest'", "Requires the modal auxiliary 'should' or bare subjunctive without a negative particle", "Example: 'Walk carefully lest you should fall' (never 'lest you should not fall')"],
      ["Inversion after negative adverbs ('Seldom', 'Hardly', 'No sooner')", "Places the auxiliary verb before the subject when a negative adverbial opens a sentence", "Example: 'No sooner had the train arrived than the passengers boarded' ('No sooner... than', 'Hardly... when')"],
      ["Singular agreement with 'Many a'", "Takes a singular countable noun and a singular verb despite conveying a plural meaning", "Example: 'Many a candidate has cleared the examination with disciplined practice'"]
    ]
  },
  {
    topic: "Abbreviations & Tech Acronyms in News",
    category: "abbreviations",
    secondaryCategory: "computer-awareness",
    sourceSite: "IBPS PO",
    level: 2,
    forms: [
      {
        q: "What does the acronym '{0}', frequently seen in recent news and competitive exams, stand for?",
        a: 1,
        exp: "{0} stands for '{1}' ({2})."
      }
    ],
    rows: [
      ["DPDP Act", "Digital Personal Data Protection Act", "India's 2023 data privacy legislation regulating the processing of digital personal data"],
      ["ANRF", "Anusandhan National Research Foundation", "statutory apex body established by the ANRF Act 2023 to seed and fund R&D across Indian universities"],
      ["ONDC", "Open Network for Digital Commerce", "open-protocol network backed by DPIIT to democratise digital e-commerce across India"],
      ["OCEN", "Open Credit Enablement Network", "digital credit protocol connecting lenders and marketplaces to enable cash-flow-based microloans for MSMEs"],
      ["CBAM", "Carbon Border Adjustment Mechanism", "European Union tariff mechanism placing a carbon price on carbon-intensive imports such as steel, cement and aluminium"],
      ["LEADS Index", "Logistics Ease Across Different States Index", "annual benchmark published by the Ministry of Commerce and Industry assessing state-level logistics infrastructure"],
      ["PARAKH", "Performance Assessment, Review, and Analysis of Knowledge for Holistic Development", "national assessment centre set up under NCERT pursuant to NEP 2020 to standardise school board evaluations"],
      ["APAAR ID", "Automated Permanent Academic Account Registry ID", "One Nation One Student ID lifelong 12-digit academic credit bank identifier under NEP 2020"],
      ["PRITHvi", "Promoting Research in Earth Systems Science, Technology and Human Resource Development", "umbrella scheme of the Ministry of Earth Sciences covering atmosphere, ocean, cryosphere and geoscience"],
      ["SATHI Portal", "Seed Traceability, Authentication and Holistic Inventory Portal", "digital platform developed by the Ministry of Agriculture and NIC for end-to-end seed certification and tracking"],
      ["CHAMPIONS Portal", "Creation and Harmonious Application of Modern Processes for Increasing the Output and National Strength", "AI-enabled single-window grievance redressal and handholding portal of the Ministry of MSME"],
      ["DARPAN", "Digital Advancement of Rural Post Office for A New India", "IT modernisation project equipping rural branch postmasters with handheld devices for banking and postal services"]
    ]
  },
  {
    topic: "Logical & Verbal Reasoning from Competitive Exams",
    category: "reasoning",
    secondaryCategory: "general-awareness",
    sourceSite: "SSC CGL",
    level: 2,
    forms: [
      {
        q: "{0}",
        a: 1,
        exp: "{2}"
      }
    ],
    rows: [
      [
        "Complete the analogy from scientific instrumentation: Seismograph : Earthquakes :: Pyrheliometer : ?",
        "Direct beam solar radiation",
        "A seismograph measures earthquake seismic waves, whereas a pyrheliometer is specifically designed to measure direct beam solar irradiance."
      ],
      [
        "Complete the analogy from Indian constitutional posts: Attorney General : Article 76 :: Advocate General of a State : ?",
        "Article 165",
        "Article 76 provides for the Attorney General for India, and the corresponding state-level constitutional office — the Advocate General — is provided under Article 165."
      ],
      [
        "Complete the analogy from space exploration: Vikram : Lander :: Pragyan : ?",
        "Six-wheeled Lunar Rover",
        "In ISRO's Chandrayaan-3 mission, Vikram was the lunar lander module while Pragyan was the six-wheeled solar-powered lunar rover."
      ],
      [
        "Complete the analogy from specialized studies: Numismatics : Coins :: Epigraphy : ?",
        "Ancient inscriptions",
        "Numismatics is the study of coins and currency, whereas Epigraphy is the study and decipherment of ancient inscriptions on stone, metal and terracotta."
      ],
      [
        "Complete the analogy from classical dances and states: Sattriya : Assam :: Gotipua : ?",
        "Odisha",
        "Sattriya is the classical dance form of Assam introduced by Srimanta Sankardev, while Gotipua is the traditional dance of Odisha that served as the precursor to Odissi."
      ],
      [
        "Complete the analogy from international headquarters: International Court of Justice : The Hague :: International Maritime Organization : ?",
        "London",
        "The International Court of Justice is seated at the Peace Palace in The Hague, while the UN International Maritime Organization (IMO) is headquartered in London."
      ],
      [
        "Complete the analogy from parliamentary committees: Public Accounts Committee : 22 members (15 Lok Sabha + 7 Rajya Sabha) :: Estimates Committee : ?",
        "30 members exclusively from the Lok Sabha",
        "Unlike the Public Accounts Committee (22 members from both Houses), the Estimates Committee consists of 30 members elected solely from the Lok Sabha."
      ],
      [
        "Complete the analogy from biosphere reserves: Nokrek : Meghalaya :: Agasthyamalai : ?",
        "Kerala and Tamil Nadu",
        "Nokrek Biosphere Reserve is located in the Garo Hills of Meghalaya, whereas Agasthyamalai Biosphere Reserve spans the southern Western Ghats across Kerala and Tamil Nadu."
      ],
      [
        "Complete the analogy from cellular biology: Ribosome : Protein synthesis :: Lysosome : ?",
        "Intracellular digestion and waste clearance",
        "Ribosomes are the sites of protein synthesis (translation), while lysosomes contain hydrolytic enzymes for intracellular digestion and autophagy."
      ],
      [
        "Complete the analogy from economic curves: Lorenz Curve : Income inequality :: Phillips Curve : ?",
        "Inverse relationship between inflation and unemployment",
        "The Lorenz Curve graphically represents income or wealth inequality, whereas the Phillips Curve depicts the short-run inverse relationship between inflation and unemployment."
      ]
    ]
  },
  {
    topic: "International Summits, Treaties & Global Affairs",
    category: "general-knowledge",
    secondaryCategory: "current-affairs",
    sourceSite: "The Hindu",
    level: 2,
    forms: [
      {
        q: "Where was the '{0}' held or headquartered according to recent international affairs?",
        a: 1,
        exp: "{0} is associated with {1} ({2})."
      },
      {
        q: "What was the key outcome or focus of '{0}' at {1}?",
        a: 2,
        exp: "At {1}, {0} focused on: {2}."
      }
    ],
    rows: [
      ["24th Meeting of the SCO Council of Heads of State (2024)", "Astana, Kazakhstan", "admission of Belarus as the 10th full member state of the Shanghai Cooperation Organisation"],
      ["6th BIMSTEC Summit", "Bangkok, Thailand", "adoption of the Bangkok Vision 2030 and entry into force of the BIMSTEC Charter for Bay of Bengal regional cooperation"],
      ["44th and 45th ASEAN Summits (2024)", "Vientiane, Laos", "theme 'ASEAN: Enhancing Connectivity and Resilience' strengthening Indo-Pacific supply chains and digital economy ties"],
      ["50th G7 Leaders' Summit (2024)", "Borgo Egnazia (Apulia), Italy", "launch of the G7 Apulia Food Systems Initiative and Partnership for Global Infrastructure and Investment (PGII) corridors"],
      ["27th Commonwealth Heads of Government Meeting (CHOGM 2024)", "Apia, Samoa", "first CHOGM hosted by a Pacific Small Island Developing State, adopting the Apia Commonwealth Ocean Declaration"],
      ["19th Summit of the Non-Aligned Movement (NAM 2024)", "Kampala, Uganda", "theme 'Deepening Cooperation for Shared Global Affluence' bringing together 120 developing member states"],
      ["UN Biodiversity Conference (COP16 to the CBD)", "Cali, Colombia", "operationalisation of the Cali Fund for fair sharing of benefits from digital sequence information on genetic resources"],
      ["UN Summit of the Future (September 2024)", "United Nations Headquarters, New York", "adoption of the Pact for the Future, the Global Digital Compact and the Declaration on Future Generations"],
      ["AI Action Summit / Bletchley & Seoul AI Safety Process", "Seoul and Paris", "international commitments on frontier AI safety testing, governance and inclusive artificial intelligence"],
      ["India-Middle East-Europe Economic Corridor (IMEC)", "New Delhi G20 MoU Corridor linking India, UAE, Saudi Arabia, Jordan, Israel and Europe", "multimodal ship-to-rail transit network accompanied by clean hydrogen pipelines and undersea high-speed data cables"],
      ["High Seas Treaty (BBNJ Agreement)", "United Nations Convention on the Law of the Sea (UNCLOS) framework", "legally binding global treaty to protect marine biodiversity in areas beyond national jurisdiction covering two-thirds of the oceans"],
      ["Minamata Convention on Mercury", "Geneva, Switzerland (UNEP Secretariat)", "global environmental treaty protecting human health and the environment from anthropogenic emissions of mercury"]
    ]
  },
  {
    topic: "Sports Championships, Trophies & Venues in News",
    category: "sports",
    secondaryCategory: "general-awareness",
    sourceSite: "Jagran Josh",
    level: 2,
    forms: [
      {
        q: "Which team, athlete or host city is associated with '{0}' in recent sports news?",
        a: 1,
        exp: "{0} — {1} ({2})."
      },
      {
        q: "What notable achievement or record was recorded at '{0}'?",
        a: 2,
        exp: "In {0} ({1}): {2}."
      }
    ],
    rows: [
      ["2024 Thomas Cup and Uber Cup Finals (Chengdu)", "China", "China swept both the men's Thomas Cup and women's Uber Cup badminton team titles on home soil in Chengdu"],
      ["Santosh Trophy 77th National Football Championship (2024)", "Services Football Team (hosted in Yupia, Arunachal Pradesh)", "Services defeated Goa in the final at Golden Jubilee Stadium in Arunachal Pradesh to claim their seventh Santosh Trophy"],
      ["133rd Durand Cup Football Tournament (2024)", "NorthEast United FC (final at Salt Lake Stadium, Kolkata)", "NorthEast United FC defeated defending champions Mohun Bagan Super Giant on penalties to win their maiden Durand Cup trophy"],
      ["2024 Women's Premier League (WPL Season 2)", "Royal Challengers Bengaluru (captained by Smriti Mandhana)", "Royal Challengers Bengaluru defeated Delhi Capitals at Arun Jaitley Stadium to win their first WPL title"],
      ["2024 Ranji Trophy Cricket Championship", "Mumbai (captained by Ajinkya Rahane)", "Mumbai defeated Vidarbha at Wankhede Stadium to win a record-extending 42nd Ranji Trophy title"],
      ["2024 ICC Women's T20 World Cup (hosted in UAE)", "New Zealand White Ferns", "New Zealand defeated South Africa by 32 runs in the Dubai final to lift their maiden ICC Women's T20 World Cup"],
      ["2024 Asian Champions Trophy Men's Hockey (Hulunbuir, China)", "Indian Men's Hockey Team (captained by Harmanpreet Singh)", "India defeated host nation China 1–0 in the final to win a record fifth Asian Champions Trophy title"],
      ["20th Asian Games (2026 Scheduled Host)", "Aichi-Nagoya, Japan", "co-hosted by Aichi Prefecture and the city of Nagoya as the third Asian Games held in Japan after Tokyo 1958 and Hiroshima 1994"],
      ["2026 Commonwealth Games Host City", "Glasgow, Scotland", "selected as host for the 23rd Commonwealth Games after previously staging the 2014 edition"],
      ["2026 FIFA Men's World Cup Host Nations", "United States, Canada and Mexico", "first FIFA World Cup to feature an expanded 48-team format across 16 host cities in three North American countries"],
      ["2034 FIFA Men's World Cup Host Nation", "Saudi Arabia", "confirmed by the FIFA Congress as the sole host nation for the 25th edition of the tournament"],
      ["Rohan Bopanna at the 2024 Australian Open Men's Doubles", "Grand Slam title with Matthew Ebden at age 43", "became the oldest first-time World No. 1 in ATP Doubles history and the oldest man in the Open Era to win a Grand Slam men's doubles title"]
    ]
  },
  {
    topic: "Cyber Security, Cloud & Computer Awareness",
    category: "computer-awareness",
    secondaryCategory: "inventions-discoveries",
    sourceSite: "IBPS PO",
    level: 2,
    forms: [
      {
        q: "In computer science and cyber security exams, what is the role of '{0}'?",
        a: 1,
        exp: "{0} is defined as: {1} ({2})."
      },
      {
        q: "Which technical layer, protocol or standard is associated with '{0}'?",
        a: 2,
        exp: "{0} ({1}) operates with {2}."
      }
    ],
    rows: [
      ["Zero-Trust Security Architecture", "A security model requiring strict identity verification for every user and device attempting to access resources, regardless of whether they are inside or outside the network perimeter", "NIST SP 800-207 principle of 'never trust, always verify'"],
      ["DNSSEC (Domain Name System Security Extensions)", "Cryptographic authentication of DNS responses to prevent DNS cache poisoning and man-in-the-middle redirection attacks", "uses digital signatures based on public-key cryptography in DNS zone records"],
      ["WPA3 (Wi-Fi Protected Access 3)", "Wireless network security certification replacing WPA2 PSK with Simultaneous Authentication of Equals (SAE) to resist offline dictionary attacks", "mandated by the Wi-Fi Alliance with 128-bit or 192-bit cryptographic suites"],
      ["Passkeys (FIDO2 / WebAuthn Standard)", "Passwordless authentication mechanism using device-bound public-key cryptography and biometrics instead of shared text passwords", "standardized by the FIDO Alliance and World Wide Web Consortium (W3C)"],
      ["Post-Quantum Cryptography (PQC)", "Cryptographic algorithms based on mathematical lattice problems designed to remain secure against attacks by both classical and quantum computers", "standardized by NIST (FIPS 203 ML-KEM, FIPS 204 ML-DSA and FIPS 205 SLH-DSA)"],
      ["Retrieval-Augmented Generation (RAG)", "AI architecture that grounds Large Language Model outputs by retrieving relevant documents from an external knowledge base before generating a response", "reduces hallucinations and enables up-to-date citations without retraining model weights"],
      ["Docker Containerization", "Operating-system-level virtualization that packages an application and its dependencies into isolated user-space instances sharing the host OS kernel", "uses Linux kernel namespaces and control groups (cgroups)"],
      ["IPv6 (Internet Protocol version 6)", "Next-generation network layer protocol using 128-bit hexadecimal addresses to overcome IPv4 address exhaustion", "developed by the Internet Engineering Task Force (IETF) in RFC 8200"],
      ["CERT-In (Indian Computer Emergency Response Team)", "National nodal agency for responding to computer security incidents, vulnerability advisories and cyber threat mitigation in India", "operates under Section 70B of the Information Technology Act, 2000 within MeitY"],
      ["ACID Properties in Relational Databases", "Guarantee of Atomicity, Consistency, Isolation and Durability ensuring reliable processing of database transactions", "formulated by Andreas Reuter and Theo Harder for fault-tolerant DBMS engines"]
    ]
  },
  {
    topic: "Quantitative & Mathematical Concepts from Competitive Exams",
    category: "quantitative-aptitude",
    secondaryCategory: "mathematics",
    sourceSite: "SSC CGL",
    level: 2,
    forms: [
      {
        q: "{0}",
        a: 1,
        exp: "{2}"
      }
    ],
    rows: [
      [
        "According to Euler's polyhedron formula for any convex polyhedron with V vertices, E edges and F faces, what is the value of V - E + F?",
        "2",
        "Euler's characteristic for any convex polyhedron states that Vertices (V) minus Edges (E) plus Faces (F) always equals 2 (for example, a cube has 8 - 12 + 6 = 2)."
      ],
      [
        "When two successive discounts of a% and b% are offered on the marked price of an article, what is the single equivalent discount percentage?",
        "(a + b - ab/100)%",
        "Applying b% after a% leaves (1 - a/100)(1 - b/100) of the marked price, yielding a net single equivalent discount of (a + b - ab/100)%."
      ],
      [
        "In a triangle, what is the point of concurrency of the three medians — which divides each median in the ratio 2 : 1 — called?",
        "Centroid",
        "The three medians of a triangle intersect at the Centroid, which is the centre of mass of the triangle and divides each median in a 2 : 1 ratio from the vertex."
      ],
      [
        "In any triangle, which point is equidistant from all three vertices and serves as the centre of the circle passing through those vertices?",
        "Circumcentre (intersection of perpendicular bisectors)",
        "The perpendicular bisectors of the three sides of a triangle meet at the Circumcentre, which is equidistant from the three vertices."
      ],
      [
        "What is the relation between the Arithmetic Mean (AM), Geometric Mean (GM) and Harmonic Mean (HM) of two positive real numbers?",
        "GM^2 = AM x HM (with AM >= GM >= HM)",
        "For any two positive numbers a and b, AM = (a+b)/2, GM = sqrt(ab) and HM = 2ab/(a+b), satisfying GM^2 = AM x HM and the inequality AM >= GM >= HM."
      ],
      [
        "For a moderately skewed frequency distribution in statistics, what is Karl Pearson's empirical relationship between Mean, Median and Mode?",
        "Mode = 3 Median - 2 Mean",
        "Karl Pearson's empirical formula for a moderately asymmetrical distribution states that (Mean - Mode) = 3(Mean - Median), which simplifies to Mode = 3 Median - 2 Mean."
      ],
      [
        "What is the difference between Compound Interest (CI) and Simple Interest (SI) on a principal P at r% per annum for 2 years (compounded annually)?",
        "P x (r / 100)^2",
        "For 2 years, SI = 2Pr/100 and CI = P[(1 + r/100)^2 - 1] = 2Pr/100 + P(r/100)^2, so CI - SI = P(r/100)^2."
      ],
      [
        "If two chords AB and CD of a circle intersect internally at point P, which geometric relation always holds true?",
        "PA x PB = PC x PD",
        "By the Intersecting Chords Theorem (Power of a Point), when two chords AB and CD intersect at P, the products of their segments are equal: PA x PB = PC x PD."
      ],
      [
        "If a tangent segment PT and a secant PAB are drawn to a circle from an external point P, which relation connects PT, PA and PB?",
        "PT^2 = PA x PB",
        "By the Tangent-Secant Theorem, the square of the length of the tangent segment PT equals the product of the external secant segment PA and the whole secant segment PB."
      ],
      [
        "What is the sum of the interior angles of a convex polygon having n sides?",
        "(n - 2) x 180 degrees",
        "Any convex n-sided polygon can be partitioned into (n - 2) triangles from one vertex, giving a total interior angle sum of (n - 2) x 180 degrees."
      ],
      [
        "According to Bayes' Theorem for two events A and B with P(B) > 0, how is the conditional probability P(A | B) expressed?",
        "[P(B | A) x P(A)] / P(B)",
        "Bayes' Theorem relates the posterior probability P(A | B) to the likelihood P(B | A) and prior P(A) via P(A | B) = [P(B | A) x P(A)] / P(B)."
      ],
      [
        "What is the eccentricity (e) of a standard parabola in conic sections?",
        "e = 1",
        "A conic section is a circle when e = 0, an ellipse when 0 < e < 1, a parabola when e = 1, and a hyperbola when e > 1."
      ]
    ]
  },
  {
    topic: "Appointments, Heads of Institutions & Constitutional Offices",
    category: "current-affairs",
    secondaryCategory: "general-awareness",
    sourceSite: "GKToday",
    level: 2,
    forms: [
      {
        q: "What is the primary constitutional or statutory mandate of the office or body '{0}'?",
        a: 1,
        exp: "{0} is mandated with: {1} ({2})."
      },
      {
        q: "Which legal provision, tenure rule or headquarters is associated with '{0}'?",
        a: 2,
        exp: "{0} ({1}) operates under {2}."
      }
    ],
    rows: [
      ["Comptroller and Auditor General of India (CAG)", "Auditing all receipts and expenditure of the Consolidated Fund of India, Consolidated Funds of States and Union Territories", "Article 148 of the Constitution with a tenure of 6 years or up to 65 years of age"],
      ["Attorney General for India", "Serving as the chief legal adviser to the Government of India with the right of audience in all courts across India", "Article 76 of the Constitution; holds office during the pleasure of the President"],
      ["Chief Election Commissioner and Election Commissioners", "Superintendence, direction and control of the preparation of electoral rolls and conduct of elections to Parliament, State Legislatures, President and Vice-President", "Appointed by the President on the recommendation of a Selection Committee under the 2023 CEC Act"],
      ["Lokpal of India", "Inquiring into allegations of corruption against public functionaries including the Prime Minister, Union Ministers and Members of Parliament", "Statutory anti-corruption ombudsman established under the Lokpal and Lokayuktas Act, 2013"],
      ["Central Vigilance Commission (CVC)", "Apex vigilance institution monitoring all vigilance activity under the Central Government and advising central authorities", "Conferred statutory status via the Central Vigilance Commission Act, 2003 on the Santhanam Committee's recommendation"],
      ["National Human Rights Commission (NHRC)", "Inquiring into violations of human rights or negligence in the prevention of such violations by a public servant", "Statutory body established on 12 October 1993 under the Protection of Human Rights Act, 1993"],
      ["National Green Tribunal (NGT)", "Expeditious disposal of cases relating to environmental protection and conservation of forests and natural resources", "Established under the National Green Tribunal Act, 2010 enforcing Article 21 right to a healthy environment"],
      ["Competition Commission of India (CCI)", "Eliminating practices having an adverse effect on market competition, preventing monopolies and protecting consumer interests", "Statutory regulator established under the Competition Act, 2002 (replacing the MRTP Act, 1969)"],
      ["Insolvency and Bankruptcy Board of India (IBBI)", "Regulating insolvency professionals, insolvency agencies and corporate/individual resolution processes in a time-bound manner", "Established on 1 October 2016 under the Insolvency and Bankruptcy Code (IBC), 2016"],
      ["Pension Fund Regulatory and Development Authority (PFRDA)", "Promoting, regulating and ensuring orderly growth of the National Pension System (NPS) and Atal Pension Yojana", "Statutory body under the Ministry of Finance governed by the PFRDA Act, 2013"],
      ["Telecom Regulatory Authority of India (TRAI)", "Regulating telecommunications services, tariffs, interconnectivity and quality of service standards across India", "Statutory body established on 20 February 1997 under the TRAI Act, 1997"],
      ["Food Safety and Standards Authority of India (FSSAI)", "Laying down science-based standards for articles of food and regulating their manufacture, storage, distribution and import", "Autonomous statutory authority under the Ministry of Health established by the Food Safety and Standards Act, 2006"],
      ["National Bank for Financing Infrastructure and Development (NaBFID)", "Serving as India's principal Development Financial Institution (DFI) for long-term non-recourse infrastructure financing", "Established by the NaBFID Act, 2021 with headquarters in Mumbai"],
      ["National Statistical Office (NSO)", "Compiling National Accounts Statistics (GDP), Index of Industrial Production (IIP), Consumer Price Index (CPI) and Periodic Labour Force Surveys", "Formed by merging NSSO and CSO under the Ministry of Statistics and Programme Implementation (MoSPI)"]
    ]
  },
  {
    topic: "World & Indian Geography in Competitive Exams",
    category: "geography",
    secondaryCategory: "static-gk",
    sourceSite: "RRB NTPC",
    level: 2,
    forms: [
      {
        q: "In physical and regional geography, which bodies of water or landmasses are connected or separated by '{0}'?",
        a: 1,
        exp: "{0} connects or separates: {1} ({2})."
      },
      {
        q: "What is the strategic or geographical significance of '{0}'?",
        a: 2,
        exp: "{0} ({1}) is strategically significant as: {2}."
      }
    ],
    rows: [
      ["Ten Degree Channel", "Separates Little Andaman (Andaman Islands) from Car Nicobar (Nicobar Islands) in the Bay of Bengal", "a 150 km wide east-west maritime channel lying along the 10-degree north parallel of latitude"],
      ["Nine Degree Channel", "Separates the island of Minicoy from the main Lakshadweep archipelago in the Arabian Sea", "a deep shipping lane crucial for international maritime traffic between the Middle East and Southeast Asia"],
      ["Eight Degree Channel (Maliku Kandu)", "Separates Minicoy Island of India from the northern atolls of the Maldives", "marks the traditional maritime boundary between India (Lakshadweep) and the Republic of Maldives"],
      ["Duncan Passage", "Separates Rutland Island (part of South Andaman) from Little Andaman", "a 48 km wide strait located within the Andaman archipelago in the Bay of Bengal"],
      ["Palk Strait and Palk Bay", "Connects the Bay of Bengal in the northeast with the Gulf of Mannar in the southwest between Tamil Nadu and Sri Lanka", "bordered on the south by Adam's Bridge (Rama Setu) chain of limestone shoals and Pamban Island"],
      ["Strait of Hormuz", "Connects the Persian Gulf with the Gulf of Oman and the Arabian Sea between Iran and Oman", "the world's most critical oil transit chokepoint carrying nearly one-fifth of global petroleum consumption"],
      ["Bab-el-Mandeb Strait", "Connects the Red Sea to the Gulf of Aden (Indian Ocean) between Yemen on the Arabian Peninsula and Djibouti/Eritrea in the Horn of Africa", "vital maritime gateway linking the Suez Canal shipping route with the Indian Ocean"],
      ["Strait of Malacca", "Connects the Andaman Sea (Indian Ocean) with the South China Sea (Pacific Ocean) between the Malay Peninsula and Sumatra", "the main shipping channel between the Indian Ocean and the Pacific Ocean"],
      ["Bering Strait", "Connects the Arctic Ocean (Chukchi Sea) with the Bering Sea (Pacific Ocean) between Russia's Chukotka Peninsula and Alaska", "contains the Diomede Islands through which the International Date Line passes"],
      ["Strait of Gibraltar", "Connects the Atlantic Ocean to the Mediterranean Sea and separates Spain (Europe) from Morocco (Africa)", "guarded on its northern shore by the Rock of Gibraltar"],
      ["Bosphorus (Istanbul) Strait", "Connects the Black Sea with the Sea of Marmara and separates European Turkey from Asian Turkey (Anatolia)", "forms part of the continental boundary between Europe and Asia alongside the Dardanelles"],
      ["Sunda Strait", "Connects the Java Sea to the Indian Ocean between the Indonesian islands of Java and Sumatra", "site of the famous volcanic island of Krakatoa"],
      ["Mozambique Channel", "Arm of the Indian Ocean located between the island nation of Madagascar and mainland Southeast Africa (Mozambique)", "stretches roughly 1,600 km and carries the warm Agulhas-feeding Mozambique Current"],
      ["Khyber Pass", "Mountain pass in the Spin Ghar range connecting Peshawar (Pakistan) with Jalalabad and Kabul (Afghanistan)", "historic trade and military corridor linking the Indian subcontinent with Central Asia"]
    ]
  },
  {
    topic: "Inventions, Pioneers & Scientific Milestones",
    category: "inventions-discoveries",
    secondaryCategory: "general-science",
    sourceSite: "SSC CHSL",
    level: 2,
    forms: [
      {
        q: "Which scientist or innovator is credited with the discovery or invention of '{0}'?",
        a: 1,
        exp: "{0} was discovered or invented by {1} ({2})."
      },
      {
        q: "What scientific breakthrough did {1} achieve with '{0}'?",
        a: 2,
        exp: "With {0}, {1} achieved: {2}."
      }
    ],
    rows: [
      ["Chandrasekhar Limit (1.44 Solar Masses)", "Subrahmanyan Chandrasekhar", "established the maximum mass of a stable white dwarf star above which it undergoes gravitational collapse into a neutron star or black hole"],
      ["Saha Ionization Equation", "Meghnad Saha", "linked the ionization state of elements in stellar atmospheres to temperature and pressure, laying the foundation of modern stellar astrophysics"],
      ["Bose-Einstein Statistics and Bosons", "Satyendra Nath Bose (with Albert Einstein)", "formulated quantum statistics for integer-spin particles (bosons) and predicted the fifth state of matter, the Bose-Einstein Condensate"],
      ["Ramachandran Plot in Structural Biology", "G. N. Ramachandran", "visualised sterically allowed phi and psi torsion angles of amino acid residues in protein polypeptide backbones, alongside the triple-helix structure of collagen"],
      ["Synthesis of the First Artificial Gene in a Living Cell", "Har Gobind Khorana", "deciphered the genetic code showing how nucleotide triplets specify amino acids and synthesized the first functional artificial gene"],
      ["Crescograph and Millimetre-Wave Radio Optics", "Jagadish Chandra Bose", "pioneered 60 GHz millimetre-wave semiconductor junctions and invented the crescograph to measure plant growth down to a millionth of an inch"],
      ["Fibre Optics ('Father of Fibre Optics')", "Narinder Singh Kapany", "demonstrated in 1954 that light could be transmitted along curved glass bundles via total internal reflection, coining the term 'fibre optics'"],
      ["Yellapragada Subbarow's Biomedical Discoveries", "Yellapragada Subbarow", "discovered the role of ATP as the energy currency of cells and developed Methotrexate (cancer chemotherapy), Diethylcarbamazine (filariasis drug) and Aureomycin (tetracycline antibiotic)"],
      ["AKS Primality Test", "Manindra Agrawal, Neeraj Kayal and Nitin Saxena", "proved at IIT Kanpur in 2002 that determining whether any given number is prime can be done deterministically in polynomial time"],
      ["Kariamanickam Srinivasa Krishnan's Co-discovery of Raman Scattering", "K. S. Krishnan (with C. V. Raman)", "conducted key experimental observations of the inelastic scattering of light in liquids and studied magnetic anisotropy of crystals"],
      ["Mahalanobis Distance in Multivariate Statistics", "Prasanta Chandra Mahalanobis", "introduced a scale-invariant statistical measure comparing a point with a distribution and founded the Indian Statistical Institute"],
      ["Birbal Sahni's Palaeobotanical Discoveries", "Birbal Sahni", "discovered Pentoxyleae (a new group of Jurassic gymnosperms from the Rajmahal Hills) and founded the Institute of Palaeobotany in Lucknow"]
    ]
  },
  {
    topic: "Awards, Laureates & Cultural Honours in News",
    category: "awards-honours",
    secondaryCategory: "static-gk",
    sourceSite: "AffairsCloud",
    level: 2,
    forms: [
      {
        q: "For what distinction is '{0}' recognised in recent awards and honours news?",
        a: 1,
        exp: "{0} — {1} ({2})."
      },
      {
        q: "Which field, work or institution is associated with the honour '{0}' ({1})?",
        a: 2,
        exp: "{0} ({1}) is associated with {2}."
      }
    ],
    rows: [
      ["58th Jnanpith Award Laureates", "Gulzar (Urdu) and Jagadguru Rambhadracharya (Sanskrit)", "India's highest literary honour bestowed by Bharatiya Jnanpith for lifetime contribution to Indian literature"],
      ["59th Jnanpith Award Laureate", "Vinod Kumar Shukla (Hindi poet and novelist)", "first author from Chhattisgarh to receive the Jnanpith Award, celebrated for novels like 'Naukar Ki Kameez' and 'Deewar Mein Ek Khirki Rahati Thi'"],
      ["2024 Ramon Magsaysay Award (animation & storytelling)", "Hayao Miyazaki (co-founder of Studio Ghibli, Japan)", "honoured for using animation to illuminate the human condition and inspire environmental and peace awareness among children"],
      ["2024 Abel Prize in Mathematics", "Michel Talagrand (French mathematician, CNRS Paris)", "awarded by the Norwegian Academy of Science and Letters for groundbreaking contributions to probability theory, stochastic processes and spin glasses"],
      ["2024 Turing Award (ACM A.M. Turing Award)", "Avi Wigderson", "honoured for reshaping the theoretical understanding of randomness and pseudorandomness in computational complexity"],
      ["2024 Pritzker Architecture Prize", "Riken Yamamoto (Japanese architect)", "recognised for designing architecture that fosters community solidarity and blends public and private realms"],
      ["2024 World Food Prize Laureates", "Cary Fowler and Geoffrey Hawtin", "honoured for their leadership in conserving crop biodiversity and establishing the Svalbard Global Seed Vault in Norway"],
      ["2024 Stockholm Water Prize", "Taikan Oki (Japanese hydrologist, University of Tokyo)", "recognised for pioneering research connecting global hydrology, virtual water trade and climate change"],
      ["2024 Tyler Prize for Environmental Achievement", "Johan Rockstrom", "awarded for leading the development of the 'Planetary Boundaries' scientific framework defining a safe operating space for humanity"],
      ["33rd Vyasa Samman (K. K. Birla Foundation)", "Pushpa Bharati for her Hindi memoir 'Yaadein, Yaadein aur Yaadein'", "prestigious annual literary award for an outstanding Hindi literary work published in the preceding 10 years"],
      ["33rd Saraswati Samman (K. K. Birla Foundation)", "Prabha Varma for his Malayalam verse novel 'Roudra Sathwikam'", "annual award for outstanding prose or poetry in any of the 22 languages listed in the Eighth Schedule"],
      ["Indira Gandhi Prize for Peace, Disarmament and Development (2023)", "Daniel Barenboim and Ali Abu Awwad", "awarded jointly to the classical maestro and the Palestinian peace activist for bringing youth together through music and non-violent dialogue"]
    ]
  },
  {
    topic: "Applied Mathematics & Quantitative Problem Solving",
    category: "mathematics",
    secondaryCategory: "quantitative-aptitude",
    sourceSite: "RRB NTPC",
    level: 2,
    forms: [
      {
        q: "{0}",
        a: 1,
        exp: "{2}"
      }
    ],
    rows: [
      [
        "In trigonometry, what is the fundamental Pythagorean identity relating secant (sec theta) and tangent (tan theta)?",
        "sec^2(theta) - tan^2(theta) = 1",
        "Dividing sin^2(theta) + cos^2(theta) = 1 throughout by cos^2(theta) yields tan^2(theta) + 1 = sec^2(theta), or sec^2(theta) - tan^2(theta) = 1."
      ],
      [
        "For a quadratic equation ax^2 + bx + c = 0 (a != 0), under what condition on the discriminant D = b^2 - 4ac are the two roots real and equal?",
        "b^2 - 4ac = 0",
        "When the discriminant D = b^2 - 4ac equals zero, the quadratic equation has two real and coincident (equal) roots given by x = -b / (2a)."
      ],
      [
        "What is the sum of the cubes of the first n natural numbers (1^3 + 2^3 + 3^3 + ... + n^3)?",
        "[n(n + 1) / 2]^2",
        "Nicomachus's theorem states that the sum of the first n cubes equals the square of the nth triangular number: [n(n + 1) / 2]^2."
      ],
      [
        "What is the sum of the squares of the first n natural numbers (1^2 + 2^2 + 3^2 + ... + n^2)?",
        "n(n + 1)(2n + 1) / 6",
        "By mathematical induction, the sum of the squares of the first n positive integers is given by the formula n(n + 1)(2n + 1) / 6."
      ],
      [
        "If a person travels a fixed distance from A to B at speed u and returns from B to A along the same route at speed v, what is the average speed for the entire round trip?",
        "2uv / (u + v) (the Harmonic Mean of u and v)",
        "Total distance is 2d and total time is d/u + d/v, so average speed = 2d / (d/u + d/v) = 2uv / (u + v), which is the harmonic mean of the two speeds."
      ],
      [
        "In coordinate geometry, what is the area of a triangle whose vertices are (0, 0), (a, 0) and (0, b)?",
        "|a x b| / 2",
        "A triangle with vertices at the origin (0, 0), (a, 0) on the x-axis and (0, b) on the y-axis is a right-angled triangle with base |a| and height |b|, so its area is |ab| / 2."
      ],
      [
        "In mensuration, if the radius of a sphere is doubled, by what factor does its total surface area (4 * pi * r^2) increase?",
        "4 times",
        "Since the surface area of a sphere is 4 * pi * r^2 (proportional to the square of the radius), doubling r multiplies the surface area by 2^2 = 4."
      ],
      [
        "In mensuration, if the radius of a sphere is doubled, by what factor does its volume (4/3 * pi * r^3) increase?",
        "8 times",
        "Because the volume of a sphere is (4/3) * pi * r^3 (proportional to the cube of the radius), doubling r increases the volume by 2^3 = 8 times."
      ],
      [
        "According to Heron's formula for a triangle with sides a, b, c and semi-perimeter s = (a + b + c)/2, what is the area of the triangle?",
        "sqrt[s(s - a)(s - b)(s - c)]",
        "Heron's formula expresses the area of any triangle in terms of its side lengths a, b, c and semi-perimeter s as the square root of s(s - a)(s - b)(s - c)."
      ],
      [
        "In set theory (Inclusion-Exclusion Principle), for any two finite sets A and B, what does n(A union B) equal?",
        "n(A) + n(B) - n(A intersection B)",
        "To count elements in either A or B without double-counting elements common to both, n(A union B) = n(A) + n(B) - n(A intersection B)."
      ],
      [
        "In number theory, what is the only even prime number?",
        "2",
        "2 is the smallest and only even prime number because every even integer greater than 2 is divisible by 2 in addition to 1 and itself."
      ],
      [
        "For any two positive integers a and b, which identity relates their Highest Common Factor (HCF) and Lowest Common Multiple (LCM)?",
        "HCF(a, b) x LCM(a, b) = a x b",
        "The product of two positive integers always equals the product of their Greatest Common Divisor (HCF) and Least Common Multiple (LCM)."
      ]
    ]
  },
  {
    topic: "General English Grammar Rules in Competitive Exams",
    category: "general-english-grammar",
    secondaryCategory: "english",
    sourceSite: "SSC CHSL",
    level: 2,
    forms: [
      {
        q: "{0}",
        a: 1,
        exp: "{2}"
      }
    ],
    rows: [
      [
        "Which correlative conjunction pair must strictly follow 'Scarcely' or 'Hardly' in standard English grammar?",
        "when / before (never 'than')",
        "'Hardly' and 'Scarcely' are paired with 'when' or 'before' (e.g., 'Hardly had he reached the station when the train departed'), whereas 'No sooner' takes 'than'."
      ],
      [
        "When two singular subjects are joined by 'either ... or', 'neither ... nor', or 'not only ... but also', how does the verb agree?",
        "The verb agrees in number and person with the nearer subject (Rule of Proximity)",
        "With correlative conjunctions like 'neither ... nor', the verb agrees with the subject closer to it (e.g., 'Neither the teacher nor the students were present')."
      ],
      [
        "When two subjects are linked by 'as well as', 'along with', 'together with', or 'in addition to', which subject determines the verb number?",
        "The first (main) subject",
        "Phrases introduced by 'as well as', 'along with' or 'together with' are parenthetical; the verb agrees with the primary first subject (e.g., 'The captain, along with the players, has arrived')."
      ],
      [
        "Which preposition correctly follows the adjectives 'senior', 'junior', 'superior', 'inferior', 'prior' and 'preferable' in comparative structures?",
        "to (never 'than')",
        "Latinate comparatives ending in '-ior' (senior, junior, superior, inferior, prior, anterior, posterior) and 'preferable' always take the preposition 'to' instead of 'than'."
      ],
      [
        "After the phrase 'It is high time' or 'It is about time' followed by a subject, which verb tense is grammatically required?",
        "Simple past tense (past subjunctive, e.g., 'It is high time we started')",
        "After 'It is time / It is high time + subject', English grammar uses the simple past form to express an action that should already have taken place."
      ],
      [
        "In conditional sentences of Type 3 (unreal past condition), what tense structure is used in the 'if'-clause and the main clause?",
        "If + Past Perfect (had + V3), ... would have + Past Participle (V3)",
        "Type 3 conditionals express hypothetical past situations: 'If she had studied harder, she would have cleared the exam.'"
      ],
      [
        "Which article usage rule applies when 'the' is placed before both nouns vs only the first noun in 'The Secretary and Treasurer'?",
        "'The Secretary and Treasurer' refers to one person holding both posts (singular verb); 'The Secretary and the Treasurer' refers to two distinct persons (plural verb)",
        "Repeating the definite article before each coordinated title indicates two separate individuals, whereas a single article indicates one individual holding dual roles."
      ],
      [
        "After verbs and expressions such as 'look forward to', 'be accustomed to', 'with a view to' and 'be habituated to', what verb form must follow 'to'?",
        "Gerund (-ing form, e.g., 'looking forward to meeting you')",
        "In expressions like 'look forward to', 'with a view to' and 'accustomed to', 'to' functions as a preposition rather than an infinitive marker, so it must be followed by a noun or gerund (-ing)."
      ]
    ]
  }
];

module.exports = { CURATED_NEWS_MCQS, NEWS_GROUPS };


