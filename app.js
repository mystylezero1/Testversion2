let gaeste = [];

const soundMode = "fun";

const sprueche = [
    "🎉 Heey! Da bist du ja!",
    "🥳 Jackpot! Dein Tisch wartet!",
    "🍾 Jetzt wird gefeiert!",
    "🎊 Willkommen!",
    "🥂 Viel Spaß auf der Hochzeit!",
    "😄 Schön, dass du da bist!"
];

// ----------------------------
// Daten laden
// ----------------------------

fetch("data.json")
.then(r => r.json())
.then(data => {

    gaeste = data;

    sitzplanErstellen();

});

// ----------------------------
// Sitzplan erstellen
// ----------------------------

function sitzplanErstellen(){

    const braut = document.getElementById("brauttisch");
    const tische = document.getElementById("tische");

    braut.innerHTML = "";
    tische.innerHTML = "";

    // Brauttisch

    const brautGaeste = gaeste.filter(
        g => g.tisch === "Braut"
    );

    braut.innerHTML = erstellePlaetze(brautGaeste);

    // normale Tische

    const liste = [
        ...new Set(
            gaeste
            .filter(g => g.tisch !== "Braut")
            .map(g => g.tisch)
        )
    ];

    liste.sort((a,b)=>Number(a)-Number(b));

    liste.forEach(tisch=>{

        const box = document.createElement("div");

        box.className = "tisch";

        box.dataset.tisch = tisch;

        box.innerHTML = `
            <h3>Tisch ${tisch}</h3>
            ${erstellePlaetze(
                gaeste.filter(g=>g.tisch==tisch)
            )}
        `;

        tische.appendChild(box);

    });

}

// ----------------------------
// Plätze erzeugen
// ----------------------------

function erstellePlaetze(liste){

    return liste.map(g=>`

        <div
            class="platz"
            data-name="${g.name.toLowerCase()}">

            ${g.name}

        </div>

    `).join("");

}
