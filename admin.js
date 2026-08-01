// Admin Konsole Steuerung (Nutzt das HTML-Modal aus der index.html)

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

  // 2. Modal Schließen (Klick auf 'X')
  const closeBtns = adminModal.querySelectorAll(".close, .close-btn, .modal-close");
  closeBtns.forEach(btn => {
    btn.onclick = () => {
      adminModal.classList.add("hidden");
      adminModal.style.display = "none";
    };
  });

  // 3. Passwortabfrage über das HTML-Eingabefeld
  const passInput = adminModal.querySelector("input[type='password']") || adminModal.querySelector("input");
  const loginBtn = adminModal.querySelector("button") || document.getElementById("adminLoginBtn");

  function pruefePasswort() {
    if (!passInput) return;
    const pass = passInput.value;

    // Liest Passwort aus config.js ODER nutzt "admin" als Fallback
    let validPass = "admin";
    if (typeof CONFIG !== "undefined") {
      validPass = CONFIG.adminPassword || CONFIG.password || CONFIG.pass || validPass;
    }

    if (pass.trim().toLowerCase() === String(validPass).trim().toLowerCase()) {
      // Login erfolgreich: Zeige Admin-Inhalte (Tabelle etc.)
      const loginArea = adminModal.querySelector(".admin-login-area") || passInput.parentElement;
      const adminContent = adminModal.querySelector(".admin-content-area") || document.getElementById("adminContent");

      if (loginArea && adminContent) {
        loginArea.style.display = "none";
        adminContent.style.display = "block";
        adminContent.classList.remove("hidden");
      }

      renderAdminTabelle();
    } else {
      alert("Falsches Passwort!");
      passInput.value = "";
    }
  }

  // Klick auf "Anmelden"-Button
  if (loginBtn) {
    loginBtn.onclick = (e) => {
      e.preventDefault();
      pruefePasswort();
    };
  }

  // Bestätigung per Enter-Taste im Passwort-Feld
  if (passInput) {
    passInput.onkeydown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        pruefePasswort();
      }
    };
  }

  // 4. Klapp-Menüs (Accordion)
  const accordionBtns = document.querySelectorAll(".admin-accordion-btn");
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

  // 6. Export & Drucken Buttons
  const exportBtn = document.getElementById("exportJsonBtn");
  if (exportBtn) exportBtn.onclick = exportiereJSON;

  const druckenBtn = document.getElementById("druckenBtn");
  if (druckenBtn) druckenBtn.onclick = () => window.print();
}

// Rendert die Admin-Tabelle dynamisch
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

// JSON exportieren
function exportiereJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(gaeste, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "data.json");
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
