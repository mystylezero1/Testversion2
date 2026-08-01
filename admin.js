document.addEventListener("DOMContentLoaded", () => {
  const adminModal = document.getElementById("adminModal");
  const openBtn = document.getElementById("adminOpenBtn");
  const closeBtn = document.getElementById("closeAdminModal");
  const loginBtn = document.getElementById("adminLoginBtn");
  
  openBtn?.addEventListener("click", () => adminModal?.classList.remove("hidden"));
  closeBtn?.addEventListener("click", () => adminModal?.classList.add("hidden"));

  loginBtn?.addEventListener("click", () => {
    const pw = document.getElementById("adminPasswordInput").value;
    // Vereinfachte Validierung
    if (pw === "hochzeit2026") {
      document.getElementById("adminLoginArea")?.classList.add("hidden");
      document.getElementById("adminDashboardArea")?.classList.remove("hidden");
      renderAdminTable();
    } else {
      document.getElementById("adminAuthError")?.classList.remove("hidden");
    }
  });

  document.getElementById("exportJsonBtn")?.addEventListener("click", () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(gaeste, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "sitzplan_export.json");
    dlAnchor.click();
  });
});

function renderAdminTable() {
  const tbody = document.getElementById("adminGaesteTbody");
  if (!tbody) return;
  tbody.innerHTML = gaeste.map((g, idx) => `
    <tr>
      <td>${g.platz}</td>
      <td>${g.name || '<i>Leer</i>'}</td>
      <td>${g.tisch}</td>
      <td>${g.isKind ? '⭐ Ja' : 'Nein'}</td>
      <td><button onclick="deleteGast(${idx})" style="padding:4px 8px; font-size:11px; background:#ef4444;">Löschen</button></td>
    </tr>
  `).join("");
}

function deleteGast(idx) {
  if (confirm("Gast wirklich löschen?")) {
    gaeste.splice(idx, 1);
    renderAdminTable();
    if (typeof sitzplanErstellen === "function") sitzplanErstellen();
  }
}
