// --- Globale Variablen ---
let saalData = null;
window.aktuellesSuchErgebnis = [];

// --- Initialisierung ---
document.addEventListener("DOMContentLoaded", () => {
  loadData();
  initSearchEvents();
});

// --- Daten aus data.json laden & Plan aufbauen ---
async function loadData() {
  try {
    const response = await fetch("data.json");
    if (!response.ok) throw new Error("Netzwerk-Antwort war nicht ok");
    saalData = await response.json();
    renderSaalplan(saalData);
  } catch (error) {
    console.error("Fehler beim Laden der Sitzplan-Daten:", error);
  }
}

// --- DOM Rendering des Saalplans ---
function renderSaalplan(data) {
  const tischeContainer = document.getElementById("tische");
  if (!tischeContainer) return;

  tischeContainer.innerHTML = "";

  // Brauttisch rendern (falls im HTML nicht statisch)
  renderBrauttisch(data.brauttisch);

  // Reguläre Tische in Reihen aufbauen
  if (data.reihen && Array.isArray(data.reihen)) {
    data.reihen.forEach((reihe) => {
      const reiheDiv = document.createElement("div");
      reiheDiv.className = "tisch-reihe";

      reihe.tische.forEach((tisch) => {
        if (tisch.typ === "buffet") {
          // Buffet / Ausschank Modul
          const buffetDiv = document.createElement("div");
          buffetDiv.className = "buffet-box";
          buffetDiv.innerHTML = `➔<br>${tisch.label || "Ausschank & Buffet"}`;
          reiheDiv.appendChild(buffetDiv);
        } else {
          // Normaler Tisch
          const tischBox = createTischElement(tisch);
          reiheDiv.appendChild(tischBox);
        }
      });

      tischeContainer.appendChild(reiheDiv);
    });
  }
}

function renderBrauttisch(brautData) {
  const brautContainer = document.getElementById("brauttisch");
  if (!brautContainer || !brautData) return;

  // Render-Logik für Brauttisch Plätze
  const plaetzeContainer = brautContainer.querySelector(".braut-reihe") || brautContainer;
  if (brautData.gaeste && Array.isArray(brautData.gaeste)) {
    plaetzeContainer.innerHTML = brautData.gaeste
      .map(
        (g) => `
      <div class="platz">
        <span class="platz-nr">${g.sitz || ""}</span>
        <span class="platz-name">${g.name}</span>
        ${g.kind ? '<span class="kind-star">★</span>' : ""}
      </div>
    `
      )
      .join("");
  }
}

function createTischElement(tisch) {
  const tischBox = document.createElement("div");
  tischBox.className = "tisch-box";
  tischBox.dataset.tischId = tisch.id;

  const inhalt = document.createElement("div");
  inhalt.className = "tisch-inhalt";

  // Links sitzende Gäste
  const linksDiv = document.createElement("div");
  linksDiv.className = "seite links";
  (tisch.links || []).forEach((g) => linksDiv.appendChild(createPlatzElement(g)));

  // Tisch Label
  const labelDiv = document.createElement("div");
  labelDiv.className = "tisch-label";
  labelDiv.innerText = tisch.label || `Tisch ${tisch.id}`;

  // Rechts sitzende Gäste
  const rechtsDiv = document.createElement("div");
  rechtsDiv.className = "seite rechts";
  (tisch.rechts || []).forEach((g) => rechtsDiv.appendChild(createPlatzElement(g)));

  inhalt.appendChild(linksDiv);
  inhalt.appendChild(labelDiv);
  inhalt.appendChild(rechtsDiv);

  tischBox.appendChild(inhalt);
  return tischBox;
}

function createPlatzElement(gast) {
  const platz = document.createElement("div");
  platz.className = "platz";
  platz.innerHTML = `
    <span class="platz-nr">${gast.sitz || ""}</span>
    <span class="platz-name">${gast.name}</span>
    ${gast.kind ? '<span class="kind-star">★</span>' : ""}
  `;
  return platz;
}

