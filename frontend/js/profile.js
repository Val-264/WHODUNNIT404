const API_URL = "http://127.0.0.1:3000/api/profile";
const LOGIN_URL = "login.html";

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

function isSolved(item) {
  return item.status === "SOLVED";
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
  const date = document.createElement("p");
  date.className = "case-date";
  date.textContent = formatDate(item.completedAt);
  info.append(title, date);

  const badge = document.createElement("span");
  const solved = isSolved(item);
  badge.className = solved
    ? "case-badge case-badge-solved"
    : "case-badge case-badge-failed";
  badge.textContent = solved ? "Resuelto" : "Fallido";

  row.append(info, badge);
  return row;
}

function renderProfile(profile) {
  document.getElementById("profile-username").textContent = profile.username;
  document.getElementById("user-chip").textContent = profile.username;

  const total = profile.history.length;
  const solved = profile.history.filter(isSolved).length;

  document.getElementById("stat-solved").textContent = solved;
  document.getElementById("stat-failed").textContent = total - solved;
  document.getElementById("stat-total").textContent = total;

  // The history only has solved and failed cases
  historyList.replaceChildren(...profile.history.map(createCaseRow));
  historyList.hidden = total === 0;
  emptyState.hidden = total > 0;
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