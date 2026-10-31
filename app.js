/**
 * Defence Track AI - Application Controller
 * UI transitions, date-driven notification statuses, live sync with official sources,
 * watchlist, calendar export, eligibility matcher and chatbot wiring.
 */
document.addEventListener("DOMContentLoaded", () => {
  const data = window.DEFENCE_DATA;
  const DefenceAIAssistant = window.DefenceAIAssistant;
  const Elig = window.DefenceEligibility;

  if (!data || !DefenceAIAssistant || !Elig) {
    console.error("Data, eligibility or AI engine not loaded successfully.");
    return;
  }

  const aiAssistant = new DefenceAIAssistant(data);

  // ---------- Helpers ----------
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const safeUrl = (u) => (/^https?:\/\//i.test(u || "") ? u : "#");
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const parseISO = (s) => (s ? new Date(s + "T00:00:00") : null);
  const daysUntil = (iso) => Math.round((parseISO(iso) - startOfDay(new Date())) / 86400000);
  const fmtDate = (iso) => parseISO(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
  const timeAgo = (iso) => {
    const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
    if (mins < 2) return "just now";
    if (mins < 60) return `${mins} min ago`;
    const h = Math.round(mins / 60);
    if (h < 48) return `${h} h ago`;
    return `${Math.round(h / 24)} days ago`;
  };

  // ---------- Date-driven statuses ----------
  const STATUS_ORDER = { Active: 0, Upcoming: 1, Expected: 2, Closed: 3 };

  function computeStatus(n) {
    const today = startOfDay(new Date());
    if (n.applyStart && n.applyLastDate) {
      if (today > parseISO(n.applyLastDate)) return "Closed";
      if (today >= parseISO(n.applyStart)) return "Active";
      return "Upcoming";
    }
    if (n.applyLastDate && today > parseISO(n.applyLastDate)) return "Closed";
    return n.expectedWindow ? "Expected" : "Closed";
  }

  function applyStatuses() {
    data.notifications.forEach((n) => { n.status = computeStatus(n); });
    data.notifications.sort((a, b) => {
      const o = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
      if (o) return o;
      const da = a.applyStart || a.applyLastDate || "9999";
      const db = b.applyStart || b.applyLastDate || "9999";
      return a.status === "Closed" ? db.localeCompare(da) : da.localeCompare(db);
    });
  }

  function countdownInfo(n) {
    if (n.status === "Active") {
      const d = daysUntil(n.applyLastDate);
      return { text: d === 0 ? "Closes today" : `Closes in ${plural(d, "day")}`, cls: d <= 7 ? "urgent" : "ok" };
    }
    if (n.status === "Upcoming") return { text: `Opens in ${plural(daysUntil(n.applyStart), "day")}`, cls: "soon" };
    if (n.status === "Expected") return { text: "Dates not official yet", cls: "soon" };
    return { text: `Closed ${plural(-daysUntil(n.applyLastDate), "day")} ago`, cls: "closed" };
  }

  function nextStepFor(careerId) {
    return data.notifications.find((n) => n.careerId === careerId && n.status !== "Closed") || null;
  }

  // ---------- State ----------
  let liveDoc = null;
  let watch = new Set();
  let watchOnly = false;
  try { watch = new Set(JSON.parse(localStorage.getItem("dtai.watch") || "[]")); } catch { /* storage unavailable */ }
  const saveWatch = () => { try { localStorage.setItem("dtai.watch", JSON.stringify([...watch])); } catch { /* ignore */ } };

  // ---------- DOM ----------
  const navTabs = document.querySelectorAll(".nav-tab");
  const sections = document.querySelectorAll(".app-section");
  const searchInput = document.getElementById("search-input");
  const filterOrg = document.getElementById("filter-org");
  const watchFilterBtn = document.getElementById("watch-filter");
  const notificationsContainer = document.getElementById("notifications-container");
  const examsContainer = document.getElementById("exams-container");
  const internshipsContainer = document.getElementById("internships-container");
  const chatbotInput = document.getElementById("chatbot-input");
  const chatbotSendBtn = document.getElementById("chatbot-send-btn");
  const chatMessages = document.getElementById("chat-messages");
  const resetChatBtn = document.getElementById("reset-chat-btn");
  const promptButtons = document.querySelectorAll(".prompt-idea-btn");
  const examModal = document.getElementById("exam-modal");
  const modalContent = document.getElementById("modal-content");
  const modalClose = document.getElementById("modal-close");
  const eligibilityForm = document.getElementById("eligibility-form");
  const rangeAge = document.getElementById("age-slider");
  const rangeAgeVal = document.getElementById("age-slider-value");
  const rangeHeight = document.getElementById("height-slider");
  const rangeHeightVal = document.getElementById("height-slider-value");
  const resultsCard = document.getElementById("results-card");
  const genderCards = document.querySelectorAll(".gender-radio-card");
  const syncBar = document.getElementById("sync-bar");
  const nextDeadlineEl = document.getElementById("next-deadline");
  const keyDatesEl = document.getElementById("key-dates");
  const liveFeedEl = document.getElementById("live-feed");
  const sourcesEl = document.getElementById("sources-list");

  // ---------- Toast ----------
  function toast(msg) {
    const t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add("show"), 10);
    setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 300); }, 3200);
  }

  // ---------- Tabs ----------
  navTabs.forEach((tab) => tab.addEventListener("click", () => switchTab(tab.dataset.tab)));
  window.switchTab = switchTab;

  function switchTab(tabId) {
    navTabs.forEach((btn) => btn.classList.toggle("active", btn.dataset.tab === tabId));
    sections.forEach((sec) => sec.classList.toggle("active", sec.id === tabId));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ---------- Dashboard ----------
  function initDashboardCounters() {
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set("counter-active-notifications", data.notifications.filter((n) => n.status === "Active").length);
    set("counter-exams", data.careers.filter((c) => c.type === "Entrance Exam").length);
    set("counter-direct-entries", data.careers.filter((c) => c.type.includes("Direct")).length);
    set("counter-internships", data.internships.length);
  }

  function renderNextDeadline() {
    if (!nextDeadlineEl) return;
    const events = [];
    data.notifications.forEach((n) => {
      if (n.status === "Active") events.push({ d: daysUntil(n.applyLastDate), text: `${n.title} closes`, n, urgent: true });
      if (n.status === "Upcoming") events.push({ d: daysUntil(n.applyStart), text: `${n.title} opens`, n });
    });
    events.sort((a, b) => a.d - b.d);
    if (!events.length) { nextDeadlineEl.style.display = "none"; return; }
    const e = events[0];
    nextDeadlineEl.style.display = "flex";
    nextDeadlineEl.className = "next-deadline" + (e.urgent && e.d <= 7 ? " urgent" : "");
    nextDeadlineEl.innerHTML = `
      <span class="nd-icon">⏰</span>
      <div><strong>Next date: ${esc(e.text)} ${e.d === 0 ? "today" : "in " + plural(e.d, "day")}</strong>
      <span>${esc(e.n.organization)} · ${esc(fmtDate(e.n.status === "Active" ? e.n.applyLastDate : e.n.applyStart))}</span></div>`;
  }

  function renderKeyDates() {
    if (!keyDatesEl) return;
    const rows = [];
    data.notifications.forEach((n) => {
      if (n.applyStart && daysUntil(n.applyStart) >= 0) rows.push({ iso: n.applyStart, label: `${n.title}: applications open`, org: n.organization });
      if (n.applyLastDate && daysUntil(n.applyLastDate) >= 0) rows.push({ iso: n.applyLastDate, label: `${n.title}: last date to apply`, org: n.organization });
      if (n.examDate && daysUntil(n.examDate) >= 0) rows.push({ iso: n.examDate, label: `${n.title}: exam`, org: n.organization });
    });
    rows.sort((a, b) => a.iso.localeCompare(b.iso));
    const top = rows.slice(0, 10);
    keyDatesEl.innerHTML = top.length ? top.map((r) => {
      const d = parseISO(r.iso);
      const days = daysUntil(r.iso);
      return `<li class="kd-row">
        <div class="kd-date"><b>${d.getDate()}</b><span>${d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" })}</span></div>
        <div class="kd-label">${esc(r.label)}<small>${esc(r.org)}</small></div>
        <div class="kd-when">${days === 0 ? "Today" : "in " + plural(days, "day")}</div></li>`;
    }).join("") : `<li class="kd-empty">No dated events coming up. Check back after the next notification.</li>`;
  }

  function renderNotifications() {
    if (!notificationsContainer) return;
    const query = searchInput.value.toLowerCase();
    const org = filterOrg.value.toLowerCase();

    const filtered = data.notifications.filter((n) => {
      const hay = `${n.title} ${n.postName} ${n.description} ${n.organization}`.toLowerCase();
      const matchesOrg = org === "all" || n.organization.toLowerCase().includes(org);
      return hay.includes(query) && matchesOrg && (!watchOnly || watch.has(n.id));
    });

    if (!filtered.length) {
      notificationsContainer.innerHTML = `<div class="glass-card" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-secondary);">
        🛡️ ${watchOnly ? "Nothing on your watchlist yet. Tap ☆ on a card to follow it." : "No notifications match your search. Try different filters or ask the AI Mentor."}</div>`;
      return;
    }

    notificationsContainer.innerHTML = filtered.map((n) => {
      const cls = { Active: "active", Upcoming: "upcoming", Expected: "expected", Closed: "closed" }[n.status];
      const cd = countdownInfo(n);
      const windowText = n.applyStart ? `${fmtDate(n.applyStart)} – ${fmtDate(n.applyLastDate)}` : (n.expectedWindow || "To be announced");
      const examText = n.examDate ? fmtDate(n.examDate) : (n.examNote || "To be announced");
      const hasDates = Boolean(n.applyStart || n.applyLastDate);
      const watched = watch.has(n.id);
      return `
        <div class="glass-card notification-card ${cls}-card" data-id="${esc(n.id)}">
          <div>
            <div class="card-top">
              <div class="badge-tag ${cls}">${esc(n.status)}</div>
              <span class="countdown ${cd.cls}">${esc(cd.text)}</span>
            </div>
            <div class="notif-org">${esc(n.organization)}</div>
            <h3 class="notif-title">${esc(n.title)}</h3>
            <p class="notif-brief">${esc(n.description)}</p>
            <ul class="notif-meta-list">
              <li><span>Apply window:</span> <strong>${esc(windowText)}</strong></li>
              <li><span>Exam / selection:</span> <strong>${esc(examText)}</strong></li>
              <li><span>Criteria:</span> <strong>${esc(n.eligibilityBrief)}</strong></li>
            </ul>
            <p class="basis-note">${n.status === "Expected" ? "⚠️ " : "✔ "}${esc(n.basis)} · checked ${esc(fmtDate(n.verifiedOn))}</p>
          </div>
          <div class="notif-actions">
            <a href="${esc(safeUrl(n.applyLink))}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">Official site 🔗</a>
            <button class="btn btn-secondary btn-sm" data-action="ics" ${hasDates ? "" : "disabled title='No official dates yet'"}>📅 Add to calendar</button>
            <button class="btn btn-secondary btn-sm watch-btn ${watched ? "on" : ""}" data-action="watch" aria-pressed="${watched}">${watched ? "★ Watching" : "☆ Watch"}</button>
          </div>
        </div>`;
    }).join("");
  }

  if (notificationsContainer) {
    notificationsContainer.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn || btn.disabled) return;
      const id = btn.closest(".notification-card").dataset.id;
      if (btn.dataset.action === "watch") {
        if (watch.has(id)) watch.delete(id); else watch.add(id);
        saveWatch();
        renderNotifications();
        toast(watch.has(id) ? "Added to your watchlist" : "Removed from watchlist");
      } else if (btn.dataset.action === "ics") {
        downloadIcs(data.notifications.find((n) => n.id === id));
      }
    });
  }

  if (searchInput) searchInput.addEventListener("input", renderNotifications);
  if (filterOrg) filterOrg.addEventListener("change", renderNotifications);
  if (watchFilterBtn) {
    watchFilterBtn.addEventListener("click", () => {
      watchOnly = !watchOnly;
      watchFilterBtn.classList.toggle("on", watchOnly);
      watchFilterBtn.setAttribute("aria-pressed", String(watchOnly));
      renderNotifications();
    });
  }

  // ---------- Calendar (.ics) export ----------
  function icsDate(iso) { return iso.replace(/-/g, ""); }
  function icsNextDay(iso) { const d = parseISO(iso); d.setDate(d.getDate() + 1); return d.getFullYear() + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0"); }
  function icsText(s) { return String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n"); }

  function downloadIcs(n) {
    if (!n) return;
    const events = [];
    if (n.applyStart) events.push({ iso: n.applyStart, title: `${n.title}: applications open` });
    if (n.applyLastDate) events.push({ iso: n.applyLastDate, title: `${n.title}: LAST DATE to apply` });
    if (n.examDate) events.push({ iso: n.examDate, title: `${n.title}: exam` });
    const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Defence Track AI//EN", "CALSCALE:GREGORIAN"];
    events.forEach((ev, i) => {
      lines.push("BEGIN:VEVENT", `UID:${n.id}-${i}@defence-track-ai`, `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${icsDate(ev.iso)}`, `DTEND;VALUE=DATE:${icsNextDay(ev.iso)}`,
        `SUMMARY:${icsText(ev.title)}`,
        `DESCRIPTION:${icsText(n.basis + ". Confirm on " + n.applyLink)}`,
        `URL:${n.applyLink}`,
        "BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${icsText(ev.title)}`, "TRIGGER:-P3D", "END:VALARM",
        "END:VEVENT");
    });
    lines.push("END:VCALENDAR");
    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${n.id}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast("Calendar file downloaded (reminder set 3 days before)");
  }

  // ---------- Live sync with official sources ----------
  function renderSyncBar(state) {
    if (!syncBar) return;
    const curated = `Curated data checked ${fmtDate(data.meta.curatedOn)}`;
    let dot = "off";
    let text;
    if (state === "loading") {
      dot = "busy"; text = "Checking official sources…";
    } else if (!liveDoc || !liveDoc.generatedAt) {
      text = liveDoc ? "Server is running but hasn't completed its first official-site check yet" : "Offline snapshot: live sync needs the Node server or the scheduled Action";
    } else {
      const ok = liveDoc.sources.filter((s) => s.ok).length;
      const ageH = (Date.now() - new Date(liveDoc.generatedAt).getTime()) / 3600000;
      dot = ok === 0 ? "bad" : ageH > 24 ? "stale" : "ok";
      text = `Live sync: checked ${timeAgo(liveDoc.generatedAt)} · ${ok}/${liveDoc.sources.length} official sites reachable`;
      if (liveDoc.refreshing) text += " · refreshing now";
    }
    syncBar.innerHTML = `<span class="sync-dot ${dot}"></span><span class="sync-text">${esc(text)}<small>${esc(curated)}</small></span>
      <button class="btn btn-secondary btn-sm" id="sync-refresh">🔄 Refresh</button>`;
    const btn = document.getElementById("sync-refresh");
    if (btn) btn.addEventListener("click", manualRefresh);
  }

  function renderLiveFeed() {
    if (!liveFeedEl) return;
    if (!liveDoc || !liveDoc.sources || !liveDoc.sources.length) {
      liveFeedEl.innerHTML = `<div class="glass-card feed-empty">Live headlines will appear here once the server has checked the official sites. Until then, use the curated cards above and the official links.</div>`;
      return;
    }
    liveFeedEl.innerHTML = liveDoc.sources.map((s) => {
      const items = (s.headlines || []).slice(0, 6).map((h) =>
        `<li><a href="${esc(safeUrl(h.url))}" target="_blank" rel="noopener noreferrer">${esc(h.title)}</a></li>`).join("");
      const state = s.ok ? `<span class="chip ok">reachable</span>` : `<span class="chip bad" title="${esc(s.error || "")}">unreachable</span>`;
      return `<div class="glass-card feed-card">
        <div class="feed-head"><h4>${esc(s.name)}</h4>${state}</div>
        <ul class="feed-list">${items || `<li class="muted">No recruitment headlines found on the page. Open the site directly.</li>`}</ul>
        <p class="feed-foot">${s.stale ? "Showing last successful check · " : ""}Checked ${esc(timeAgo(s.checkedAt))} · <a href="${esc(safeUrl(s.url))}" target="_blank" rel="noopener noreferrer">${esc(s.site)}</a></p>
      </div>`;
    }).join("");
  }

  function shareLiveWithAssistant() {
    aiAssistant.liveMeta = liveDoc && liveDoc.generatedAt ? { generatedAt: liveDoc.generatedAt } : null;
    aiAssistant.liveFeed = [];
    if (liveDoc && liveDoc.sources) {
      liveDoc.sources.forEach((s) => (s.headlines || []).slice(0, 4).forEach((h) => aiAssistant.liveFeed.push({ source: s.name, title: h.title, url: h.url })));
    }
  }

  async function loadLive(showBusy) {
    if (showBusy) renderSyncBar("loading");
    let doc = null;
    for (const url of ["/api/live", "data/live.json"]) {
      try {
        const r = await fetch(url + (url.includes("?") ? "" : "?t=" + Date.now()), { cache: "no-store" });
        if (r.ok) { doc = await r.json(); break; }
      } catch { /* try next */ }
    }
    liveDoc = doc;
    shareLiveWithAssistant();
    renderSyncBar();
    renderLiveFeed();
    return doc;
  }

  async function manualRefresh() {
    const btn = document.getElementById("sync-refresh");
    if (btn) { btn.disabled = true; btn.textContent = "Refreshing…"; }
    try {
      const r = await fetch("/api/refresh", { method: "POST" });
      if (r.status === 429) {
        const j = await r.json();
        toast(`Checked recently. Try again in ${Math.ceil(j.retryAfterSeconds / 60)} min.`);
      } else if (r.ok) {
        toast("Checking official sites… this takes a few seconds");
        await new Promise((res) => setTimeout(res, 8000));
      } else {
        toast("Refresh isn't available on this host. The scheduled Action updates it instead.");
      }
    } catch {
      toast("Refresh needs the Node server (npm start).");
    }
    await loadLive(false);
  }

  function renderSources() {
    if (!sourcesEl) return;
    sourcesEl.innerHTML = data.sources.map((s) => `<a href="${esc(safeUrl(s.url))}" target="_blank" rel="noopener noreferrer">${esc(s.name)}</a>`).join(" · ");
  }

  // ---------- Exams explorer ----------
  function statusChipFor(careerId) {
    const n = nextStepFor(careerId);
    if (!n) return "";
    if (n.status === "Active") return `<span class="chip ok">Open · closes ${esc(fmtDate(n.applyLastDate))}</span>`;
    if (n.status === "Upcoming") return `<span class="chip soon">Opens ${esc(fmtDate(n.applyStart))}</span>`;
    return `<span class="chip soon">Expected, not official</span>`;
  }

  function renderExams() {
    if (!examsContainer) return;
    examsContainer.innerHTML = data.careers.map((c) => `
      <div class="glass-card exam-card" data-exam-id="${esc(c.id)}" tabindex="0" role="button">
        <div class="exam-header">
          <h3>${esc(c.title)}</h3>
          <span class="exam-badge">${c.commissionType.includes("Permanent") ? "PC" : "SSC"}</span>
        </div>
        <div class="exam-org">${esc(c.organization)}</div>
        <p class="notif-brief clamp-3">${esc(c.description)}</p>
        <div class="exam-chip-row">${statusChipFor(c.id)}</div>
        <div class="exam-stats">
          <div><span>Eligibility</span><strong>${esc(c.eligibility.gender.join("/"))}</strong></div>
          <div><span>Age Range</span><strong>${c.eligibility.ageMin}-${c.eligibility.ageMax} Yrs</strong></div>
        </div>
      </div>`).join("");

    document.querySelectorAll(".exam-card").forEach((card) => {
      const open = () => {
        const exam = data.careers.find((c) => c.id === card.dataset.examId);
        if (exam) openExamModal(exam);
      };
      card.addEventListener("click", open);
      card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
    });
  }

  function openExamModal(exam) {
    const syllabusHtml = exam.syllabi.map((s) => `<li>${esc(s)}</li>`).join("");
    const stepsHtml = exam.selectionProcess.map((step) => `<li>${esc(step)}</li>`).join("");
    const related = data.notifications.filter((n) => n.careerId === exam.id);
    const relatedHtml = related.length ? `
      <div>
        <h4 class="modal-section-title">Current &amp; upcoming cycles</h4>
        <ul class="modal-bullets">${related.map((n) => {
          const cd = countdownInfo(n);
          return `<li><strong>${esc(n.title)}</strong> — ${esc(n.status)} (${esc(cd.text)})${n.applyStart ? `, applications ${esc(fmtDate(n.applyStart))} to ${esc(fmtDate(n.applyLastDate))}` : ""}${n.examDate ? `, exam ${esc(fmtDate(n.examDate))}` : ""}</li>`;
        }).join("")}</ul>
      </div>` : "";

    modalContent.innerHTML = `
      <div class="modal-title-row">
        <h2>${esc(exam.title)}</h2>
        <p style="color: var(--accent-cyan); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.85rem;">
          ${esc(exam.organization)} • ${esc(exam.type)}
        </p>
      </div>
      <div class="modal-sections">
        <div><h4 class="modal-section-title">Description</h4><p>${esc(exam.description)}</p></div>
        ${relatedHtml}
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div><h4 class="modal-section-title">Age limit</h4><p><strong>${exam.eligibility.ageMin} to ${exam.eligibility.ageMax} Years</strong></p></div>
          <div><h4 class="modal-section-title">Frequency</h4><p>${esc(exam.frequency)}</p></div>
        </div>
        <div><h4 class="modal-section-title">Educational Qualification</h4><p>${esc(exam.eligibility.education)}</p></div>
        <div><h4 class="modal-section-title">Selection Process</h4><ol class="modal-bullets" style="margin-left: 0;">${stepsHtml}</ol></div>
        <div><h4 class="modal-section-title">Syllabus Highlights</h4><ul class="modal-bullets">${syllabusHtml}</ul></div>
      </div>
      <div style="margin-top: 32px; display: flex; gap: 12px;">
        <a href="${esc(safeUrl(exam.link))}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="flex: 1; justify-content: center;">Visit Official Portal 🔗</a>
        <button class="btn btn-secondary" id="modal-close-2">Close Details</button>
      </div>`;
    examModal.style.display = "flex";
    const c2 = document.getElementById("modal-close-2");
    if (c2) c2.addEventListener("click", closeModal);
  }

  function closeModal() { examModal.style.display = "none"; }
  if (modalClose) modalClose.addEventListener("click", closeModal);
  window.addEventListener("click", (e) => { if (e.target === examModal) closeModal(); });
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  // ---------- Internships ----------
  function renderInternships() {
    if (!internshipsContainer) return;
    internshipsContainer.innerHTML = data.internships.map((i) => `
      <div class="internship-card">
        <div class="internship-header">
          <div class="internship-org">${esc(i.organization)}</div>
          <h3 class="internship-title">${esc(i.title)}</h3>
        </div>
        <div class="internship-meta-row"><span>Duration: ${esc(i.duration)}</span><span>•</span><span>Location: ${esc(i.location)}</span></div>
        <div class="internship-body">
          <p style="margin-bottom: 12px;"><strong>Eligibility:</strong> ${esc(i.eligibility)}</p>
          <p style="margin-bottom: 12px;"><strong>Description:</strong> ${esc(i.description)}</p>
          <p><strong>Benefits:</strong> ${esc(i.benefits)}</p>
        </div>
        <div style="margin-top: 20px; border-top: 1px solid var(--glass-border); padding-top: 12px; font-size: 0.8rem;">
          <strong>Application Method:</strong> ${esc(i.applyMethod)}
        </div>
      </div>`).join("");
  }

  // ---------- Eligibility matcher ----------
  if (rangeAge) rangeAge.addEventListener("input", (e) => { rangeAgeVal.textContent = e.target.value; });
  if (rangeHeight) rangeHeight.addEventListener("input", (e) => { rangeHeightVal.textContent = e.target.value === "0" ? "Skip" : e.target.value + " cm"; });

  genderCards.forEach((card) => {
    card.addEventListener("click", () => {
      genderCards.forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");
      const radio = card.querySelector("input");
      if (radio) radio.checked = true;
    });
  });

  if (eligibilityForm) eligibilityForm.addEventListener("submit", (e) => { e.preventDefault(); calculateFormEligibility(); });

  function calculateFormEligibility() {
    const sel = document.querySelector(".gender-radio-card.selected input");
    const input = {
      gender: sel ? sel.value : "male",
      age: parseInt(rangeAge.value, 10),
      qualification: document.getElementById("qualification-select").value,
      hasPCM: document.getElementById("pcm-select").value === "yes",
      height: parseInt(rangeHeight.value, 10)
    };

    resultsCard.innerHTML = `<div style="text-align: center; padding: 60px 20px;">
      <div class="typing-bubble" style="justify-content: center; margin-bottom: 16px;"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>
      <p style="color: var(--accent-cyan); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.85rem;">Evaluating Indian Armed Forces entry criteria...</p></div>`;

    setTimeout(() => {
      const { eligible, restricted } = Elig.evaluate(data.careers, input);
      const total = data.careers.length;
      const pct = Math.round((eligible.length / total) * 100);

      const eligibleHtml = eligible.map(({ career, notes }) => {
        const step = nextStepFor(career.id);
        const stepHtml = step ? `<div class="match-next">${step.status === "Active" ? "🟢 Open now" : step.status === "Upcoming" ? "🟡 Opens " + esc(fmtDate(step.applyStart)) : "⚪ Expected"}: ${esc(step.title)}</div>` : "";
        const notesHtml = notes.length ? `<div class="match-notes">${notes.map((n) => "• " + esc(n)).join("<br>")}</div>` : "";
        return `<div class="match-item">
          <div><div class="match-item-name">${esc(career.title)}</div>
          <div class="match-item-type">${esc(career.type)} • Age ${career.eligibility.ageMin}-${career.eligibility.ageMax}</div>${stepHtml}${notesHtml}</div>
          <span class="match-status-badge">ELIGIBLE</span></div>`;
      }).join("");

      resultsCard.innerHTML = `
        <div class="result-active-view">
          <div class="result-header">
            <div class="result-heading-flex"><h3>Personalized Eligibility</h3><span class="score-badge">${pct}% Match</span></div>
            <p style="font-size: 0.85rem; margin-top: 4px;">Scanned ${total} pathways. Preliminary screen only; the official notification prevails.</p>
          </div>
          <div style="margin-bottom: 20px;">
            <h4 style="font-size: 0.95rem; color: var(--success); text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.05em;">🎉 Eligible Careers (${eligible.length})</h4>
            ${eligible.length ? `<div class="eligibility-list-matches">${eligibleHtml}</div>` : `<p style="font-size: 0.9rem; color: var(--text-muted); text-align: center; padding: 16px;">No matches for these inputs. Check the restricted list for what to change.</p>`}
          </div>
          ${restricted.length ? `<div>
            <h4 style="font-size: 0.95rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.05em;">🔒 Restricted Entries (${restricted.length})</h4>
            <div class="eligibility-list-matches" style="max-height: 200px;">${restricted.map((r) => `<div class="match-item" style="opacity: 0.75;"><div>
              <div class="match-item-name">${esc(r.career.title)}</div>
              <div class="match-item-type" style="color: var(--danger); font-weight: 500;">${esc(r.reasons.join("; "))}</div></div></div>`).join("")}</div>
          </div>` : ""}
          <div style="margin-top: 24px; border-top: 1px solid var(--glass-border); padding-top: 16px;">
            <button class="btn btn-primary" style="width: 100%; justify-content: center;" onclick="window.switchTab('ai')">Ask AI for preparation guidelines 🛡️</button>
          </div>
        </div>`;
    }, 400);
  }

  // ---------- AI chat ----------
  function initChatbot() {
    appendChatBubble("bot", `Jai Hind! 🇮🇳 I am **Defence Track AI**, your Indian Defence Careers Advisor.\n\nI can check eligibility, explain SSB and medical standards, and tell you which notifications are open **today** or coming up.\n\nType **"Analyze Profile"** for a structured eligibility check, or ask a question directly!`);
  }

  function appendChatBubble(sender, text) {
    const bubble = document.createElement("div");
    bubble.classList.add("message", sender);
    const timeString = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    bubble.innerHTML = `<div class="message-bubble">${parseMarkdownToHtml(text)}</div><div class="message-time">${timeString}</div>`;
    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function showTypingIndicator() {
    const indicator = document.createElement("div");
    indicator.classList.add("message", "bot", "typing-indicator-node");
    indicator.innerHTML = `<div class="message-bubble typing-bubble"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>`;
    chatMessages.appendChild(indicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return indicator;
  }

  function handleUserMessageSubmit() {
    const text = chatbotInput.value.trim();
    if (!text) return;
    chatbotInput.value = "";
    appendChatBubble("user", text);
    const indicator = showTypingIndicator();
    setTimeout(() => {
      if (indicator.parentNode) indicator.parentNode.removeChild(indicator);
      applyStatuses(); // so answers always reflect today's date
      appendChatBubble("bot", aiAssistant.processMessage(text).text);
    }, 700);
  }

  if (chatbotSendBtn) chatbotSendBtn.addEventListener("click", handleUserMessageSubmit);
  if (chatbotInput) chatbotInput.addEventListener("keydown", (e) => { if (e.key === "Enter") handleUserMessageSubmit(); });
  if (resetChatBtn) resetChatBtn.addEventListener("click", () => { chatMessages.innerHTML = ""; aiAssistant.resetAnalysis(); initChatbot(); });
  promptButtons.forEach((btn) => btn.addEventListener("click", () => {
    if (btn.dataset.prompt) { chatbotInput.value = btn.dataset.prompt; handleUserMessageSubmit(); }
  }));

  // Minimal, safe markdown: input is HTML-escaped first, so nothing external can inject markup.
  function parseMarkdownToHtml(text) {
    let html = String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    html = html.replace(/^### (.*?)$/gm, "<h3>$1</h3>");
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/(^|[^*\w])\*(?!\s)([^*\n]+?)\*(?!\w)/g, "$1<em>$2</em>");
    html = html.replace(/`([^`]*)`/g, "<code>$1</code>");
    html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    const out = [];
    let list = null;
    html.split("\n").forEach((raw) => {
      const line = raw.trim();
      const ul = line.match(/^[*-]\s+(.*)$/);
      const ol = line.match(/^\d+\.\s+(.*)$/);
      const kind = ul ? "ul" : ol ? "ol" : null;
      if (kind) {
        if (list !== kind) { if (list) out.push(`</${list}>`); out.push(`<${kind}>`); list = kind; }
        out.push(`<li>${(ul || ol)[1]}</li>`);
      } else {
        if (list) { out.push(`</${list}>`); list = null; }
        out.push(raw);
      }
    });
    if (list) out.push(`</${list}>`);
    return out.join("\n");
  }

  // ---------- Init ----------
  function refreshAll() {
    applyStatuses();
    initDashboardCounters();
    renderNextDeadline();
    renderKeyDates();
    renderNotifications();
    renderExams();
  }

  refreshAll();
  renderInternships();
  renderSources();
  renderSyncBar("loading");
  initChatbot();
  loadLive(false);

  // Self-updating behaviour in the browser:
  //  - statuses & countdowns are recomputed from today's date (also when the tab regains focus)
  //  - the live official-source feed is re-polled every 15 minutes
  setInterval(() => loadLive(false), 15 * 60 * 1000);
  setInterval(refreshAll, 30 * 60 * 1000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) { refreshAll(); loadLive(false); } });
});
