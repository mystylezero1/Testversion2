// Admin Konsole Steuerung - Präzise Sichtbarkeits-Steuerung

document.addEventListener("DOMContentLoaded", () => {
  initAdminEvents();
});

function initAdminEvents() {
  const adminBtn = document.getElementById("adminOpenBtn");
  const adminModal = document.getElementById("adminModal");

  if (!adminModal) return;

  // 1. Admin Button öffnet das Modal
  if (adminBtn) {
    adminBtn.onclick = (e) => {
      e.preventDefault();
      adminModal.classList.remove("hidden");
      adminModal.style.display = "flex";

      const passInput = findPassInput(adminModal);
      if (passInput) passInput.focus();
    };
  }

  // 2. Schließen-Buttons ('x' etc.)
  const closeBtns = adminModal.querySelectorAll(".close, .close-btn, .modal-close");
  closeBtns.forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      adminModal.classList.add("hidden");
      adminModal.style.display = "none";
    };
  });

  // Passwort-Eingabefeld sicher finden
  function findPassInput(modal) {
    return modal.querySelector("input[type='password']") || 
           modal.querySelector("#adminPassword, #adminPass, #passInput") ||
           modal.querySelector("input");
  }

  // Anmelden-Button sicher finden
  function findLoginBtn(modal) {
    return modal.querySelector("#adminLoginBtn, .btn-login") ||
           Array.from(modal.querySelectorAll("button")).find(b => 
             !b.classList.contains("close") && 
             !b.classList.contains("close-btn") && 
             !b.classList.contains("modal-close") &&
             !b.id.includes("export") &&
             !b.id.includes("print")
           );
  }

  // Passwort prüfen & Admin-Inhalte freischalten
  function pruefePasswort() {
    const passInput = findPassInput(adminModal);
    const eingabe = passInput ? passInput.value.trim() : "";

    // Akzeptiert "admin", "1234", "hochzeit" ODER direktes Klicken auf Anmelden (leeres Feld)
    const istKorrekt = (
      eingabe.toLowerCase() === "admin" ||
      eingabe.toLowerCase() === "1234" ||
      eingabe.toLowerCase() === "hochzeit" ||
      eingabe === ""
    );

    if (istKorrekt) {
      // A) NUR die Passworteingabe und den Button ausblenden
      if (passInput) {
        passInput.style.display = "none";
        if (passInput.previousElementSibling) {
          passInput.previousElementSibling.style.display = "none";
        }
      }

      const loginBtn = findLoginBtn(adminModal);
      if (loginBtn) {
        loginBtn.style.display = "none";
      }

      const loginLabels = adminModal.querySelectorAll("label, p");
      loginLabels.forEach(el => {
        if (el.textContent.includes("Passwort") || el.textContent.includes("Anmelden")) {
          el.style.display = "none";
        }
      });

      // B) ALLE Admin-Bereiche & Tabellen einblenden
      const allModalElements = adminModal.querySelectorAll("div, table, tr, td, th, tbody, thead, button, section, form");
      allModalElements.forEach(el => {
        if (el !== passInput && el !== loginBtn) {
          el.classList.remove("hidden");
          if (el.style.display === "none") {
            el.style.display = "block";
          }
        }
      });

      const tabContents = adminModal.querySelectorAll(".tab-content");
      tabContents.forEach(tab => {
        tab.style.display = "block";
        tab.classList.remove("hidden");
      });

      // C) Gästeliste rendern
      renderAdminTabelle();
    } else {
      alert("Falsches Passwort!");
      if (passInput) passInput.value = "";
    }
  }

  // Event-Listener für Anmelden & Enter-Taste
  const loginBtn = findLoginBtn(adminModal);
  if (loginBtn) {
    loginBtn.onclick = (e) => {
      e.preventDefault();
      pruefePasswort();
    };
  }

  const passInput = findPassInput(adminModal);
  if (passInput) {
    passInput.onkeydown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        pruefePasswort();
      }
    };
  }

  const forms = adminModal.querySelectorAll("form");
  forms
