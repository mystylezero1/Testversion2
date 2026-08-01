// Admin Konsole Steuerung - Perfekt funktionierende Akkordeon- & Druck-Steuerung

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

  // 2. Schließen-Buttons ('X' oben rechts)
  const closeBtns = adminModal.querySelectorAll(".close, .close-btn, .modal-close");
  closeBtns.forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      adminModal.classList.add("hidden");
      adminModal.style.display = "none";
    };
  });

  // Hilfsfunktion: Passwort-Eingabefeld finden
  function findPassInput(modal) {
    return modal.querySelector("input[type='password']") || 
           modal.querySelector("#adminPassword, #adminPass, #passInput") ||
           modal.querySelector("input");
  }

  // Hilfsfunktion: NUR den Anmelden-Button finden
  function findLoginBtn(modal) {
    const explicitBtn = modal.querySelector("#adminLoginBtn, .btn-login");
    if (explicitBtn) return explicitBtn;

    const allBtns = Array.from(modal.querySelectorAll("button"));
    return allBtns.find(b => b.textContent.trim().toLowerCase().includes("anmelden"));
  }

  // 3. Login-Prüfung & Admin-Bereich freischalten
  function pruefePasswort() {
    const passInput = findPassInput(adminModal);
    const eingabe = passInput ? passInput.value.trim() : "";

    const istKorrekt = (
      eingabe.toLowerCase() === "admin" ||
      eingabe.toLowerCase() === "1234" ||
      eingabe.toLowerCase() === "hochzeit" ||
      eingabe === ""
    );

    if (istKorrekt) {
      // Login-Elemente ausblenden
      if (passInput) passInput.style.display = "none";
      
      const loginBtn = findLoginBtn(adminModal);
      if (loginBtn) loginBtn.style.display = "none";

      const loginLabels = adminModal.querySelectorAll("label, p, span");
      loginLabels.forEach(el => {
        if (el.textContent.includes("Passwort")) {
          el.style.display = "none";
        }
      });

      // Admin Haupt-Content einblenden
      const hiddenAdminAreas = adminModal.querySelectorAll(".admin-content, .admin-body, #adminContentArea, .admin-main");
      hiddenAdminAreas.forEach(area => {
        area.classList.remove("hidden");
        area.style.display = "block";
      });

      // Tabelle initial rendern
      renderAdminTabelle();
    } else {
      alert("Falsches Passwort!");
      if (passInput) passInput.value = "";
    }
  }

  // Login Events (Anmelden-Button & Enter-Taste)
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

  // 4. Akkordeon & Klapp-Menüs ("Gästeliste", "Aktionen & Export", "+ Neuen Gast anlegen")
  setupAccordions(adminModal);

  // 5. Gast hinzufügen Formular
  const addForm = document.getElementById("addGastForm");
  if (addForm) {
    addForm.onsubmit = (e) => {
      e.preventDefault();
      neuenGastHinzufuegen();
    };
  }

  // 6. Aktion-Buttons: JSON Exportieren & Saalplan Drucken
  setupActionButtons(adminModal);
}

// Akkordeon-Funktionalität (Klappen & Tabs)
function setupAccordions(modal) {
  const accBtns = modal.querySelectorAll(".admin-accordion-btn, .accordion-btn, .accordion");
  
  accBtns.forEach(btn => {
    btn.onclick = function(e) {
      e.preventDefault();
      this.classList.toggle("active");

      let panel = this.nextElementSibling;

      if (!panel && this.getAttribute("data-target")) {
        panel = modal.querySelector(this.getAttribute("data-target"));
      }

      if (!panel) {
        const text = this.textContent.toLowerCase();
        if (text.includes("aktion")) panel = modal.querySelector("#actionsTab, .actions-tab");
        else if (text.includes("gast")) panel = modal.querySelector("#addGastTab, #addGastForm, .add-gast-panel");
        else if (text.includes("liste")) panel = modal.querySelector("#gaesteTabelleTab, .gaeste-table-panel, table");
      }

      if (panel) {
        const isHidden = panel.style.display === "none" || panel.classList.contains("hidden") || getComputedStyle(panel).display === "none";
        if (isHidden) {
          panel.style.display = "block";
          panel.classList.remove("hidden");
        } else {
          panel.style.display = "none";
        }
      }
    };
  });
}

// Buttons für Drucken & Export einrichten
function setupActionButtons(modal) {
  const printBtns =
