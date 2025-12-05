let top3 = [];

const topList = document.getElementById("top-list");
const artistSelect = document.getElementById("artist-select");
const addBtn = document.getElementById("add-btn");
const feedback = document.getElementById("feedback");
const emptyInfo = document.querySelector(".empty-info");

// lista fixa de artistas
const allArtists = [
    "Niink", "Ga", "Ghard", "Veigh",
    "Lukkas", "MC Kadu", "Nagalli"
];

function renderTop3() {
    topList.innerHTML = "";

    top3.forEach((artist) => {
        const li = document.createElement("li");
        li.textContent = artist;
        topList.appendChild(li);
    });

    emptyInfo.style.display = top3.length === 0 ? "block" : "none";
}

addBtn.addEventListener("click", () => {
    const selected = artistSelect.value;
    feedback.textContent = "";

    if (!selected) {
        feedback.textContent = "Escolha um artista primeiro.";
        return;
    }

    // ------------------------------
    // 🧠 REGRA ESPECIAL DO NAGALLI
    // ------------------------------
    if (selected === "Nagalli") {
        const available = allArtists.filter(a =>
            a !== "Nagalli" && !top3.includes(a)
        );

        if (available.length === 0) {
            feedback.textContent = "Não há artistas disponíveis para sortear.";
            return;
        }

        // sortear um artista que não está no top3
        const randomArtist =
            available[Math.floor(Math.random() * available.length)];

        if (top3.length < 3) {
            top3.push(randomArtist);
        } else {
            top3[2] = randomArtist;
        }

        renderTop3();
        feedback.textContent = `${randomArtist} foi sorteado!`;
        return;
    }

    // ------------------------------
    // fluxo normal
    // ------------------------------
    if (top3.includes(selected)) {
        feedback.textContent = "Esse artista já está no ranking.";
        return;
    }

    if (top3.length >= 3) {
        feedback.textContent = "O ranking já tem 3 artistas.";
        return;
    }

    top3.push(selected);
    renderTop3();
    feedback.textContent = `${selected} foi adicionado ao Top 3!`;
});

renderTop3();
