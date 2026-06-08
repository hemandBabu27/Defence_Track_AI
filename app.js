/**
 * TKMCE Defence Focus Club - Application Controller
 * Manages UI transitions, card rendering, search filters,
 * eligibility scoring, and chatbot interactivity.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Ensure we have access to the data and AI engine
  const data = window.DEFENCE_DATA;
  const DefenceAIAssistant = window.DefenceAIAssistant;
  
  if (!data || !DefenceAIAssistant) {
    console.error("Data or AI Engine not loaded successfully.");
    return;
  }

  // Initialize the AI Assistant instance
  const aiAssistant = new DefenceAIAssistant(data);

  // --- STATE ---
  let activeTab = "dashboard";
  let activeNotifications = [...data.notifications];

  // --- DOM ELEMENTS ---
  const navTabs = document.querySelectorAll(".nav-tab");
  const sections = document.querySelectorAll(".app-section");
  const searchInput = document.getElementById("search-input");
  const filterOrg = document.getElementById("filter-org");
  const notificationsContainer = document.getElementById("notifications-container");
  const examsContainer = document.getElementById("exams-container");
  const internshipsContainer = document.getElementById("internships-container");
  const chatbotInput = document.getElementById("chatbot-input");
  const chatbotSendBtn = document.getElementById("chatbot-send-btn");
  const chatMessages = document.getElementById("chat-messages");
  const resetChatBtn = document.getElementById("reset-chat-btn");
  const promptButtons = document.querySelectorAll(".prompt-idea-btn");

  // --- MODAL ELEMENTS ---
  const examModal = document.getElementById("exam-modal");
  const modalContent = document.getElementById("modal-content");
  const modalClose = document.getElementById("modal-close");

  // --- ELIGIBILITY CALCULATOR ELEMENTS ---
  const eligibilityForm = document.getElementById("eligibility-form");
  const rangeAge = document.getElementById("age-slider");
  const rangeAgeVal = document.getElementById("age-slider-value");
  const rangeHeight = document.getElementById("height-slider");
  const rangeHeightVal = document.getElementById("height-slider-value");
  const resultsCard = document.getElementById("results-card");
  const genderCards = document.querySelectorAll(".gender-radio-card");

  // --- INITIALIZATION ---
  initDashboardCounters();
  renderNotifications();
  renderExams();
  renderInternships();
  initChatbot();

  // --- TAB NAVIGATION SYSTEM ---
  navTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;
      switchTab(target);
    });
  });

  // Export switchTab to global window so HTML triggers can call it
  window.switchTab = switchTab;

  function switchTab(tabId) {
    activeTab = tabId;
    
    // Update tabs
    navTabs.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === tabId);
    });

    // Update sections
    sections.forEach((sec) => {
      sec.classList.toggle("active", sec.id === tabId);
    });

    // Auto-scroll to top of main view
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // --- 1. DASHBOARD & NOTIFICATIONS CENTRE ---
  function initDashboardCounters() {
    const activeCount = data.notifications.filter(n => n.status === "Active").length;
    const examsCount = data.careers.filter(c => c.type === "Entrance Exam").length;
    const directCount = data.careers.filter(c => c.type.includes("Direct")).length;
    const internshipsCount = data.internships.length;

    const counterActive = document.getElementById("counter-active-notifications");
    const counterExams = document.getElementById("counter-exams");
    const counterDirect = document.getElementById("counter-direct-entries");
    const counterIntern = document.getElementById("counter-internships");

    if (counterActive) counterActive.innerText = activeCount;
    if (counterExams) counterExams.innerText = examsCount;
    if (counterDirect) counterDirect.innerText = directCount;
    if (counterIntern) counterIntern.innerText = internshipsCount;
  }

  function renderNotifications() {
    if (!notificationsContainer) return;
    
    const query = searchInput.value.toLowerCase();
    const org = filterOrg.value;

    const filtered = data.notifications.filter((n) => {
      const matchesSearch = 
        n.title.toLowerCase().includes(query) ||
        n.postName.toLowerCase().includes(query) ||
        n.description.toLowerCase().includes(query);
      
      const matchesOrg = org === "all" || n.organization.toLowerCase() === org.toLowerCase();
      
      return matchesSearch && matchesOrg;
    });

    if (filtered.length === 0) {
      notificationsContainer.innerHTML = `
        <div class="glass-card" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-secondary);">
          🛡️ No active notifications match your search. Try adjusting filters or ask our AI chatbot.
        </div>
      `;
      return;
    }

    notificationsContainer.innerHTML = filtered.map((n) => {
      let statusClass = "closed-card";
      let statusBadge = "closed";
      if (n.status === "Active") {
        statusClass = "active-card";
        statusBadge = "active";
      } else if (n.status === "Upcoming") {
        statusClass = "upcoming-card";
        statusBadge = "upcoming";
      }

      return `
        <div class="glass-card notification-card ${statusClass}">
          <div>
            <div class="badge-tag ${statusBadge}">${n.status}</div>
            <div class="notif-org">${n.organization}</div>
            <h3 class="notif-title">${n.title}</h3>
            <p class="notif-brief">${n.description}</p>
            
            <ul class="notif-meta-list">
              <li><span>Apply Last Date:</span> <strong>${n.applyLastDate}</strong></li>
              <li><span>Exam Date:</span> <strong>${n.examDate}</strong></li>
              <li><span>Brief Criteria:</span> <strong>${n.eligibilityBrief}</strong></li>
            </ul>
          </div>
          
          <div class="notif-actions">
            <a href="${n.applyLink}" target="_blank" class="btn btn-secondary" style="width: 100%; justify-content: center; font-size: 0.85rem;">
              Apply / Read Gazette 🔗
            </a>
          </div>
        </div>
      `;
    }).join("");
  }

  // Hook up event listeners for dashboard filters
  if (searchInput) searchInput.addEventListener("input", renderNotifications);
  if (filterOrg) filterOrg.addEventListener("change", renderNotifications);

  // --- 2. EXAMS EXPLORER ---
  function renderExams() {
    if (!examsContainer) return;

    examsContainer.innerHTML = data.careers.map((c) => {
      const genderBadge = c.eligibility.gender.join("/");
      return `
        <div class="glass-card exam-card" data-exam-id="${c.id}">
          <div class="exam-header">
            <h3>${c.title}</h3>
            <span class="exam-badge">${c.commissionType.includes("Permanent") ? "PC" : "SSC"}</span>
          </div>
          <div class="exam-org">${c.organization}</div>
          <p class="notif-brief" style="font-size: 0.85rem; height: 60px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;">
            ${c.description}
          </p>
          
          <div class="exam-stats">
            <div>
              <span>Eligibility</span>
              <strong>${genderBadge}</strong>
            </div>
            <div>
              <span>Age Range</span>
              <strong>${c.eligibility.ageMin}-${c.eligibility.ageMax} Yrs</strong>
            </div>
          </div>
        </div>
      `;
    }).join("");

    // Add click listeners to launch modal
    document.querySelectorAll(".exam-card").forEach((card) => {
      card.addEventListener("click", () => {
        const examId = card.dataset.examId;
        const examData = data.careers.find((c) => c.id === examId);
        if (examData) {
          openExamModal(examData);
        }
      });
    });
  }

  function openExamModal(exam) {
    const syllabusHtml = exam.syllabi.map(s => `<li>${s}</li>`).join("");
    const stepsHtml = exam.selectionProcess.map(step => `<li>${step}</li>`).join("");

    modalContent.innerHTML = `
      <div class="modal-title-row">
        <h2>${exam.title}</h2>
        <p style="color: var(--accent-cyan); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.85rem;">
          ${exam.organization} • ${exam.type}
        </p>
      </div>
      
      <div class="modal-sections">
        <div>
          <h4 class="modal-section-title">Description</h4>
          <p>${exam.description}</p>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div>
            <h4 class="modal-section-title">Age limit</h4>
            <p><strong>${exam.eligibility.ageMin} to ${exam.eligibility.ageMax} Years</strong></p>
          </div>
          <div>
            <h4 class="modal-section-title">Frequence</h4>
            <p>${exam.frequency}</p>
          </div>
        </div>

        <div>
          <h4 class="modal-section-title">Educational Qualification</h4>
          <p>${exam.eligibility.education}</p>
        </div>

        <div>
          <h4 class="modal-section-title">Selection Process</h4>
          <ol class="modal-bullets" style="margin-left: 0;">
            ${stepsHtml}
          </ol>
        </div>

        <div>
          <h4 class="modal-section-title">Syllabus Highlights</h4>
          <ul class="modal-bullets">
            ${syllabusHtml}
          </ul>
        </div>
      </div>
      
      <div style="margin-top: 32px; display: flex; gap: 12px;">
        <a href="${exam.link}" target="_blank" class="btn btn-primary" style="flex: 1; justify-content: center;">
          Visit Official Portal 🔗
        </a>
        <button class="btn btn-secondary" onclick="document.getElementById('exam-modal').style.display='none'">
          Close Details
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

  // Close modal if clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === examModal) {
      examModal.style.display = "none";
    }
  });

  // --- 3. INTERNSHIPS ---
  function renderInternships() {
    if (!internshipsContainer) return;

    internshipsContainer.innerHTML = data.internships.map((intern) => {
      return `
        <div class="internship-card">
          <div class="internship-header">
            <div class="internship-org">${intern.organization}</div>
            <h3 class="internship-title">${intern.title}</h3>
          </div>
          
          <div class="internship-meta-row">
            <span>Duration: ${intern.duration}</span>
            <span>•</span>
            <span>Location: ${intern.location}</span>
          </div>
          
          <div class="internship-body">
            <p style="margin-bottom: 12px;"><strong>Eligibility:</strong> ${intern.eligibility}</p>
            <p style="margin-bottom: 12px;"><strong>Description:</strong> ${intern.description}</p>
            <p><strong>Benefits:</strong> ${intern.benefits}</p>
          </div>
          
          <div style="margin-top: 20px; border-top: 1px solid var(--glass-border); padding-top: 12px; font-size: 0.8rem;">
            <strong>Application Method:</strong> ${intern.applyMethod}
          </div>
        </div>
      `;
    }).join("");
  }

  // --- 4. ELIGIBILITY CALCULATOR ---
  // Range sliders UI updates
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

  // Gender card selection toggle
  genderCards.forEach((card) => {
    card.addEventListener("click", () => {
      genderCards.forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      const radio = card.querySelector("input");
      if (radio) radio.checked = true;
    });
  });

  if (eligibilityForm) {
    eligibilityForm.addEventListener("submit", (e) => {
      e.preventDefault();
      calculateFormEligibility();
    });
  }

  function calculateFormEligibility() {
    // Collect values
    const selectedGenderCard = document.querySelector(".gender-radio-card.selected input");
    const gender = selectedGenderCard ? selectedGenderCard.value : "male";
    const age = parseInt(rangeAge.value, 10);
    const qualification = document.getElementById("qualification-select").value;
    const hasPCM = document.getElementById("pcm-select").value === "yes";
    const height = parseInt(rangeHeight.value, 10);

    // Show dynamic loader in results pane
    resultsCard.innerHTML = `
      <div style="text-align: center; padding: 60px 20px;">
        <div class="typing-bubble" style="justify-content: center; margin-bottom: 16px;">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
        <p style="color: var(--accent-cyan); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.85rem;">
          Evaluating Indian Armed Forces Entry Criteria...
        </p>
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
          reasons.push(`Min age limit is ${career.eligibility.ageMin}`);
        } else if (age > career.eligibility.ageMax) {
          isEligible = false;
          reasons.push(`Max age limit is ${career.eligibility.ageMax}`);
        }

        // Education & Stream Check
        const isGrad = ["graduate_non_tech", "graduate_tech", "law", "post_graduate"].includes(qualification);
        if (career.id === "nda") {
          if (qualification !== "12th" && !isGrad) {
            isEligible = false;
            reasons.push("Requires 12th standard");
          }
          if ((career.title.includes("Navy") || career.title.includes("Air Force")) && !hasPCM) {
            isEligible = false;
            reasons.push("Air Force/Navy branches require 10+2 PCM");
          }
        } else if (career.id === "cds") {
          if (!isGrad) {
            isEligible = false;
            reasons.push("Requires graduation degree");
          }
          if (career.title.includes("Air Force Academy") && !hasPCM) {
            isEligible = false;
            reasons.push("AFA flight duties require 10+2 PCM");
          }
        } else if (career.id === "afcat") {
          if (!isGrad) {
            isEligible = false;
            reasons.push("Requires graduation degree");
          }
          if (!hasPCM) {
            isEligible = false;
            reasons.push("Requires Physics & Mathematics at 10+2 level");
          }
        } else if (career.id === "ssc_tech" || career.id === "tgc") {
          if (qualification !== "graduate_tech") {
            isEligible = false;
            reasons.push("Requires B.E / B.Tech engineering degree");
          }
        } else if (career.id === "jag") {
          if (qualification !== "law") {
            isEligible = false;
            reasons.push("Requires LLB degree");
          }
        } else if (career.id.startsWith("agniveer")) {
          if (qualification !== "12th" && !isGrad) {
            isEligible = false;
            reasons.push("Requires 10th or 12th standard");
          }
        }

        // Height checks
        if (height > 0) {
          let minHeight = 157.5; // default male army
          if (gender === "female") minHeight = 152;
          if (career.id === "afcat" && career.title.toLowerCase().includes("flying")) {
            minHeight = 162.5;
          }
          if (height < minHeight) {
            isEligible = false;
            reasons.push(`Height must be at least ${minHeight} cm`);
          }
        }

        if (isEligible) {
          eligibleList.push(career);
        } else {
          restrictedList.push({ career, reasons });
        }
      });

      // Render evaluation results
      const totalOpportunities = data.careers.length;
      const matchPercent = Math.round((eligibleList.length / totalOpportunities) * 100);

      resultsCard.innerHTML = `
        <div class="result-active-view">
          <div class="result-header">
            <div class="result-heading-flex">
              <h3>Personalized Eligibility</h3>
              <span class="score-badge">${matchPercent}% Match</span>
            </div>
            <p style="font-size: 0.85rem; margin-top: 4px;">Based on your inputs, we scanned ${totalOpportunities} career pathways.</p>
          </div>

          <div style="margin-bottom: 20px;">
            <h4 style="font-size: 0.95rem; color: var(--success); text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.05em;">
              🎉 Eligible Careers (${eligibleList.length})
            </h4>
            
            ${eligibleList.length === 0 ? `
              <p style="font-size: 0.9rem; color: var(--text-muted); text-align: center; padding: 16px;">
                No matches found based on age or qualification. Check out Agniveer or alternative entries.
              </p>
            ` : `
              <div class="eligibility-list-matches">
                ${eligibleList.map(item => `
                  <div class="match-item">
                    <div>
                      <div class="match-item-name">${item.title}</div>
                      <div class="match-item-type">${item.type} • Age ${item.eligibility.ageMin}-${item.eligibility.ageMax}</div>
                    </div>
                    <span class="match-status-badge">ELIGIBLE</span>
                  </div>
                `).join("")}
              </div>
            `}
          </div>

          ${restrictedList.length > 0 ? `
            <div>
              <h4 style="font-size: 0.95rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.05em;">
                🔒 Restricted Entries (${restrictedList.length})
              </h4>
              <div class="eligibility-list-matches" style="max-height: 200px;">
                ${restrictedList.map(item => `
                  <div class="match-item" style="opacity: 0.6;">
                    <div>
                      <div class="match-item-name">${item.career.title}</div>
                      <div class="match-item-type" style="color: var(--danger); font-weight: 500;">
                        ${item.reasons.join(", ")}
                      </div>
                    </div>
                  </div>
                `).join("")}
              </div>
            </div>
          ` : ""}

          <div style="margin-top: 24px; border-top: 1px solid var(--glass-border); padding-top: 16px;">
            <button class="btn btn-primary" style="width: 100%; justify-content: center;" onclick="window.switchTab('ai')">
              Ask AI For preparation Guidelines 🛡️
            </button>
          </div>
        </div>
      `;
    }, 600);
  }

  // --- 5. AI CHAT ASSISTANT CORE ---
  function initChatbot() {
    // Append welcoming message
    appendChatBubble("bot", `Jai Hind! 🇮🇳 I am **TKMCE Defence Focus AI**, your Indian Defence Careers Advisor.\n\nI can help you analyze eligibility, understand SSB interview procedures, explain eye-vision and medical standards, and identify active notifications or internships.\n\nType **"Analyze Profile"** to get a structured eligibility check, or ask a question directly!`);
  }

  function appendChatBubble(sender, text) {
    const bubble = document.createElement("div");
    bubble.classList.add("message", sender);

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Parse simulated Markdown into HTML
    const formattedHtml = parseMarkdownToHtml(text);

    bubble.innerHTML = `
      <div class="message-bubble">${formattedHtml}</div>
      <div class="message-time">${timeString}</div>
    `;

    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function showTypingIndicator() {
    const indicator = document.createElement("div");
    indicator.classList.add("message", "bot", "typing-indicator-node");
    indicator.innerHTML = `
      <div class="message-bubble typing-bubble">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    `;
    chatMessages.appendChild(indicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return indicator;
  }

  function removeTypingIndicator(node) {
    if (node && node.parentNode) {
      node.parentNode.removeChild(node);
    }
  }

  function handleUserMessageSubmit() {
    const text = chatbotInput.value.trim();
    if (!text) return;

    // Clear input
    chatbotInput.value = "";

    // Append user message
    appendChatBubble("user", text);

    // Show loader
    const indicator = showTypingIndicator();

    // Process message on delay to simulate thinking
    setTimeout(() => {
      removeTypingIndicator(indicator);
      
      const responseObj = aiAssistant.processMessage(text);
      appendChatBubble("bot", responseObj.text);

      // Handle custom callback actions triggered by AI chatbot state machine
      if (responseObj.action === "start_analysis") {
        // We can do UI tweaks if necessary
      } else if (responseObj.action === "finish_analysis") {
        // Optional: Parse inputs and switch to eligibility screen, or update standard values
      }

    }, 850);
  }

  if (chatbotSendBtn) chatbotSendBtn.addEventListener("click", handleUserMessageSubmit);
  if (chatbotInput) {
    chatbotInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        handleUserMessageSubmit();
      }
    });
  }

  if (resetChatBtn) {
    resetChatBtn.addEventListener("click", () => {
      chatMessages.innerHTML = "";
      aiAssistant.resetAnalysis();
      initChatbot();
    });
  }

  // Hook up quick hint prompt ideas
  promptButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const promptText = btn.dataset.prompt;
      if (promptText) {
        chatbotInput.value = promptText;
        handleUserMessageSubmit();
      }
    });
  });

  // Helper Markdown-to-HTML parser
  function parseMarkdownToHtml(text) {
    // 1. Escape HTML entities to prevent rendering arbitrary DOM nodes
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // 2. Headings (### heading)
    html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');

    // 3. Bold (**text**)
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // 4. Bullet lists (* item)
    const lines = html.split('\n');
    let inList = false;
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (line.startsWith('*') || line.startsWith('-')) {
        let content = line.substring(1).trim();
        // remove any leading bold tag space details
        if (!inList) {
          lines[i] = '<ul><li>' + content + '</li>';
          inList = true;
        } else {
          lines[i] = '<li>' + content + '</li>';
        }
      } else {
        if (inList) {
          lines[i - 1] = lines[i - 1] + '</ul>';
          inList = false;
        }
      }
    }
    if (inList) {
      lines[lines.length - 1] = lines[lines.length - 1] + '</ul>';
    }
    
    html = lines.join('\n');

    // 5. Code blocks / Inlines (`text`)
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');

    // 6. External Links ([text](url))
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="color: var(--accent-cyan); text-decoration: underline;">$1</a>');

    return html;
  }
});
