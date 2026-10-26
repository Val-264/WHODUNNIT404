const API_URL = "http://127.0.0.1:3000/api/auth/login";
const SESSION_URL = "http://127.0.0.1:3000/api/auth/me";
const MENU_URL = "menu.html";

const form = document.getElementById("login-form");
const submitBtn = document.getElementById("submit-btn");
const formAlert = document.getElementById("form-alert");

function showError(name, message) {
  const item = document.querySelector(`[data-field="${name}"]`);
  item.classList.add("input-error");
  item.querySelector(".error-message").textContent = message;
}

function clearErrors() {
  document.querySelectorAll(".input-item").forEach((item) => {
    item.classList.remove("input-error");
    item.querySelector(".error-message").textContent = "";
  });
  formAlert.hidden = true;
}

function showAlert(message) {
  formAlert.textContent = message;
  formAlert.hidden = false;
}

// Only checks empty fields: it says nothing about how the account works
function validate(data) {
  let isValid = true;

  if (!data.identifier.trim()) {
    showError("identifier", "Este campo es obligatorio");
    isValid = false;
  }

  if (!data.password) {
    showError("password", "Este campo es obligatorio");
    isValid = false;
  }

  return isValid;
}

// AC09: the token lives in an httpOnly cookie, so JS cannot read it.
// We ask the backend if the session is still valid when the page loads.
async function checkSession() {
  try {
    const response = await fetch(SESSION_URL, { credentials: "include" });
    if (response.ok) {
      window.location.href = MENU_URL;
    }
  } catch (error) {
    // Backend is off: stay on the login page
  }
}

// Show / hide password
document.querySelector(".toggle-password").addEventListener("click", (event) => {
  const button = event.currentTarget;
  const input = button.parentElement.querySelector("input");
  const icon = button.querySelector("img");
  const isHidden = input.type === "password";

  input.type = isHidden ? "text" : "password";
  icon.src = isHidden
    ? "../assets/icons/eye-off.svg"
    : "../assets/icons/eye.svg";
  button.setAttribute(
    "aria-label",
    isHidden ? "Ocultar contraseña" : "Mostrar contraseña",
  );
});

// Clear a field's error as soon as the user types in it
form.querySelectorAll("input").forEach((input) => {
  input.addEventListener("input", () => {
    const item = input.closest(".input-item");
    item.classList.remove("input-error");
    item.querySelector(".error-message").textContent = "";
    formAlert.hidden = true;
  });
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearErrors();

  const data = Object.fromEntries(new FormData(form));

  if (!validate(data)) {
    form.querySelector(".input-error input").focus();
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Entrando...";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // lets the browser store the session cookie
      body: JSON.stringify({
        identifier: data.identifier.trim(),
        password: data.password,
      }),
    });

    if (response.ok) {
      // AC07: session started, go to the menu
      window.location.href = MENU_URL;
      return;
    }

    // AC08: generic message, never says which field failed
    if (response.status === 400 || response.status === 401) {
      showAlert("Usuario o contraseña incorrectos");
    } else {
      showAlert("No pudimos iniciar sesión. Inténtalo de nuevo.");
    }
  } catch (error) {
    showAlert("No pudimos conectar con el servidor.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Iniciar sesión";
  }
});

checkSession();