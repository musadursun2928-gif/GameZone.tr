/* ===== GameZone — App Logic ===== */

const SAMPLE_GAMES = [];

let games = [];
let searchQuery = "";

function init() {
    loadGames();
    renderGames();
    bindEvents();
}

function loadGames() {
    const stored = localStorage.getItem("gamezone_games");
    if (stored) {
        games = JSON.parse(stored);
    } else {
        games = [...SAMPLE_GAMES];
        saveGames();
    }
}

function saveGames() {
    localStorage.setItem("gamezone_games", JSON.stringify(games));
}

function renderGames() {
    const grid = document.getElementById("gamesGrid");
    const noResults = document.getElementById("noResults");

    const filtered = games.filter(g =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filtered.length === 0) {
        grid.innerHTML = "";
        noResults.style.display = "block";
        return;
    }
    noResults.style.display = "none";

    grid.innerHTML = filtered.map(g => `
        <div class="game-card" data-id="${g.id}">
            <div class="game-card-img">
                ${g.image ? `<img src="${g.image}" alt="${g.name}">` : g.emoji}
            </div>
            <div class="game-card-body">
                <div class="game-card-title">${g.name}</div>
                <div class="game-card-meta">
                    <span class="game-card-cat">${g.category}</span>
                    <span class="game-card-plays">▶ ${formatPlays(g.plays)}</span>
                </div>
            </div>
        </div>
    `).join("");
}

function formatPlays(n) {
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    return n.toString();
}

function bindEvents() {
    // Search
    document.getElementById("searchInput").addEventListener("input", e => {
        searchQuery = e.target.value;
        renderGames();
    });

    // Game card click
    document.getElementById("gamesGrid").addEventListener("click", e => {
        const card = e.target.closest(".game-card");
        if (!card) return;
        openGame(parseInt(card.dataset.id));
    });

    // Close game modal
    document.getElementById("modalClose").addEventListener("click", closeGame);
    document.getElementById("gameModal").addEventListener("click", e => {
        if (e.target === e.currentTarget) closeGame();
    });

    // Admin button opens upload
    document.getElementById("fabUpload").addEventListener("click", () => {
        document.getElementById("uploadModal").classList.add("open");
    });
    document.getElementById("uploadClose").addEventListener("click", () => {
        document.getElementById("uploadModal").classList.remove("open");
    });
    document.getElementById("uploadModal").addEventListener("click", e => {
        if (e.target === e.currentTarget) document.getElementById("uploadModal").classList.remove("open");
    });

    // Upload form
    document.getElementById("uploadForm").addEventListener("submit", handleUpload);

    // ESC key
    document.addEventListener("keydown", e => {
        if (e.key === "Escape") {
            closeGame();
            document.getElementById("uploadModal").classList.remove("open");
        }
    });

    // Smooth scroll for nav links
    document.querySelectorAll('.nav-link[href^="#"]').forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute("href"));
            if (target) target.scrollIntoView({ behavior: "smooth" });
        });
    });
}

function openGame(id) {
    const game = games.find(g => g.id === id);
    if (!game) return;
    game.plays++;
    saveGames();

    document.getElementById("modalTitle").textContent = game.name;
    document.getElementById("modalCategory").textContent = game.category.toUpperCase();
    document.getElementById("modalPlays").textContent = "▶ " + formatPlays(game.plays) + " oynama";
    document.getElementById("modalGameContainer").innerHTML = `<iframe src="${game.url}" allowfullscreen></iframe>`;
    document.getElementById("gameModal").classList.add("open");
    document.body.style.overflow = "hidden";
}

function closeGame() {
    document.getElementById("gameModal").classList.remove("open");
    document.getElementById("modalGameContainer").innerHTML = "";
    document.body.style.overflow = "";
}

function handleUpload(e) {
    e.preventDefault();
    const statusEl = document.getElementById("uploadStatus");
    const name = document.getElementById("uploadName").value.trim();
    const category = document.getElementById("uploadCategory").value;
    const url = document.getElementById("uploadUrl").value.trim();
    const imageFile = document.getElementById("uploadImage").files[0];

    if (!name || !url) return;

    const newGame = {
        id: Date.now(),
        name: name,
        category: category,
        emoji: getCategoryEmoji(category),
        url: url,
        plays: 0,
        image: null
    };

    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function (ev) {
            newGame.image = ev.target.result;
            addGame(newGame, statusEl);
        };
        reader.readAsDataURL(imageFile);
    } else {
        addGame(newGame, statusEl);
    }
}

function addGame(game, statusEl) {
    games.unshift(game);
    saveGames();
    renderGames();

    statusEl.textContent = "✅ Oyun başarıyla yüklendi!";
    statusEl.className = "upload-status success";
    document.getElementById("uploadForm").reset();

    setTimeout(() => {
        document.getElementById("uploadModal").classList.remove("open");
        statusEl.textContent = "";
    }, 1500);
}

function getCategoryEmoji(cat) {
    const map = { aksiyon: "💥", bulmaca: "🧩", yarış: "🏎️", spor: "⚽", strateji: "🏰" };
    return map[cat] || "🎮";
}

document.addEventListener("DOMContentLoaded", init);
