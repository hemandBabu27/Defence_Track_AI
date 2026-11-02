/**
 * Defence Focus Club - TKMCE Master Data Layer
 * Contains verified structured data for Indian Defence Sector Entrance Exams,
 * Direct Entries, Active Notifications, DRDO Internships, Official Portals,
 * 7th CPC Pay Matrix, and Physical & Medical benchmarks.
 */

const DEFENCE_DATA = {
  // 1. Entrance Exams & Direct Entry Schemes
  careers: [
    {
      id: "nda",
      title: "NDA (National Defence Academy & Naval Academy)",
      organization: "Indian Armed Forces (Army, Navy, Air Force)",
      wing: "Tri-Services",
      type: "Entrance Exam",
      commissionType: "Permanent Commission (PC)",
      frequency: "Twice a year (NDA I in April, NDA II in September)",
      conductingBody: "UPSC (Union Public Service Commission)",
      officialGazette: "UPSC Gaz. Notification NDA & NA",
      eligibility: {
        gender: ["male", "female"],
        ageMin: 16.5,
        ageMax: 19.5,
        education: "12th Pass of 10+2 pattern (Physics & Maths required for Navy and Air Force; any stream for Army). Female candidates eligible for all 3 wings.",
        maritalStatus: "Unmarried"
      },
      selectionProcess: [
        "Written Exam (Mathematics - 300 marks, General Ability Test - 600 marks)",
        "SSB Interview (5-day testing: Intelligence & Personality tests - 900 marks)",
        "Computerised Pilot Selection System (CPSS) for IAF Flying branch",
        "Medical Examination at Command Hospitals",
        "Final All-India Merit List by UPSC"
      ],
      description: "Premier tri-service academy where cadets of Army, Navy, and Air Force train together at Khadakwasla, Pune before moving to IMA, INA, and AFA.",
      syllabi: [
        "Mathematics: Algebra, Trigonometry, Analytical Geometry, Differential Calculus, Statistics & Probability",
        "General Ability Test Part A: English (Vocabulary, Grammar, Comprehension)",
        "General Ability Test Part B: General Knowledge (Physics, Chemistry, General Science, History, Geography, Current Affairs)"
      ],
      link: "https://www.upsc.gov.in",
      applyLink: "https://upsconline.nic.in"
    },
    {
      id: "cds",
      title: "CDS (Combined Defence Services)",
      organization: "Indian Armed Forces (Army, Navy, Air Force)",
      wing: "Tri-Services",
      type: "Entrance Exam",
      commissionType: "Permanent & Short Service Commission",
      frequency: "Twice a year (CDS I in April, CDS II in September)",
      conductingBody: "UPSC (Union Public Service Commission)",
      officialGazette: "UPSC Gaz. Notification CDS Examination",
      eligibility: {
        gender: ["male", "female"],
        ageMin: 19,
        ageMax: 25,
        education: "Graduation Degree for IMA & OTA; B.Tech / Degree with Physics & Maths for INA and AFA. Non-maths graduates eligible for OTA Chennai.",
        maritalStatus: "Unmarried"
      },
      selectionProcess: [
        "Written Exam (IMA/INA/AFA: English, GK, Elementary Math - 300 marks; OTA: English, GK - 200 marks)",
        "5-Day SSB Interview (Stage I: OIR & PPDT; Stage II: Psych, GTO, Personal Interview, Conference)",
        "Medical Board Examination at Military Hospital",
        "UPSC All-India Merit List"
      ],
      description: "Entry pathway for graduates into IMA Dehradun (Army PC), INA Ezhimala (Navy PC), AFA Dundigal (Air Force PC/SSC), and OTA Chennai (SSC Men & Women).",
      syllabi: [
        "English: Grammar, Vocabulary, Reading Comprehension, Sentence Correction",
        "General Knowledge: Indian Polity, Modern History, Geography, General Science, Defence Affairs",
        "Elementary Mathematics: Arithmetic, Algebra, Geometry, Mensuration, Trigonometry (Not required for OTA)"
      ],
      link: "https://www.upsc.gov.in",
      applyLink: "https://upsconline.nic.in"
    },
    {
      id: "afcat",
      title: "AFCAT (Air Force Common Admission Test)",
      organization: "Indian Air Force",
      wing: "Air Force",
      type: "Entrance Exam",
      commissionType: "Permanent & Short Service Commission",
      frequency: "Twice a year (AFCAT 01 in Jan-Feb, AFCAT 02 in August)",
      conductingBody: "Indian Air Force (CDAC)",
      officialGazette: "IAF Gazette Notification AFCAT",
      eligibility: {
        gender: ["male", "female"],
        ageMin: 20,
        ageMax: 26,
        education: "Graduate with min 60% marks & 10+2 PCM (min 60%) OR B.E/B.Tech (60% marks). Flying: 20-24 yrs; Ground Duty: 20-26 yrs.",
        maritalStatus: "Unmarried (below 25 years)"
      },
      selectionProcess: [
        "Online Written Test (AFCAT - 100 questions, 300 marks, 2 hours)",
        "Air Force Selection Board (AFSB) Testing (5 Days: Screening, Psych, Group Tests, Interview)",
        "CPSS (Computerised Pilot Selection System - once in a lifetime for Flying branch)",
        "Specialist Medical Examination (IAM Bengaluru / AFCME Delhi)"
      ],
      description: "Conducts recruitment for Flying Branch (Transport, Helicopters, Fighters), Ground Duty Technical, and Ground Duty Non-Technical branches of the IAF.",
      syllabi: [
        "General Awareness: History, Sports, Geography, Environment, Defence, Science",
        "Verbal Ability in English: Comprehension, Error Detection, Sentence Completion, Synonyms & Antonyms",
        "Numerical Ability: Decimal Fraction, Time & Work, Profit & Loss, Percentage, Ratio & Proportion",
        "Reasoning and Military Aptitude: Spatial and Verbal Reasoning"
      ],
      link: "https://afcat.cdac.in",
      applyLink: "https://afcat.cdac.in"
    },
    {
      id: "navy_btech",
      title: "10+2 (B.Tech) Cadet Entry Scheme",
      organization: "Indian Navy",
      wing: "Navy",
      type: "Direct Entry (Via JEE Main)",
      commissionType: "Permanent Commission (PC)",
      frequency: "Twice a year (Jan and July batches)",
      conductingBody: "Indian Navy Directorate of Manpower Planning & Recruitment",
      officialGazette: "Indian Navy 10+2 B.Tech Entry Notice",
      eligibility: {
        gender: ["male", "female"],
        ageMin: 16.5,
        ageMax: 19.5,
        education: "Passed 10+2 with minimum 70% aggregate in PCM and 50% in English. Mandatory appearance in JEE (Main) exam of that year.",
        maritalStatus: "Unmarried"
      },
      selectionProcess: [
        "Shortlisting based on All-India Common Rank List (CRL) of JEE (Main)",
        "5-Day SSB Interview at Selection Centres (Bhopal, Visakhapatnam, Kolkata, Bangalore)",
        "Medical Board Examination",
        "4-Year B.Tech Degree training at Indian Naval Academy (INA) Ezhimala fully funded by Indian Navy"
      ],
      description: "Direct entry for 10+2 students with JEE Main scores to earn an engineering degree from INA Ezhimala and get commissioned as Sub-Lieutenants in Executive and Technical branches.",
      syllabi: ["No Written Exam. Shortlisted purely based on JEE Main CRL Rank, followed by 5-day SSB interview."],
      link: "https://www.joinindiannavy.gov.in",
      applyLink: "https://www.joinindiannavy.gov.in"
    },
    {
      id: "army_tes",
      title: "10+2 Technical Entry Scheme (TES)",
      organization: "Indian Army",
      wing: "Army",
      type: "Direct Entry (Via JEE Main)",
      commissionType: "Permanent Commission (PC)",
      frequency: "Twice a year (TES-53 & TES-54)",
      conductingBody: "Indian Army Directorate General of Recruiting",
      officialGazette: "Indian Army Gazette Notification TES",
      eligibility: {
        gender: ["male"],
        ageMin: 16.5,
        ageMax: 19.5,
        education: "Passed 10+2 with minimum 60% aggregate in Physics, Chemistry & Maths. Mandatory appearance in JEE (Main) of that year.",
        maritalStatus: "Unmarried"
      },
      selectionProcess: [
        "Shortlisting based on JEE (Main) CRL Cut-off score",
        "Direct 5-Day SSB Interview at Army Selection Centres",
        "Medical Board Examination at Military Hospital",
        "Basic military training followed by 3-year B.Tech at CME Pune, MCTE Mhow, or MCEME Secunderabad"
      ],
      description: "Permanent Commission technical entry pathway for male candidates straight after 10+2 with engineering degree and commission as Lieutenants in Corps of Engineers, Signals, and EME.",
      syllabi: ["No Written Exam. Direct SSB Interview assessment."],
      link: "https://joinindianarmy.nic.in",
      applyLink: "https://joinindianarmy.nic.in"
    },
    {
      id: "ssc_tech",
      title: "SSC Tech (Short Service Commission Technical Men & Women)",
      organization: "Indian Army",
      wing: "Army",
      type: "Direct Entry (No Written Exam)",
      commissionType: "Short Service Commission (SSC)",
      frequency: "Twice a year",
      conductingBody: "Directorate General of Recruiting (Army)",
      officialGazette: "Army SSC(Tech) Men & Women Notification",
      eligibility: {
        gender: ["male", "female"],
        ageMin: 20,
        ageMax: 27,
        education: "B.E. / B.Tech in notified engineering disciplines (Civil, Mech, Electrical, CS, ECE, Aero, etc.). Final year engineering students eligible.",
        maritalStatus: "Unmarried"
      },
      selectionProcess: [
        "Shortlisting based on cumulative Engineering CGPA / Percentage cut-off",
        "Direct 5-Day SSB Interview at Selection Centres",
        "Specialist Medical Examination",
        "OTA Chennai Training (49 weeks)"
      ],
      description: "Premier entry pathway for engineering graduates to join the Technical Branches of the Indian Army without writing a written exam.",
      syllabi: ["No Written Exam. Assessment is based on Technical Background (B.Tech syllabus) and SSB Interview."],
      link: "https://joinindianarmy.nic.in",
      applyLink: "https://joinindianarmy.nic.in"
    },
    {
      id: "tgc",
      title: "TGC (Technical Graduate Course)",
      organization: "Indian Army",
      wing: "Army",
      type: "Direct Entry (No Written Exam)",
      commissionType: "Permanent Commission (PC)",
      frequency: "Twice a year",
      conductingBody: "Indian Army Directorate of Recruiting",
      officialGazette: "Indian Army Gazette Notification TGC",
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
        "Medical Examination",
        "IMA Dehradun 1-year military training leading to Permanent Commission"
      ],
      description: "Pathway for male engineering graduates to join the Indian Army as Permanent Commissioned Officers in Engineers, Signals, and EME.",
      syllabi: ["No Written Exam. SSB OLQs testing and technical interview."],
      link: "https://joinindianarmy.nic.in",
      applyLink: "https://joinindianarmy.nic.in"
    },
    {
      id: "jag",
      title: "JAG (Judge Advocate General)",
      organization: "Indian Army / Indian Navy",
      wing: "Tri-Services",
      type: "Direct Entry (No Written Exam)",
      commissionType: "Short Service Commission (SSC)",
      frequency: "Twice a year",
      conductingBody: "Directorate General of Recruiting",
      officialGazette: "JAG Entry Scheme Notification",
      eligibility: {
        gender: ["male", "female"],
        ageMin: 21,
        ageMax: 27,
        education: "Minimum 55% aggregate marks in LLB Degree (3 or 5 years) and eligible for registration as an advocate with Bar Council. CLAT PG score is mandatory.",
        maritalStatus: "Unmarried"
      },
      selectionProcess: [
        "Shortlisting of applications based on CLAT PG score and LLB percentage",
        "Direct 5-Day SSB Interview",
        "Specialist Medical Examination",
        "OTA Chennai Training (49 weeks)"
      ],
      description: "Recruits qualified law graduates to serve as military legal officers handling courts-martial, military law, and legal advisories.",
      syllabi: ["No Written Exam. Constitutional Law, Military Law fundamentals, and SSB testing."],
      link: "https://joinindianarmy.nic.in",
      applyLink: "https://joinindianarmy.nic.in"
    },
    {
      id: "ncc_special",
      title: "NCC Special Entry Scheme (Men & Women)",
      organization: "Indian Army / Navy / Air Force",
      wing: "Tri-Services",
      type: "Direct Entry (No Written Exam)",
      commissionType: "Short Service Commission (SSC)",
      frequency: "Twice a year",
      conductingBody: "Directorate General of Recruiting",
      officialGazette: "NCC Special Entry Scheme Notification",
      eligibility: {
        gender: ["male", "female"],
        ageMin: 19,
        ageMax: 25,
        education: "Graduate with minimum 50% marks, and must have served for min 2/3 academic years in Senior Division/Wing of NCC with minimum 'B' Grade in 'C' Certificate Exam.",
        maritalStatus: "Unmarried"
      },
      selectionProcess: [
        "Shortlisting based on graduation aggregate marks and NCC 'C' certificate grade",
        "Direct 5-Day SSB Interview",
        "Medical Examination",
        "OTA Chennai Training (49 weeks)"
      ],
      description: "Dedicated entry route recognizing the discipline of NCC 'C' certificate holders, exempting them from written examinations.",
      syllabi: ["No Written Exam. Direct SSB evaluation of officer-like qualities (OLQs)."],
      link: "https://joinindianarmy.nic.in",
      applyLink: "https://joinindianarmy.nic.in"
    },
    {
      id: "coastguard_ac",
      title: "Indian Coast Guard Assistant Commandant",
      organization: "Indian Coast Guard (Ministry of Defence)",
      wing: "Coast Guard",
      type: "Entrance Exam",
      commissionType: "Permanent Commission (General Duty / Technical / Law)",
      frequency: "Twice a year (01 and 02 batches)",
      conductingBody: "Indian Coast Guard (CDAC)",
      officialGazette: "ICG Gazette Notification Assistant Commandant",
      eligibility: {
        gender: ["male", "female"],
        ageMin: 21,
        ageMax: 25,
        education: "General Duty: Bachelor's degree (min 60%) with Maths & Physics at 10+2. Technical: Engineering Degree (min 60%). CPL: 12th pass with valid Commercial Pilot License.",
        maritalStatus: "Unmarried"
      },
      selectionProcess: [
        "Stage I: Computer Based Examination (CGCAT)",
        "Stage II: Preliminary Selection Board (PSB) - CCBT & PP&DT",
        "Stage III: Final Selection Board (FSB) - Psychological Test, Group Task, Interview",
        "Stage IV: Special Medical Examination at Military Hospital",
        "Stage V: Training at INA Ezhimala"
      ],
      description: "Group 'A' Gazetted Officer recruitment to guard India's 7,500 km maritime coastline, Exclusive Economic Zone (EEZ), and offshore assets.",
      syllabi: ["English, Reasoning & Numerical Ability, General Science, Mathematical Aptitude, General Knowledge"],
      link: "https://joinindiancoastguard.cdac.in",
      applyLink: "https://joinindiancoastguard.cdac.in"
    },
    {
      id: "drdo_scientist_b",
      title: "DRDO Scientist 'B' (RAC Recruitment)",
      organization: "DRDO (Ministry of Defence)",
      wing: "DRDO",
      type: "Direct / Written + Interview",
      commissionType: "Permanent Group 'A' Gazetted Scientific Officer",
      frequency: "Annual Recruitment via RAC",
      conductingBody: "Recruitment & Assessment Centre (RAC) DRDO",
      officialGazette: "RAC DRDO Advt Scientist 'B'",
      eligibility: {
        gender: ["male", "female"],
        ageMin: 21,
        ageMax: 28,
        education: "First Class Bachelor's Degree in Engineering (ECE, CS, Mechanical, Electrical, Chemical, Metallurgy, Aero) OR First Class Master's Degree in Science. Valid GATE score mandatory.",
        maritalStatus: "Married/Unmarried"
      },
      selectionProcess: [
        "Shortlisting based on GATE Score (Cut-off rank)",
        "Personal Interview at RAC DRDO HQ, Delhi (or Descriptive Examination in select subjects)",
        "Medical Examination",
        "Appointment as Scientist 'B' in Pay Level 10 (₹56,100 basic + DA + HRA)"
      ],
      description: "The premier scientific career entry in India for engineers and scientists to innovate next-generation missiles, radars, electronic warfare, AI systems, and combat aircraft.",
      syllabi: ["Engineering disciplines as per GATE syllabus; RAC descriptive exam questions."],
      link: "https://rac.gov.in",
      applyLink: "https://rac.gov.in"
    },
    {
      id: "agniveer_army",
      title: "Agniveer (Indian Army)",
      organization: "Indian Army",
      wing: "Army",
      type: "Entrance Exam & Rally",
      commissionType: "4-Year Agnipath Scheme (25% absorbed as Regular Cadre)",
      frequency: "Recruitment rallies conducted by AROs throughout the year",
      conductingBody: "Indian Army Directorate of Recruiting",
      officialGazette: "Indian Army Agnipath Rally Notification",
      eligibility: {
        gender: ["male", "female"],
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
      description: "Recruitment scheme for soldiers into the Indian Army for a period of 4 years with Seva Nidhi package and regular cadre commission opportunity.",
      syllabi: ["General Knowledge, General Science, Mathematics, English, Computer (as per trade)"],
      link: "https://joinindianarmy.nic.in",
      applyLink: "https://joinindianarmy.nic.in"
    }
  ],

  // 2. Active & Upcoming Recruitment Notifications with Official References
  notifications: [
    {
      id: "notif_001",
      title: "NDA & NA Examination (I) 2027",
      organization: "UPSC",
      postName: "Army, Navy, and Air Force Wing Cadets (159th Course)",
      officialReference: "UPSC Notice No. 01/2027-NDA-I",
      releaseDate: "2026-12-02",
      applyLastDate: "2026-12-22",
      examDate: "2027-04-11",
      status: "Active",
      eligibilityBrief: "12th Pass or appearing (Born between July 2, 2008 and July 1, 2011). Male & Female.",
      description: "Official UPSC notification for admission to Army, Navy, and Air Force wings of NDA and Naval Academy Course commencing 2027.",
      applyLink: "https://upsconline.nic.in",
      gazetteLink: "https://www.upsc.gov.in/examinations/active-exams",
      verified: true
    },
    {
      id: "notif_002",
      title: "CDS Examination (I) 2027",
      organization: "UPSC",
      postName: "IMA, INA, AFA, and OTA (Men & Women)",
      officialReference: "UPSC Notice No. 02/2027-CDS-I",
      releaseDate: "2026-12-02",
      applyLastDate: "2026-12-22",
      examDate: "2027-04-11",
      status: "Active",
      eligibilityBrief: "Degree in any discipline for IMA/OTA; Engg/PCM for INA & AFA (Age 19-25).",
      description: "Combined Defence Services Examination (I) 2027 covering 450+ vacancies across IMA Dehradun, INA Ezhimala, AFA Dundigal, and OTA Chennai.",
      applyLink: "https://upsconline.nic.in",
      gazetteLink: "https://www.upsc.gov.in/examinations/active-exams",
      verified: true
    },
    {
      id: "notif_003",
      title: "AFCAT 01/2027 Online Application",
      organization: "Indian Air Force",
      postName: "Commissioned Officers (Flying, Tech, Non-Tech, Weapon Systems)",
      officialReference: "IAF Gaz. Notice AFCAT 01/2027",
      releaseDate: "2026-11-15",
      applyLastDate: "2026-12-15",
      examDate: "2027-02-20",
      status: "Active",
      eligibilityBrief: "Graduation (Min 60%) + 10+2 PCM (Min 60%) OR B.E/B.Tech (Age 20-26).",
      description: "Indian Air Force invites applications for Flying Branch, Aeronautical Engineering, Weapon Systems, and Ground Duty branches.",
      applyLink: "https://afcat.cdac.in",
      gazetteLink: "https://afcat.cdac.in",
      verified: true
    },
    {
      id: "notif_004",
      title: "Indian Navy 10+2 (B.Tech) Cadet Entry Scheme",
      organization: "Indian Navy",
      postName: "Executive & Technical Branch Officers",
      officialReference: "DMPR Gaz. Notice 10+2 B.Tech Entry",
      releaseDate: "2026-10-10",
      applyLastDate: "2026-11-20",
      examDate: "Direct SSB (Dec 2026 - Jan 2027)",
      status: "Active",
      eligibilityBrief: "10+2 with 70% in PCM + Valid JEE (Main) CRL Rank (Age 16.5-19.5).",
      description: "Direct entry for male and female cadets into Indian Naval Academy (INA) Ezhimala for 4-year B.Tech program funded entirely by Indian Navy.",
      applyLink: "https://www.joinindiannavy.gov.in",
      gazetteLink: "https://www.joinindiannavy.gov.in",
      verified: true
    },
    {
      id: "notif_005",
      title: "Army SSC Technical 69th Men & 40th Women Course",
      organization: "Indian Army",
      postName: "Short Service Commissioned Technical Officer",
      officialReference: "DG Recruiting Notice SSC(Tech)-69/40",
      releaseDate: "2026-12-10",
      applyLastDate: "2027-01-15",
      examDate: "Direct SSB (Feb - Mar 2027)",
      status: "Upcoming",
      eligibilityBrief: "Engineering Degree (B.E/B.Tech) or final year students (Age 20-27).",
      description: "Direct entry for engineering graduates into Indian Army. No written exam. Shortlisted candidates receive direct 5-day SSB interview calls.",
      applyLink: "https://joinindianarmy.nic.in",
      gazetteLink: "https://joinindianarmy.nic.in",
      verified: true
    },
    {
      id: "notif_006",
      title: "DRDO Junior Research Fellowship (JRF) - CAIR & ADE Labs",
      organization: "DRDO",
      postName: "JRF in AI, Computer Vision, Robotics & Autonomous Systems",
      officialReference: "DRDO-CAIR/ADE JRF Notice 04/2026",
      releaseDate: "2026-10-15",
      applyLastDate: "2026-11-25",
      examDate: "Interview (Dec 2026)",
      status: "Active",
      eligibilityBrief: "B.E/B.Tech in CS/IT/ECE with valid GATE score OR M.E/M.Tech First Class.",
      description: "DRDO-CAIR & ADE Bengaluru hiring Junior Research Fellows for AI-driven UAV swarming and tactical robotics. Fellowship ₹37,000/mo + HRA.",
      applyLink: "https://www.drdo.gov.in/careers",
      gazetteLink: "https://rac.gov.in",
      verified: true
    },
    {
      id: "notif_007",
      title: "Indian Coast Guard Assistant Commandant (02/2027 Batch)",
      organization: "Indian Coast Guard",
      postName: "Assistant Commandant (General Duty & Technical)",
      officialReference: "ICG Advt No. CGCAT-02/2027",
      releaseDate: "2026-11-20",
      applyLastDate: "2026-12-18",
      examDate: "CGCAT (February 2027)",
      status: "Upcoming",
      eligibilityBrief: "Degree (min 60%) with Maths & Physics at 10+2 OR B.Tech (Age 21-25).",
      description: "Recruitment of Group 'A' Gazetted Officers in Indian Coast Guard for coastal surveillance, marine pollution control, and maritime border security.",
      applyLink: "https://joinindiancoastguard.cdac.in",
      gazetteLink: "https://joinindiancoastguard.cdac.in",
      verified: true
    }
  ],

  // 3. Defence Internships & Scientific Student Projects
  internships: [
    {
      id: "intern_001",
      title: "DRDO Apprentice Training (Graduate & Technician)",
      organization: "DRDO - GTRE (Gas Turbine Research Establishment)",
      duration: "1 Year",
      location: "Bengaluru, Karnataka",
      eligibility: "B.E/B.Tech or Diploma in Mechanical, Aeronautical, Electrical, ECE, CS. Must be enrolled on NATS portal.",
      description: "GTRE offers comprehensive apprenticeships under the Apprentices Act. Hands-on exposure to gas turbine propulsion, Kaveri aero-engine development, and high-altitude test rigs.",
      benefits: "Monthly stipend of ₹9,000 (Graduate) / ₹8,000 (Diploma) + official certificate from DRDO GTRE.",
      applyMethod: "Register on NATS portal (nats.education.gov.in) and apply via DRDO RAC or GTRE official website.",
      officialPortal: "https://www.drdo.gov.in/labs-and-establishments/gas-turbine-research-establishment-gtre"
    },
    {
      id: "intern_002",
      title: "DRDO Academic Student Project Scheme",
      organization: "DRDO Labs (ADE, DEBEL, CAIR, DLRL, ARDE)",
      duration: "3 to 6 Months",
      location: "Bengaluru, Pune, Hyderabad, Delhi",
      eligibility: "Pre-final and final year B.Tech, M.Tech, and M.Sc students with minimum 70% marks and HoD recommendation.",
      description: "Allows engineering and science students to execute their final year capstone projects under senior DRDO scientists. Domains include AI for Defence, Drone Autopilots, Radar Signal Processing, and Cryptography.",
      benefits: "Mentorship by Defence Scientists, access to classified research infrastructure, and high placement value. (Unpaid, but premier credential).",
      applyMethod: "Submit formal HoD recommendation letter, student resume, and project proposal directly to the Director of the specific DRDO laboratory 2 months in advance.",
      officialPortal: "https://www.drdo.gov.in"
    },
    {
      id: "intern_003",
      title: "Aeronautical Development Agency (ADA) Technical Internship",
      organization: "Aeronautical Development Agency (Ministry of Defence)",
      duration: "2 to 6 Months",
      location: "Bengaluru, Karnataka",
      eligibility: "B.E/B.Tech & M.Tech students in Aerospace, Avionics, Mechanical, Systems Engineering, CS/AI.",
      description: "ADA is India's nodal agency designing the Light Combat Aircraft (LCA Tejas Mk1A, Mk2) and 5th-generation Advanced Medium Combat Aircraft (AMCA). Selected interns assist in flight control laws, aerodynamics, and digital twins.",
      benefits: "Direct involvement in India's premier combat aircraft programs, guidance from Chief Designers, official ADA project completion certificate.",
      applyMethod: "Apply through college Placement Office or submit an application to Head of HR Development, ADA, PB No. 1718, Vimanapura Post, Bengaluru.",
      officialPortal: "https://www.ada.gov.in"
    },
    {
      id: "intern_004",
      title: "BEL (Bharat Electronics Limited) Industrial Training",
      organization: "Bharat Electronics Limited (Navratna DPSU)",
      duration: "1 to 3 Months",
      location: "Bengaluru, Ghaziabad, Kotdwara, Pune, Chennai",
      eligibility: "B.Tech/B.E students in Electronics, Telecommunication, Computer Science, Electrical Engineering who completed 6th semester.",
      description: "Practical industrial training in manufacturing and testing of tactical communication systems, night vision devices, electronic warfare suites, and naval weapon control radars.",
      benefits: "Real-world exposure to defence manufacturing standards, testing protocols, and industrial safety certifications.",
      applyMethod: "Submit internship request letter from Training & Placement Officer (TPO) to General Manager (HR), Bharat Electronics Limited.",
      officialPortal: "https://bel-india.in"
    },
    {
      id: "intern_005",
      title: "HAL (Hindustan Aeronautics Limited) Vocational Training",
      organization: "Hindustan Aeronautics Limited (Navratna DPSU)",
      duration: "4 to 8 Weeks",
      location: "Bengaluru, Nashik, Koraput, Kanpur, Lucknow",
      eligibility: "B.E / B.Tech students in Aeronautical, Aerospace, Mechanical, Electrical, Production Engineering.",
      description: "Intensive training at HAL aircraft manufacturing divisions. Study aerospace machining, assembly of Sukhoi Su-30MKI, Tejas LCA, and ALH Dhruv helicopters.",
      benefits: "Industrial certification from India's premier aerospace giant; practical insight into aviation assembly lines.",
      applyMethod: "Apply online through the HAL official technical training institute (TTI) portal during summer/winter application windows.",
      officialPortal: "https://hal-india.co.in"
    }
  ],

  // 4. Official Government Portals Directory
  officialPortals: [
    {
      id: "upsc",
      name: "Union Public Service Commission (UPSC)",
      shortName: "UPSC",
      url: "https://www.upsc.gov.in",
      applyUrl: "https://upsconline.nic.in",
      category: "Recruitment Authority",
      description: "Conducts NDA & NA, CDS, and CAPF (AC) national selection exams.",
      helpline: "011-23385271 / 23381125",
      verified: true
    },
    {
      id: "army",
      name: "Join Indian Army (Directorate General of Recruiting)",
      shortName: "Indian Army",
      url: "https://joinindianarmy.nic.in",
      applyUrl: "https://joinindianarmy.nic.in",
      category: "Service Headquarters",
      description: "Official portal for Officer entries (TES, TGC, SSC Tech, NCC, JAG) and Agniveer rallies.",
      helpline: "011-26173215 / 26175473",
      verified: true
    },
    {
      id: "navy",
      name: "Join Indian Navy (DMPR - Naval Headquarters)",
      shortName: "Indian Navy",
      url: "https://www.joinindiannavy.gov.in",
      applyUrl: "https://www.joinindiannavy.gov.in/en/account/login",
      category: "Service Headquarters",
      description: "Official portal for 10+2 B.Tech entry, SSC Executive/Tech, and Agniveer Navy (SSR/MR).",
      helpline: "1800-419-2929 (Toll Free)",
      verified: true
    },
    {
      id: "iaf",
      name: "Indian Air Force - AFCAT Portal (CDAC)",
      shortName: "Indian Air Force (Officers)",
      url: "https://afcat.cdac.in",
      applyUrl: "https://afcat.cdac.in/afcatreg/",
      category: "Service Headquarters",
      description: "Conducts AFCAT for Flying, Technical, Ground Duty, and Weapon Systems branches.",
      helpline: "020-25503105 / 25503106",
      verified: true
    },
    {
      id: "iaf_agnipath",
      name: "CASB Agnipath Vayu (IAF Airmen Selection)",
      shortName: "Agnipath Vayu",
      url: "https://agnipathvayu.cdac.in",
      applyUrl: "https://agnipathvayu.cdac.in/avreg/controller/showSignIn",
      category: "Agnipath Scheme",
      description: "Central Airmen Selection Board recruitment for Agniveer Vayu intake.",
      helpline: "011-25694209 / 25699606",
      verified: true
    },
    {
      id: "drdo_rac",
      name: "DRDO Recruitment & Assessment Centre (RAC)",
      shortName: "DRDO RAC",
      url: "https://rac.gov.in",
      applyUrl: "https://rac.gov.in",
      category: "Defence R&D",
      description: "Recruitment of Scientist 'B', Junior Research Fellows (JRF), and scientific officers.",
      helpline: "011-23812955 / 23830599",
      verified: true
    },
    {
      id: "drdo_main",
      name: "Defence Research & Development Organisation (DRDO)",
      shortName: "DRDO",
      url: "https://www.drdo.gov.in",
      applyUrl: "https://www.drdo.gov.in/careers",
      category: "Defence R&D",
      description: "Apex defence R&D organization managing 50+ laboratories and apprentice schemes.",
      helpline: "011-23015254",
      verified: true
    },
    {
      id: "coastguard",
      name: "Indian Coast Guard (Join Indian Coast Guard)",
      shortName: "Coast Guard",
      url: "https://joinindiancoastguard.cdac.in",
      applyUrl: "https://joinindiancoastguard.cdac.in",
      category: "Armed Force of the Union",
      description: "Recruitment of Assistant Commandants (Officers) and Navik (GD/DB) & Yantrik.",
      helpline: "0120-2975817 / 2975818",
      verified: true
    },
    {
      id: "mod_pib",
      name: "Press Information Bureau - Ministry of Defence",
      shortName: "MoD PIB",
      url: "https://pib.gov.in",
      applyUrl: "https://pib.gov.in/allRel.aspx",
      category: "Govt Information",
      description: "Official releases, policy notifications, and commission orders from Ministry of Defence.",
      helpline: "011-23389332",
      verified: true
    },
    {
      id: "nats",
      name: "National Apprenticeship Training Scheme (NATS)",
      shortName: "NATS Portal",
      url: "https://nats.education.gov.in",
      applyUrl: "https://nats.education.gov.in",
      category: "Apprenticeship",
      description: "Mandatory portal for Graduate/Technician Apprentice registrations in DRDO and DPSUs.",
      helpline: "1800-425-2239",
      verified: true
    }
  ],

  // 5. Physical & Medical Standards Reference
  physicalStandards: {
    generalHeight: {
      male: "157.5 cm (Army/Navy), 162.5 cm (Air Force Flying Branch), 157 cm (Coast Guard)",
      female: "152.0 cm (Army/Navy), 162.5 cm (Air Force Flying Branch), 152 cm (Coast Guard)",
      concessions: "Gorkhas, Garhwalis, Kumaonis, and candidates from NE India / Ladakh get 2 to 5 cm height relaxation."
    },
    visualStandards: {
      flying: "6/6 in one eye and 6/9 in the other, correctable to 6/6 only for hypermetropia (+1.5D max). No Myopia allowed. LASIK/PRK allowed only if age > 20, done at least 12 months prior, corneal thickness > 425 microns, normal fundus.",
      armyStandard: "6/6 (better eye) and 6/9 (worse eye), correctable to 6/6 with glasses. Max myopia limit is -3.50D, hypermetropia +3.50D (including astigmatism). LASIK allowed if done after 20 years of age.",
      navyStandard: "6/6 (better eye) and 6/12 (worse eye), correctable to 6/6 with glasses. Max myopia -0.75D and hypermetropia +1.5D for Executive branch; -3.5D for Technical branch.",
      colorPerception: "CP-I (Air Force Flying & Navy Executive), CP-II (Army Combat Arms & Flying), CP-III (Army Technical/Logistics), CP-IV (Strictly Restricted)."
    },
    commonDisqualifications: [
      {
        name: "Flat Foot (Pes Planus)",
        details: "Absence of longitudinal medial arch of foot. Disqualifying because lack of spring mechanism leads to severe fatigue, knee damage, and spinal stress during 20km loaded route marches."
      },
      {
        name: "Knock Knees (Genu Valgum)",
        details: "Inward curving knees touching while medial malleoli (ankles) are separated. Must have minimum inter-malleolar distance (< 5cm) when knees touch."
      },
      {
        name: "Body Tattoos",
        details: "Tattoos permitted ONLY on the inner face of forearms (elbow to wrist) and on the back of hand. Tattoos on chest, neck, face, shoulders, or back are strictly disqualifying across all 3 services."
      },
      {
        name: "Deviated Nasal Septum (DNS) & Ear Wax",
        details: "Common ground for temporary rejection at SSB Medicals. Candidates are given 42 days for Appeal Medical Board (AMB). Candidates should clean ear wax and undergo Septoplasty for DNS well in advance."
      },
      {
        name: "Sweaty Palms (Hyperhidrosis)",
        details: "Excessive sweating of hands/feet. Disqualifying because sweat compromises grip on weapons, triggers, steering controls, and safety ropes."
      }
    ]
  },

  // 6. 7th Central Pay Commission (CPC) Pay Matrix
  payMatrix: [
    {
      level: "Level 10",
      armyRank: "Lieutenant",
      navyRank: "Sub Lieutenant",
      airForceRank: "Flying Officer",
      coastGuardRank: "Assistant Commandant",
      basicPayMin: 56100,
      basicPayMax: 177500,
      msp: 15500,
      approxGross: 105000,
      promotionTimeline: "On Commissioning (Passing Out Parade)"
    },
    {
      level: "Level 10B",
      armyRank: "Captain",
      navyRank: "Lieutenant",
      airForceRank: "Flight Lieutenant",
      coastGuardRank: "Deputy Commandant",
      basicPayMin: 61300,
      basicPayMax: 193900,
      msp: 15500,
      approxGross: 118000,
      promotionTimeline: "After 2 Years of Commissioned Service"
    },
    {
      level: "Level 11",
      armyRank: "Major",
      navyRank: "Lieutenant Commander",
      airForceRank: "Squadron Leader",
      coastGuardRank: "Commandant (Junior Grade)",
      basicPayMin: 69400,
      basicPayMax: 207200,
      msp: 15500,
      approxGross: 135000,
      promotionTimeline: "After 6 Years of Service"
    },
    {
      level: "Level 12A",
      armyRank: "Lieutenant Colonel",
      navyRank: "Commander",
      airForceRank: "Wing Commander",
      coastGuardRank: "Commandant",
      basicPayMin: 121200,
      basicPayMax: 212400,
      msp: 15500,
      approxGross: 195000,
      promotionTimeline: "After 13 Years of Service (Time Scale)"
    },
    {
      level: "Level 13",
      armyRank: "Colonel",
      navyRank: "Captain",
      airForceRank: "Group Captain",
      coastGuardRank: "Deputy Inspector General",
      basicPayMin: 130600,
      basicPayMax: 215900,
      msp: 15500,
      approxGross: 215000,
      promotionTimeline: "Selection Grade (15-18 Years)"
    },
    {
      level: "Level 14",
      armyRank: "Major General",
      navyRank: "Rear Admiral",
      airForceRank: "Air Vice Marshal",
      coastGuardRank: "Additional Director General",
      basicPayMin: 144200,
      basicPayMax: 218200,
      msp: 15500,
      approxGross: 245000,
      promotionTimeline: "Selection Grade (2-Star Flag Officer)"
    },
    {
      level: "Level 17",
      armyRank: "General / COAS",
      navyRank: "Admiral / CNS",
      airForceRank: "Air Chief Marshal / CAS",
      coastGuardRank: "N/A",
      basicPayMin: 225000,
      basicPayMax: 225000,
      msp: 0,
      approxGross: 320000,
      promotionTimeline: "Apex Service Chief & Chief of Defence Staff (CDS)"
    }
  ]
};

// Export to Node/CommonJS or global window
if (typeof module !== "undefined" && module.exports) {
  module.exports = DEFENCE_DATA;
} else {
  window.DEFENCE_DATA = DEFENCE_DATA;
}
