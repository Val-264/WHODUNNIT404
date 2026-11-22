const API_URL = "http://127.0.0.1:3000/api/profile";
const LOGIN_URL = "login.html";
 
const BADGES = {
  SOLVED: { text: "Resuelto", className: "case-badge-solved" },
  FAILED: { text: "Fallido", className: "case-badge-failed" },
  IN_PROGRESS: { text: "En curso", className: "case-badge-progress" },
  ABANDONED: { text: "Abandonado", className: "case-badge-abandoned" },
};

const loadingState = document.getElementById("loading-state");
const errorState = document.getElementById("error-state");
const contentState = document.getElementById("content-state");
const emptyState = document.getElementById("empty-state");
const historyList = document.getElementById("history-list");
const retryBtn = document.getElementById("retry-btn");

// Shows one state at a time: "loading", "error" or "content"
function showState(name) {
  loadingState.hidden = name !== "loading";
  errorState.hidden = name !== "error";
  contentState.hidden = name !== "content";
}

// The API answers { success, data: { username, history, ... } }
function readProfile(body) {
  const data = body.data || body;
  return {
    username: data.username,
    history: data.history || [],
  };
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("es-MX");
}

function createCaseRow(item) {
  const row = document.createElement("li");
  row.className = "case-row";

  const info = document.createElement("div");
  const title = document.createElement("p");
  title.className = "case-title";
  title.textContent = item.caseTitle;
  info.append(title);

  // The ongoing cases don´t have an end date
  const dateText = formatDate(item.completedAt);
  if (dateText) {
    const date = document.createElement("p");
    date.className = "case-date";
    date.textContent = dateText;
    info.append(date);
  }

  const badgeInfo = BADGES[item.status] || { text: item.status, className: "" };
  const badge = document.createElement("span");
  badge.className = `case-badge ${badgeInfo.className}`;
  badge.textContent = badgeInfo.text;

  row.append(info, badge);
  return row;
}

function renderProfile(profile) {
  document.getElementById("profile-username").textContent = profile.username;
  document.getElementById("user-chip").textContent = profile.username;

  const solved = profile.history.filter((item) => item.status === "SOLVED").length;
  const failed = profile.history.filter((item) => item.status === "FAILED").length;

  // Cases in progress are listed, but they do not count as solved or failed
  document.getElementById("stat-solved").textContent = solved;
  document.getElementById("stat-failed").textContent = failed;
  document.getElementById("stat-total").textContent = solved + failed;

  const hasHistory = profile.history.length > 0;
  historyList.replaceChildren(...profile.history.map(createCaseRow));
  historyList.hidden = !hasHistory;
  emptyState.hidden = solved + failed > 0;
}

async function loadProfile() {
  showState("loading");

  try {
    const response = await fetch(API_URL, { credentials: "include" });

    // No valid session: go back to the login
    if (response.status === 401) {
      window.location.href = LOGIN_URL;
      return;
    }

    if (!response.ok) {
      showState("error");
      return;
    }

    const body = await response.json();
    renderProfile(readProfile(body));
    showState("content");
  } catch (error) {
      console.error(error);
    showState("error");
  }
}

retryBtn.addEventListener("click", loadProfile);

loadProfile();