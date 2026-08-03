// --- Globale Variablen ---
let saalData = null;
window.aktuellesSuchErgebnis = [];

// --- Initialisierung ---
document.addEventListener("DOMContentLoaded", () => {
  loadData();
  initSearchEvents();
});

// --- Daten laden & flexibel Rendern ---
async function loadData() {
  try {
    const response = await fetch("data.json");
    if (!response.ok) throw new Error("Netzwerk-Antwort war nicht ok");
    saalData = await response.json();
    
    // Prüfen, ob eine eigene Render-Funktion existiert, sonst Standard nutzen
    if (typeof renderCustomPlan === "function") {
      renderCustomPlan(saalData);
    } else {
      renderSaalplanFlexibel(saalData);
    }
  } catch (error) {
    console.error("Fehler beim Laden der Sitzplan-Daten:", error);
  }
}

function renderSaalplanFlexibel(data) {
  const tischeContainer = document.getElementById("tische");
  if (!tischeContainer) return;

  // Falls die Tische bereits fest im HTML stehen oder anders gerendert werden,
  // lassen wir das HTML unangetastet, wenn kein tische-Array übergeben wurde.
  if (!data || (!data.tische && !data.reihen && !Array.isArray(data))) return;

  tischeContainer.innerHTML = "";

  // Datenformat vereinheitlichen (egal ob Array oder Objekt)
  let tischeListe = [];
  if (Array.isArray(data)) {
    tischeListe = data;
  } else if (data.tische && Array.isArray(data.tische)) {
    tischeListe = data.tische;
  }

  if (tischeListe.length > 0) {
    // Tische in 5er/6er Reihen aufteilen
    // Reihe 1: T1-5, Reihe 2: T6-10, Reihe 3: T11-12 + Buffet, Reihe 4: T13-20
    let aktuelleReihe = document.createElement("div");
    aktuelleReihe.className = "tisch-reihe";

    tischeListe.forEach((tisch, index) => {
      const tischBox = createTischElement(tisch);
      aktuelleReihe.appendChild(tischBox);

      // Nach Tisch 12 (in Reihe 3) das Buffet anheften
      if (tisch.id == 12 || tisch.label == "Tisch 12") {
        const buffetDiv = document.createElement("div");
        buffetDiv.className = "buffet-box";
        buffetDiv.innerHTML = "➔<br>Ausschank & Buffet";
        aktuelleReihe.appendChild(buffetDiv);
      }

      // Neue Reihe alle 5 Tische anfangen (oder wenn Reihe voll ist)
      if ((index + 1) % 5 === 0 || index === tischeListe.length - 1) {
        tischeContainer.appendChild(aktuelleReihe);
        aktuelleReihe = document.createElement("div");
        aktuelleReihe.className = "tisch-reihe";
      }
    });
  }
}

function createTischElement(tisch) {
  const tischBox = document.createElement("div");
  tischBox.className = "tisch-box";
  tischBox.dataset.tischId = tisch.id || "";

  const inhalt = document.createElement("div");
  inhalt.className = "tisch-inhalt";

  const linksDiv = document.createElement("div");
  linksDiv.className = "seite links";
  (tisch.links || tisch.gaesteLinks || []).forEach(g => linksDiv.appendChild(createPlatzElement(g)));

  const labelDiv = document.createElement("div");
  labelDiv.className = "tisch-label";
  labelDiv.innerText = tisch.label || `Tisch ${tisch.id || ""}`;

  const rechtsDiv = document.createElement("div");
  rechtsDiv.className = "seite rechts";
  (tisch.rechts || tisch.gaesteRechts || []).forEach(g => rechtsDiv.appendChild(createPlatzElement(g)));

  inhalt.appendChild(linksDiv);
  inhalt.appendChild(labelDiv);
  inhalt.appendChild(rechtsDiv);

  tischBox.appendChild(inhalt);
  return tischBox;
}

function createPlatzElement(gast) {
  const platz = document.createElement("div");
  platz.className = "platz";
  const name = typeof gast === "string" ? gast : (gast.name || "");
  const sitz = gast.sitz || "";
  const istKind = gast.kind ? '<span class="kind-star">★</span>' : "";

  platz.innerHTML = `
    <span class="platz-nr">${sitz}</span>
    <span class="platz-name">${name}</span>
    ${istKind}
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
