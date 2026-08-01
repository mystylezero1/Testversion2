// Admin Konsole Steuerung - Vollständiger & Bereinigter Code

document.addEventListener("DOMContentLoaded", () => {
  initAdminEvents();
});

function initAdminEvents() {
  const oldBtn = document.getElementById("adminOpenBtn");
  const adminModal = document.getElementById("adminModal");

  if (oldBtn && adminModal) {
    // 1. BUTTON-RESET: Klont den Button, um alle doppelten Event-Listener aus app.js zu löschen
    const adminBtn = oldBtn.cloneNode(true);
    oldBtn.parentNode.replaceChild(adminBtn, oldBtn);

    // 2. Passwortabfrage (wird garantiert nur noch einmal ausgeführt)
    adminBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const pass = prompt("Bitte Admin-Passwort eingeben:");
      if (pass === null) return; // Abgebrochen

      // Liest Passwort aus config.js ODER nutzt "admin" als Fallback
      let validPass = "admin";
      if (typeof CONFIG !== "undefined") {
        validPass = CONFIG.adminPassword || CONFIG.password || CONFIG.pass || validPass;
      }

      // Vergleich (ignoriert Groß-/Kleinschreibung und Leerzeichen)
      if (pass.trim().toLowerCase() === String(validPass).trim().toLowerCase()) {
        adminModal.classList.remove("hidden");
        renderAdminTabelle(); // Tabelle beim Öffnen befüllen
      } else {
        alert("Falsches Passwort!");
      }
    });
  }

  // 3. Modal Schließen (Klick auf 'X' oder Schließen-Button)
  const closeBtns = document.querySelectorAll("#adminModal .close, #adminModal .close-btn, #adminModal .modal-close");
  closeBtns.forEach(btn => {
    btn.onclick = () => {
      adminModal.classList.add("hidden");
    };
  });

  // 4. Klapp-Menüs (Accordion) für "+ Neuen Gast anlegen" etc.
  const accordionBtns = document.querySelectorAll(".admin-accordion-btn");
  accordionBtns.forEach(btn => {
    btn.onclick = function() {
      this.classList.toggle("active");
      const panel = this.nextElementSibling;
      if (panel) {
        if (panel.style.display === "block" || panel.style.maxHeight) {
          panel.style.display = "none";
          panel.style.maxHeight = null;
        } else {
          panel.style.display = "block";
          panel.style.maxHeight = panel.scrollHeight + "px";
        }
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

  // Sortieren nach Tisch und Platz
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

// Neuen Gast zur Liste hinzufügen
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
  
  // Ansichten aktualisieren
  renderAdminTabelle();
  if (typeof sitzplanErstellen === "function") sitzplanErstellen();

  // Eingaben zurücksetzen
  nameInput.value = "";
  platzInput.value = "";
  if (kindInput) kindInput.checked = false;

  alert(`Gast "${neuesObjekt.name}" hinzugefügt! Vergiss nicht, am Ende "JSON Exportieren" zu klicken.`);
}

// Gast aus Liste löschen
function gastLoeschen(index) {
  if (confirm(`Möchtest du "${gaeste[index].name}" wirklich löschen?`)) {
    gaeste.splice(index, 1);
    renderAdminTabelle();
    if (typeof sitzplanErstellen === "function") sitzplanErstellen();
  }
}

// JSON Datei herunterladen
function exportiereJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(gaeste, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "data.json");
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
