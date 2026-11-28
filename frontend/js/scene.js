const API_URL = "http://127.0.0.1:3000/api";
const LOGIN_URL = "login.html";
const MENU_URL = "menu.html";
const MAP_URL = "map.html";

const GAME_URL = `${API_URL}/games`; // GET /games/:gameId
const PROFILE_URL = `${API_URL}/profile`;

const DEFAULT_ERROR_TITLE = "No pudimos cargar la escena";
const DEFAULT_ERROR_TEXT =
  "El servidor no responde o la partida ya no está disponible.";
const NO_DIALOGUE_TEXT =
  "El diálogo de este personaje no está disponible por ahora. Vuelve al mapa e inténtalo más tarde.";

const params = new URLSearchParams(window.location.search);
const gameId = params.get("game");
const placeId = params.get("place");

// Back to the map without opening the case file again (resume=1)
const mapUrl = `${MAP_URL}?${new URLSearchParams({ game: gameId || "", resume: "1" })}`;

const loadingState = document.getElementById("loading-state");
const errorState = document.getElementById("error-state");
const contentState = document.getElementById("content-state");
const dialogueBox = document.getElementById("dialogue-box");
const dialogueText = document.getElementById("dialogue-text");
const dialogueProgress = document.getElementById("dialogue-progress");
const dialogueCount = document.getElementById("dialogue-count");
const nextBtn = document.getElementById("next-btn");

let lines = []; // dialogue of the character, one text per line
let current = 0;

// Shows one state at a time: "loading", "error" or "content"
function showState(name) {
  loadingState.hidden = name !== "loading";
  errorState.hidden = name !== "error";
  contentState.hidden = name !== "content";
}

