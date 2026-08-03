let gaeste = [];
const soundMode = "fun";

// ----------------------------
// Daten laden (mit Fallback)
// ----------------------------
document.addEventListener("DOMContentLoaded", () => {
  const inlineData = document.getElementById("data-json");
  if (inlineData && inlineData.textContent.trim()) {
    try {
      gaeste = JSON.parse(inlineData.textContent);
      sitzplanErstellen();
    } catch (e) {
      console.warn("Inline JSON fehlerhaft, versuche fetch...");
      loadViaFetch();
    }
  } else {
    loadViaFetch();
  }

  initAppEvents();
});

function loadViaFetch() {
  fetch("data.json")
    .then(r => r.json())
    .then(data => {
      gaeste = data;
      sitzplanErstellen();
    })
    .catch(err => console.error("Fehler beim Laden der Gästedaten:", err));
}

// ----------------------------
// Events initialisieren
// ----------------------------
function initAppEvents() {
  const findenBtn = document.getElementById("findenBtn");
  const searchInput = document.getElementById("search");
  const zeigePlanBtn = document.getElementById("zeigeGesamtenPlanBtn");
  const neueSucheBtn = document.getElementById("neueSucheBtn");

  if (findenBtn) findenBtn.addEventListener("click", sucheGast);
  if (searchInput) {
    searchInput.addEventListener("keydown", e => {
      if (e.key === "Enter") sucheGast();
    });
  }

  if (zeigePlanBtn) {
    zeigePlanBtn.addEventListener("click", () => {
      document.getElementById("welcome").classList.add("hidden");
      document.getElementById("overlay").classList.remove("hidden");
      document.getElementById("neueSucheBtn").classList.remove("hidden");
    });
  }

  if (neueSucheBtn) {
    neueSucheBtn.addEventListener("click", () => {
      document.getElementById("overlay").classList.add("hidden");
      document.getElementById("neueSucheBtn").classList.add("hidden");
      document.getElementById("welcome").classList.remove("hidden");
      document.getElementById("search").value = "";
      document.getElementById("search").focus();
    });
  }
}

// ----------------------------
// Sitzplan erstellen (4-Reihen Layout + Brauttisch & Buffet)
// ----------------------------
function sitzplanErstellen() {
  const braut = document.getElementById("brauttisch");
  const tischeContainer = document.getElementById("tische");

  if (!braut || !tischeContainer) return;

  braut.innerHTML = "";
  tischeContainer.innerHTML = "";

  // 1. Brauttisch Aufteilung (Plätze <= 7 oben, Plätze > 7 unten)
  const brautGaeste = gaeste.filter(g => String(g.tisch).toLowerCase() === "braut");
  const brautOben = brautGaeste.filter(g => Number(g.platz) <= 7).sort((a,b) => a.platz - b.platz);
  const brautUnten = brautGaeste.filter(g => Number(g.platz) > 7).sort((a,b) => a.platz - b.platz);

  braut.innerHTML = `
    <div class="braut-reihe">
      ${brautOben.map(g => renderPlatzHtml(g)).join("")}
    </div>
    <div class="braut-platte">
      <span class="tisch-tag">TISCH 1</span>
      <span>👸 🤴 Brauttisch</span>
      <span class="tisch-tag">TISCH 2</span>
    </div>
    <div class="braut-reihe">
      ${brautUnten.map(g => renderPlatzHtml(g)).join("")}
    </div>
  `;

  // 2. Tisch-Reihen laut Grundriss
  const reihenLayout = [
    [3, 4, 5, 6, 7],               // Reihe 1
    [8, 9, 10, 11, 12, "buffet"],  // Reihe 2 (inkl. Buffet-Box rechts)
    [13, 14, 15, 16],              // Reihe 3
    [17, 18, 19, 20]               // Reihe 4
  ];

  reihenLayout.forEach(reihe => {
    const reiheDiv = document.createElement("div");
    reiheDiv.className = "tisch-reihe";

    reihe.forEach(item => {
      if (item === "buffet") {
        const buffetBox = document.createElement("div");
        buffetBox.className = "buffet-box";
        buffetBox.innerHTML = `<span>➔<br>Ausschank &amp; Buffet</span>`;
        reiheDiv.appendChild(buffetBox);
      } else {
        const tischNr = item;
        const box = document.createElement("div");
        box.className = "tisch-box";
        box.dataset.tisch = tischNr;

        const tischGaeste = gaeste.filter(g => String(g.tisch) === String(tischNr));
        tischGaeste.sort((a, b) => Number(a.platz) - Number(b.platz));

        const links = tischGaeste.filter((_, idx) => idx % 2 === 0);
        const rechts = tischGaeste.filter((_, idx) => idx % 2 !== 0);

        box.innerHTML = `
          <div class="tisch-inhalt">
            <div class="seite">${links.map(g => renderPlatzHtml(g)).join("")}</div>
            <div class="tisch-label">${tischNr}</div>
            <div class="seite">${rechts.map(g => renderPlatzHtml(g)).join("")}</div>
          </div>
        `;
        reiheDiv.appendChild(box);
      }
    });

    tischeContainer.appendChild(reiheDiv);
  });
}

