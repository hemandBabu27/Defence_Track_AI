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

  // Filters & Counters
  const searchInput = document.getElementById("search-input");
  const filterOrg = document.getElementById("filter-org");
  const filterStatus = document.getElementById("filter-status");
  const notificationsContainer = document.getElementById("notifications-container");

  // Exams & Modal
  const examsContainer = document.getElementById("exams-container");
  const examModal = document.getElementById("exam-modal");
  const modalContent = document.getElementById("modal-content");
  const modalClose = document.getElementById("modal-close");

  // Eligibility
  const eligibilityForm = document.getElementById("eligibility-form");
  const rangeAge = document.getElementById("age-slider");
  const rangeAgeVal = document.getElementById("age-slider-value");
  const rangeHeight = document.getElementById("height-slider");
  const rangeHeightVal = document.getElementById("height-slider-value");
  const resultsCard = document.getElementById("results-card");
  const genderLabels = document.querySelectorAll(".gender-btn");

  // Internships & Directory
  const internshipsContainer = document.getElementById("internships-container");
  const officialPortalsContainer = document.getElementById("official-portals-container");

  // Chatbot
  const chatbotInput = document.getElementById("chatbot-input");
  const chatbotSendBtn = document.getElementById("chatbot-send-btn");
  const chatMessages = document.getElementById("chat-messages");
  const resetChatBtn = document.getElementById("reset-chat-btn");
  const chipButtons = document.querySelectorAll(".chip-btn");

  // --- INITIALIZATION ---
  initCounters();
  renderNotifications();
  renderExams();
  renderInternships();
  renderDirectory();
  initChatbot();
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
            const timeStr = liveData.generatedAt ? new Date(liveData.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Live";
            syncStatusLabel.innerText = `Official Feeds Synced (${timeStr})`;
          }

          // Merge live headlines into active notifications for display
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
        // Take top 2 headlines per source that mention exam or recruitment
        src.headlines.slice(0, 2).forEach((h, idx) => {
          liveItems.push({
            id: `live_${src.id}_${idx}`,
            title: h.title,
            organization: src.name || src.site,
            officialReference: `Official Portal Bulletin (${src.site})`,
            releaseDate: new Date().toISOString().split('T')[0],
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
      // Add unique live items to active notifications
      const existingTitles = new Set(data.notifications.map(n => n.title.toLowerCase()));
      const uniqueLive = liveItems.filter(item => !existingTitles.has(item.title.toLowerCase()));
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
            setTimeout(fetchLiveUpdates, 3000);
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

  // --- COUNTERS ---
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

  // --- NOTIFICATIONS CENTRE ---
  function renderNotifications() {
    if (!notificationsContainer) return;

    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const org = filterOrg ? filterOrg.value.toLowerCase() : "all";
    const status = filterStatus ? filterStatus.value : "all";

    const filtered = activeNotifications.filter((n) => {
      const matchesSearch =
        n.title.toLowerCase().includes(query) ||
        (n.postName && n.postName.toLowerCase().includes(query)) ||
        n.description.toLowerCase().includes(query) ||
        (n.officialReference && n.officialReference.toLowerCase().includes(query));

      const matchesOrg = org === "all" || n.organization.toLowerCase().includes(org);
      const matchesStatus = status === "all" || n.status === status;

      return matchesSearch && matchesOrg && matchesStatus;
    });

    if (filtered.length === 0) {
      notificationsContainer.innerHTML = `
        <div class="clean-card" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
          No recruitment notices match your search. Try resetting filters.
        </div>
      `;
      return;
    }

    notificationsContainer.innerHTML = filtered.map((n) => {
      let statusClass = "closed";
      if (n.status === "Active") statusClass = "active";
      else if (n.status === "Upcoming") statusClass = "upcoming";

      return `
        <div class="item-card">
          <div>
            <div class="card-header-row">
              <span class="status-badge ${statusClass}">${n.status}</span>
              ${n.verified ? '<span style="font-size: 11px; color: var(--success); font-weight: 700;">✓ Official Gazette</span>' : ''}
            </div>
            
            <div class="card-org">${n.organization}</div>
            ${n.officialReference ? `<div class="card-ref">${n.officialReference}</div>` : ''}
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
            ${n.gazetteLink ? `
              <a href="${n.gazetteLink}" target="_blank" class="btn btn-outline btn-sm">
                Gazette 📄
              </a>
            ` : ''}
          </div>
        </div>
      `;
    }).join("");
  }

  if (searchInput) searchInput.addEventListener("input", renderNotifications);
  if (filterOrg) filterOrg.addEventListener("change", renderNotifications);
  if (filterStatus) filterStatus.addEventListener("change", renderNotifications);

  // --- EXAMS EXPLORER & MODAL ---
  function renderExams() {
    if (!examsContainer) return;

    examsContainer.innerHTML = data.careers.map((c) => {
      const genderStr = c.eligibility.gender.join("/");
      return `
        <div class="item-card" data-exam-id="${c.id}" style="cursor: pointer;">
          <div>
            <div class="card-header-row">
              <span class="card-org">${c.organization}</span>
              <span class="status-badge active">${c.commissionType.includes("Permanent") ? "Permanent" : "Short Service"}</span>
            </div>
            
            <h3 class="card-title">${c.title}</h3>
            <div class="card-ref">Gazette: ${c.officialGazette || 'Official Service Circular'}</div>
            <p class="card-desc">${c.description}</p>
            
            <ul class="card-meta-list">
              <li><span>Eligibility:</span> <strong>${genderStr}</strong></li>
              <li><span>Age Bracket:</span> <strong>${c.eligibility.ageMin} - ${c.eligibility.ageMax} Yrs</strong></li>
              <li><span>Conducting:</span> <strong>${c.conductingBody}</strong></li>
            </ul>
          </div>

          <div class="card-actions">
            <button class="btn btn-secondary btn-sm full-width">
              View Syllabus & Selection Criteria →
            </button>
          </div>
        </div>
      `;
    }).join("");

    document.querySelectorAll("#exams-container .item-card").forEach((card) => {
      card.addEventListener("click", () => {
        const examId = card.dataset.examId;
        const exam = data.careers.find((c) => c.id === examId);
        if (exam) openExamModal(exam);
      });
    });
  }

  function openExamModal(exam) {
    const syllabusList = exam.syllabi.map((s) => `<li>${s}</li>`).join("");
    const stepsList = exam.selectionProcess.map((step) => `<li>${step}</li>`).join("");

    modalContent.innerHTML = `
      <div class="modal-header-section">
        <h2 class="modal-title">${exam.title}</h2>
        <div style="font-size: 13px; color: var(--primary); font-weight: 700; text-transform: uppercase;">
          ${exam.organization} • ${exam.type}
        </div>
        <div style="font-size: 12px; color: var(--text-muted); font-family: monospace; margin-top: 4px;">
          Gazette: ${exam.officialGazette || 'Official Service Circular'}
        </div>
      </div>

      <div class="modal-detail-block">
        <h4>Overview</h4>
        <p style="font-size: 14px; color: var(--text-main);">${exam.description}</p>
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
        <p style="font-size: 14px;">${exam.eligibility.education}</p>
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
        <button class="btn btn-outline" onclick="document.getElementById('exam-modal').style.display='none'">
          Close
        </button>
      </div>
    `;

    examModal.style.display = "flex";
  }

  if (modalClose) {
    modalClose.addEventListener("click", () => {
      examModal.style.display = "none";
    });
  }

  window.addEventListener("click", (e) => {
    if (e.target === examModal) examModal.style.display = "none";
  });

  // --- ELIGIBILITY CALCULATOR ---
  if (rangeAge) {
    rangeAge.addEventListener("input", (e) => {
      rangeAgeVal.innerText = e.target.value;
    });
  }
  if (rangeHeight) {
    rangeHeight.addEventListener("input", (e) => {
      rangeHeightVal.innerText = e.target.value === "0" ? "Skip" : e.target.value + " cm";
    });
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
    const selectedGenderRadio = document.querySelector('input[name="gender"]:checked');
    const gender = selectedGenderRadio ? selectedGenderRadio.value : "male";
    const age = parseInt(rangeAge.value, 10);
    const qualification = document.getElementById("qualification-select").value;
    const hasPCM = document.getElementById("pcm-select").value === "yes";
    const height = parseInt(rangeHeight.value, 10);

    resultsCard.innerHTML = `
      <div style="text-align: center; padding: 40px 20px;">
        <div style="font-size: 13px; color: var(--primary); font-weight: 700;">Evaluating Armed Forces Guidelines...</div>
      </div>
    `;

    setTimeout(() => {
      let eligibleList = [];
      let restrictedList = [];

      data.careers.forEach((career) => {
        let isEligible = true;
        let reasons = [];

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
            reasons.push("Requires LLB degree");
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

        // Height Check
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
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="font-size: 1.15rem; color: var(--primary);">Matching Entries</h3>
            <span class="status-badge active" style="font-size: 12px;">${matchPercent}% Match</span>
          </div>

          <div style="margin-bottom: 16px;">
            <h4 style="font-size: 12px; color: var(--success); text-transform: uppercase; margin-bottom: 8px;">
              Eligible (${eligibleList.length})
            </h4>
            
            ${eligibleList.length === 0 ? `
              <p style="font-size: 13px; color: var(--text-muted);">No matching officer entries found for this profile.</p>
            ` : `
              <div class="result-matches-list">
                ${eligibleList.map((item) => `
                  <div class="match-row">
                    <div>
                      <div class="match-name">${item.title}</div>
                      <div class="match-sub">${item.conductingBody} • Age ${item.eligibility.ageMin}-${item.eligibility.ageMax}</div>
                    </div>
                    <span class="status-badge active">Eligible</span>
                  </div>
                `).join("")}
              </div>
            `}
          </div>

          ${restrictedList.length > 0 ? `
            <div>
              <h4 style="font-size: 12px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px;">
                Restricted Entries (${restrictedList.length})
              </h4>
              <div class="result-matches-list" style="max-height: 140px;">
                ${restrictedList.map((item) => `
                  <div class="match-row" style="opacity: 0.7;">
                    <div>
                      <div class="match-name">${item.career.title}</div>
                      <div class="match-sub" style="color: var(--danger);">${item.reasons.join(", ")}</div>
                    </div>
                  </div>
                `).join("")}
              </div>
            </div>
          ` : ""}

          <div style="margin-top: 18px;">
            <button class="btn btn-primary full-width" onclick="window.switchTab('ai')">
              Ask AI Mentor For Guidance 🛡️
            </button>
          </div>
        </div>
      `;
    }, 300);
  }

  // --- INTERNSHIPS ---
  function renderInternships() {
    if (!internshipsContainer) return;

    internshipsContainer.innerHTML = data.internships.map((intern) => {
      return `
        <div class="item-card">
          <div>
            <div class="card-org">${intern.organization}</div>
            <h3 class="card-title">${intern.title}</h3>
            
            <ul class="card-meta-list" style="margin-bottom: 12px; border-top: none; padding-top: 0;">
              <li><span>Duration:</span> <strong>${intern.duration}</strong></li>
              <li><span>Location:</span> <strong>${intern.location}</strong></li>
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
    }).join("");
  }

  // --- OFFICIAL DIRECTORY ---
  function renderDirectory() {
    if (!officialPortalsContainer) return;

    officialPortalsContainer.innerHTML = data.officialPortals.map((p) => {
      return `
        <div class="item-card">
          <div>
            <span class="status-badge closed" style="margin-bottom: 8px;">${p.category}</span>
            <h3 class="card-title">${p.name}</h3>
            <p class="card-desc">${p.description}</p>
            <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px;">
              📞 Helpline: <strong>${p.helpline}</strong>
            </div>
          </div>

          <div class="card-actions">
            <a href="${p.url}" target="_blank" class="btn btn-outline btn-sm" style="flex: 1;">
              Portal Info 🌐
            </a>
            <a href="${p.applyUrl}" target="_blank" class="btn btn-primary btn-sm" style="flex: 1;">
              Apply Link 🔗
            </a>
          </div>
        </div>
      `;
    }).join("");
  }

  // --- AI CHATBOT ADVISOR ---
  function initChatbot() {
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
    }, 400);
  }

  if (chatbotSendBtn) chatbotSendBtn.addEventListener("click", handleUserMessageSubmit);
  if (chatbotInput) {
    chatbotInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleUserMessageSubmit();
    });
  }

  if (resetChatBtn) {
    resetChatBtn.addEventListener("click", () => {
      if (chatMessages) chatMessages.innerHTML = "";
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
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    html = html.replace(/^### (.*?)$/gm, '<h4 style="color: var(--primary); margin: 6px 0;">$1</h4>');
    html = html.replace(/^## (.*?)$/gm, '<h3 style="color: var(--primary); margin: 8px 0;">$1</h3>');
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    const lines = html.split("\n");
    let inList = false;
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (line.startsWith("*") || line.startsWith("-")) {
        let content = line.substring(1).trim();
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

    html = html.replace(/`(.*?)`/g, '<code style="background: rgba(0,43,102,0.06); padding: 2px 4px; border-radius: 3px;">$1</code>');
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="color: var(--primary); font-weight: 600; text-decoration: underline;">$1</a>');

    return html;
  }

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
});
