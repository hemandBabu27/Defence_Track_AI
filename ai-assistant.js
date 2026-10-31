/**
 * TKMCE Defence Focus Club - Chatbot Assistant Engine
 * A simulated NLP keyword-matching assistant that mimics a seasoned Indian Defence Careers Mentor.
 * Handles profile analysis state-machine, medical standards check, SSB tips, and internship advice.
 */

class DefenceAIAssistant {
  constructor(defenceData) {
    this.data = defenceData;
    this.liveFeed = [];   // headlines from official sites (filled by app.js)
    this.liveMeta = null; // { generatedAt }
    // States for interactive Profile Analysis
    this.analysisState = {
      isActive: false,
      step: 0,
      inputs: {
        gender: "",
        age: 0,
        qualification: "",
        hasPCM: null, // "yes" / "no" for 12th PCM
        height: 0
      }
    };
  }

  /**
   * Resets the active profile analyzer state
   */
  resetAnalysis() {
    this.analysisState = {
      isActive: false,
      step: 0,
      inputs: { gender: "", age: 0, qualification: "", hasPCM: null, height: 0 }
    };
  }

  fmtDate(iso) {
    return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }

  today() {
    return new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  }

  describeNotification(n) {
    const badge = { Active: "🟢 OPEN", Upcoming: "🟡 UPCOMING", Expected: "⚪ EXPECTED", Closed: "⚫ CLOSED" }[n.status] || n.status;
    let r = `**${n.title}** [${badge}]\n`;
    r += `*   **Post**: ${n.postName} (${n.organization})\n`;
    if (n.applyStart) r += `*   **Apply**: ${this.fmtDate(n.applyStart)} to ${this.fmtDate(n.applyLastDate)}\n`;
    else if (n.expectedWindow) r += `*   **Apply**: ${n.expectedWindow}\n`;
    r += `*   **Exam / selection**: ${n.examDate ? this.fmtDate(n.examDate) : (n.examNote || "To be announced")}\n`;
    r += `*   **Eligibility**: ${n.eligibilityBrief}\n`;
    r += `*   **Basis**: ${n.basis}\n`;
    r += `*   [Official site](${n.applyLink})\n\n`;
    return r;
  }