function renderPlatzHtml(g) {
  return `
    <div class="platz" data-name="${g.name.toLowerCase()}" data-platz="${g.platz}">
      <span class="platz-nr">${g.platz}</span>
      <span class="platz-name">${g.name}</span>
      ${g.isKind ? '<span class="kind-star">⭐</span>' : ''}
    </div>
  `;
}

// ----------------------------
// Sprache
// ----------------------------
function sprich(text) {
  if (soundMode === "off" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();

  const s = new SpeechSynthesisUtterance(text);
  s.lang = "de-DE";
  s.rate = 1;
  s.pitch = 1.1;
  s.volume = 1;

  window.speechSynthesis.speak(s);
}

// ----------------------------
// Gast suchen (Mehrfach-Treffer unterstützt)
// ----------------------------
window.aktuellesSuchErgebnis = [];

function sucheGast() {
  const query = document.getElementById("search").value.trim().toLowerCase();
  if (!query) return;

  // ALLE passenden Gäste finden (nicht nur den ersten)
  const treffer = gaeste.filter(g => 
    g.name.toLowerCase().includes(query) ||
    String(g.tisch).toLowerCase() === query ||
    String(g.platz) === query
  );

  if (treffer.length === 0) {
    alert("Kein passender Gast oder Tisch gefunden.");
    return;
  }

  if (treffer.length === 1) {
    fokussiereGast(treffer[0]);
  } else {
    zeigGastAuswahlModal(treffer);
  }
}

function fokussiereGast(gast) {
  // Views umschalten
  document.getElementById("welcome").classList.add("hidden");
  document.getElementById("overlay").classList.remove("hidden");
  document.getElementById("neueSucheBtn").classList.remove("hidden");

  // Highlights zurücksetzen
  document.querySelectorAll(".highlight").forEach(t => t.classList.remove("highlight"));

  // Ziel-Element ermitteln
  let zielElement = null;
  if (String(gast.tisch).toLowerCase() === "braut") {
    zielElement = document.getElementById("brauttisch");
  } else {
    zielElement = document.querySelector(`.tisch-box[data-tisch="${gast.tisch}"]`);
  }

  if (zielElement) {
    zielElement.classList.add("highlight");
    zielElement.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // Benachrichtigung anzeigen
  const speech = document.getElementById("speech");
  const spruecheList = (typeof CONFIG !== "undefined" && CONFIG.sprueche) ? CONFIG.sprueche : [
    "🎉 Heey! Da bist du ja!",
    "🥳 Jackpot! Dein Tisch wartet!",
    "🍾 Jetzt wird gefeiert!"
  ];

  if (speech) {
    speech.innerHTML = `
      <h2>${spruecheList[Math.floor(Math.random() * spruecheList.length)]}</h2>
      <p>Willkommen <b>${gast.name}</b>!<br>Tisch ${gast.tisch} (Platz ${gast.platz})</p>
    `;
    speech.classList.remove("hidden");

    setTimeout(() => {
      speech.classList.add("hidden");
    }, 5000);
  }

  if (typeof confetti === "function") {
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
  }

  if (soundMode === "fun") {
    sprich(`Hallo ${gast.name}! Du sitzt an Tisch ${gast.tisch}. Viel Spaß auf der Hochzeit!`);
  }

  const audio = document.getElementById("ding");
  if (audio) {
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }
}

// Modal für mehrere Treffer
function zeigGastAuswahlModal(trefferListe) {
  window.aktuellesSuchErgebnis = trefferListe;

  let modalHtml = `
    <div id="search-modal" class="modal">
      <div class="glass-card" style="max-width: 400px; width: 90%; margin: auto; padding: 20px; background: rgba(255,255,255,0.95); border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h3 style="margin: 0; font-size: 20px; color: #333;">Mehrere Gäste gefunden</h3>
          <span style="cursor: pointer; font-size: 24px; line-height: 1;" onclick="schliesseSearchModal()">&times;</span>
        </div>
        <p style="font-size: 14px; color: #666; margin-bottom: 15px;">Bitte wähle deinen Namen aus:</p>
        <div style="display: flex; flex-direction: column; gap: 8px; max-height: 250px; overflow-y: auto;">
  `;

  trefferListe.forEach((gast, index) => {
    const tischLabel = String(gast.tisch).toLowerCase() === "braut" ? "Brauttisch" : `Tisch ${gast.tisch}`;
    modalHtml += `
      <button style="text-align: left; padding: 12px 15px; background: #f5f5f7; border: 1px solid #ddd; border-radius: 10px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-size: 15px;" 
              onclick="waehleGastAus(${index})">
        <span><strong>${gast.name}</strong></span>
        <span style="font-size: 12px; opacity: 0.7; background: #e0e0e0; padding: 3px 8px; border-radius: 6px;">${tischLabel}</span>
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
  const zielGast = window.aktuellesSuchErgebnis[index];
  schliesseSearchModal();
  if (zielGast) {
    fokussiereGast(zielGast);
  }
}

function schliesseSearchModal() {
  const modal = document.getElementById("search-modal");
  if (modal) modal.remove();
}
