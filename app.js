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
// Gast suchen (Flexibel: Name, Tisch, Platz)
// ----------------------------
function sucheGast() {
  const query = document.getElementById("search").value.trim().toLowerCase();
  if (!query) return;

  // Suche nach Teil-Name, Tisch-Nr oder Platz-Nr
  const gast = gaeste.find(g => 
    g.name.toLowerCase().includes(query) ||
    String(g.tisch).toLowerCase() === query ||
    String(g.platz) === query
  );

  if (!gast) {
    alert("Kein passender Gast oder Tisch gefunden.");
    return;
  }

  // Views umschalten
  document.getElementById("welcome").classList.add("hidden");
  document.getElementById("overlay").classList.remove("hidden");
  document.getElementById("neueSucheBtn").classList.remove("hidden");

  // Highlights zurücksetzen
  document.querySelectorAll(".highlight").forEach(t => t.classList.remove("highlight"));

  // Ziel-Element ermitteln (Brauttisch oder normale Tisch-Box)
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

  speech.innerHTML = `
    <h2>${spruecheList[Math.floor(Math.random() * spruecheList.length)]}</h2>
    <p>Willkommen <b>${gast.name}</b>!<br>Tisch ${gast.tisch} (Platz ${gast.platz})</p>
  `;

  speech.classList.remove("hidden");

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

  setTimeout(() => {
    speech.classList.add("hidden");
  }, 5000);
}
