let gaeste = [];

document.addEventListener("DOMContentLoaded", () => {
  fetch("data.json")
    .then(res => res.json())
    .then(data => {
      gaeste = data;
      sitzplanErstellen();
    })
    .catch(err => console.error("Fehler beim Laden der Gästedaten:", err));

  document.getElementById("findenBtn")?.addEventListener("click", sucheGast);
  document.getElementById("search")?.addEventListener("keydown", e => {
    if (e.key === "Enter") sucheGast();
  });

  document.getElementById("zeigeGesamtenPlanBtn")?.addEventListener("click", zeigePlan);
  document.getElementById("neueSucheBtn")?.addEventListener("click", neueSuche);
});

function sitzplanErstellen() {
  const braut = document.getElementById("brauttisch");
  const tische = document.getElementById("tische");
  if (!braut || !tische) return;

  braut.innerHTML = "";
  tische.innerHTML = "";

  let brautGaeste = gaeste.filter(g => g.tisch === "Braut").sort((a,b) => a.platz - b.platz);
  
  // Plätze 1-7 in der oberen Reihe renderbar machen (Kästchen 8 bleibt bewusst ungenutzt)
  let obenBraut = brautGaeste.filter(g => g.platz >= 1 && g.platz <= 7);
  let untenBraut = brautGaeste.filter(g => g.platz >= 9 && g.platz <= 14);

  braut.innerHTML = `
    <div class="braut-reihe braut-oben">
      ${obenBraut.map(g => platzHTML(g)).join("")}
    </div>
    <div class="braut-platte">
      <span class="tisch-tag">Tisch 1</span>
      <span>👰🤵 Brauttisch</span>
      <span class="tisch-tag">Tisch 2</span>
    </div>
    <div class="braut-reihe braut-unten">
      ${untenBraut.map(g => platzHTML(g)).join("")}
    </div>
  `;

  let nummern = [...new Set(gaeste.filter(g => g.tisch !== "Braut").map(g => Number(g.tisch)))].sort((a,b) => a - b);
  
  nummern.forEach(nummer => {
    let personen = gaeste.filter(g => Number(g.tisch) === nummer).sort((a,b) => a.platz - b.platz);
    let haelfte = Math.ceil(personen.length / 2);
    let links = personen.slice(0, haelfte);
    let rechts = personen.slice(haelfte);

    let box = document.createElement("div");
    box.className = "tisch-box";
    box.dataset.tisch = nummer;

    box.innerHTML = `
      <div class="tisch-inhalt">
        <div class="seite links">${links.map(g => platzHTML(g)).join("")}</div>
        <div class="tisch-label"><span>${nummer}</span></div>
        <div class="seite rechts">${rechts.map(g => platzHTML(g)).join("")}</div>
      </div>
    `;
    tische.appendChild(box);
  });
}

function platzHTML(g) {
  if (!g.name) return `<div class="platz empty"></div>`;
  const star = g.isKind ? `<span class="kind-star" title="Kind">⭐</span>` : '';
  return `
    <div class="platz" data-name="${g.name.toLowerCase()}" data-platz="${g.platz}">
      <span class="platz-nr">${g.platz}</span>
      <span class="platz-name">${g.name} ${star}</span>
    </div>
  `;
}

function sucheGast() {
  const query = document.getElementById("search").value.trim().toLowerCase();
  if (!query) return;

  const treffer = gaeste.filter(g => 
    g.name.toLowerCase().includes(query) || 
    String(g.tisch) === query || 
    String(g.platz) === query
  );

  if (treffer.length === 0) {
    alert(`Kein Eintrag für "${query}" gefunden.`);
    return;
  }

  zeigePlan();
  let ziel = treffer[0];
  
  document.querySelectorAll(".highlight").forEach(el => el.classList.remove("highlight"));

  let el;
  if (ziel.tisch === "Braut") {
    el = document.getElementById("brauttisch");
  } else {
    el = document.querySelector(`.tisch-box[data-tisch="${ziel.tisch}"]`);
  }

  if (el) {
    el.classList.add("highlight");
    setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "center" }), 200);
  }

  if (typeof confetti === "function") {
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
  }
}

function zeigePlan() {
  document.getElementById("welcome")?.classList.add("hidden");
  document.getElementById("overlay")?.classList.remove("hidden");
  document.getElementById("neueSucheBtn")?.classList.remove("hidden");
}

function neueSuche() {
  document.getElementById("overlay")?.classList.add("hidden");
  document.getElementById("neueSucheBtn")?.classList.add("hidden");
  document.getElementById("welcome")?.classList.remove("hidden");
  const input = document.getElementById("search");
  if (input) { input.value = ""; input.focus(); }
}
