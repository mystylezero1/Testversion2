// Admin Konsole Steuerung - Optimierte Version (Saalplan-Druck & Passwort-Handling)

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
      if (passInput) {
        passInput.value = "";
        passInput.focus();
      }
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

  // Hilfsfunktion: Anmelden-Button finden
  function findLoginBtn(modal) {
    const explicitBtn = modal.querySelector("#adminLoginBtn, .btn-login");
    if (explicitBtn) return explicitBtn;

    const allBtns = Array.from(modal.querySelectorAll("button"));
    return allBtns.find(b => b.textContent.trim().toLowerCase().includes("anmelden"));
  }

  // 3. Login-Prüfung & Admin-Bereich freischalten
  function pruefePasswort() {
    const passInput = findPassInput(adminModal);
    const eingabe = passInput ? passInput.value.trim().toLowerCase() : "";

    // Gültige Passwörter
    const gueltigePasswoerter = ["admin", "1234", "hochzeit", "anja", "dino", ""];
    const istKorrekt = gueltigePasswoerter.includes(eingabe);

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

      // Admin-Hauptbereiche sichtbar machen
      const hiddenAdminAreas = adminModal.querySelectorAll(".admin-content, .admin-body, #adminContentArea, .admin-main");
      hiddenAdminAreas.forEach(area => {
        area.classList.remove("hidden");
        area.style.display = "block";
      });

      // Klapp-Menüs aktivieren
      setupAccordions(adminModal);

      // Tabelle rendern
      renderAdminTabelle();
    } else {
      alert("Falsches Passwort! Gültige Passwörter: admin, 1234, hochzeit, anja, dino (oder einfach leer lassen).");
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

  // 4. Formular zum Hinzufügen von Gästen
  const addForm = document.getElementById("addGastForm");
  if (addForm) {
    addForm.onsubmit = (e) => {
      e.preventDefault();
      neuenGastHinzufuegen();
    };
  }

  // 5. Drucken- & Export-Buttons einrichten
  setupActionButtons(adminModal);
}

// Akkordeon-Steuerung für "Gästeliste", "Aktionen & Export", "+ Neuen Gast anlegen"
function setupAccordions(modal) {
  const allBtns = Array.from(modal.querySelectorAll("button, .accordion, .accordion-btn, .admin-accordion-btn"));

  const menuBtns = allBtns.filter(btn => {
    const txt = btn.textContent.trim().toLowerCase();
    const isClose = btn.classList.contains("close") || btn.classList.contains("close-btn") || txt === "x" || txt === "×";
    const isAction = btn.id === "exportJsonBtn" || btn.id === "printPlanBtn" || txt.includes("löschen") || txt.includes("anmelden");
    return !isClose && !isAction;
  });

  menuBtns.forEach(btn => {
    btn.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();

      const txt = this.textContent.trim().toLowerCase();
      let targetPanel = null;

      if (txt.includes("liste") || txt.includes("gästeliste")) {
        targetPanel = modal.querySelector("#gaesteTabelleTab, .gaeste-table-panel, table")?.closest("div") || modal.querySelector("table");
      } else if (txt.includes("aktion") || txt.includes("export")) {
        targetPanel = modal.querySelector("#actionsTab, .actions-tab, .admin-actions-grid")?.closest("div") || modal.querySelector("#actionsTab");
      } else if (txt.includes("gast") || txt.includes("anlegen")) {
        targetPanel = modal.querySelector("#addGastTab, #addGastForm, .add-gast-panel") || modal.querySelector("form");
      }

      if (!targetPanel && this.nextElementSibling) {
        targetPanel = this.nextElementSibling;
      }

      if (targetPanel) {
        this.classList.toggle("active");
        const isHidden = targetPanel.style.display === "none" || targetPanel.classList.contains("hidden") || window.getComputedStyle(targetPanel).display === "none";
        
        if (isHidden) {
          targetPanel.style.display = "block";
          targetPanel.classList.remove("hidden");
        } else {
          targetPanel.style.display = "none";
        }
      }
    };
  });
}

// Drucken & Exportieren Buttons
function setupActionButtons(modal) {
  const printBtns = modal.querySelectorAll("#printPlanBtn, #printBtn, #druckenBtn, .btn-print");
  printBtns.forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      saalplanDrucken(modal);
    };
  });

  const exportBtns = modal.querySelectorAll("#exportJsonBtn, #exportBtn, .btn-export");
  exportBtns.forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      exportiereJSON();
    };
  });
}

// Saalplan drucken: Ausblenden des Modals vor dem Druck
function saalplanDrucken(modal) {
  if (modal) {
    modal.style.display = "none";
  }

  setTimeout(() => {
    window.print();
    if (modal) {
      modal.style.display = "flex";
    }
  }, 200);
}

// Automatisches Verstecken des Modals beim Auslösen des Druckdialogs
window.addEventListener("beforeprint", () => {
  const adminModal = document.getElementById("adminModal");
  if (adminModal) adminModal.style.display = "none";
});

window.addEventListener("afterprint", () => {
  const adminModal = document.getElementById("adminModal");
  if (adminModal && !adminModal.classList.contains("hidden")) {
    adminModal.style.display = "flex";
  }
});

// Admin-Tabelle rendern
function renderAdminTabelle() {
  const tbody = document.getElementById("adminGaesteTbody");
  if (!tbody) return;

  tbody.innerHTML = "";
  if (!window.gaeste) window.gaeste = [];

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

// Gast hinzufügen
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

  if (!window.gaeste) window.gaeste = [];
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
  if (!window.gaeste) return;
  if (confirm(`Möchtest du "${gaeste[index].name}" wirklich löschen?`)) {
    gaeste.splice(index, 1);
    renderAdminTabelle();
    if (typeof sitzplanErstellen === "function") sitzplanErstellen();
  }
}

// JSON exportieren
function exportiereJSON() {
  if (!window.gaeste) window.gaeste = [];
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(gaeste, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "data.json");
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