function showError(title = DEFAULT_ERROR_TITLE, text = DEFAULT_ERROR_TEXT) {
  document.getElementById("error-title").textContent = title;
  document.getElementById("error-text").textContent = text;
  showState("error");
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

// The images are files of the frontend (frontend/assets/images).
// The API sends a path or a file name, and the page is in frontend/pages
function assetUrl(path) {
  if (!path || path === "/") return "";
  if (/^https?:\/\//.test(path)) return path;

  const clean = path
    .replace(/^\/+/, "")
    .replace(/^(frontend\/)?assets\//, "")
    .replace(/^images\//, "");
  return `../assets/images/${clean}`;
}

// Resolves with the <img> only if it loads, so a broken image is never shown
function createImage(url, className, alt) {
  return new Promise((resolve) => {
    if (!url) return resolve(null);
    const image = new Image();
    image.className = className;
    image.alt = alt;
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = url;
  });
}

// ---------- Data ----------
// The game gives the number of the zone, the case title and, as a fallback,
// the place and the character of the zone
function readGame(body) {
  const data = body.data || body;
  const zones = data.zones || [];
  const index = zones.findIndex((zone) => String(zone.id) === placeId);
  if (index === -1) return null;

  const zone = zones[index];
  const character = zone.character || {};
  return {
    caseTitle: data.title,
    zoneNumber: index + 1,
    placeName: zone.name,
    placeImage: zone.imageUrl,
    characterName: character.name || character.suspect_name,
    characterImage: character.imgUrl || character.imageUrl || character.img_url,
  };
}

// The interview comes from the server, which decides the dialogue according to
// the role of the character in this session. The screen only shows its lines
function readInterview(body) {
  const data = body.data || body;
  const place = data.place || data.location || {};
  const character = data.character || data.suspect || {};
  const raw = data.dialogue || data.dialogue_lines || data.lines || [];
  const list = Array.isArray(raw) ? raw : raw.lines || [];

  return {
    placeName: place.name || place.place_name,
    placeImage: place.imageUrl || place.image_url,
    characterName: character.name || character.suspect_name,
    characterImage: character.imgUrl || character.imageUrl || character.img_url || character.image_url,
    lines: list
      .map((line) => (typeof line === "string" ? line : line && line.text))
      .filter((line) => typeof line === "string" && line.trim() !== ""),
  };
}

// Returns the interview, { forbidden: true } for a session of another user,
// or null if it cannot be loaded (the scene still opens without dialogue)
async function loadInterview() {
  try {
    const response = await request(
      `${GAME_URL}/${gameId}/places/${placeId}/interview`,
    );
    if (response.status === 403) return { forbidden: true };
    if (!response.ok) return null;
    return readInterview(await response.json());
  } catch (error) {
    return null;
  }
}

function pad(number) {
  return String(number).padStart(2, "0");
}

function renderLine() {
  dialogueText.textContent = lines[current];
  dialogueCount.textContent = `${pad(current + 1)} / ${pad(lines.length)}`;
  const isLast = current === lines.length - 1;
  nextBtn.textContent = isLast ? "← Volver al mapa" : "Siguiente →";
}

function goToMap() {
  window.location.href = mapUrl;
}

// The only interaction of the scene: next line, and back to the map at the end
function advance() {
  if (lines.length === 0 || current === lines.length - 1) {
    goToMap();
    return;
  }
  current += 1;
  renderLine();
}

function renderScene(scene) {
  document.getElementById("scene-case").textContent = scene.caseTitle || "";
  document.getElementById("scene-zone").textContent = `Zona ${scene.zoneNumber}`;
  document.getElementById("scene-title").textContent = scene.placeName || "";
  document.getElementById("character-name").textContent = scene.characterName;
  document.getElementById("dialogue-name").textContent = scene.characterName;
  document.getElementById("back-link").href = mapUrl;

  if (lines.length > 0) {
    renderLine();
  } else {
    dialogueText.textContent = NO_DIALOGUE_TEXT;
    dialogueProgress.hidden = true;
    nextBtn.textContent = "← Volver al mapa";
  }

  // Images are added when they load. Until then the screen uses its dark fallback
  createImage(assetUrl(scene.placeImage), "", "").then((image) => {
    if (image) document.getElementById("scene-bg").prepend(image);
  });
  createImage(
    assetUrl(scene.characterImage),
    "portrait-photo",
    scene.characterName,
  ).then((image) => {
    if (image) document.getElementById("portrait").replaceChildren(image);
  });
}

async function loadUsername() {
  try {
    const response = await fetch(PROFILE_URL, { credentials: "include" });
    if (!response.ok) return;
    const body = await response.json();
    const data = body.data || body;
    document.getElementById("user-chip").textContent = data.username || "";
  } catch (error) {
    // The scene still works without the name in the navbar
  }
}

async function loadScene() {
  showState("loading");

  try {
    const [gameResponse, interview] = await Promise.all([
      request(`${GAME_URL}/${gameId}`),
      loadInterview(),
    ]);

    // AC32: the session of another user is refused by the server
    if (gameResponse.status === 403 || (interview && interview.forbidden)) {
      showError("Sin acceso", "Esta partida pertenece a otro usuario.");
      return;
    }
    if (!gameResponse.ok) throw new Error("Game request failed");

    const game = readGame(await gameResponse.json());
    if (!game) {
      showError(
        "Lugar no disponible",
        "Este lugar no forma parte de la partida.",
      );
      return;
    }

    // The interview has priority. The game fills what it does not send
    const scene = {
      caseTitle: game.caseTitle,
      zoneNumber: game.zoneNumber,
      placeName: (interview && interview.placeName) || game.placeName,
      placeImage: (interview && interview.placeImage) || game.placeImage,
      characterName:
        (interview && interview.characterName) || game.characterName || "",
      characterImage:
        (interview && interview.characterImage) || game.characterImage,
    };

    lines = interview ? interview.lines : [];
    current = 0;
    renderScene(scene);
    showState("content");
    nextBtn.focus();

    // Floating case file button on this screen too (AC25)
    CaseFile.init({
      gameUrl: GAME_URL,
      gameId,
      loginUrl: LOGIN_URL,
      autoOpen: false,
    });
  } catch (error) {
    showError();
  }
}

// The case file button sits above the dialogue box, whatever its height
new ResizeObserver(() => {
  document.documentElement.style.setProperty(
    "--dialogue-h",
    `${dialogueBox.offsetHeight}px`,
  );
}).observe(dialogueBox);

nextBtn.addEventListener("click", advance);

// A click on the dialogue box (outside its button) also moves on
dialogueBox.addEventListener("click", (event) => {
  if (!event.target.closest("button")) advance();
});

// Enter or Space move on, unless a button, a link or the case file is in use
document.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  if (event.target.closest("button, a, input, textarea")) return;
  if (contentState.hidden) return;

  const caseFile = document.getElementById("file-modal");
  if (caseFile && !caseFile.hidden) return;

  event.preventDefault();
  advance();
});

document.getElementById("retry-btn").addEventListener("click", loadScene);

if (!gameId) {
  window.location.href = MENU_URL;
} else if (!placeId) {
  window.location.href = mapUrl;
} else {
  loadUsername();
  loadScene();
}