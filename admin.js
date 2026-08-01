// Admin Konsole Steuerung - Präzise HTML-Modal Steuerung

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
    };
  }

  // 2. Modal Schließen (Klick auf 'X' oder Schließen-Buttons)
  const closeBtns = adminModal.querySelectorAll(".close, .close-btn, .modal-close");
  closeBtns.forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      adminModal.classList.add("hidden");
      adminModal.style.display = "none";
    };
  });

  // 3. Elemente im Login-Bereich präzise finden
  // Passwort-Feld suchen (sucht erst nach Passwords, sonst nach erstem Input)
  const passInput = adminModal.querySelector("#adminPassword, #adminPass, #passInput, input[type='password']") 
                    || adminModal.querySelector("input");

  // Login-Button gezielt suchen (schließt den 'X'-Button explizit aus)
  const loginBtn = adminModal.querySelector("#adminLoginBtn, #loginBtn, .btn-login") 
                   || Array.from(adminModal.querySelectorAll("button")).find(b => 
                      !b.classList.contains("close") && 
                      !b.classList.contains("close-btn") && 
                      b.textContent.trim().toLowerCase().includes("anmelden")
                   )
                   || adminModal.querySelector("form button");

  // Login-Container und Haupt-Admin-Bereich ermitteln
  const loginArea = adminModal.querySelector(".admin-login-area, #adminLoginArea, form") 
                    || (passInput ? passInput.closest("div:not(#adminModal)") : null);

  function pruefePasswort() {
    if (!passInput) return;
    const pass = passInput.value;

    // Liest Passwort aus config.js ODER nutzt "admin" als Fallback
    let validPass = "admin";
    if (typeof CONFIG !== "undefined" && CONFIG) {
      validPass = CONFIG.adminPassword || CONFIG.password || CONFIG.pass || validPass;
    }

    const eingabe = pass.trim();
    const sollPass = String(validPass).trim();

    // Passwort-Vergleich (sowohl exakt als auch schreibweisen-tolerant)
    if (eingabe === sollPass || eingabe.toLowerCase() === sollPass.toLowerCase()) {
      // Login erfolgreich: Login-Eingabe ausblenden
      if (loginArea) {
        loginArea.style.display = "none";
        loginArea.classList.add("hidden");
      }

      // Admin-Inhalte (Gästeliste, Tabelle, Export) einblenden
      const hiddenAdminElements = adminModal.querySelectorAll(".admin-accordion-btn, table, .admin-footer, #adminGaesteTbody, .admin-content-area, #adminContentArea");
      hiddenAdminElements.forEach(el => {
        el.style.display = "";
        el.classList.remove("hidden");
      });

      // Tabelle rendern
      renderAdminTabelle();
    } else {
      alert("Falsches Passwort!");
      passInput.value = "";
      passInput.focus();
    }
  }

  // Klick auf den Anmelden-Button
  if (loginBtn) {
    loginBtn.onclick = (e) => {
      e.preventDefault();
      pruefePasswort();
    };
  }

  // Formular-Absenden abfangen (falls Anmelden in einem <form> liegt)
  const loginForm = adminModal.querySelector("form");
  if (loginForm) {
    loginForm.onsubmit = (e) => {
      e.preventDefault();
      pruefePasswort();
    };
  }

  // Enter-Taste im Passwort-Feld abfangen
  if (passInput) {
    passInput.onkeydown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        pruefePasswort();
      }
    };
  }

  // 4. Klapp-Menüs (Accordion) für "+ Neuen Gast anlegen" etc.
  const accordionBtns = adminModal.querySelectorAll(".admin-accordion-btn");
  accordionBtns.forEach(btn => {
    btn.onclick = function() {
      this.classList.toggle("active");
      const panel = this.nextElementSibling;
      if (panel) {
        panel.style.display = (panel.style.display === "block") ? "none" : "block";
      }
    };
  });

  // 5. Gast hinzufügen Formular
  const addForm = document.getElementById("addGastForm");
  if (addForm) {
    addForm.onsubmit = (e) => {
      e.preventDefault();
      neuenGastHinzufuegen();
    };
  }

  // 6. JSON Exportieren Button
  const exportBtn = document.getElementById("exportJsonBtn");
  if (exportBtn) exportBtn.onclick = exportiereJSON;

  // 7. Saalplan Drucken Button
  const druckenBtn = document.getElementById("druckenBtn");
  if (druckenBtn) {
    druckenBtn.onclick = () => window.print();
  }
}

// Rendert die Admin-Tabelle dynamisch neu
function renderAdminTabelle() {
  const tbody = document.getElementById("adminGaesteTbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  gaeste.sort((a, b) => {
    if (a.tisch === b.tisch) return a.platz - b.platz;
    return String(a.tisch).localeCompare(String(b.tisch));
  });

  gaeste.forEach((gast, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${gast.platz}</td>
      <td>${gast.name}</td>
      <td>${gast.tisch}</td>
      <td>${gast.isKind ? "Ja ⭐" : "Nein"}</td>
      <td>
        <button class="btn-delete" onclick="gastLoeschen(${index})">Löschen</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Neuen Gast hinzufügen
function neuenGastHinzufuegen() {
  const nameInput = document.getElementById("neuerName");
  const tischInput = document.getElementById("neuerTisch");
  const platzInput = document.getElementById("neuerPlatz");
  const kindInput = document.getElementById("neuesKind");

  if (!nameInput || !tischInput || !platzInput) return;

  const tischVal = tischInput.value.trim();
  const neuesObjekt = {
    tisch: isNaN(tischVal) ? tischVal : Number(tischVal),
    platz: Number(platzInput.value),
    name: nameInput.value.trim(),
    isKind: kindInput ? kindInput.checked : false
  };

  gaeste.push(neuesObjekt);
  renderAdminTabelle();
  if (typeof sitzplanErstellen === "function") sitzplanErstellen();

  nameInput.value = "";
  platzInput.value = "";
  if (kindInput) kindInput.checked = false;

  alert(`Gast "${neuesObjekt.name}" hinzugefügt!`);
}

// Gast löschen
function gastLoeschen(index) {
  if (confirm(`Möchtest du "${gaeste[index].name}" wirklich löschen?`)) {
    gaeste.splice(index, 1);
    renderAdminTabelle();
    if (typeof sitzplanErstellen === "function") sitzplanErstellen();
  }
}

// JSON Datei exportieren
function exportiereJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(gaeste, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "data.json");
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
