// Floating case file button + modal. Shared by every gameplay screen (US06).
// Usage: CaseFile.init({ gameUrl, gameId, loginUrl, autoOpen })
const CaseFile = (() => {
  const SECTIONS = [
    { code: "DOC-A1", title: "La víctima", key: "victim" },
    { code: "DOC-B2", title: "La historia", key: "story" },
    { code: "DOC-C3", title: "El contexto", key: "context" },
  ];

  let overlay = null;
  let fab = null;
  let closeBtn = null;
  let tagNode = null;
  let victimNode = null;
  let bodies = {}; // key -> container of the section text
  let settings = null;
  let loaded = false;

  function createElement(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function isOpen() {
    return overlay && !overlay.hidden;
  }

  // ---------- Build the DOM (same markup the map had before) ----------
  function build() {
    fab = createElement("button", "case-file-fab", "Expediente");
    fab.type = "button";
    fab.setAttribute("aria-label", "Abrir expediente del caso");

    overlay = createElement("div", "modal-overlay");
    overlay.id = "file-modal";
    overlay.hidden = true;

    const article = createElement("article", "file with-corners");
    article.setAttribute("role", "dialog");
    article.setAttribute("aria-modal", "true");
    article.setAttribute("aria-labelledby", "file-victim");

    // Header
    const header = createElement("header", "file-header");
    tagNode = createElement("p", "file-tag");
    victimNode = createElement("h2", "file-victim");
    victimNode.id = "file-victim";

    const stamp = createElement("p", "stamp");
    stamp.append("CONFIDENCIAL ", createElement("span", "", "EXPEDIENTE NO. 404"));

    closeBtn = createElement("button", "file-close", "✕");
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", "Cerrar expediente");

    header.append(tagNode, victimNode, stamp, closeBtn, createElement("div", "divider"));

    // Body: one section per document
    const body = createElement("div", "file-body");
    SECTIONS.forEach(({ code, title, key }) => {
      const section = document.createElement("section");
      const heading = createElement("h3", "file-section");
      heading.append(createElement("small", "", code), ` ${title}`);
      bodies[key] = document.createElement("div");
      section.append(heading, bodies[key]);
      body.append(section);
    });

    // Footer
    const footer = createElement("footer", "file-footer");
    const doneBtn = createElement("button", "btn-primary", "Cerrar expediente");
    doneBtn.type = "button";
    footer.append(doneBtn, createElement("p", "", "Pulsa ESC para cerrar"));

    article.append(header, body, footer);
    overlay.append(article);
    document.body.append(fab, overlay);

    // The file closes with the X, the button, ESC or a click outside of it
    fab.addEventListener("click", open);
    closeBtn.addEventListener("click", close);
    doneBtn.addEventListener("click", close);
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) close();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isOpen()) close();
    });
  }

  // ---------- Data ----------
  // The backend sends the same intro text as story and context for now,
  // and no separate text about the victim. Empty or repeated sections are hidden.
  function normalize(body) {
    const data = body.data || body;
    return {
      caseTitle: data.title,
      victimName: data.victimName,
      victim: data.victim, // not sent yet
      story: data.story,
      context: data.context === data.story ? "" : data.context,
    };
  }

  // A text with line breaks becomes one paragraph per line
  function fillSection(key, text) {
    const container = bodies[key];
    const paragraphs = String(text || "")
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => createElement("p", "", line));
    container.replaceChildren(...paragraphs);
    container.closest("section").hidden = paragraphs.length === 0;
  }

  function fill(data) {
    tagNode.textContent = `${data.caseTitle || "Caso"} // Dossier judicial`;
    victimNode.textContent = data.victimName || "";
    SECTIONS.forEach(({ key }) => fillSection(key, data[key]));
  }

  async function load() {
    const response = await fetch(`${settings.gameUrl}/${settings.gameId}`, {
      credentials: "include",
    });

    if (response.status === 401) {
      window.location.href = settings.loginUrl;
      return;
    }
    if (!response.ok) throw new Error("Case file request failed");

    fill(normalize(await response.json()));
    loaded = true;
  }

  function showError() {
    fill({
      caseTitle: "Caso",
      victimName: "Expediente no disponible",
      story: "No pudimos cargar el expediente. Ciérralo y vuelve a abrirlo.",
    });
  }

  // ---------- Open / close ----------
  // The file is a layer over the current screen: nothing is reloaded,
  // so the player comes back to exactly where they were.
  async function open() {
    overlay.hidden = false;
    closeBtn.focus();

    if (!loaded) {
      try {
        await load();
      } catch (error) {
        showError();
      }
    }
  }

  function close() {
    overlay.hidden = true;
    fab.focus();
  }

  async function init(options) {
    // Calling init twice (for example after a retry) does nothing
    if (document.getElementById("file-modal")) return;

    settings = { loginUrl: "login.html", autoOpen: false, ...options };
    if (!settings.gameUrl || !settings.gameId) return;

    build();

    try {
      await load();
    } catch (error) {
      // The button stays. The file tries again the next time it opens
    }

    if (settings.autoOpen) open();
  }

  return { init, open, close };
})();