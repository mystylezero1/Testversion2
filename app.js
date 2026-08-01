// App Steuerung - Vollständiger & Bereinigter Code
// (Zuständig für Suche, Saalplan-Anzeige und Gastdaten)

// Globales Gäste-Array vorbereiten (falls aus data.json geladen wird)
window.gaeste = window.gaeste || [];

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

async function initApp() {
  // 1. Falls 'gaeste' noch leer ist, versuchen data.json per Fetch zu laden
  if (!window.gaeste || window.gaeste.length === 0) {
    try {
      const response = await fetch("data.json");
      if (response.ok) {
        window.gaeste = await response.json();
      }
    } catch (e) {
      console.warn("data.json konnte nicht direkt geladen werden. Nutze vorhandene Gästedaten.", e);
    }
  }

  // 2. Event-Listener für Suchfunktion & Saalplan-Modal initialisieren
  initSuchFunktion();
  initSaalplanModal();

  // 3. Initialen Saalplan rendern
  sitzplanErstellen();
}

// Such-Logik für Gäste, Tische und Sitznummern
function initSuchFunktion() {
  const sucheInput = document.getElementById("sucheInput") || document.querySelector(".input-search, input[type='text']");
  const sucheBtn = document.getElementById("sucheBtn") || document.querySelector(".btn-search, button[type='submit']");

  if (sucheBtn && sucheInput) {
    sucheBtn.addEventListener("click", (e) => {
      e.preventDefault();
      fuehreSucheAus(sucheInput.value);
    });

    sucheInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") {
        fuehreSucheAus(sucheInput.value);
      }
    });
  }
}

function fuehreSucheAus(query) {
  const term = query.trim().toLowerCase();
  if (!term) {
    alert("Bitte gib einen Namen, Tisch oder eine Sitznummer ein.");
    return;
  }

  // Gäste filtern (Name, Tisch oder Platznummer)
  const treffer = gaeste.filter(g => 
    g.name.toLowerCase().includes(term) ||
    String(g.tisch).toLowerCase().includes(term) ||
    String(g.platz).toLowerCase().includes(term)
  );

  const ergebnisContainer = document.getElementById("suchErgebnis") || document.getElementById("ergebnisContainer");

  if (treffer.length > 0) {
    if (ergebnisContainer) {
      ergebnisContainer.innerHTML = treffer.map(g => `
        <div class="gast-karte">
          <h3>${g.name} ${g.isKind ? "⭐" : ""}</h3>
          <p><strong>Tisch:</strong> ${g.tisch} | <strong>Platz:</strong> ${g.platz}</p>
        </div>
      `).join("");
      ergebnisContainer.classList.remove("hidden");
    } else {
      // Fallback-Popup, falls kein Suchergebnis-Container im HTML vorhanden ist
      const ergebnisText = treffer.map(g => `• ${g.name} ➔ Tisch: ${g.tisch}, Platz: ${g.platz}`).join("\n");
      alert(`Gefundene Gäste:\n\n${ergebnisText}`);
    }

    // Optionaler Soundeffekt (fängt 404-Fehler ab, falls ding.mp3 fehlt)
    playDingSound();
  } else {
    alert(`Keine Ergebnisse für "${query}" gefunden.`);
  }
}

// Saalplan Modal Steuerung
function initSaalplanModal() {
  const saalplanBtn = document.getElementById("saalplanBtn") || document.getElementById("showSaalplanBtn");
  const saalplanModal = document.getElementById("saalplanModal");
  const closeBtns = document.querySelectorAll("#saalplanModal .close, #saalplanModal .close-btn");

  if (saalplanBtn && saalplanModal) {
    saalplanBtn.addEventListener("click", () => {
      sitzplanErstellen(); // Saalplan vor dem Öffnen frisch zeichnen
      saalplanModal.classList.remove("hidden");
    });
  }

  closeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      if (saalplanModal) saalplanModal.classList.add("hidden");
    });
  });
}

// Generiert die Tischübersicht dynamisch im HTML
function sitzplanErstellen() {
  const container = document.getElementById("saalplanContainer") || document.getElementById("tischeContainer");
  if (!container) return;

  container.innerHTML = "";

  // Nach Tischen gruppieren
  const tische = {};
  gaeste.forEach(gast => {
    const tischKey = gast.tisch || "Unbekannt";
    if (!tische[tischKey]) tische[tischKey] = [];
    tische[tischKey].push(gast);
  });

  // Tische rendern
  Object.keys(tische).forEach(tischName => {
    const tischDiv = document.createElement("div");
    tischDiv.className = "tisch-karte";

    // Plätze aufsteigend sortieren
    tische[tischName].sort((a, b) => a.platz - b.platz);

    const gaesteListe = tische[tischName].map(g => 
      `<li>Platz ${g.platz}: <strong>${g.name}</strong> ${g.isKind ? "⭐" : ""}</li>`
    ).join("");

    tischDiv.innerHTML = `
      <h3>Tisch: ${tischName}</h3>
      <ul>${gaesteListe}</ul>
    `;
    container.appendChild(tischDiv);
  });
}

// Sichere Sound-Funktion (verhindert Konsolenfehler, falls mp3 nicht existiert)
function playDingSound() {
  try {
    const audio = new Audio("ding.mp3");
    audio.play().catch(() => {
      // Stillschweigend abfangen, wenn Audio fehlt oder vom Browser blockiert wird
    });
  } catch (e) {
    // Fehler ignorieren
  }
}