  /**
   * Processes the user message and returns a text response + action code (optional)
   */
  processMessage(userMessage) {
    const msg = userMessage.trim().toLowerCase();

    // Check if the Profile Analyzer state machine is currently active
    if (this.analysisState.isActive) {
      return this.handleProfileAnalysisStep(msg);
    }

    // Check if user wants to start the Profile Analyzer
    if (
      msg.includes("analyze profile") ||
      msg.includes("profile analyzer") ||
      msg.includes("check my eligibility") ||
      msg.includes("what jobs am i eligible for") ||
      msg.includes("find my career")
    ) {
      this.analysisState.isActive = true;
      this.analysisState.step = 1;
      return {
        text: `🛡️ **TKMCE Defence Focus AI Profile Analyzer**\n\nI will ask you 5 quick questions to calculate your eligibility for all officer & non-officer entries.\n\n**Step 1 of 5: What is your gender?**\n*(Please reply with **Male** or **Female**)*`,
        action: "start_analysis"
      };
    }

    // 1. GREETINGS & INTRO
    if (msg === "hi" || msg === "hello" || msg === "hey" || msg.includes("greetings") || msg.includes("who are you")) {
      return {
        text: `Jai Hind! 🇮🇳 I am **TKMCE Defence Focus AI**, your Indian Defence Careers Advisor.\n\nI can help you with:\n1. **Active Vacancies** & notifications\n2. **Entrance Exams** (NDA, CDS, AFCAT, CAPF)\n3. **Eligibility Criteria** (Direct Technical, JAG, NCC entries)\n4. **SSB Interview** guidance & stages\n5. **Medical Standards** (Eye vision, flat foot, tattoos, etc.)\n6. **DRDO/Defence Internships**\n\nType **"Analyze Profile"** to find out all entries you can apply for! How can I assist you today?`
      };
    }

    // 1b. LIVE OFFICIAL-SITE HEADLINES
    if (/\b(latest|news|headlines?|what'?s new|updates?)\b/.test(msg)) {
      if (!this.liveFeed.length) {
        return {
          text: `I don't have a live feed right now. It fills in when the server (or the scheduled update) has checked the official sites.\n\nMeanwhile, the curated notifications are current as of **${this.today()}**. Ask me about **vacancies** or **deadlines**.`
        };
      }
      let response = `### 📰 Latest from official sites\n\n`;
      this.liveFeed.slice(0, 12).forEach((h) => { response += `*   **${h.source}**: [${h.title}](${h.url})\n`; });
      response += `\n*Headlines are read automatically from the official pages. Open the link and confirm details before acting.*`;
      return { text: response };
    }

    // 2. SSB INTERVIEW QUERIES
    if (/\b(ssb|interview|selection board|5[- ]?day)\b/.test(msg)) {
      return {
        text: `### 🎯 SSB Interview (Services Selection Board) Overview\n\nThe SSB is a comprehensive **5-day testing procedure** designed to evaluate 15 Officer Like Qualities (OLQs):\n\n*   **Day 1: Screening Test**\n    *   OIR (Officers Intelligence Rating) Test: Verbal & Non-verbal reasoning.\n    *   PP&DT (Picture Perception & Description Test): Story writing, individual narration, and group discussion. *Crucial stage (many candidates get screened out here).* \n*   **Day 2: Psychological Testing**\n    *   TAT (Thematic Apperception Test): Write 12 stories based on pictures.\n    *   WAT (Word Association Test): Write sentences on 60 words (15s each).\n    *   SRT (Situation Reaction Test): Write reactions to 60 real-life scenarios (30 mins).\n    *   SD (Self Description): Write opinions of parents, teachers, friends, and self.\n*   **Day 3 & 4: Group Testing Officers (GTO) Tasks**\n    *   GD (Group Discussions), GPE (Group Planning Exercise).\n    *   PGT (Progressive Group Task), HGT (Half Group Task), IOT (Individual Obstacles).\n    *   Snake Race/Group Obstacle Race, Command Task, and Lecturette.\n*   **Day 5: Board Conference**\n    *   A face-to-face final assessment by all assessors. Results are declared immediately after.\n\n**💡 Pro Tip:** Focus on honesty, team spirit, clear expression, and physical stamina. Do you want tips on a specific test (like PP&DT or SRT)?`
      };
    }

    // 3. EYE VISION & LASIK
    if (/\b(eyes?|eyesight|vision|glass(es)?|spectacles?|specs|lasik|prk|myopia|hypermetropia|colou?r[- ]?blind\w*|blind)\b/.test(msg)) {
      return {
        text: `### 👁️ Visual Standards for Indian Defence Services\n\nDefence visual standards are strict and vary by service and branch:\n\n*   **Flying Branch (Air Force/Navy/Army Aviation):**\n    *   **6/6** in one eye, **6/9** in other (correctable to 6/6 only under hypermetropia +1.5D).\n    *   *Myopia is NOT allowed* for cadet entries.\n    *   **LASIK/PRK** is permitted ONLY if performed after age 20, done at least 12 months prior to physicals, with normal corneal thickness and retinal map.\n*   **Army (GD / Technical Officer):**\n    *   Uncorrected: **6/6** better eye, **6/9** worse eye.\n    *   Correctable to 6/6 with glasses. Max limits: Myopia up to **-3.50D**, Hypermetropia up to **+3.50D** (including astigmatism).\n*   **Navy (Executive):**\n    *   Uncorrected: **6/6** better, **6/12** worse. Correctable to 6/6. Max Myopia: **-0.75D**, Max Hypermetropia: **+1.5D**.\n\n*Note: Color blindness (CP-III or worse depending on branch) is a major rejection point for combat roles.*`
      };
    }

    // 4. MEDICAL REJECTIONS (Flat foot, knock knees, tattoos)
    if (/\b(medicals?|disqualifications?|rejections?|flat ?foot|knock[- ]knees?|tattoos?|dns|sweaty)\b/.test(msg)) {
      let response = `### 🏥 Common Medical Rejection Grounds in Defence Physicals\n\nBased on official Armed Forces Medical Boards, here are critical checkpoints:\n\n`;
      this.data.physicalStandards.commonDisqualifications.forEach((disq) => {
        response += `*   **${disq.name}**: ${disq.details}\n`;
      });
      response += `\n**🔍 Need Clarification?** If you have a specific condition, let me know, and I can tell you if it's a *temporary* or *permanent* rejection.`;
      return { text: response };
    }

    // 5. DRDO / INTERNSHIP QUERIES
    if (/\b(internships?|intern|drdo|apprentice\w*|projects?|ada|bel|hal|gtre)\b/.test(msg)) {
      let response = `### 🔬 Research Internships & Training in Defence Sector\n\nStudents (B.E/B.Tech, M.Tech, M.Sc) can gain valuable exposure at **DRDO (Defence Research & Development Organisation)**, **ADA**, and Defence PSUs:\n\n`;
      this.data.internships.forEach((intern) => {
        response += `🌐 **${intern.title}** (${intern.organization})\n`;
        response += `*   **Duration**: ${intern.duration} | **Location**: ${intern.location}\n`;
        response += `*   **Eligibility**: ${intern.eligibility}\n`;
        response += `*   **Scope**: ${intern.description}\n`;
        response += `*   **How to Apply**: ${intern.applyMethod}\n\n`;
      });
      response += `**💡 Tip**: DRDO has over 50 laboratories (like ADE for UAVs, CAIR for AI/Robotics, GTRE for Engines). Reach out to specific laboratory directors with a formal recommendation from your college HOD early in your semester!`;
      return { text: response };
    }

    // 6. EXAM INFO REQUEST (with live status for that exam)
    const EXAM_ALIASES = {
      nda: /\bnda\b|national defence academy/,
      cds: /\bcds\b|combined defence/,
      afcat: /\bafcat\b/,
      capf: /\bcapf\b|assistant commandant/,
      ssc_tech: /ssc[- ]?tech|\bssc\b/,
      tgc: /\btgc\b|technical graduate/,
      jag: /\bjag\b|judge advocate/,
      ncc_special: /\bncc\b/,
      agniveer_army: /agniveer.*army|army.*agniveer|\bagniveer\b/,
      agniveer_navy: /agniveer.*navy|navy.*agniveer/,
      agniveer_airforce: /agniveer.*(air ?force|vayu)|vayu/
    };
    let matchedExam = null;
    for (const exam of this.data.careers) {
      const rx = EXAM_ALIASES[exam.id];
      if (rx && rx.test(msg)) { matchedExam = exam; break; }
    }
    if (matchedExam) {
      const related = this.data.notifications.filter((n) => n.careerId === matchedExam.id);
      let statusBlock = "";
      if (related.length) {
        statusBlock = `**📅 Status as of ${this.today()}:**\n` + related.map((n) => {
          const when = n.applyStart ? `${this.fmtDate(n.applyStart)} to ${this.fmtDate(n.applyLastDate)}` : (n.expectedWindow || "dates to be announced");
          return `*   ${n.title}: **${n.status}** (${when})`;
        }).join("\n") + "\n\n";
      }
      return {
        text: `### 📋 Entry Details: ${matchedExam.title}\n\n${statusBlock}*   **Conducting Body**: ${matchedExam.conductingBody}\n*   **Frequency**: ${matchedExam.frequency}\n*   **Commission**: ${matchedExam.commissionType}\n*   **Who Can Apply**: ${matchedExam.eligibility.gender.join("/")}, aged ${matchedExam.eligibility.ageMin}-${matchedExam.eligibility.ageMax} years.\n*   **Educational Criteria**: ${matchedExam.eligibility.education}\n\n**🛠️ Selection Process:**\n${matchedExam.selectionProcess.map((step, i) => `${i + 1}. ${step}`).join("\n")}\n\n**📖 Syllabus Highlights:**\n${matchedExam.syllabi.map((x) => `* ${x}`).join("\n")}\n\n[Official Link](${matchedExam.link})`
      };
    }

    // 7. NOTIFICATIONS / DEADLINES (status computed from today's date)
    if (/\b(vacanc\w*|notifications?|deadlines?|last date|calendar|upcoming|openings?|open now|schedule|dates?|apply|job|jobs)\b/.test(msg)) {
      const open = this.data.notifications.filter((n) => n.status !== "Closed");
      const closedRecent = this.data.notifications.filter((n) => n.status === "Closed").slice(0, 2);
      let response = `### 🔔 Defence recruitment — as of ${this.today()}\n\n`;
      if (!open.length) response += `Nothing is open or scheduled in my data right now. Check the official sites below.\n\n`;
      open.forEach((n) => { response += this.describeNotification(n); });
      if (closedRecent.length) {
        response += `**Recently closed:**\n`;
        closedRecent.forEach((n) => { response += `*   ${n.title} (closed ${this.fmtDate(n.applyLastDate)})\n`; });
        response += `\n`;
      }
      response += `Dates marked *EXPECTED* are not official yet. Type **"Analyze Profile"** to see which of these you qualify for.`;
      return { text: response };
    }

    // FALLBACK
    return {
      text: `Sorry, I couldn't fully comprehend that query. 🫡\n\nI can answer questions regarding **SSB interviews**, **visual standards**, **medical conditions**, **DRDO internships**, and **Defence Exams (NDA, CDS, AFCAT, etc.)**.\n\nTry asking: \n*   *"What are the eye vision standards for Flying branch?"*\n*   *"How does the 5-day SSB work?"*\n*   *"Are there internships at DRDO?"*\n*   Or type **"Analyze Profile"** to check your eligibility!`
    };
  }

  /**
   * Handles multi-step conversational profile analysis
   */
  handleProfileAnalysisStep(msg) {
    const step = this.analysisState.step;

    switch (step) {
      case 1: // Gender
        if (/\bfemale\b|^f$|\b(woman|girl|lady)\b/.test(msg)) {
          this.analysisState.inputs.gender = "female";
        } else if (/\bmale\b|^m$|\b(man|boy)\b/.test(msg)) {
          this.analysisState.inputs.gender = "male";
        } else {
          return {
            text: `⚠️ Please specify either **Male** or **Female** to continue.`
          };
        }
        this.analysisState.step = 2;
        return {
          text: `Got it: **${this.analysisState.inputs.gender.toUpperCase()}**.\n\n**Step 2 of 5: What is your Age?**\n*(Please reply with a number, e.g., 20)*`
        };

      case 2: // Age
        const age = parseInt(msg.replace(/[^0-9]/g, ""), 10);
        if (isNaN(age) || age < 10 || age > 40) {
          return {
            text: `⚠️ Please enter a valid age (e.g. 19 or 22).`
          };
        }
        this.analysisState.inputs.age = age;
        this.analysisState.step = 3;
        return {
          text: `Age registered: **${age} years**.\n\n**Step 3 of 5: What is your highest educational qualification?**\n\nReply with one of these numbers:\n1. **12th Appearing/Passed**\n2. **Graduate (Non-Technical)** (B.A, B.Com, B.Sc, BBA, etc.)\n3. **Graduate (Technical - Engineering)** (B.E, B.Tech)\n4. **Law Graduate** (LLB)\n5. **Post Graduate** (M.A, M.Sc, M.Tech, etc.)`
        };

      case 3: // Qualification
        let qualStr = "";
        if (msg === "1" || msg.includes("12th") || msg.includes("twelfth") || msg.includes("school")) {
          qualStr = "12th";
        } else if (msg === "2" || msg.includes("non-technical") || msg.includes("non tech") || msg.includes("graduate non")) {
          qualStr = "graduate_non_tech";
        } else if (msg === "3" || msg.includes("technical") || msg.includes("engineering") || msg.includes("btech") || msg.includes("b.tech") || msg.includes("b.e")) {
          qualStr = "graduate_tech";
        } else if (msg === "4" || msg.includes("law") || msg.includes("llb")) {
          qualStr = "law";
        } else if (msg === "5" || msg.includes("post") || msg.includes("master") || msg.includes("pg")) {
          qualStr = "post_graduate";
        } else {
          return {
            text: `⚠️ Please enter a number from 1 to 5 corresponding to your qualification.`
          };
        }

        this.analysisState.inputs.qualification = qualStr;
        this.analysisState.step = 4;
        return {
          text: `Qualification registered.\n\n**Step 4 of 5: Did you have Physics & Mathematics in Class 12th?**\n*(Reply with **Yes** or **No**)*`
        };

      case 4: // PCM Status
        if (msg === "yes" || msg === "y" || msg.includes("yeah") || msg.includes("pcm")) {
          this.analysisState.inputs.hasPCM = true;
        } else if (msg === "no" || msg === "n" || msg.includes("not")) {
          this.analysisState.inputs.hasPCM = false;
        } else {
          return {
            text: `⚠️ Please reply with **Yes** or **No** to indicate if you had Physics & Maths in 12th.`
          };
        }

        this.analysisState.step = 5;
        return {
          text: `Got it.\n\n**Step 5 of 5: What is your height in centimeters?**\n*(e.g., 170. If unsure, type **0** to skip)*`
        };

      case 5: // Height & Compile Report
        let heightVal = parseInt(msg.replace(/[^0-9]/g, ""), 10);
        if (isNaN(heightVal)) heightVal = 0;
        this.analysisState.inputs.height = heightVal;

        // Process eligibility list
        const report = this.generateEligibilityReport();
        this.resetAnalysis(); // Reset state machine for next use

        return {
          text: report,
          action: "finish_analysis"
        };
    }
  }

  /**
   * Generates eligibility details based on inputs (shared rules in eligibility.js)
   */
  generateEligibilityReport() {
    const Elig = (typeof module !== "undefined" && module.exports) ? require("./eligibility.js") : window.DefenceEligibility;
    const { gender, age, qualification, hasPCM, height } = this.analysisState.inputs;
    const { eligible, restricted } = Elig.evaluate(this.data.careers, this.analysisState.inputs);
    const qualLabel = {
      "12th": "Class 12", graduate_non_tech: "Graduate (non-technical)", graduate_tech: "Engineering graduate",
      law: "Law graduate", post_graduate: "Post graduate"
    }[qualification] || qualification;

    let report = `### 📊 Your Profile Analysis Report\n\n`;
    report += `**Profile Summary:**\n`;
    report += `*   Gender: \`${gender.toUpperCase()}\`\n`;
    report += `*   Age: \`${age} Years\`\n`;
    report += `*   Education: \`${qualLabel}\` (Physics/Maths: \`${hasPCM ? "Yes" : "No"}\`)\n`;
    if (height > 0) report += `*   Height: \`${height} cm\`\n`;
    report += `\n---\n\n`;

    if (eligible.length) {
      report += `### ✅ Eligible Entry Routes (${eligible.length})\n`;
      eligible.forEach(({ career, notes }) => {
        const step = this.data.notifications.find((n) => n.careerId === career.id && n.status !== "Closed");
        report += `*   **${career.title}** (${career.type})\n`;
        report += `    *   *Commission*: ${career.commissionType}\n`;
        notes.forEach((n) => { report += `    *   *Note*: ${n}\n`; });
        if (step) {
          const when = step.applyStart ? `${this.fmtDate(step.applyStart)} to ${this.fmtDate(step.applyLastDate)}` : step.expectedWindow;
          report += `    *   *Next step*: ${step.title} (${step.status}) — ${when}\n`;
        } else {
          report += `    *   *Next step*: no open cycle right now. Watch the official site.\n`;
        }
      });
    } else {
      report += `### ❌ No Direct Officer Entry Matches\n`;
      report += `Based on age or qualification limits, you do not meet the criteria for the entries I track.\n`;
    }

    if (restricted.length) {
      report += `\n### 🔒 Ineligible / Restricted Entries (${restricted.length})\n`;
      restricted.slice(0, 4).forEach((item) => { report += `*   **${item.career.title}**: ${item.reasons.join("; ")}\n`; });
      if (restricted.length > 4) report += `*   *...and ${restricted.length - 4} more entries.*\n`;
    }

    report += `\n🛡️ *Disclaimer: This is a preliminary check against standard criteria. Always read the official notification before applying.*`;
    return report;
  }
}

// Bind to window or export
if (typeof module !== "undefined" && module.exports) {
  module.exports = DefenceAIAssistant;
} else {
  window.DefenceAIAssistant = DefenceAIAssistant;
}
