// Admin Konsole Steuerung

document.addEventListener("DOMContentLoaded", () => {
  initAdminEvents();
});

function initAdminEvents() {
  // Accordion / Klapp-Menüs
  const accordionBtns = document.querySelectorAll(".admin-accordion-btn");
  accordionBtns.forEach(btn => {
    btn.addEventListener("click", function() {
      this.classList.toggle("active");
      const panel = this.nextElementSibling;
      if (panel) {
        if (panel.style.maxHeight) {
          panel.style.maxHeight = null;
        } else {
          panel.style.maxHeight = panel.scrollHeight + "px";
        }
      }
    });
  });

  // Gast hinzufügen Formular
  const addForm = document.getElementById("addGastForm");
  if (addForm) {
    addForm.addEventListener("submit", (e) => {
      e.preventDefault();
      neuenGastHinzufuegen();
    });
  }

  // JSON Exportieren
  document.getElementById("exportJsonBtn")?.addEventListener("click", exportiereJSON);

  // Saalplan Drucken
  document.getElementById("druckenBtn")?.addEventListener("click", () => {
    window.print();
  });
}

// Rendert die Admin-Tabelle neu
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

// Neuen Gast zur lokalen Liste hinzufügen
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
  
  // UI aktualisieren
  renderAdminTabelle();
  if (typeof sitzplanErstellen === "function") sitzplanErstellen();

  // Formular zurücksetzen
  nameInput.value = "";
  platzInput.value = "";
  if (kindInput) kindInput.checked = false;

  alert(`Gast "${neuesObjekt.name}" hinzugefügt! Vergiss nicht, am Ende "JSON Exportieren" zu klicken.`);
}

// Gast aus lokaler Liste löschen
function gastLoeschen(index) {
  if (confirm(`Möchtest du "${gaeste[index].name}" wirklich löschen?`)) {
    gaeste.splice(index, 1);
    renderAdminTabelle();
    if (typeof sitzplanErstellen === "function") sitzplanErstellen();
  }
}

// JSON Datei zum Download anbieten
function exportiereJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(gaeste, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "data.json");
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
