const API_URL = "http://127.0.0.1:3000/api/auth/register";
const MENU_URL = "menu.html";

// Same rules as RegisterPlayerDTO in the backend
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

// Rules shown in the live password checklist
const rules = {
  length: (password) => password.length >= 8,
  uppercase: (password) => /[A-Z]/.test(password),
  lowercase: (password) => /[a-z]/.test(password),
  number: (password) => /\d/.test(password),
};

const form = document.getElementById("register-form");
const submitBtn = document.getElementById("submit-btn");
const formAlert = document.getElementById("form-alert");
const success = document.getElementById("success");
const passwordInput = document.getElementById("password");
const confirmInput = document.getElementById("confirmPassword");

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

// AC02: returns false if something is invalid
function validate(data) {
  let isValid = true;

  if (!data.username.trim()) {
    showError("username", "Este campo es obligatorio");
    isValid = false;
  }

  if (!data.email.trim()) {
    showError("email", "Este campo es obligatorio");
    isValid = false;
  } else if (!EMAIL_REGEX.test(data.email.trim())) {
    showError("email", "Escribe un correo válido");
    isValid = false;
  }

  if (!data.password) {
    showError("password", "Este campo es obligatorio");
    isValid = false;
  } else if (!PASSWORD_REGEX.test(data.password)) {
    showError(
      "password",
      "Debe tener 8 caracteres, una mayúscula, una minúscula y un número",
    );
    isValid = false;
  }

  if (!data.confirmPassword) {
    showError("confirmPassword", "Este campo es obligatorio");
    isValid = false;
  } else if (data.password !== data.confirmPassword) {
    showError("confirmPassword", "Las contraseñas no coinciden");
    isValid = false;
  }

  return isValid;
}

// AC03: the backend answers 409 with a message for each duplicated field
function getDuplicatedField(status, body) {
  if (status !== 409) return null;

  const text = String(body.message || "").toLowerCase();
  if (text.includes("email")) return "email";
  if (text.includes("user")) return "username";
  return null;
}

// Live check: do both passwords match?
function checkMatch() {
  const item = confirmInput.closest(".input-item");
  const message = item.querySelector(".match-message");
  const matches =
    confirmInput.value !== "" && confirmInput.value === passwordInput.value;

  message.textContent = matches ? "✓ Las contraseñas coinciden" : "";
  item.classList.toggle("input-valid", matches);
}

// Show / hide password
document.querySelectorAll(".toggle-password").forEach((button) => {
  button.addEventListener("click", () => {
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
});

// Clear a field's error as soon as the user types in it
form.querySelectorAll("input").forEach((input) => {
  input.addEventListener("input", () => {
    const item = input.closest(".input-item");
    item.classList.remove("input-error");
    item.querySelector(".error-message").textContent = "";
  });
});

// Live password requirements (turn green as the user types)
passwordInput.addEventListener("input", () => {
  const password = passwordInput.value;
  const item = passwordInput.closest(".input-item");
  let allValid = true;

  document.querySelectorAll("#requirements li").forEach((li) => {
    const isValid = rules[li.dataset.rule](password);
    li.classList.toggle("valid", isValid);
    if (!isValid) allValid = false;
  });

  // Green border only when every rule is met
  item.classList.toggle("input-valid", allValid);
  checkMatch();
});

confirmInput.addEventListener("input", checkMatch);

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearErrors();

  const data = Object.fromEntries(new FormData(form));

  if (!validate(data)) {
    form.querySelector(".input-error input").focus();
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Creando expediente...";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: data.username.trim(),
        email: data.email.trim(),
        password: data.password,
        confirmPassword: data.confirmPassword,
      }),
    });
    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      const duplicated = getDuplicatedField(response.status, body);

      if (duplicated === "username") {
        showError("username", "Este nombre de usuario ya está en uso");
      } else if (duplicated === "email") {
        showError("email", "Este correo ya está registrado");
      } else {
        formAlert.textContent = "No pudimos crear tu cuenta. Inténtalo de nuevo.";
        formAlert.hidden = false;
      }
      return;
    }

    // AC01: success, go to the menu
    form.hidden = true;
    success.hidden = false;
    setTimeout(() => {
      window.location.href = MENU_URL;
    }, 1800);
  } catch (error) {
    formAlert.textContent = "No pudimos conectar con el servidor.";
    formAlert.hidden = false;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Crear cuenta";
  }
});