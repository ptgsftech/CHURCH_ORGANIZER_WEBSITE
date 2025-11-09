/*****************************************************
 * CHURCH ORGANIZER - APP.JS
 * Handles dynamic data loading, year/month buttons,
 * and loader overlay functionality
 *****************************************************/

// === INITIAL STATE ===
let selectedYear = new Date().getFullYear();
let selectedMonth = new Date().getMonth() + 1;
const yearStart = 2020;
const yearEnd = 2039;

// === On Page Load ===
document.addEventListener("DOMContentLoaded", () => {
  populateYearList();
  populateMonthTabs();
  loadSessions(selectedYear, selectedMonth);
});

// === YEAR BUTTONS (Paginated) ===
let yearPage = 0;
const yearsPerPage = 10;

function populateYearList() {
  const yearList = document.getElementById("yearList");
  if (!yearList) return;

  yearList.innerHTML = "";
  const allYears = Array.from({ length: yearEnd - yearStart + 1 }, (_, i) => yearStart + i);
  const start = yearPage * yearsPerPage;
  const visibleYears = allYears.slice(start, start + yearsPerPage);

  // Previous Button
  if (start > 0) {
    const prev = document.createElement("button");
    prev.className = "btn btn-outline-secondary me-2";
    prev.textContent = "«";
    prev.onclick = () => { yearPage--; populateYearList(); };
    yearList.appendChild(prev);
  }

  // Year Buttons
  visibleYears.forEach(y => {
    const btn = document.createElement("button");
    btn.className = `btn btn-outline-primary year-btn ${y === selectedYear ? "active" : ""}`;
    btn.textContent = y;
    btn.onclick = () => {
      selectedYear = y;
      document.querySelectorAll(".year-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      loadSessions(selectedYear, selectedMonth);
    };
    yearList.appendChild(btn);
  });

  // Next Button
  if (start + yearsPerPage < allYears.length) {
    const next = document.createElement("button");
    next.className = "btn btn-outline-secondary ms-2";
    next.textContent = "»";
    next.onclick = () => { yearPage++; populateYearList(); };
    yearList.appendChild(next);
  }
}

// === MONTH BUTTONS ===
function populateMonthTabs() {
  const monthTabs = document.getElementById("monthTabs");
  if (!monthTabs) return;

  monthTabs.innerHTML = "";
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  monthNames.forEach((m, i) => {
    const btn = document.createElement("button");
    btn.className = `btn btn-outline-secondary month-btn ${i + 1 === selectedMonth ? "active" : ""}`;
    btn.textContent = m;
    btn.onclick = () => {
      selectedMonth = i + 1;
      document.querySelectorAll(".month-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      loadSessions(selectedYear, selectedMonth);
    };
    monthTabs.appendChild(btn);
  });
}

// === LOAD SESSION DATA ===
function loadSessions(year, month) {
  const container = document.getElementById("sessionContainer");
  if (!container) return;

  container.style.filter = "blur(8px)";
  container.style.pointerEvents = "none";

  const overlay = document.getElementById("loadingOverlay");
  overlay.style.display = "flex";

  const video = overlay.querySelector("video");
  video.playbackRate = 0.3;
  video.classList.add("slow");

  google.script.run
    .withSuccessHandler(data => {
      overlay.style.display = "none";
      container.style.filter = "";
      container.style.pointerEvents = "";
      renderSessions(data);
    })
    .getSessions(year, month);
}

// === RENDER SESSION CARDS ===
function renderSessions(data) {
  const container = document.getElementById("sessionContainer");
  if (!data || data.length === 0) {
    container.innerHTML = "<div class='text-muted'>No sessions found.</div>";
    return;
  }

  container.innerHTML = "";
  data.forEach(s => {
    const card = document.createElement("div");
    card.className = "card p-2 mb-3 shadow-sm";
    card.innerHTML = `
      <div class="card-header bg-primary text-white">${s.date}</div>
      <div class="card-body">
        🕒 <strong>${s.time}</strong><br>
        🙌 ${s.worshiper || "Worship Team"}<br>
        🎤 ${s.speaker || "Speaker"}<br>
        📖 ${s.topic || "Topic"}<br>
      </div>
    `;
    container.appendChild(card);
  });
}

/******************************************************
 * DARK MODE HANDLER
 ******************************************************/
document.getElementById("themeToggle").addEventListener("click", () => {
  const currentTheme = document.body.getAttribute("data-theme");
  if (currentTheme === "dark") {
    document.body.removeAttribute("data-theme");
    localStorage.setItem("theme", "light");
  } else {
    document.body.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
  }
});

/******************************************************
 * APPLY SAVED THEME ON LOAD
 ******************************************************/
window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.setAttribute("data-theme", "dark");
  }
});