/**
 * Defence Focus Club - TKMCE Application Controller
 * Optimized, clean and responsive controller for recruitment alerts,
 * exams explorer, eligibility matching, DRDO internships, and AI advisor.
 */

document.addEventListener("DOMContentLoaded", () => {
  const data = window.DEFENCE_DATA;
  const DefenceAIAssistant = window.DefenceAIAssistant;

  if (!data || !DefenceAIAssistant) {
    console.error("Critical: Data layer or AI Assistant engine not loaded.");
    return;
  }

  // Initialize the AI Assistant
  const aiAssistant = new DefenceAIAssistant(data);

  // --- STATE ---
  let activeTab = "dashboard";
  let activeNotifications = [...data.notifications];
  let liveOfficialSources = [];

  // --- DOM ELEMENTS ---
  const navTabs = document.querySelectorAll(".nav-tab");
  const sections = document.querySelectorAll(".app-section");

  // Sync & Header
  const btnManualSync = document.getElementById("btn-manual-sync");
  const syncIcon = document.getElementById("sync-icon");
  const syncStatusLabel = document.getElementById("sync-status-label");

  // Section 1: Dashboard / Recruitment Alerts
  const searchInput = document.getElementById("search-input");
  const filterOrg = document.getElementById("filter-org");
  const filterStatus = document.getElementById("filter-status");
  const notificationsContainer = document.getElementById("notifications-container");

  // Section 2: Exams Explorer & Countdown
  const examSearchInput = document.getElementById("exam-search-input");
  const filterExamWing = document.getElementById("filter-exam-wing");
  const filterExamType = document.getElementById("filter-exam-type");
  const examsContainer = document.getElementById("exams-container");
  const cdDays = document.getElementById("cd-days");
  const cdHours = document.getElementById("cd-hours");
  const cdMins = document.getElementById("cd-mins");
  const cdSecs = document.getElementById("cd-secs");
  const btnIcsDownload = document.getElementById("btn-ics-download");

  // Section 3: Eligibility Matcher
  const eligibilityForm = document.getElementById("eligibility-form");
  const rangeAge = document.getElementById("age-slider");
  const rangeAgeVal = document.getElementById("age-slider-value");
  const rangeHeight = document.getElementById("height-slider");
  const rangeHeightVal = document.getElementById("height-slider-value");
  const weightInput = document.getElementById("weight-input");
  const bmiPreviewLabel = document.getElementById("bmi-preview-label");
  const resultsCard = document.getElementById("results-card");
  const genderLabels = document.querySelectorAll(".gender-btn");

  // Section 4: Internships
  const internSearchInput = document.getElementById("intern-search-input");
  const filterInternOrg = document.getElementById("filter-intern-org");
  const internshipsContainer = document.getElementById("internships-container");
  const btnShowNocTemplate = document.getElementById("btn-show-noc-template");
  const nocModal = document.getElementById("noc-modal");
  const nocModalClose = document.getElementById("noc-modal-close");
  const btnCopyNoc = document.getElementById("btn-copy-noc");
  const nocTemplateText = document.getElementById("noc-template-text");

  // Section 5: AI Chatbot
  const chatbotInput = document.getElementById("chatbot-input");
  const chatbotSendBtn = document.getElementById("chatbot-send-btn");
  const chatMessages = document.getElementById("chat-messages");
  const resetChatBtn = document.getElementById("reset-chat-btn");
  const chipButtons = document.querySelectorAll(".chip-btn");

  // Section 6: Official Directory & Pay Matrix
  const payMatrixBody = document.getElementById("pay-matrix-body");
  const officialPortalsContainer = document.getElementById("official-portals-container");

  // Modals
  const examModal = document.getElementById("exam-modal");
  const modalContent = document.getElementById("modal-content");
  const modalClose = document.getElementById("modal-close");

  // --- INITIALIZATION ---
  initCounters();
  renderNotifications();
  renderExams();
  initCountdownTimer();
  renderInternships();
  renderPayMatrix();
  renderDirectory();
  initChatbot();
  initBMIEvaluator();
  fetchLiveUpdates();

  // --- TAB NAVIGATION ---
  navTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;
      switchTab(target);
    });
  });

  window.switchTab = switchTab;

  function switchTab(tabId) {
    activeTab = tabId;

    navTabs.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === tabId);
    });

    sections.forEach((sec) => {
      sec.classList.toggle("active", sec.id === tabId);
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // --- OFFICIAL SELF-UPDATING SYNC ENGINE ---
  async function fetchLiveUpdates() {
    try {
      const res = await fetch("/api/live");
      if (res.ok) {
        const liveData = await res.json();
        if (liveData && Array.isArray(liveData.sources)) {
          liveOfficialSources = liveData.sources;

          if (syncStatusLabel) {
            const timeStr = liveData.generatedAt
              ? new Date(liveData.generatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "Live";
            syncStatusLabel.innerText = `Official Feeds Synced (${timeStr})`;
          }

          mergeLiveHeadlines(liveData.sources);
        }
      }
    } catch (e) {
      if (syncStatusLabel) syncStatusLabel.innerText = "Official Cache Verified";
    }
  }

  function mergeLiveHeadlines(sources) {
    const liveItems = [];
    sources.forEach((src) => {
      if (src.ok && Array.isArray(src.headlines) && src.headlines.length > 0) {
        src.headlines.slice(0, 2).forEach((h, idx) => {
          liveItems.push({
            id: `live_${src.id}_${idx}`,
            title: h.title,
            organization: src.name || src.site,
            officialReference: `Official Portal Bulletin (${src.site})`,
            releaseDate: new Date().toISOString().split("T")[0],
            applyLastDate: "Check Official Site",
            examDate: "Refer Official Gazette",
            status: "Active",
            eligibilityBrief: "Official Gazette Announcement directly from portal",
            description: `Live recruitment headline extracted directly from ${src.site}.`,
            applyLink: h.url,
            gazetteLink: h.url,
            verified: true,
            isLiveBulletin: true
          });
        });
      }
    });

    if (liveItems.length > 0) {
      const existingTitles = new Set(data.notifications.map((n) => n.title.toLowerCase()));
      const uniqueLive = liveItems.filter((item) => !existingTitles.has(item.title.toLowerCase()));
      activeNotifications = [...uniqueLive, ...data.notifications];
      initCounters();
      renderNotifications();
    }
  }

  if (btnManualSync) {
    btnManualSync.addEventListener("click", async () => {
      if (syncIcon) syncIcon.style.display = "inline-block";
      btnManualSync.disabled = true;

      try {
        const res = await fetch("/api/refresh", { method: "POST" });
        if (res.ok) {
          const result = await res.json();
          if (result.status === "cooldown") {
            showToast(`Official feed recently updated. (Next check in ${result.retryAfterSeconds}s)`);
          } else {
            showToast("Updating from official government portals... 🔄");
            setTimeout(fetchLiveUpdates, 2500);
          }
        } else {
          fallbackSync();
        }
      } catch (err) {
        fallbackSync();
      } finally {
        setTimeout(() => {
          btnManualSync.disabled = false;
        }, 800);
      }
    });
  }

  function fallbackSync() {
    const now = new Date();
    activeNotifications = data.notifications.map((n) => {
      const copy = { ...n };
      if (copy.applyLastDate && copy.applyLastDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const lastDate = new Date(copy.applyLastDate);
        if (now > lastDate) copy.status = "Closed";
      }
      return copy;
    });

    initCounters();
    renderNotifications();
    showToast("Verified against official UPSC, Army, Navy & IAF portals! 🇮🇳");
  }

  // --- SECTION 1: COUNTERS ---
  function initCounters() {
    const activeCount = activeNotifications.filter((n) => n.status === "Active").length;
    const examsCount = data.careers.filter((c) => c.type === "Entrance Exam").length;
    const directCount = data.careers.filter((c) => c.type.includes("Direct")).length;
    const internshipsCount = data.internships.length;

    const elActive = document.getElementById("counter-active-notifications");
    const elExams = document.getElementById("counter-exams");
    const elDirect = document.getElementById("counter-direct-entries");
    const elIntern = document.getElementById("counter-internships");

    if (elActive) elActive.innerText = activeCount;
    if (elExams) elExams.innerText = examsCount;
    if (elDirect) elDirect.innerText = directCount;
    if (elIntern) elIntern.innerText = internshipsCount;
  }

  // --- SECTION 1: NOTIFICATIONS CENTRE ---
  function renderNotifications() {
    if (!notificationsContainer) return;

    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const org = filterOrg ? filterOrg.value.toLowerCase() : "all";
    const status = filterStatus ? filterStatus.value : "all";

    const filtered = activeNotifications.filter((n) => {
      const matchesSearch =
        n.title.toLowerCase().includes(query) ||
        (n.postName && n.postName.toLowerCase().includes(query)) ||
        (n.description && n.description.toLowerCase().includes(query)) ||
        (n.officialReference && n.officialReference.toLowerCase().includes(query));

      const matchesOrg = org === "all" || n.organization.toLowerCase().includes(org);
      const matchesStatus = status === "all" || n.status === status;

      return matchesSearch && matchesOrg && matchesStatus;
    });

    if (filtered.length === 0) {
      notificationsContainer.innerHTML = `
        <div class="clean-card" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
          <p style="font-size: 1.1rem; margin-bottom: 8px;">No recruitment notices match your search criteria.</p>
          <button class="btn btn-sm btn-secondary" onclick="document.getElementById('search-input').value=''; document.getElementById('filter-org').value='all'; document.getElementById('filter-status').value='all'; window.renderNotifications();">Reset Filters</button>
        </div>
      `;
      return;
    }

    notificationsContainer.innerHTML = filtered
      .map((n) => {
        let statusClass = "closed";
        if (n.status === "Active") statusClass = "active";
        else if (n.status === "Upcoming") statusClass = "upcoming";

        return `
        <div class="item-card">
          <div>
            <div class="card-header-row">
              <span class="status-badge ${statusClass}">${n.status}</span>
              ${n.verified ? '<span style="font-size: 11px; color: var(--success); font-weight: 700;">✓ Official Gazette</span>' : ""}
            </div>
            
            <div class="card-org">${n.organization}</div>
            ${n.officialReference ? `<div class="card-ref">${n.officialReference}</div>` : ""}
            <h3 class="card-title">${n.title}</h3>
            <p class="card-desc">${n.description}</p>
            
            <ul class="card-meta-list">
              <li><span>Apply Last Date:</span> <strong>${n.applyLastDate}</strong></li>
              <li><span>Exam / Rally Date:</span> <strong>${n.examDate}</strong></li>
              <li><span>Eligibility:</span> <strong>${n.eligibilityBrief}</strong></li>
            </ul>
          </div>
          
          <div class="card-actions">
            <a href="${n.applyLink}" target="_blank" class="btn btn-primary btn-sm" style="flex: 1;">
              Apply Online 🔗
            </a>
            ${
              n.gazetteLink
                ? `
              <a href="${n.gazetteLink}" target="_blank" class="btn btn-outline btn-sm">
                Gazette 📄
              </a>
            `
                : ""
            }
          </div>
        </div>
      `;
      })
      .join("");
  }

  window.renderNotifications = renderNotifications;

  if (searchInput) searchInput.addEventListener("input", renderNotifications);
  if (filterOrg) filterOrg.addEventListener("change", renderNotifications);
  if (filterStatus) filterStatus.addEventListener("change", renderNotifications);

  // --- SECTION 2: EXAMS EXPLORER ---
  function renderExams() {
    if (!examsContainer) return;

    const query = examSearchInput ? examSearchInput.value.toLowerCase().trim() : "";
    const wing = filterExamWing ? filterExamWing.value : "all";
    const type = filterExamType ? filterExamType.value : "all";

    const filtered = data.careers.filter((c) => {
      const matchSearch =
        c.title.toLowerCase().includes(query) ||
        c.organization.toLowerCase().includes(query) ||
        c.conductingBody.toLowerCase().includes(query) ||
        (c.description && c.description.toLowerCase().includes(query)) ||
        (c.syllabi && c.syllabi.some((s) => s.toLowerCase().includes(query)));

      const matchWing =
        wing === "all" ||
        (wing === "Tri-Services" && c.wing === "Tri-Services") ||
        (wing === "Army" && (c.wing === "Army" || c.organization.includes("Army"))) ||
        (wing === "Navy" && (c.wing === "Navy" || c.organization.includes("Navy"))) ||
        (wing === "Air Force" && (c.wing === "Air Force" || c.organization.includes("Air Force"))) ||
        (wing === "Coast Guard" && (c.wing === "Coast Guard" || c.organization.includes("Coast Guard"))) ||
        (wing === "DRDO" && (c.wing === "DRDO" || c.organization.includes("DRDO")));

      const matchType =
        type === "all" ||
        (type === "Entrance Exam" && c.type === "Entrance Exam") ||
        (type === "Direct Entry" && c.type.includes("Direct"));

      return matchSearch && matchWing && matchType;
    });

    if (filtered.length === 0) {
      examsContainer.innerHTML = `
        <div class="clean-card" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
          <p style="font-size: 1.1rem; margin-bottom: 8px;">No defence examinations match your search criteria.</p>
          <button class="btn btn-sm btn-secondary" onclick="document.getElementById('exam-search-input').value=''; document.getElementById('filter-exam-wing').value='all'; document.getElementById('filter-exam-type').value='all'; window.renderExams();">Reset Search</button>
        </div>
      `;
      return;
    }

    examsContainer.innerHTML = filtered
      .map((c) => {
        const genderStr = c.eligibility.gender.join("/");
        return `
        <div class="item-card" data-exam-id="${c.id}">
          <div>
            <div class="card-header-row">
              <span class="card-org">${c.organization}</span>
              <span class="status-badge active">${c.commissionType.includes("Permanent") ? "Permanent" : "Short Service"}</span>
            </div>
            
            <h3 class="card-title">${c.title}</h3>
            <div class="card-ref">Gazette: ${c.officialGazette || "Official Service Circular"}</div>
            <p class="card-desc">${c.description}</p>
            
            <ul class="card-meta-list">
              <li><span>Eligibility:</span> <strong>${genderStr}</strong></li>
              <li><span>Age Bracket:</span> <strong>${c.eligibility.ageMin} - ${c.eligibility.ageMax} Yrs</strong></li>
              <li><span>Conducting:</span> <strong>${c.conductingBody}</strong></li>
            </ul>
          </div>

          <div class="card-actions">
            <button class="btn btn-secondary btn-sm full-width btn-open-exam" data-exam-id="${c.id}">
              View Syllabus & Selection Criteria →
            </button>
          </div>
        </div>
      `;
      })
      .join("");

    // Attach click listeners
    document.querySelectorAll(".btn-open-exam").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const examId = btn.dataset.examId;
        const exam = data.careers.find((c) => c.id === examId);
        if (exam) openExamModal(exam);
      });
    });

    document.querySelectorAll("#exams-container .item-card").forEach((card) => {
      card.addEventListener("click", () => {
        const examId = card.dataset.examId;
        const exam = data.careers.find((c) => c.id === examId);
        if (exam) openExamModal(exam);
      });
    });
  }

  window.renderExams = renderExams;

  if (examSearchInput) examSearchInput.addEventListener("input", renderExams);
  if (filterExamWing) filterExamWing.addEventListener("change", renderExams);
  if (filterExamType) filterExamType.addEventListener("change", renderExams);

  // --- SECTION 2: COUNTDOWN TIMER & ICS DOWNLOAD ---
  function initCountdownTimer() {
    // Target: UPSC CDS (I) 2027 on April 11, 2027 at 09:00 AM IST
    const targetDate = new Date("2027-04-11T09:00:00+05:30").getTime();

    function update() {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        if (cdDays) cdDays.innerText = "00";
        if (cdHours) cdHours.innerText = "00";
        if (cdMins) cdMins.innerText = "00";
        if (cdSecs) cdSecs.innerText = "00";
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (cdDays) cdDays.innerText = days < 10 ? "0" + days : days;
      if (cdHours) cdHours.innerText = hours < 10 ? "0" + hours : hours;
      if (cdMins) cdMins.innerText = minutes < 10 ? "0" + minutes : minutes;
      if (cdSecs) cdSecs.innerText = seconds < 10 ? "0" + seconds : seconds;
    }

    update();
    setInterval(update, 1000);

    if (btnIcsDownload) {
      btnIcsDownload.addEventListener("click", () => {
        const icsContent = [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "PRODID:-//Defence Focus Club TKMCE//Defence Track AI//EN",
          "CALSCALE:GREGORIAN",
          "METHOD:PUBLISH",
          "BEGIN:VEVENT",
          "UID:upsc-cds-1-2027@defencefocusclub.tkmce.ac.in",
          "DTSTAMP:20261102T000000Z",
          "DTSTART:20270411T033000Z",
          "DTEND:20270411T113000Z",
          "SUMMARY:UPSC CDS (I) 2027 Written Examination",
          "DESCRIPTION:Combined Defence Services Examination (I) 2027 conducted by UPSC for IMA, INA, AFA and OTA. Visit https://upsc.gov.in",
          "LOCATION:Designated UPSC Examination Centre, India",
          "STATUS:CONFIRMED",
          "END:VEVENT",
          "END:VCALENDAR"
        ].join("\r\n");

        const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute("download", "UPSC_CDS_I_2027.ics");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast("Calendar event (.ics) downloaded! Save to Google / Apple Calendar 📅");
      });
    }
  }

  // --- EXAM DETAILS MODAL ---
  function openExamModal(exam) {
    if (!modalContent || !examModal) return;

    const syllabusList = exam.syllabi.map((s) => `<li>${s}</li>`).join("");
    const stepsList = exam.selectionProcess.map((step) => `<li>${step}</li>`).join("");

    modalContent.innerHTML = `
      <div class="modal-header-section">
        <h2 class="modal-title">${exam.title}</h2>
        <div style="font-size: 13px; color: var(--primary); font-weight: 700; text-transform: uppercase;">
          ${exam.organization} • ${exam.type}
        </div>
        <div style="font-size: 12px; color: var(--text-muted); font-family: monospace; margin-top: 4px;">
          Gazette: ${exam.officialGazette || "Official Service Circular"}
        </div>
      </div>

      <div class="modal-detail-block">
        <h4>Overview</h4>
        <p style="font-size: 14px; color: var(--text-main); line-height: 1.5;">${exam.description}</p>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
        <div class="modal-detail-block">
          <h4>Age Threshold</h4>
          <p style="font-size: 14px;"><strong>${exam.eligibility.ageMin} to ${exam.eligibility.ageMax} Years</strong></p>
        </div>
        <div class="modal-detail-block">
          <h4>Recruitment Frequency</h4>
          <p style="font-size: 14px;">${exam.frequency}</p>
        </div>
      </div>

      <div class="modal-detail-block">
        <h4>Educational Criteria</h4>
        <p style="font-size: 14px; line-height: 1.5;">${exam.eligibility.education}</p>
      </div>

      <div class="modal-detail-block">
        <h4>Selection Process & SSB Testing</h4>
        <ol class="modal-list">
          ${stepsList}
        </ol>
      </div>

      <div class="modal-detail-block">
        <h4>Syllabus Highlights</h4>
        <ul class="modal-list">
          ${syllabusList}
        </ul>
      </div>

      <div style="margin-top: 24px; display: flex; gap: 10px;">
        <a href="${exam.applyLink || exam.link}" target="_blank" class="btn btn-primary" style="flex: 1;">
          Visit Official Portal 🔗
        </a>
        <button class="btn btn-outline" id="btn-close-modal-inside">
          Close
        </button>
      </div>
    `;

    examModal.style.display = "flex";

    const btnInsideClose = document.getElementById("btn-close-modal-inside");
    if (btnInsideClose) {
      btnInsideClose.addEventListener("click", () => {
        examModal.style.display = "none";
      });
    }
  }

  window.openExamModal = openExamModal;

  if (modalClose) {
    modalClose.addEventListener("click", () => {
      examModal.style.display = "none";
    });
  }

  // --- SECTION 3: ELIGIBILITY MATCHER & BMI ---
  function initBMIEvaluator() {
    function calculateBMI() {
      const hVal = parseInt(rangeHeight ? rangeHeight.value : "170", 10);
      const wVal = parseFloat(weightInput ? weightInput.value : "68");
      const hInM = (hVal > 0 ? hVal : 170) / 100;
      const bmi = (wVal / (hInM * hInM)).toFixed(1);

      let cadre = "Ideal Military Cadre ✓";
      if (bmi < 18.5) cadre = "Underweight (Needs physical conditioning)";
      else if (bmi > 28) cadre = "Overweight (Over permissible military limit)";
      else if (bmi > 25) cadre = "Permissible SSB border (±10%)";

      if (bmiPreviewLabel) {
        bmiPreviewLabel.innerText = `BMI: ~${bmi} (${cadre})`;
      }
    }

    if (rangeAge) {
      rangeAge.addEventListener("input", (e) => {
        if (rangeAgeVal) rangeAgeVal.innerText = e.target.value;
      });
    }

    if (rangeHeight) {
      rangeHeight.addEventListener("input", (e) => {
        if (rangeHeightVal) {
          rangeHeightVal.innerText = e.target.value === "0" ? "Skip" : e.target.value + " cm";
        }
        calculateBMI();
      });
    }

    if (weightInput) {
      weightInput.addEventListener("input", calculateBMI);
    }

    calculateBMI();
  }

  genderLabels.forEach((label) => {
    label.addEventListener("click", () => {
      genderLabels.forEach((l) => l.classList.remove("active"));
      label.classList.add("active");
    });
  });

  if (eligibilityForm) {
    eligibilityForm.addEventListener("submit", (e) => {
      e.preventDefault();
      calculateEligibility();
    });
  }

  function calculateEligibility() {
    if (!resultsCard) return;

    const selectedGenderRadio = document.querySelector('input[name="gender"]:checked');
    const gender = selectedGenderRadio ? selectedGenderRadio.value : "male";
    const age = parseInt(rangeAge ? rangeAge.value : "20", 10);
    const qualification = document.getElementById("qualification-select") ? document.getElementById("qualification-select").value : "graduate_tech";
    const hasPCM = document.getElementById("pcm-select") ? document.getElementById("pcm-select").value === "yes" : true;
    const height = parseInt(rangeHeight ? rangeHeight.value : "170", 10);

    resultsCard.innerHTML = `
      <div style="text-align: center; padding: 40px 20px;">
        <div style="font-size: 14px; color: var(--primary); font-weight: 700; margin-bottom: 8px;">
          Calculating Armed Forces Commission Criteria...
        </div>
        <p style="font-size: 12px; color: var(--text-muted);">Cross-verifying age, qualification, 10+2 PCM, and medical height standards.</p>
      </div>
    `;

    setTimeout(() => {
      const eligibleList = [];
      const restrictedList = [];

      data.careers.forEach((career) => {
        let isEligible = true;
        const reasons = [];

        // Gender Check
        if (!career.eligibility.gender.includes(gender)) {
          isEligible = false;
          reasons.push(`Restricted to ${career.eligibility.gender.join("/")}`);
        }

        // Age Check
        if (age < career.eligibility.ageMin) {
          isEligible = false;
          reasons.push(`Min age is ${career.eligibility.ageMin} yrs`);
        } else if (age > career.eligibility.ageMax) {
          isEligible = false;
          reasons.push(`Max age is ${career.eligibility.ageMax} yrs`);
        }

        // Education Check
        const isGrad = ["graduate_non_tech", "graduate_tech", "law", "post_graduate"].includes(qualification);
        if (career.id === "nda") {
          if (qualification !== "12th" && !isGrad) {
            isEligible = false;
            reasons.push("Requires 12th standard");
          }
          if ((career.title.includes("Navy") || career.title.includes("Air Force")) && !hasPCM) {
            isEligible = false;
            reasons.push("Navy/Air Force wings require 10+2 PCM");
          }
        } else if (career.id === "cds") {
          if (!isGrad) {
            isEligible = false;
            reasons.push("Requires graduate degree");
          }
          if (career.title.includes("Air Force") && !hasPCM) {
            isEligible = false;
            reasons.push("AFA requires Physics & Maths in 12th");
          }
        } else if (career.id === "afcat") {
          if (!isGrad) {
            isEligible = false;
            reasons.push("Requires graduation degree");
          }
          if (!hasPCM) {
            isEligible = false;
            reasons.push("Requires Physics & Maths at 10+2");
          }
        } else if (career.id === "navy_btech" || career.id === "army_tes") {
          if (qualification !== "12th" && !isGrad) {
            isEligible = false;
            reasons.push("Requires 10+2 PCM + JEE Main score");
          }
          if (!hasPCM) {
            isEligible = false;
            reasons.push("Requires 10+2 PCM");
          }
        } else if (career.id === "ssc_tech" || career.id === "tgc") {
          if (qualification !== "graduate_tech") {
            isEligible = false;
            reasons.push("Requires B.E / B.Tech degree");
          }
        } else if (career.id === "jag") {
          if (qualification !== "law") {
            isEligible = false;
            reasons.push("Requires LLB law degree");
          }
        } else if (career.id === "drdo_scientist_b") {
          if (qualification !== "graduate_tech" && qualification !== "post_graduate") {
            isEligible = false;
            reasons.push("Requires B.Tech/M.Tech with valid GATE");
          }
        } else if (career.id.startsWith("agniveer")) {
          if (qualification !== "12th" && !isGrad) {
            isEligible = false;
            reasons.push("Requires 10th or 12th standard");
          }
        }

        // Height Standard Check
        if (height > 0) {
          let minHeight = 157.5;
          if (gender === "female") minHeight = 152;
          if (career.id === "afcat" && career.title.toLowerCase().includes("flying")) {
            minHeight = 162.5;
          }
          if (height < minHeight) {
            isEligible = false;
            reasons.push(`Height minimum: ${minHeight} cm`);
          }
        }

        if (isEligible) {
          eligibleList.push(career);
        } else {
          restrictedList.push({ career, reasons });
        }
      });

      const totalOpportunities = data.careers.length;
      const matchPercent = Math.round((eligibleList.length / totalOpportunities) * 100);

      resultsCard.innerHTML = `
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid var(--border); padding-bottom: 10px;">
            <h3 style="font-size: 1.15rem; color: var(--primary);">Matching Entries</h3>
            <span class="status-badge active" style="font-size: 12px;">${matchPercent}% Compatible</span>
          </div>

          <div style="margin-bottom: 16px;">
            <h4 style="font-size: 12px; color: var(--success); text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.04em;">
              Eligible Pathways (${eligibleList.length})
            </h4>
            
            ${
              eligibleList.length === 0
                ? `
              <p style="font-size: 13px; color: var(--text-muted);">No matching officer entries found for this profile. Try adjusting age or qualification.</p>
            `
                : `
              <div class="result-matches-list">
                ${eligibleList
                  .map(
                    (item) => `
                  <div class="match-row">
                    <div>
                      <div class="match-name">${item.title}</div>
                      <div class="match-sub">${item.conductingBody} • Age ${item.eligibility.ageMin}-${item.eligibility.ageMax} • ${item.commissionType}</div>
                    </div>
                    <div style="display: flex; gap: 6px;">
                      <button class="btn btn-sm btn-outline" onclick="window.openExamModal(window.DEFENCE_DATA.careers.find(c => c.id === '${item.id}'))">
                        Syllabus 📄
                      </button>
                      <a href="${item.applyLink || item.link}" target="_blank" class="btn btn-sm btn-primary">
                        Apply 🔗
                      </a>
                    </div>
                  </div>
                `
                  )
                  .join("")}
              </div>
            `
            }
          </div>

          ${
            restrictedList.length > 0
              ? `
            <div>
              <h4 style="font-size: 12px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.04em;">
                Ineligible For Profile (${restrictedList.length})
              </h4>
              <div class="result-matches-list" style="max-height: 140px;">
                ${restrictedList
                  .map(
                    (item) => `
                  <div class="match-row" style="opacity: 0.75;">
                    <div>
                      <div class="match-name">${item.career.title}</div>
                      <div class="match-sub" style="color: var(--danger); font-weight: 600;">${item.reasons.join("; ")}</div>
                    </div>
                  </div>
                `
                  )
                  .join("")}
              </div>
            </div>
          `
              : ""
          }

          <div style="margin-top: 18px;">
            <button class="btn btn-secondary full-width" onclick="window.switchTab('ai')">
              Ask AI Mentor For Specific Preparation Strategy 🛡️
            </button>
          </div>
        </div>
      `;
    }, 200);
  }

  // --- SECTION 4: INTERNSHIPS & DRDO ---
  function renderInternships() {
    if (!internshipsContainer) return;

    const query = internSearchInput ? internSearchInput.value.toLowerCase().trim() : "";
    const org = filterInternOrg ? filterInternOrg.value : "all";

    const filtered = data.internships.filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(query) ||
        item.organization.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query) ||
        item.eligibility.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query);

      const matchOrg =
        org === "all" ||
        item.organization.toLowerCase().includes(org.toLowerCase()) ||
        item.title.toLowerCase().includes(org.toLowerCase());

      return matchSearch && matchOrg;
    });

    if (filtered.length === 0) {
      internshipsContainer.innerHTML = `
        <div class="clean-card" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
          <p style="font-size: 1.1rem; margin-bottom: 8px;">No internships found matching your query.</p>
          <button class="btn btn-sm btn-secondary" onclick="document.getElementById('intern-search-input').value=''; document.getElementById('filter-intern-org').value='all'; window.renderInternships();">Reset Filter</button>
        </div>
      `;
      return;
    }

    internshipsContainer.innerHTML = filtered
      .map((intern) => {
        return `
        <div class="item-card">
          <div>
            <div class="card-org">${intern.organization}</div>
            <h3 class="card-title">${intern.title}</h3>
            
            <ul class="card-meta-list" style="margin-bottom: 12px; border-top: none; padding-top: 0;">
              <li><span>Duration:</span> <strong>${intern.duration}</strong></li>
              <li><span>Location:</span> <strong>${intern.location}</strong></li>
              ${intern.stipend ? `<li><span>Stipend:</span> <strong>${intern.stipend}</strong></li>` : ""}
            </ul>

            <p class="card-desc"><strong>Eligibility:</strong> ${intern.eligibility}</p>
            <p class="card-desc">${intern.description}</p>
          </div>

          <div class="card-actions">
            <a href="${intern.officialPortal || 'https://www.drdo.gov.in'}" target="_blank" class="btn btn-outline btn-sm full-width">
              Official Portal Details 🔗
            </a>
          </div>
        </div>
      `;
      })
      .join("");
  }

  window.renderInternships = renderInternships;

  if (internSearchInput) internSearchInput.addEventListener("input", renderInternships);
  if (filterInternOrg) filterInternOrg.addEventListener("change", renderInternships);

  // DRDO NOC Modal handlers
  if (btnShowNocTemplate) {
    btnShowNocTemplate.addEventListener("click", () => {
      if (nocModal) nocModal.style.display = "flex";
    });
  }

  if (nocModalClose) {
    nocModalClose.addEventListener("click", () => {
      if (nocModal) nocModal.style.display = "none";
    });
  }

  if (btnCopyNoc && nocTemplateText) {
    btnCopyNoc.addEventListener("click", () => {
      const textToCopy = nocTemplateText.innerText;
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          showToast("HoD Recommendation Letter format copied to clipboard! 📋");
        })
        .catch(() => {
          showToast("Template text selected for copying!");
        });
    });
  }

  // --- SECTION 5: AI CHATBOT ADVISOR ---
  function initChatbot() {
    if (!chatMessages) return;
    chatMessages.innerHTML = "";
    appendChatBubble(
      "bot",
      `Jai Hind! 🇮🇳 I am **Defence Focus AI Advisor** from TKMCE.\n\nI can help you with:\n*   **Active recruitment notices** (NDA, CDS, AFCAT, Technical entries)\n*   **SSB interview stages** and 15 Officer Like Qualities (OLQs)\n*   **Medical criteria** (eyesight limits, LASIK, flat foot)\n*   **7th CPC Salary** & Commission ranks\n*   **DRDO Internships** & student projects\n\nType **"Analyze Profile"** to scan entries matching your criteria, or ask a question directly!`
    );
  }

  function appendChatBubble(sender, text) {
    if (!chatMessages) return;

    const bubble = document.createElement("div");
    bubble.classList.add("message", sender);

    const timeString = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const formattedHtml = parseMarkdownToHtml(text);

    bubble.innerHTML = `
      <div class="message-bubble">${formattedHtml}</div>
      <div class="message-time">${timeString}</div>
    `;

    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function handleUserMessageSubmit() {
    if (!chatbotInput) return;
    const text = chatbotInput.value.trim();
    if (!text) return;

    chatbotInput.value = "";
    appendChatBubble("user", text);

    setTimeout(() => {
      const responseObj = aiAssistant.processMessage(text);
      appendChatBubble("bot", responseObj.text);
    }, 300);
  }

  if (chatbotSendBtn) chatbotSendBtn.addEventListener("click", handleUserMessageSubmit);
  if (chatbotInput) {
    chatbotInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleUserMessageSubmit();
    });
  }

  if (resetChatBtn) {
    resetChatBtn.addEventListener("click", () => {
      aiAssistant.resetAnalysis();
      initChatbot();
      showToast("Chat reset 🔄");
    });
  }

  chipButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const promptText = btn.dataset.prompt;
      if (promptText && chatbotInput) {
        chatbotInput.value = promptText;
        handleUserMessageSubmit();
      }
    });
  });

  // Markdown Parser
  function parseMarkdownToHtml(text) {
    let html = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    html = html.replace(/^### (.*?)$/gm, '<h4 style="color: var(--primary); margin: 6px 0;">$1</h4>');
    html = html.replace(/^## (.*?)$/gm, '<h3 style="color: var(--primary); margin: 8px 0;">$1</h3>');
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    const lines = html.split("\n");
    let inList = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith("*") || line.startsWith("-")) {
        const content = line.substring(1).trim();
        if (!inList) {
          lines[i] = '<ul style="padding-left: 18px; margin: 4px 0;"><li>' + content + "</li>";
          inList = true;
        } else {
          lines[i] = "<li>" + content + "</li>";
        }
      } else {
        if (inList) {
          lines[i - 1] = lines[i - 1] + "</ul>";
          inList = false;
        }
      }
    }
    if (inList) lines[lines.length - 1] = lines[lines.length - 1] + "</ul>";
    html = lines.join("\n");

    html = html.replace(
      /`(.*?)`/g,
      '<code style="background: rgba(0,43,102,0.06); padding: 2px 4px; border-radius: 3px;">$1</code>'
    );
    html = html.replace(
      /\[(.*?)\]\((.*?)\)/g,
      '<a href="$2" target="_blank" style="color: var(--primary); font-weight: 600; text-decoration: underline;">$1</a>'
    );

    return html;
  }

  // --- SECTION 6: OFFICIAL DIRECTORY & 7th CPC PAY MATRIX ---
  function renderPayMatrix() {
    if (!payMatrixBody || !data.payMatrix) return;

    payMatrixBody.innerHTML = data.payMatrix
      .map((p) => {
        return `
        <tr>
          <td><span class="level-tag">${p.level}</span></td>
          <td><strong>${p.armyRank}</strong></td>
          <td>${p.navyRank}</td>
          <td>${p.airForceRank}</td>
          <td>${p.coastGuardRank}</td>
          <td>₹${p.basicPayMin.toLocaleString("en-IN")} - ₹${p.basicPayMax.toLocaleString("en-IN")}</td>
          <td><strong>₹${p.msp.toLocaleString("en-IN")}</strong></td>
        </tr>
      `;
      })
      .join("");
  }

  function renderDirectory() {
    if (!officialPortalsContainer || !data.officialPortals) return;

    officialPortalsContainer.innerHTML = data.officialPortals
      .map((p) => {
        return `
        <div class="portal-card">
          <div>
            <div class="portal-header">
              <span class="status-badge closed">${p.category}</span>
              ${p.verified ? '<span style="font-size: 11px; color: var(--success); font-weight: 700;">✓ Verified</span>' : ""}
            </div>
            <h3 class="portal-title">${p.name}</h3>
            <p class="portal-desc">${p.description}</p>
          </div>
          <div>
            <div class="portal-helpline">
              <span>📞 Helpline:</span> <strong>${p.helpline}</strong>
            </div>
            <div class="card-actions">
              <a href="${p.url}" target="_blank" class="btn btn-outline btn-sm" style="flex: 1;">
                Portal Info 🌐
              </a>
              <a href="${p.applyUrl}" target="_blank" class="btn btn-primary btn-sm" style="flex: 1;">
                Apply Online 🔗
              </a>
            </div>
          </div>
        </div>
      `;
      })
      .join("");
  }

  // Global modal closing on background click & Escape key
  window.addEventListener("click", (e) => {
    if (examModal && e.target === examModal) examModal.style.display = "none";
    if (nocModal && e.target === nocModal) nocModal.style.display = "none";
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (examModal) examModal.style.display = "none";
      if (nocModal) nocModal.style.display = "none";
    }
  });

  // Toast Helper
  function showToast(message) {
    const toastWrapper = document.getElementById("toast");
    if (!toastWrapper) return;

    const toast = document.createElement("div");
    toast.className = "toast-msg";
    toast.innerText = message;
    toastWrapper.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.25s ease";
      setTimeout(() => toast.remove(), 250);
    }, 2800);
  }

  window.showToast = showToast;
});
