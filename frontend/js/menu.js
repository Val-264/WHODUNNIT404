const API_URL = "http://127.0.0.1:3000/api";
const CASES_URL = `${API_URL}/games/cases`;
const PROFILE_URL = `${API_URL}/profile`;
const LOGIN_URL = "login.html";
const MAP_URL = "map.html";

const START_URL = `${API_URL}/games/start`; // POST { story_id } -> creates the game
const RESTART_URL = `${API_URL}/games/restart`; // POST { story_id, restart: true }

const loadingState = document.getElementById("loading-state");
const errorState = document.getElementById("error-state");
const contentState = document.getElementById("content-state");
const casesList = document.getElementById("cases-list");
const errorTitle = document.getElementById("error-title");
const errorText = document.getElementById("error-text");
const retryBtn = document.getElementById("retry-btn");
const confirmModal = document.getElementById("confirm-modal");
const openingModal = document.getElementById("opening-modal");
const openingName = document.getElementById("opening-name");

let retryAction = loadCases;
let caseToRestart = null;

// Shows one state at a time: "loading", "error" or "content"
function showState(name) {
  loadingState.hidden = name !== "loading";
  errorState.hidden = name !== "error";
  contentState.hidden = name !== "content";
}

function showError(title, text, action) {
  errorTitle.textContent = title;
  errorText.textContent = text;
  retryAction = action;
  showState("error");
}

// fetch with the session cookie. Sends the user to the login if it expired
async function request(url, options = {}) {
  const response = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (response.status === 401) {
    window.location.href = LOGIN_URL;
    throw new Error("Session expired");
  }

  return response;
}

function createElement(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function createButton(className, text, onClick) {
  const button = createElement("button", className, text);
  button.type = "button";
  button.addEventListener("click", onClick);
  return button;
}

function createCard(item, index) {
  const card = createElement("article", "case-card with-corners");
  const top = createElement("div", "case-card-top");
  const actions = createElement("div", "case-actions");

  // AC17: a case with a saved game can be resumed or restarted
  if (item.hasActiveGame) {
    card.classList.add("is-active");
    top.append(createElement("p", "case-status", "Investigación activa"));
    card.append(createElement("span", "case-stamp", "En curso"));
    actions.append(
      createButton("btn-primary", "Continuar", () => continueCase(item)),
      createButton("btn-secondary", "Reiniciar", () => askRestart(item)),
    );
  } else {
    actions.append(
      createButton("btn-primary", "Investigar", () =>
        openCase(item, START_URL),
      ),
    );
  }

  const number = createElement("span", "case-number", item.title);
  const doc = createElement("span", "case-doc", `DOC-00${index + 1}`);
  const header = createElement("div", "case-card-top");
  header.append(number, doc);

  card.append(
    top,
    header,
    createElement("p", "case-victim-label", "Víctima"),
    createElement("h2", "case-victim", item.victimName),
    createElement("p", "case-description", item.description),
    actions,
  );
  return card;
}

// AC16: all the cases are shown and each one is selectable
function renderCases(cases) {
  if (cases.length === 0) {
    casesList.replaceChildren(
      createElement("p", "case-description", "No hay casos disponibles."),
    );
    return;
  }
  casesList.replaceChildren(...cases.map(createCard));
}

async function loadUsername() {
  try {
    const response = await fetch(PROFILE_URL, { credentials: "include" });
    if (!response.ok) return;
    const body = await response.json();
    const data = body.data || body;
    document.getElementById("user-chip").textContent = data.username || "";
  } catch (error) {
    // The menu still works without the name in the navbar
  }
}

async function loadCases() {
  showState("loading");

  try {
    const response = await request(CASES_URL);
    if (!response.ok) throw new Error("Cases request failed");

    const body = await response.json();
    renderCases(body.data || []);
    showState("content");
  } catch (error) {
    showError(
      "No pudimos cargar los casos",
      "La base de expedientes no responde. Revisa tu conexión o inténtalo de nuevo.",
      loadCases,
    );
  }
}

// Starts (or restarts) a case and goes to the map, where the case file opens
async function openCase(item, url) {
  openingName.textContent = item.victimName;
  openingModal.hidden = false;

  try {
    const payload = { story_id: item.id };
    if (url === RESTART_URL) payload.restart = true;

    const response = await request(url, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Start request failed");

    const body = await response.json();
    const game = body.data || body;
    if (!game.gameId) throw new Error("The game id is missing");
    window.location.href = `${MAP_URL}?game=${game.gameId}`;
  } catch (error) {
    openingModal.hidden = true;
    showError(
      "No pudimos iniciar el caso",
      "El servidor de expedientes no responde o la evidencia no está disponible.",
      () => openCase(item, url),
    );
  }
}

function continueCase(item) {
  // Without the saved game id there is nowhere to go
  if (!item.activeGameId) {
    showError(
      "No pudimos continuar el caso",
      "No encontramos la partida guardada. Inténtalo de nuevo.",
      loadCases,
    );
    return;
  }
  window.location.href = `${MAP_URL}?game=${item.activeGameId}&resume=1`;
}

function askRestart(item) {
  caseToRestart = item;
  confirmModal.hidden = false;
}

function closeConfirm() {
  confirmModal.hidden = true;
  caseToRestart = null;
}

document.getElementById("cancel-btn").addEventListener("click", closeConfirm);

document.getElementById("confirm-btn").addEventListener("click", () => {
  const item = caseToRestart;
  closeConfirm();
  openCase(item, RESTART_URL);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeConfirm();
});

retryBtn.addEventListener("click", () => retryAction());

loadUsername();
loadCases();