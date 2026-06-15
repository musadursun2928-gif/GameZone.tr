/* ===== GameZone — App Logic ===== */

const SAMPLE_GAMES = [];
const ADMIN_PASSWORD = "gamezone2928";

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

    // ESC key
    document.addEventListener("keydown", e => {
        if (e.key === "Escape") {
            closeGame();
            document.getElementById("adminLoginModal").classList.remove("open");
            document.getElementById("adminPanelModal").classList.remove("open");
            document.body.style.overflow = "";
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

    // ===== SECRET ADMIN =====

    // Logo'ya 3 kere tıkla
    let logoClicks = 0;
    let logoTimer = null;
    document.querySelector(".logo").addEventListener("click", e => {
        e.preventDefault();
        logoClicks++;
        clearTimeout(logoTimer);
        logoTimer = setTimeout(() => { logoClicks = 0; }, 1500);
        if (logoClicks >= 3) {
            logoClicks = 0;
            openAdminLogin();
        }
    });

    // Ctrl + Shift + A
    document.addEventListener("keydown", e => {
        if (e.ctrlKey && e.shiftKey && e.key === "A") {
            e.preventDefault();
            openAdminLogin();
        }
    });

    // Admin login form
    document.getElementById("adminLoginForm").addEventListener("submit", e => {
        e.preventDefault();
        const pass = document.getElementById("adminPassword").value;
        if (pass === ADMIN_PASSWORD) {
            document.getElementById("adminLoginModal").classList.remove("open");
            document.getElementById("adminPassword").value = "";
            document.getElementById("adminLoginError").textContent = "";
            openAdminPanel();
        } else {
            document.getElementById("adminLoginError").textContent = "❌ Yanlış şifre!";
        }
    });

    // Admin login close
    document.getElementById("adminLoginClose").addEventListener("click", () => {
        document.getElementById("adminLoginModal").classList.remove("open");
        document.getElementById("adminPassword").value = "";
        document.getElementById("adminLoginError").textContent = "";
        document.body.style.overflow = "";
    });
    document.getElementById("adminLoginModal").addEventListener("click", e => {
        if (e.target === e.currentTarget) {
            document.getElementById("adminLoginModal").classList.remove("open");
            document.body.style.overflow = "";
        }
    });

    // Admin panel close
    document.getElementById("adminPanelClose").addEventListener("click", () => {
        document.getElementById("adminPanelModal").classList.remove("open");
        document.body.style.overflow = "";
    });
    document.getElementById("adminPanelModal").addEventListener("click", e => {
        if (e.target === e.currentTarget) {
            document.getElementById("adminPanelModal").classList.remove("open");
            document.body.style.overflow = "";
        }
    });

    // Admin add game form
    document.getElementById("adminAddForm").addEventListener("submit", adminAddGame);
}

// ===== ADMIN FUNCTIONS =====

function openAdminLogin() {
    document.getElementById("adminLoginModal").classList.add("open");
    document.body.style.overflow = "hidden";
    document.getElementById("adminPassword").focus();
}

function openAdminPanel() {
    document.getElementById("adminPanelModal").classList.add("open");
    document.body.style.overflow = "hidden";
    renderAdminGameList();
}

function renderAdminGameList() {
    const list = document.getElementById("adminGameList");
    if (games.length === 0) {
        list.innerHTML = '<p style="color:#4a5568; text-align:center; padding:20px;">Henüz oyun eklenmedi.</p>';
        return;
    }
    list.innerHTML = games.map(g => `
        <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:8px; padding:12px 16px; margin-bottom:8px;">
            <div style="display:flex; align-items:center; gap:12px;">
                <span style="font-size:1.3rem;">${g.emoji || "🎮"}</span>
                <div>
                    <span style="font-weight:600; font-size:0.85rem;">${g.name}</span>
                    <span style="font-family:'Orbitron',sans-serif; font-size:0.5rem; font-weight:600; letter-spacing:1px; padding:2px 6px; border-radius:4px; background:rgba(0,229,255,0.1); color:#00e5ff; margin-left:8px;">${g.category.toUpperCase()}</span>
                </div>
            </div>
            <button onclick="adminDeleteGame(${g.id})" style="background:none; border:1px solid rgba(255,45,123,0.3); color:#ff2d7b; padding:6px 14px; border-radius:6px; cursor:pointer; font-family:'Orbitron',sans-serif; font-size:0.55rem; font-weight:700; letter-spacing:1px; transition:all 0.3s;">SİL</button>
        </div>
    `).join("");
}

function adminAddGame(e) {
    e.preventDefault();
    const name = document.getElementById("adminGameName").value.trim();
    const category = document.getElementById("adminGameCategory").value;
    const url = document.getElementById("adminGameUrl").value.trim();
    const image = document.getElementById("adminGameImage").value.trim();
    const status = document.getElementById("adminAddStatus");

    if (!name || !url) return;

    const emojiMap = { aksiyon: "💥", bulmaca: "🧩", yarış: "🏎️", spor: "⚽", strateji: "🏰" };

    games.unshift({
        id: Date.now(),
        name: name,
        category: category,
        emoji: emojiMap[category] || "🎮",
        url: url,
        plays: 0,
        image: image || null
    });

    saveGames();
    renderGames();
    renderAdminGameList();

    document.getElementById("adminAddForm").reset();
    status.textContent = "✅ " + name + " eklendi!";
    status.style.color = "#34d399";
    setTimeout(() => { status.textContent = ""; }, 3000);
}

function adminDeleteGame(id) {
    const game = games.find(g => g.id === id);
    if (!game) return;
    if (!confirm(game.name + " silinsin mi?")) return;
    games = games.filter(g => g.id !== id);
    saveGames();
    renderGames();
    renderAdminGameList();
}

// ===== GAME MODAL =====

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

function getCategoryEmoji(cat) {
    const map = { aksiyon: "💥", bulmaca: "🧩", yarış: "🏎️", spor: "⚽", strateji: "🏰" };
    return map[cat] || "🎮";
}

document.addEventListener("DOMContentLoaded", init);
