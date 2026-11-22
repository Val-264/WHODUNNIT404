const API_URL = "http://127.0.0.1:3000/api";
const LOGIN_URL = "login.html";
const MENU_URL = "menu.html";
const SCENE_URL = "scene.html";
const ZONES_COUNT = 9;

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

// The case file texts are handled by case-file.js. The map only needs these
function readGame(body) {
  const data = body.data || body;
  return {
    caseTitle: data.title,
    zones: data.zones || [], // the 9 zones of the map, in order
  };
}

// Opens the scene of a zone: its background and the character assigned to it
function openScene(zone) {
  const query = new URLSearchParams({ game: gameId, place: zone.id });
  window.location.href = `${SCENE_URL}?${query}`;
}

function createZone(zone, index) {
  const name = zone.name || DEFAULT_ZONE_NAMES[index] || "";
  const button = createElement("button", "zone with-corners");
  button.type = "button";
  // A zone without id cannot open a scene
  button.disabled = !zone.id;
  if (name.toLowerCase() === "plaza") button.classList.add("zone-plaza");

  const text = createElement("span", "zone-text");
  text.append(createElement("span", "zone-name", name));
  if (zone.zoneInfo) {
    text.append(createElement("span", "zone-info", zone.zoneInfo));
  }

  button.append(
    createElement("span", "zone-label", `Zona ${index + 1}`),
    text,
    createElement("span", "zone-action", "Investigar"),
  );
  button.addEventListener("click", () => openScene(zone));
  return button;
}

function renderGame(game) {
  document.getElementById("map-tag").textContent = game.caseTitle || "";
  zonesList.replaceChildren(...game.zones.map(createZone));
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
    const game = readGame(body);
    // AC26: the map always shows exactly 9 locations
    if (game.zones.length !== ZONES_COUNT) {
      throw new Error("The map needs exactly 9 zones");
    }
    renderGame(game);
    showState("content");

    // Floating case file button. A new case opens the file.
    // Resuming a saved game goes straight to the map
    CaseFile.init({
      gameUrl: GAME_URL,
      gameId,
      loginUrl: LOGIN_URL,
      autoOpen: !isResume,
    });
  } catch (error) {
    showState("error");
  }
}

document.getElementById("retry-btn").addEventListener("click", loadGame);

if (gameId) {
  loadUsername();
  loadGame();
} else {
  window.location.href = MENU_URL;
}