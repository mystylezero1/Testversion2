// Admin Konsole Steuerung - Vollständige & Robuste Lösung

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
      
      const passInput = meinvollstaendigesPasswortFeld(adminModal);
      if (passInput) passInput.focus();
    };
  }

  // 2. Modal Schließen (Klick auf 'X')
  const closeBtns = adminModal.querySelectorAll(".close, .close-btn, .modal-close");
  closeBtns.forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      adminModal.classList.add("hidden");
      adminModal.style.display = "none";
    };
  });

  // Hilfsfunktion: Findet das Passwort-Eingabefeld
  function meinvollstaendigesPasswortFeld(modal) {
    let input = modal.querySelector("input[type='password']");
    if (input) return input;
    
    const loginBtn = modal.querySelector("#adminLoginBtn, .btn-login, button:not(.close)");
    if (loginBtn && loginBtn.parentElement) {
      input = loginBtn.parentElement.querySelector("input");
      if (input) return input;
    }
    return modal.querySelector("input");
  }

  // Passwort-Prüfung und Inhalt-Freischaltung
  function pruefePasswort() {
    const passInput = meinvollstaendigesPasswortFeld(adminModal);
    const eingabe = passInput ? passInput.value.trim() : "";

    // Passwort akzeptieren ("admin", "1234", "hochzeit" ODER einfach leer lassen)
    const istKorrekt = (
      eingabe.toLowerCase() === "admin" ||
      eingabe.toLowerCase() === "1234" ||
      eingabe.toLowerCase() === "hochzeit" ||
      eingabe === ""
    );

    if (istKorrekt) {
      // A. Login-Eingabefeld und Button ausblenden
      let loginContainer = adminModal.querySelector(".admin-login-area, #adminLoginArea, .login-container, form");
      if (!loginContainer && passInput) {
        loginContainer = passInput.closest("div:not(#adminModal):not(.modal-content)") || passInput.parentElement;
      }

      if (loginContainer) {
        loginContainer.style.display = "none";
        loginContainer.classList.add("hidden");
      }

      // B. ALLE verborgenen Bereiche im Admin-Modal freischalten & einblenden
      const allElements = adminModal.querySelectorAll("*");
      allElements.forEach(el => {
        if (!loginContainer || !loginContainer.contains(el)) {
          el.classList.remove("hidden");
          if (el.style.display === "none") {
            el.style.display = "";
          }
        }
      });

      // Haupt-Admin-Container explizit als Block anzeigen
      const mainContentAreas = adminModal.querySelectorAll("#adminContent, .admin-content, .admin-body, #adminContentArea, div");
      mainContentAreas.forEach(area => {
        if (!loginContainer || !loginContainer.contains(area)) {
          area.classList.remove("hidden");
        }
      });

      // C. Gästeliste Rendern
      renderAdminTabelle();
    } else {
      alert(`Falsches Passwort!`);
      if (passInput) passInput.value = "";
    }
  }

  // Anmelden-Button verknüpfen
  const loginBtn = Array.from(adminModal.querySelectorAll("button")).find(b => 
    !b.classList.contains("close") && 
    !b.classList.contains("close-btn") && 
    !b.classList.contains("modal-close")
  );

  if (loginBtn) {
    loginBtn.onclick = (e) => {
      e.preventDefault();
      pruefePasswort();
    };
  }

  // Formular-Submit & Enter-Taste abfangen
  const form = adminModal.querySelector("form");
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      pruefePasswort();
    };
  }

  const passInput = meinvollstaendigesPasswortFeld(adminModal);
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

// Rendert die Admin-Tabelle neu
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
