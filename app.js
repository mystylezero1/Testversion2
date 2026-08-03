function sitzplanErstellen() {
  const braut = document.getElementById("brauttisch");
  const tischeContainer = document.getElementById("tische");

  if (!braut || !tischeContainer) return;

  braut.innerHTML = "";
  tischeContainer.innerHTML = "";

  // 1. Brauttisch Layout (Oben 1-7, Mitte Tag, Unten 9-14)
  const brautGaeste = gaeste.filter(g => String(g.tisch).toLowerCase() === "braut");
  const brautOben = brautGaeste.filter(g => g.platz <= 7).sort((a,b) => a.platz - b.platz);
  const brautUnten = brautGaeste.filter(g => g.platz > 7).sort((a,b) => a.platz - b.platz);

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

  // 2. Tisch-Gruppen / Reihen laut Screenshot definieren
  const reihenLayout = [
    [3, 4, 5, 6, 7],               // Reihe 1
    [8, 9, 10, 11, 12, "buffet"],  // Reihe 2 (inkl. Ausschank & Buffet)
    [13, 14, 15, 16],              // Reihe 3
    [17, 18, 19, 20]               // Reihe 4
  ];

  reihenLayout.forEach(reihe => {
    const reiheDiv = document.createElement("div");
    reiheDiv.className = "tisch-reihe";

    reihe.forEach(item => {
      if (item === "buffet") {
        // Ausschank & Buffet Box rechts in Reihe 2
        const buffetBox = document.createElement("div");
        buffetBox.className = "buffet-box";
        buffetBox.innerHTML = `<span>➔<br>Ausschank &amp; Buffet</span>`;
        reiheDiv.appendChild(buffetBox);
      } else {
        // Normaler Tisch
        const tischNr = item;
        const box = document.createElement("div");
        box.className = "tisch-box";
        box.dataset.tisch = tischNr;

        const tischGaeste = gaeste.filter(g => String(g.tisch) === String(tischNr));
        tischGaeste.sort((a, b) => a.platz - b.platz);

        // Aufteilung Links / Rechts
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