// --- Event Listener für Suche ---
function initSearchEvents() {
  const searchInput = document.getElementById("guest-search") || document.querySelector("input[type='text']");
  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        starteSuche();
      }
    });
  }
}

// --- Mehrfach-Suchlogik ---
function starteSuche() {
  const input = document.getElementById("guest-search") || document.querySelector("input[type='text']");
  if (!input) return;

  const suchbegriff = input.value.trim().toLowerCase();
  if (!suchbegriff) return;

  const allePlaetze = document.querySelectorAll(".platz");
  const treffer = [];

  allePlaetze.forEach((platz) => {
    const nameEl = platz.querySelector(".platz-name") || platz;
    const gastName = nameEl.innerText || nameEl.textContent;

    if (gastName && gastName.toLowerCase().includes(suchbegriff)) {
      const tischBox = platz.closest(".tisch-box") || platz.closest("#brauttisch");
      const tischLabel = tischBox ? (tischBox.querySelector(".tisch-label")?.innerText || "Brauttisch") : "Unbekannt";

      treffer.push({
        element: platz,
        tisch: tischBox,
        name: gastName.trim(),
        tischName: tischLabel.trim()
      });
    }
  });

  document.querySelectorAll(".highlight").forEach((el) => el.classList.remove("highlight"));

  if (treffer.length === 0) {
    alert("Kein Gast mit diesem Namen gefunden.");
    return;
  }

  zeigSaalplan();

  if (treffer.length === 1) {
    fokussiereTisch(treffer[0]);
  } else {
    zeigTrefferAuswahl(treffer);
  }
}

function fokussiereTisch(trefferItem) {
  if (!trefferItem || !trefferItem.tisch) return;

  const tisch = trefferItem.tisch;

  tisch.classList.add("highlight");
  tisch.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });

  setTimeout(() => {
    tisch.classList.remove("highlight");
  }, 4000);
}

function zeigTrefferAuswahl(trefferListe) {
  window.aktuellesSuchErgebnis = trefferListe;

  let modalHtml = `
    <div id="search-modal" class="modal">
      <div class="glass-card" style="max-width: 420px; width: 90%;">
        <div class="modal-header">
          <h3 style="font-family: 'Cormorant Garamond', serif; font-size: 22px; margin: 0;">Mehrere Gäste gefunden</h3>
          <span class="close-btn" onclick="schliesseSearchModal()">&times;</span>
        </div>
        <p style="font-size: 13px; color: #666; margin: 10px 0 15px 0;">Bitte wähle deinen Namen aus:</p>
        <div style="display: flex; flex-direction: column; gap: 8px; max-height: 280px; overflow-y: auto;">
  `;

  trefferListe.forEach((item, index) => {
    modalHtml += `
      <button class="btn-secondary" style="text-align: left; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; width: 100%;" 
              onclick="waehleGastAus(${index})">
        <span><strong>${item.name}</strong></span>
        <span style="font-size: 11px; opacity: 0.8; background: rgba(0,0,0,0.06); padding: 3px 8px; border-radius: 6px;">${item.tischName}</span>
      </button>
    `;
  });

  modalHtml += `
        </div>
      </div>
    </div>
  `;

  schliesseSearchModal();
  document.body.insertAdjacentHTML("beforeend", modalHtml);
}

function waehleGastAus(index) {
  const ziel = window.aktuellesSuchErgebnis[index];
  schliesseSearchModal();
  if (ziel) {
    fokussiereTisch(ziel);
  }
}

function schliesseSearchModal() {
  const modal = document.getElementById("search-modal");
  if (modal) modal.remove();
}

function zeigSaalplan() {
  const welcome = document.getElementById("welcome");
  const overlay = document.getElementById("overlay");

  if (welcome) welcome.classList.add("hidden");
  if (overlay) overlay.classList.remove("hidden");
}

function zeigWelcome() {
  const welcome = document.getElementById("welcome");
  const overlay = document.getElementById("overlay");

  if (welcome) welcome.classList.remove("hidden");
  if (overlay) overlay.classList.add("hidden");
}
