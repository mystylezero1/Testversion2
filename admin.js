// ----------------------------
// Admin Console Logik & Event-Listener
// ----------------------------

document.addEventListener("DOMContentLoaded", () => {
  initAdminEvents();
});

function initAdminEvents() {
  const adminOpenBtn = document.getElementById("adminOpenBtn");
  const closeAdminModal = document.getElementById("closeAdminModal");
  const adminLoginBtn = document.getElementById("adminLoginBtn");
  const exportJsonBtn = document.getElementById("exportJsonBtn");
  const printPlanBtn = document.getElementById("printPlanBtn");
  const addGastForm = document.getElementById("addGastForm");

  // Tabs Switches
  const tabGaesteBtn = document.getElementById("tabGaesteBtn");
  const tabAddBtn = document.getElementById("tabAddBtn");
  const tabActionsBtn = document.getElementById("tabActionsBtn");

  if (adminOpenBtn) {
    adminOpenBtn.addEventListener("click", () => {
      document.getElementById("adminModal")?.classList.remove("hidden");
    });
  }

  if (closeAdminModal) {
    closeAdminModal.addEventListener("click", () => {
      document.getElementById("adminModal")?.classList.add("hidden");
    });
  }

  if (adminLoginBtn) {
    adminLoginBtn.addEventListener("click", checkAdminLogin);
  }

  // Password Enter-Taste
  const pwInput = document.getElementById("adminPasswordInput");
  if (pwInput) {
    pwInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") checkAdminLogin();
    });
  }

  // Tab Wechsel
  if (tabGaesteBtn) tabGaesteBtn.addEventListener("click", () => switchAdminTab("gaesteTab", tabGaesteBtn));
  if (tabAddBtn) tabAddBtn.addEventListener("click", () => switchAdminTab("addGastTab", tabAddBtn));
  if (tabActionsBtn) tabActionsBtn.addEventListener("click", () => switchAdminTab("actionsTab", tabActionsBtn));

  // Aktionen
  if (exportJsonBtn) exportJsonBtn.addEventListener("click", exportierenNachExcel);
  if (printPlanBtn) printPlanBtn.addEventListener("click", () => window.print());
  if (addGastForm) addGastForm.addEventListener("submit", gastHinzufuegen);
}

// ----------------------------
// Login Prüfung
// ----------------------------
function checkAdminLogin() {
  const pwInput = document.getElementById("adminPasswordInput");
  if (!pwInput) return;

  // Standard-Passwort (anpassen falls gewünscht)
  if (pwInput.value === "1234" || pwInput.value === "anja&dino") {
    document.getElementById("adminLoginArea")?.classList.add("hidden");
    document.getElementById("adminDashboardArea")?.classList.remove("hidden");
    renderAdminTabelle();
  } else {
    alert("Falsches Passwort!");
  }
}

// ----------------------------
// Tab Navigation
// ----------------------------
function switchAdminTab(tabId, btnElement) {
  document.querySelectorAll(".tab-content").forEach(el => el.classList.add("hidden"));
  document.querySelectorAll(".tab-btn").forEach(el => el.classList.remove("active"));
  
  const target = document.getElementById(tabId);
  if (target) target.classList.remove("hidden");
  if (btnElement) btnElement.classList.add("active");
}

// ----------------------------
// Tabelle Rendern
// ----------------------------
function renderAdminTabelle() {
  const tbody = document.getElementById("adminGaesteTbody");
  if (!tbody || typeof gaeste === "undefined") return;

  tbody.innerHTML = "";
  gaeste.forEach((g, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${g.platz}</td>
      <td>${g.name}</td>
      <td>${g.tisch}</td>
      <td>${g.isKind ? "Ja ⭐" : "Nein"}</td>
      <td>
        <button onclick="gastLoeschen(${index})" style="background:#e74c3c; padding:3px 8px; font-size:11px;">Löschen</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ----------------------------
// Gast Hinzufügen
// ----------------------------
function gastHinzufuegen(e) {
  e.preventDefault();
  const name = document.getElementById("neuerName").value.trim();
  const tisch = document.getElementById("neuerTisch").value.trim();
  const platz = document.getElementById("neuerPlatz").value;
  const isKind = document.getElementById("neuesKind").checked;

  if (!name || !tisch || !platz) return;

  gaeste.push({
    tisch: isNaN(tisch) ? tisch : Number(tisch),
    platz: Number(platz),
    name: name,
    isKind: isKind
  });

  // UI aktualisieren
  renderAdminTabelle();
  if (typeof sitzplanErstellen === "function") sitzplanErstellen();

  document.getElementById("addGastForm").reset();
  alert(`Gast ${name} erfolgreich hinzugefügt!`);
  switchAdminTab("gaesteTab", document.getElementById("tabGaesteBtn"));
}

// ----------------------------
// Gast Löschen
// ----------------------------
function gastLoeschen(index) {
  if (confirm(`Gast "${gaeste[index].name}" wirklich löschen?`)) {
    gaeste.splice(index, 1);
    renderAdminTabelle();
    if (typeof sitzplanErstellen === "function") sitzplanErstellen();
  }
}

// ----------------------------
// Excel Export (SheetJS)
// ----------------------------
function exportierenNachExcel() {
  if (typeof XLSX === "undefined") {
    alert("Excel-Bibliothek konnte nicht geladen werden.");
    return;
  }

  const dataToExport = gaeste.map(g => ({
    "Tisch": g.tisch,
    "Platz-Nr": g.platz,
    "Name": g.name,
    "Kind": g.isKind ? "Ja" : "Nein"
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Gästeliste");

  XLSX.writeFile(workbook, "Hochzeit_Gaesteliste.xlsx");
}
