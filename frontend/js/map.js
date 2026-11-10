const API_URL = "http://127.0.0.1:3000/api";
const LOGIN_URL = "login.html";
const MENU_URL = "menu.html";

const GAME_URL = `${API_URL}/games`; // GET /games/:id
const PROFILE_URL = `${API_URL}/profile`;

// Same order the backend uses for the map. Used if a zone arrives without a name
const DEFAULT_ZONE_NAMES = [
  "Teatro",
  "Cantina",
  "Biblioteca",
  "Hotel",
  "Plaza",
  "Salón de baile",
  "Farmacia",
  "Café",
  "Fachada del banco",
];

const params = new URLSearchParams(window.location.search);
const gameId = params.get("game");
const isResume = params.get("resume") === "1";

const loadingState = document.getElementById("loading-state");
const errorState = document.getElementById("error-state");
const contentState = document.getElementById("content-state");
const zonesList = document.getElementById("zones-list");
const fileModal = document.getElementById("file-modal");
const openFileBtn = document.getElementById("open-file-btn");

// Shows one state at a time: "loading", "error" or "content"
function showState(name) {
  loadingState.hidden = name !== "loading";
  errorState.hidden = name !== "error";
  contentState.hidden = name !== "content";
}

// fetch with the session cookie. Sends the user to the login if it expired
async function request(url) {
  const response = await fetch(url, { credentials: "include" });

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

// The backend sends the same intro text as story and context for now,
// and no separate text about the victim. Empty or repeated sections are hidden.
function readGame(body) {
  const data = body.data || body;
  return {
    caseTitle: data.title,
    victimName: data.victimName,
    victim: data.victim, // not sent yet
    story: data.story,
    context: data.context === data.story ? "" : data.context,
    zones: data.zones || [], // the 9 zones of the map, in order
  };
}

// A text with line breaks becomes one paragraph per line
function fillParagraphs(containerId, text) {
  const container = document.getElementById(containerId);
  const paragraphs = String(text || "")
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line) => createElement("p", "", line));
  container.replaceChildren(...paragraphs);
  // A section without text is hidden
  container.closest("section").hidden = paragraphs.length === 0;
}

function renderCaseFile(game) {
  document.getElementById("file-tag").textContent =
    `${game.caseTitle || "Caso"} // Dossier judicial`;
  document.getElementById("file-victim").textContent = game.victimName;
  fillParagraphs("file-victim-text", game.victim);
  fillParagraphs("file-story-text", game.story);
  fillParagraphs("file-context-text", game.context);
}

function selectZone(selected) {
  zonesList.querySelectorAll(".zone").forEach((zone) => {
    zone.classList.toggle("is-selected", zone === selected);
  });
}

function createZone(zone, index) {
  const name = zone.name || DEFAULT_ZONE_NAMES[index] || "";
  const button = createElement("button", "zone with-corners");
  button.type = "button";
  if (name.toLowerCase() === "plaza") button.classList.add("zone-plaza");

  button.append(
    createElement("span", "zone-label", `Zona ${index + 1}`),
    createElement("span", "zone-name", name),
    createElement("span", "zone-action", "Investigar"),
  );
  button.addEventListener("click", () => selectZone(button));
  return button;
}

function renderGame(game) {
  document.getElementById("map-tag").textContent = game.caseTitle || "";
  renderCaseFile(game);
  zonesList.replaceChildren(...game.zones.map(createZone));
}

function openFile() {
  fileModal.hidden = false;
  document.getElementById("file-close-btn").focus();
}

function closeFile() {
  fileModal.hidden = true;
  openFileBtn.focus();
}

async function loadUsername() {
  try {
    const response = await fetch(PROFILE_URL, { credentials: "include" });
    if (!response.ok) return;
    const body = await response.json();
    const data = body.data || body;
    document.getElementById("user-chip").textContent = data.username || "";
  } catch (error) {
    // The map still works without the name in the navbar
  }
}

async function loadGame() {
  showState("loading");

  try {
    const response = await request(`${GAME_URL}/${gameId}`);
    if (!response.ok) throw new Error("Game request failed");

    const body = await response.json();
    renderGame(readGame(body));
    showState("content");

    // A new case opens the file. Resuming a saved game goes straight to the map
    if (!isResume) openFile();
  } catch (error) {
    showState("error");
  }
}

// The file closes with the X, the button, ESC or a click outside of it
document.getElementById("file-close-btn").addEventListener("click", closeFile);
document.getElementById("file-done-btn").addEventListener("click", closeFile);
openFileBtn.addEventListener("click", openFile);

fileModal.addEventListener("click", (event) => {
  if (event.target === fileModal) closeFile();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !fileModal.hidden) closeFile();
});

document.getElementById("retry-btn").addEventListener("click", loadGame);

if (gameId) {
  loadUsername();
  loadGame();
} else {
  window.location.href = MENU_URL;
}