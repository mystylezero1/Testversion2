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
// ----------------------------
// Sprache
// ----------------------------

function sprich(text){

    if(soundMode==="off") return;

    if(!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const s = new SpeechSynthesisUtterance(text);

    s.lang = "de-DE";
    s.rate = 1;
    s.pitch = 1.1;
    s.volume = 1;

    window.speechSynthesis.speak(s);

}

// ----------------------------
// Suche
// ----------------------------

document
.getElementById("finden")
.addEventListener("click", sucheGast);

document
.getElementById("search")
.addEventListener("keydown", e=>{

    if(e.key==="Enter"){

        sucheGast();

    }

});

// ----------------------------
// Gast suchen
// ----------------------------

function sucheGast(){

    const suche = document
    .getElementById("search")
    .value
    .trim()
    .toLowerCase();

    if(suche==="") return;

    const gast = gaeste.find(
        g=>g.name.toLowerCase()===suche
    );

    if(!gast){

        alert("Name nicht gefunden.");

        return;

    }

    document
    .getElementById("welcome")
    .classList.add("hidden");

    document
    .getElementById("overlay")
    .classList.remove("hidden");

    document
    .querySelectorAll(".highlight")
    .forEach(t=>t.classList.remove("highlight"));

    const tisch = document.querySelector(
        `.tisch[data-tisch="${gast.tisch}"]`
    );

    if(tisch){

        tisch.classList.add("highlight");

        tisch.scrollIntoView({

            behavior:"smooth",
            block:"center"

        });

    }

    const speech = document.getElementById("speech");

    speech.innerHTML = `

        <h2>

        ${sprueche[
            Math.floor(Math.random()*sprueche.length)
        ]}

        </h2>

        <p>

        Willkommen <b>${gast.name}</b>

        <br><br>

        Viel Spaß auf der Hochzeit
        von Anja & Dino 🥂

        </p>

    `;

    speech.classList.remove("hidden");

    // Konfetti

    if(typeof confetti==="function"){

        confetti({

            particleCount:120,
            spread:80,
            origin:{y:0.6}

        });

    }

    // Sprachmodus

    if(soundMode==="fun"){

        const texte=[

            `Heey ${gast.name}! Da bist du ja!`,

            `${gast.name}! Jackpot! Dein Tisch wartet!`,

            `Willkommen ${gast.name}! Jetzt wird gefeiert!`,

            `${gast.name}! Anja und Dino wünschen dir einen wunderschönen Abend!`,

            `Viel Spaß ${gast.name}!`

        ];

        sprich(

            texte[
                Math.floor(Math.random()*texte.length)
            ]

        );

    }

    // Chime

    const audio=document.getElementById("ding");

    if(audio){

        audio.currentTime=0;

        audio.play().catch(()=>{});

    }

    setTimeout(()=>{

        speech.classList.add("hidden");

    },5000);

}
