/**
 * TKMCE Defence Focus Club - Data Layer
 * Contains structured data for Indian Defence Sector Entrance Exams, Direct Entries,
 * Active/Upcoming Notifications, Defence Internships, and Medical/Physical benchmarks.
 */

const DEFENCE_DATA = {
  // 1. Entrance Exams & Direct Entry Schemes
  careers: [
    {
      id: "nda",
      title: "NDA (National Defence Academy)",
      organization: "Indian Armed Forces (Army, Navy, Air Force)",
      type: "Entrance Exam",
      commissionType: "Permanent Commission (PC)",
      frequency: "Twice a year (NDA I in April, NDA II in September)",
      conductingBody: "UPSC (Union Public Service Commission)",
      eligibility: {
        gender: ["male", "female"],
        ageMin: 16.5,
        ageMax: 19.5,
        education: "12th Pass of 10+2 pattern (Physics & Maths required for Navy and Air Force; any stream for Army)",
        maritalStatus: "Unmarried"
      },
      selectionProcess: [
        "Written Exam (Mathematics - 300 marks, General Ability Test - 600 marks)",
        "SSB Interview (5-day testing: Intelligence & Personality tests - 900 marks)",
        "Medical Examination",
        "Final Merit List"
      ],
      description: "The premier joint training institution of the Indian Armed Forces, where cadets of the three services train together before going to their respective service academies.",
      syllabi: ["Mathematics (Algebra, Trigonometry, Calculus, Statistics)", "General Ability Test (English, Physics, Chemistry, General Science, History, Geography, Current Events)"],
      link: "https://www.upsc.gov.in"
    },
    {
      id: "cds",
      title: "CDS (Combined Defence Services)",
      organization: "Indian Armed Forces (Army, Navy, Air Force)",
      type: "Entrance Exam",
      commissionType: "Permanent & Short Service Commission",
      frequency: "Twice a year (CDS I in Feb/March, CDS II in September/October)",
      conductingBody: "UPSC (Union Public Service Commission)",
      eligibility: {
        gender: ["male", "female"],
        ageMin: 19,
        ageMax: 25, // IMA: 19-24, INA: 19-24, AFA: 20-24, OTA: 19-25
        education: "Graduate (Degree for IMA/OTA; B.Sc/B.Tech with Physics & Maths for INA/AFA)",
        maritalStatus: "Unmarried (Married allowed for OTA male/female above 25 in some conditions, but standard is unmarried)"
      },
      selectionProcess: [
        "Written Exam (IMA/INA/AFA: English, GK, Elementary Math - 300 marks; OTA: English, GK - 200 marks)",
        "SSB Interview (5-day personality & psychological testing)",
        "Medical Board Examination",
        "Final Merit List"
      ],
      description: "Entry point for graduates into the Indian Military Academy (IMA), Indian Naval Academy (INA), Air Force Academy (AFA), and Officers Training Academy (OTA) for short service commission.",
      syllabi: ["English (Grammar, Vocabulary, Comprehension)", "General Knowledge (History, Science, Economy, Geography, Current Affairs)", "Elementary Mathematics (Arithmetic, Algebra, Geometry, Mensuration)"],
      link: "https://www.upsc.gov.in"
    },
    {
      id: "afcat",
      title: "AFCAT (Air Force Common Admission Test)",
      organization: "Indian Air Force",
      type: "Entrance Exam",
      commissionType: "Permanent & Short Service Commission",
      frequency: "Twice a year (AFCAT I in Feb, AFCAT II in August)",
      conductingBody: "Indian Air Force (IAF)",
      eligibility: {
        gender: ["male", "female"],
        ageMin: 20,
        ageMax: 26, // Flying: 20-24, Ground Duty: 20-26
        education: "Graduate with minimum 60% marks in any discipline with Maths & Physics at 10+2 level, OR B.E/B.Tech (60% marks)",
        maritalStatus: "Unmarried (below 25 years)"
      },
      selectionProcess: [
        "Online Written Test (AFCAT - Verbal Ability, Numerical Ability, Reasoning, General Awareness)",
        "AFSB Interview (Air Force Selection Board Testing)",
        "CPSS (Computerised Pilot Selection System - Only for Flying Branch)",
        "Medical Examination"
      ],
      description: "Conducts recruitment for Flying Branch (Transport, Helicopters, Fighters) and Ground Duty (Technical & Non-Technical) branches of the IAF.",
      syllabi: ["General Awareness", "Verbal Ability in English", "Numerical Ability & Reasoning", "Military Aptitude Test"],
      link: "https://afcat.cdac.in"
    },
    {
      id: "capf",
      title: "CAPF (Assistant Commandant)",
      organization: "Central Armed Police Forces (BSF, CRPF, CISF, ITBP, SSB)",
      type: "Entrance Exam",
      commissionType: "Permanent Gazette Officers",
      frequency: "Once a year (Usually July/August)",
      conductingBody: "UPSC (Union Public Service Commission)",
      eligibility: {
        gender: ["male", "female"],
        ageMin: 20,
        ageMax: 25, // Age relaxation for OBC/SC/ST
        education: "Bachelor's degree in any discipline from a recognized university",
        maritalStatus: "Married/Unmarried"
      },
      selectionProcess: [
        "Written Examination (Paper I: General Ability & Intelligence, Paper II: General Studies, Essay & Comprehension)",
        "Physical Standards/Physical Efficiency Tests (PET) & Medical Standards Tests",
        "Interview/Personality Test (150 Marks)",
        "Final Merit List"
      ],
      description: "Recruits Assistant Commandants (Group A Gazetted Officers) in the paramilitary forces under the Ministry of Home Affairs.",
      syllabi: ["Paper 1: General Mental Ability, Science, Current Events, Indian Polity & Economy, History of India, India & World Geography", "Paper 2: Essay writing (English/Hindi), Comprehension, Precis Writing, Counter Argument (English only)"],
      link: "https://www.upsc.gov.in"
    },
    {
      id: "ssc_tech",
      title: "SSC Tech (Short Service Commission Technical)",
      organization: "Indian Army / Indian Navy",
      type: "Direct Entry (No Written Exam)",
      commissionType: "Short Service Commission (SSC)",
      frequency: "Twice a year",
      conductingBody: "Directorate General of Recruiting (Army) / Navy Recruitment",
      eligibility: {
        gender: ["male", "female"],
        ageMin: 20,
        ageMax: 27,
        education: "B.E. / B.Tech in engineering streams specified in the notification (Final year students eligible)",
        maritalStatus: "Unmarried"
      },
      selectionProcess: [
        "Shortlisting of applications based on cumulative percentage/CGPA cut-off in Engineering",
        "Direct SSB Interview (5-day process at Selection Centres)",
        "Medical Examination",
        "Merit List preparation"
      ],
      description: "Direct entry pathway for engineering graduates to join the Technical Branches of the Army and Navy without writing a written exam. Selection is purely based on academic merits and the SSB interview.",
      syllabi: ["No Written Exam. Assessment is based on Technical Background (B.Tech syllabus) and SSB Interview guidelines."],
      link: "https://joinindianarmy.nic.in"
    },
    {
      id: "tgc",
      title: "TGC (Technical Graduate Course)",
      organization: "Indian Army",
      type: "Direct Entry (No Written Exam)",
      commissionType: "Permanent Commission (PC)",
      frequency: "Twice a year",
      conductingBody: "Indian Army Directorate of Recruiting",
      eligibility: {
        gender: ["male"],
        ageMin: 20,
        ageMax: 27,
        education: "B.E / B.Tech in notified engineering disciplines",
        maritalStatus: "Unmarried"
      },
      selectionProcess: [
        "Shortlisting based on Engineering CGPA cut-off",
        "Direct 5-Day SSB Interview",
        "Medical Test",
        "Final Merit List"
      ],
      description: "A pathway for male engineering graduates to join the Indian Army as Permanent Commissioned Officers in the Corps of Engineers, Signals, and EME.",
      syllabi: ["No Written Exam. Evaluation is done during the SSB Interview and subsequent medical evaluation."],
      link: "https://joinindianarmy.nic.in"
    },
    {
      id: "jag",
      title: "JAG (Judge Advocate General)",
      organization: "Indian Army / Indian Navy / Indian Air Force",
      type: "Direct Entry (No Written Exam)",
      commissionType: "Short Service Commission (SSC)",
      frequency: "Twice a year",
      conductingBody: "Directorate General of Recruiting",
      eligibility: {
        gender: ["male", "female"],
        ageMin: 21,
        ageMax: 27,
        education: "Minimum 55% aggregate marks in LLB Degree (three years professional after graduation or five years after 10+2). Candidates must be eligible for registration as an advocate with Bar Council of India/State.",
        maritalStatus: "Unmarried"
      },
      selectionProcess: [
        "Shortlisting of applications based on LLB Marks / CLAT PG score (Navy uses CLAT PG)",
        "Direct SSB Interview",
        "Medical Examination"
      ],
      description: "Recruits law graduates to serve as legal officers in the military, handling military law, courts-martial, and legal advisories.",
      syllabi: ["No Written Exam. Focus is on General Law, Military Act introduction, Constitutional Law, and SSB parameters."],
      link: "https://joinindianarmy.nic.in"
    },
    {
      id: "ncc_special",
      title: "NCC Special Entry Scheme",
      organization: "Indian Army / Navy / Air Force",
      type: "Direct Entry (No Written Exam)",
      commissionType: "Short Service Commission (SSC)",
      frequency: "Twice a year",
      conductingBody: "Directorate General of Recruiting",
      eligibility: {
        gender: ["male", "female"],
        ageMin: 19,
        ageMax: 25,
        education: "Graduate with aggregate minimum 50% marks, and must have served for minimum 2/3 academic years in the Senior Division/Wing of NCC with minimum 'B' Grade in 'C' Certificate Exam.",
        maritalStatus: "Unmarried"
      },
      selectionProcess: [
        "Shortlisting of applications based on graduation marks",
        "Direct SSB Interview",
        "Medical Board Examination"
      ],
      description: "Dedicated entry route recognizing the discipline and training of NCC 'C' certificate holders, exempting them from written examinations.",
      syllabi: ["No Written Exam. Direct SSB evaluation of officer-like qualities (OLQs)."],
      link: "https://joinindianarmy.nic.in"
    },
    {
      id: "agniveer_army",
      title: "Agniveer (Indian Army)",
      organization: "Indian Army",
      type: "Entrance Exam",
      commissionType: "4-Year Agnipath Scheme (25% retained as Permanent Commission)",
      frequency: "Recruitment rallies conducted throughout the year by AROs",
      conductingBody: "Indian Army",
      eligibility: {
        gender: ["male", "female"], // Female mostly in Corps of Military Police (CMP)
        ageMin: 17.5,
        ageMax: 21,
        education: "Class 10th Pass (with 45% aggregate and 33% in each subject) for General Duty; Class 12th Pass (PCM / Commerce / Arts) for Technical, Clerk, and Store Keeper.",
        maritalStatus: "Unmarried"
      },
      selectionProcess: [
        "Common Entrance Examination (CEE) - Online CBT",
        "Physical Fitness Test (PFT) (1.6 Km Run, Pull-ups, 9 Feet Ditch, Zig-Zag Balance)",
        "Physical Measurement Test (PMT)",
        "Medical Examination",
        "Merit List"
      ],
      description: "Recruitment scheme for soldiers (other than officers) into the Indian Army for a period of 4 years. Promising candidates are selected for regular cadre commission.",
      syllabi: ["General Knowledge, General Science, Mathematics, English, Computer (as per trade)"],
      link: "https://joinindianarmy.nic.in"
    },
    {
      id: "agniveer_navy",
      title: "Agniveer (Indian Navy)",
      organization: "Indian Navy",
      type: "Entrance Exam",
      commissionType: "4-Year Agnipath Scheme",
      frequency: "Twice a year",
      conductingBody: "Indian Navy Bureau of Sailors",
      eligibility: {
        gender: ["male", "female"],
        ageMin: 17.5,
        ageMax: 21,
        education: "Class 12th Pass with Physics & Mathematics and at least one of Chemistry/Biology/Computer Science for SSR (Senior Secondary Recruits); Class 10th Pass for MR (Musician, Chef, Steward).",
        maritalStatus: "Unmarried"
      },
      selectionProcess: [
        "Computer Based Examination (INET - Indian Navy Entrance Test)",
        "Physical Efficiency Test (PET) (Run, Squats/Uthak Baithak, Push-ups, Bent-knee Sit-ups)",
        "Recruitment Medicals",
        "Final Merit List"
      ],
      description: "Enrolment of sailors in the Indian Navy under the Agnipath scheme for general service and technical duties.",
      syllabi: ["Science, Mathematics, English, General Awareness"],
      link: "https://joinindiannavy.gov.in"
    },
    {
      id: "agniveer_airforce",
      title: "Agniveer Vayu (Indian Air Force)",
      organization: "Indian Air Force",
      type: "Entrance Exam",
      commissionType: "4-Year Agnipath Scheme",
      frequency: "Twice a year",
      conductingBody: "Indian Air Force CASB (Central Airmen Selection Board)",
      eligibility: {
        gender: ["male", "female"],
        ageMin: 17.5,
        ageMax: 21,
        education: "Class 12th Pass with Physics, Chemistry, and Mathematics (minimum 50% marks aggregate and 50% in English) OR 3-year Diploma in Engineering (Mechanical/Electrical/Electronics/CS/IT). Non-Science subjects also eligible for separate trades.",
        maritalStatus: "Unmarried"
      },
      selectionProcess: [
        "Phase I: Online Written Exam (Science subjects: Math, Physics, English; Non-science: Reasoning, General Awareness)",
        "Phase II: Physical Fitness Test (PFT), Adaptability Test 1 and Adaptability Test 2",
        "Phase III: Medical Examination"
      ],
      description: "Recruitment of airmen in the IAF under the Agnipath framework.",
      syllabi: ["Physics, Mathematics, English (CBSE 10+2 curriculum), and RAGA (Reasoning & General Awareness)"],
      link: "https://agnipathvayu.cdac.in"
    }
  ],

  // 2. Active / Upcoming Notifications
  notifications: [
    {
      id: "notif_001",
      title: "NDA & NA Exam (II) 2026",
      organization: "UPSC",
      postName: "Army, Navy, and Air Force Cadet Entry (158th Course)",
      releaseDate: "2026-05-15",
      applyLastDate: "2026-06-12",
      examDate: "2026-09-06",
      status: "Active",
      eligibilityBrief: "12th Pass or appearing (Born between Jan 2, 2008 and Jan 1, 2011)",
      description: "UPSC has released the notification for the National Defence Academy and Naval Academy Exam (II) 2026. A golden opportunity for 12th standard students.",
      applyLink: "https://upsconline.nic.in"
    },
    {
      id: "notif_002",
      title: "CDS Exam (II) 2026",
      organization: "UPSC",
      postName: "IMA, INA, AFA, OTA Cadet Officers",
      releaseDate: "2026-05-15",
      applyLastDate: "2026-06-12",
      examDate: "2026-09-06",
      status: "Active",
      eligibilityBrief: "Graduate in any stream / B.Tech (Born between July 2, 2002 and July 1, 2007)",
      description: "Combined Defence Services Examination (II) 2026 is active. The exam is scheduled for September 2026. Non-maths graduates can apply for OTA.",
      applyLink: "https://upsconline.nic.in"
    },
    {
      id: "notif_003",
      title: "AFCAT 02/2026",
      organization: "Indian Air Force",
      postName: "Commissioned Officers (Flying and Ground Duty)",
      releaseDate: "2026-06-01",
      applyLastDate: "2026-06-30",
      examDate: "2026-08-25",
      status: "Active",
      eligibilityBrief: "Graduation (Min 60% marks) & 10+2 PCM (Min 60%)",
      description: "Indian Air Force invites online applications for AFCAT 02/2026. Entries available for Flying Branch and Ground Duty (Technical and Non-Technical) branches.",
      applyLink: "https://afcat.cdac.in"
    },
    {
      id: "notif_004",
      title: "Army SSC Technical 68th Men & 39th Women Course",
      organization: "Indian Army",
      postName: "Short Service Commissioned Officer (Technical)",
      releaseDate: "2026-07-10",
      applyLastDate: "2026-08-09",
      examDate: "Direct SSB (Oct - Nov 2026)",
      status: "Upcoming",
      eligibilityBrief: "Engineering Degree or final year students (Age 20-27)",
      description: "Direct entry for B.E/B.Tech graduates. No written test. Selection based on SSB Interview scores. Shortlisting threshold varies by engineering branch.",
      applyLink: "https://joinindianarmy.nic.in"
    },
    {
      id: "notif_005",
      title: "CAPF (Assistant Commandant) Exam 2026",
      organization: "UPSC",
      postName: "Assistant Commandant (BSF, CRPF, CISF, ITBP, SSB)",
      releaseDate: "2026-04-20",
      applyLastDate: "2026-05-18",
      examDate: "2026-08-02",
      status: "Closed",
      eligibilityBrief: "Graduate in any stream (Age 20-25)",
      description: "UPSC CAPF (AC) 2026 recruitment notification. Applications are closed. Exam will be held in offline mode with two papers on the same day.",
      applyLink: "https://www.upsc.gov.in"
    },
    {
      id: "notif_006",
      title: "DRDO Junior Research Fellowship (JRF) - CAIR Lab",
      organization: "DRDO (Centre for Artificial Intelligence & Robotics)",
      postName: "JRF in Computer Science / AI / Electronics",
      releaseDate: "2026-05-28",
      applyLastDate: "2026-06-25",
      examDate: "Interview (July 2026)",
      status: "Active",
      eligibilityBrief: "B.E/B.Tech in CS/EE with valid GATE score OR M.E/M.Tech first class.",
      description: "DRDO-CAIR, Bangalore is hiring Junior Research Fellows for projects in Artificial Intelligence, Cyber Security, and Robotics. Initial fellowship is for 2 years.",
      applyLink: "https://drdo.gov.in"
    }
  ],

  // 3. Internships & Research Projects
  internships: [
    {
      id: "intern_001",
      title: "DRDO Apprentice Training (Graduate/Diploma)",
      organization: "DRDO - GTRE (Gas Turbine Research Establishment)",
      duration: "1 Year",
      location: "Bengaluru",
      eligibility: "B.E/B.Tech or Diploma in Mechanical, Aero, EE, ECE, CS. Candidates must have registered on NATS portal.",
      description: "GTRE offers apprentice training under the Apprentices Act. It provides deep hands-on exposure to gas turbine technologies, design processes, and testing rigs.",
      benefits: "Monthly stipend of ₹9,000 (Graduate) / ₹8,000 (Diploma) and a prestigious certificate from DRDO.",
      applyMethod: "Apply online through DRDO RAC portal or NATS Portal."
    },
    {
      id: "intern_002",
      title: "DRDO Student Project Scheme",
      organization: "DRDO Labs (ADE, DEBEL, CAIR, DLRL)",
      duration: "3 to 6 Months",
      location: "Multiple (Pune, Bengaluru, Hyderabad, Delhi)",
      eligibility: "Pre-final and Final year B.E/B.Tech or M.E/M.Tech / M.Sc students recommended by their Head of Department.",
      description: "Allows students to complete their final semester academic projects under the supervision of senior scientists at state-of-the-art defence laboratories. Projects include Drone Autopilots, Life Support Systems, Radar Signal Processing, and Cryptography.",
      benefits: "Scientific mentorship, access to world-class lab infrastructure, and publication opportunities. (Unpaid, but highly valued).",
      applyMethod: "Requires a formal recommendation letter from College Principal/HOD addressed to the Director of the specific DRDO laboratory."
    },
    {
      id: "intern_003",
      title: "Aeronautical Development Agency (ADA) Internship",
      organization: "ADA (Ministry of Defence)",
      duration: "2 to 6 Months",
      location: "Bengaluru",
      eligibility: "B.E/B.Tech / M.E/M.Tech students in Aerospace, Avionics, Mechanical, Systems Engineering.",
      description: "ADA is responsible for the design and development of India's Light Combat Aircraft (Tejas, AMCA). Selected interns assist in aerodynamics modelling, structural analysis, and flight control simulations.",
      benefits: "Work directly on indigenous combat aircraft design, guidance from flight testing teams.",
      applyMethod: "Apply through the official ADA website under the HR development cell or via college placement coordinator."
    },
    {
      id: "intern_004",
      title: "BEL (Bharat Electronics Limited) Industrial Training",
      organization: "Bharat Electronics Limited (DPSU)",
      duration: "1 to 3 Months",
      location: "Ghaziabad, Bengaluru, Chennai",
      eligibility: "B.Tech/B.E students who have completed 6th semester in Electronics, Telecommunications, or Computer Science.",
      description: "Practical exposure to the manufacturing, assembling, and testing of tactical communication systems, electronic warfare suits, and radars.",
      benefits: "Industrial experience in a leading Defence Public Sector Undertaking (DPSU), certificate.",
      applyMethod: "Submit internship request form through the college Training & Placement officer to BEL HR department."
    }
  ],

  // 4. Physical & Medical Standards Reference
  physicalStandards: {
    generalHeight: {
      male: "157.5 cm (Army/Navy), 162.5 cm (Air Force Flying Branch)",
      female: "152.0 cm (Army/Navy), 162.5 cm (Air Force Flying Branch)",
      concessions: "Gorkhas, Garhwalis, Kumaonis, and candidates from NE India get 2 to 5 cm height relaxation."
    },
    visualStandards: {
      flying: "6/6 in one eye and 6/9 in the other, correctable to 6/6 only for hypermetropia (+1.5D maximum). No Myopia allowed. Laser surgery (LASIK/PRK) allowed only under strict guidelines (age > 20, done at least 12 months prior, normal retina).",
      armyStandard: "6/6 (better eye) and 6/9 (worse eye), correctable to 6/6 with glasses. Max myopia limit is -3.5D, hypermetropia +3.50D (including astigmatism). LASIK allowed if done after 20 years of age.",
      navyStandard: "6/6 (better eye) and 6/12 (worse eye), correctable to 6/6 with glasses. Max myopia -0.75D and hypermetropia +1.5D for Executive branch."
    },
    commonDisqualifications: [
      {
        name: "Flat Foot (Pes Planus)",
        details: "Lack of longitudinal arch in the foot. Disqualifying because it leads to early fatigue, knee pain, and spinal stress during running, heavy marching, or jump drills."
      },
      {
        name: "Knock Knees (Genu Valgum)",
        details: "Inward curvature of knees where they touch while standing. Causes load distribution imbalance and increases injuries in combat duties."
      },
      {
        name: "Tattoos",
        details: "Permanent body tattoos are permitted ONLY on the inner face of forearms (from inside of elbow to the wrist) and on the reverse side of palm/back (dorsal) side of hand. Tattoos on any other part of the body are strictly disqualifying."
      },
      {
        name: "Ear Wax & DNS",
        details: "Accumulated ear wax and Deviated Nasal Septum (DNS) are common temporary rejection points. Candidates are advised to clean ears and get DNS surgically corrected (Septoplasty) before medicals."
      },
      {
        name: "Sweaty Palms (Hyperhidrosis)",
        details: "Excessive sweating of palms/soles is disqualifying as it impairs grip on weaponry, ropes, and electronic controls."
      }
    ]
  }
};

// Export the data if running in Node/ESM environment (optional fallback),
// otherwise bind to global window object for browser access.
if (typeof module !== "undefined" && module.exports) {
  module.exports = DEFENCE_DATA;
} else {
  window.DEFENCE_DATA = DEFENCE_DATA;
}
