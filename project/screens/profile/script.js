/**
 * ThinkBin Profile JavaScript Engine
 */

// Borders Config mapping to assets/filters from Toko
const bordersConfig = {
  1: { id: 1, name: "Eco Green", image: "../toko/assets/border1.png", filter: "" },
  2: { id: 2, name: "Autumn Forest", image: "../toko/assets/border1.png", filter: "hue-rotate(30deg) saturate(1.2) brightness(0.95)" },
  3: { id: 3, name: "Sakura Pink", image: "../toko/assets/border1.png", filter: "hue-rotate(240deg) saturate(1.4)" },
  4: { id: 4, name: "Ocean Guardian", image: "../toko/assets/border2.png", filter: "hue-rotate(180deg) saturate(1.1)" },
  5: { id: 5, name: "Forest Guardian", image: "../toko/assets/border2.png", filter: "" },
  6: { id: 6, name: "Twilight Guardian", image: "../toko/assets/border2.png", filter: "hue-rotate(90deg) saturate(1.2)" },
  7: { id: 7, name: "Crystal Ice", image: "../toko/assets/border3.png", filter: "" },
  8: { id: 8, name: "Crystal Amethyst", image: "../toko/assets/border3.png", filter: "hue-rotate(70deg) saturate(1.2)" },
  9: { id: 9, name: "Crystal Ruby", image: "../toko/assets/border3.png", filter: "hue-rotate(220deg) saturate(1.3)" },
  10: { id: 10, name: "Emerald Royal", image: "../toko/assets/border4.png", filter: "" },
  11: { id: 11, name: "Sapphire Royal", image: "../toko/assets/border4.png", filter: "hue-rotate(140deg) saturate(1.2)" },
  12: { id: 12, name: "Golden Monarch", image: "../toko/assets/border4.png", filter: "hue-rotate(320deg) brightness(1.1) saturate(1.4)" }
};

// Mock Profiles for other accounts (so other users can be inspected)
const otherUsersData = {
  max: {
    displayName: "Max",
    level: 8,
    xp: 4850,
    coins: 920,
    streak: 14,
    equippedBorder: 12,
    rankTitle: "Champion",
    userPhoto: "../plopp/assets/mascot_max.png"
  },
  leonardo: {
    displayName: "Leonardo",
    level: 7,
    xp: 3420,
    coins: 780,
    streak: 10,
    equippedBorder: 10,
    rankTitle: "Warrior",
    userPhoto: "../plopp/assets/mascot_leonardo.png"
  },
  susan: {
    displayName: "Susan",
    level: 6,
    xp: 2150,
    coins: 650,
    streak: 8,
    equippedBorder: 4,
    rankTitle: "Guardian",
    userPhoto: "../plopp/assets/mascot_susan.png"
  },
  aroma: {
    displayName: "Aroma",
    level: 5,
    xp: 1450,
    coins: 430,
    streak: 5,
    equippedBorder: 1,
    rankTitle: "Explorer",
    userPhoto: "../plopp/assets/mascot_main.png"
  },
  james: {
    displayName: "James",
    level: 4,
    xp: 880,
    coins: 290,
    streak: 4,
    equippedBorder: 0,
    rankTitle: "Rookie",
    userPhoto: "../plopp/assets/mascot_main.png"
  },
  william: {
    displayName: "William",
    level: 3,
    xp: 620,
    coins: 180,
    streak: 3,
    equippedBorder: 0,
    rankTitle: "Rookie",
    userPhoto: "../plopp/assets/mascot_main.png"
  },
  chloe: {
    displayName: "Chloe",
    level: 3,
    xp: 510,
    coins: 120,
    streak: 2,
    equippedBorder: 0,
    rankTitle: "Rookie",
    userPhoto: "../plopp/assets/mascot_main.png"
  }
};

// Initialize default state values for Current User
let isViewingOtherUser = false;
let gameState = {
  level: 6,
  xp: 1250,
  coins: 640,
  streak: 7,
  displayName: "Raka",
  equippedBorder: 0,
  userPhoto: null
};

// Web Audio API Context
let audioCtx = null;
const defaultAvatarSvg = "assets/mascot_thumbsup_transparent.png";

// Level thresholds mapping (scaled for 342 XP total progression)
const levelThresholds = [
  { level: 1, prevSum: 0, target: 30 },
  { level: 2, prevSum: 30, target: 35 },
  { level: 3, prevSum: 65, target: 40 },
  { level: 4, prevSum: 105, target: 45 },
  { level: 5, prevSum: 150, target: 50 },
  { level: 6, prevSum: 200, target: 55 },
  { level: 7, prevSum: 255, target: 65 },
  { level: 8, prevSum: 320, target: 100 }
];

// Ranks definitions (Rookie 0-49, Explorer 50-99, Guardian 100-159, Warrior 160-249, Champion 250-319, Legend 320+)
const ranksConfig = [
  {
    name: "Rookie",
    badge: "assets/badge_rookie.jpg",
    xpMin: 0,
    xpMax: 50,
    pill: "Pemula Lingkungan",
    desc: "Selesaikan modul awal dan mulailah memilah sampah!"
  },
  {
    name: "Explorer",
    badge: "assets/badge_explorer.jpg",
    xpMin: 50,
    xpMax: 100,
    pill: "Penjelajah Lingkungan",
    desc: "Terus belajar dan selesaikan tantangan untuk naik rank!"
  },
  {
    name: "Guardian",
    badge: "assets/badge_guardian.jpg",
    xpMin: 100,
    xpMax: 160,
    pill: "Penjaga Lingkungan",
    desc: "Jaga kelestarian lingkungan dengan memilah sampah organik dan B3!"
  },
  {
    name: "Warrior",
    badge: "assets/badge_warrior.jpg",
    xpMin: 160,
    xpMax: 250,
    pill: "Pejuang Lingkungan",
    desc: "Terapkan aksi nyata pengurangan sampah plastik dan daur ulang!"
  },
  {
    name: "Champion",
    badge: "assets/badge_champion.jpg",
    xpMin: 250,
    xpMax: 320,
    pill: "Juara Lingkungan",
    desc: "Hebat! Kamu telah menguasai hampir seluruh konsep pemilahan sampah!"
  },
  {
    name: "Legend",
    badge: "assets/badge_champion.jpg",
    xpMin: 320,
    xpMax: 99999,
    pill: "Legenda Lingkungan",
    desc: "Peringkat tertinggi! Kamu adalah Legenda Pelindung Bumi ThinkBin!"
  }
];

// Initial Setup
window.addEventListener("DOMContentLoaded", () => {
  loadFromLocalStorage();
  setupEventListeners();
  updateUI();
  renderOwnedBorders();
  
  // Force cache-busting for local assets
  document.querySelectorAll("img").forEach(img => {
    const src = img.getAttribute("src");
    if (src && src.includes("assets/")) {
      img.src = src + "?t=" + Date.now();
    }
  });
});

// Load state from local storage
function loadFromLocalStorage() {
  const savedState = localStorage.getItem("thinkbin_layout_profile_state");
  if (savedState) {
    try {
      const parsed = JSON.parse(savedState);
      gameState = { ...gameState, ...parsed };
    } catch (e) {}
  }

  // Load XP and Coins from global keys
  const liveXp = localStorage.getItem("thinkbin_xp");
  if (liveXp) gameState.xp = parseInt(liveXp, 10);

  const liveCoins = localStorage.getItem("thinkbin_coins");
  if (liveCoins) gameState.coins = parseInt(liveCoins, 10);

  // Load equipped border
  const liveBorder = localStorage.getItem("thinkbin_equipped");
  if (liveBorder) gameState.equippedBorder = parseInt(liveBorder, 10);
}

// Save state to local storage
function saveToLocalStorage() {
  if (isViewingOtherUser) return;
  localStorage.setItem("thinkbin_layout_profile_state", JSON.stringify(gameState));
}

// Warm up Web Audio API
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playCoinSound() {
  initAudio();
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "triangle";
    const now = audioCtx.currentTime;
    osc.frequency.setValueAtTime(987.77, now);
    osc.frequency.setValueAtTime(1318.51, now + 0.08);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(now + 0.35);
  } catch (e) {}
}

// Setup Event Listeners
function setupEventListeners() {
  // 1. User Photo File Uploader
  const fileInput = document.getElementById("avatar-file-input");
  const editTrigger = document.getElementById("avatar-edit-trigger");
  
  if (editTrigger && fileInput && !isViewingOtherUser) {
    editTrigger.addEventListener("click", () => {
      initAudio();
      fileInput.click();
    });

    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target.result;
          gameState.userPhoto = dataUrl;
          
          playCoinSound();
          updateUI();
          saveToLocalStorage();
          
          const avatarCircle = document.getElementById("profile-avatar-bg");
          if (avatarCircle) {
            avatarCircle.classList.add("wobble-anim");
            setTimeout(() => avatarCircle.classList.remove("wobble-anim"), 800);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // 2. Back Button Navigation
  const btnBack = document.getElementById("btn-back-profile");
  if (btnBack) {
    btnBack.addEventListener("click", () => {
      if (isViewingOtherUser) {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ type: 'navigate', screen: 'plopp' }, '*');
        } else {
          window.location.href = '../plopp/leaderboard.html';
        }
      } else {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ type: 'navigate', screen: 'home' }, '*');
        } else {
          window.location.href = '../thinkhome/index.html';
        }
      }
    });
  }

  // 3. Go to Toko Button
  const btnGoToToko = document.getElementById("btnGoToToko");
  if (btnGoToToko) {
    btnGoToToko.addEventListener("click", () => {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'navigate', screen: 'toko' }, '*');
      } else {
        window.location.href = '../toko/index.html';
      }
    });
  }
}

// Synchronize state to UI elements
function updateUI() {
  // 1. Photo Source
  const photoSrc = gameState.userPhoto || defaultAvatarSvg;
  const avatarImg = document.getElementById("profile-avatar-img");
  if (avatarImg) avatarImg.src = photoSrc;

  // 2. Equipped Border
  updateProfileBorder();

  // 3. User Name
  const nameVal = document.getElementById("user-display-name-val");
  if (nameVal) nameVal.textContent = gameState.displayName;

  // 4. Level XP Progression
  let activeLevelDef = levelThresholds[0];
  let calculatedLevel = 1;
  for (let i = levelThresholds.length - 1; i >= 0; i--) {
    if (gameState.xp >= levelThresholds[i].prevSum) {
      activeLevelDef = levelThresholds[i];
      calculatedLevel = levelThresholds[i].level;
      break;
    }
  }
  gameState.level = calculatedLevel;

  const levelProgressXp = Math.max(0, gameState.xp - activeLevelDef.prevSum);
  const levelTargetXp = activeLevelDef.target;
  
  // Set the 3 square cards values
  const sqStreak = document.getElementById("stat-square-streak-val");
  if (sqStreak) { sqStreak.textContent = `${gameState.streak} Hari`; }
  
  const sqXp = document.getElementById("stat-square-xp-val");
  if (sqXp) { sqXp.textContent = gameState.xp.toLocaleString(); }
  
  const sqCoin = document.getElementById("stat-square-coin-val");
  if (sqCoin) { sqCoin.textContent = gameState.coins.toLocaleString(); }

  // Set wide streak card
  const wideStreakTitle = document.getElementById("wide-streak-title-val");
  if (wideStreakTitle) { wideStreakTitle.textContent = `${gameState.streak} Hari Berturut-turut`; }

  const xpPercent = Math.max(0, Math.min(100, (levelProgressXp / levelTargetXp) * 100));
  
  // Set Hero Card progress bar
  const heroXpFill = document.getElementById("hero-xp-fill");
  if (heroXpFill) { heroXpFill.style.width = `${xpPercent}%`; }
  const heroXpText = document.getElementById("hero-xp-text");
  if (heroXpText) { heroXpText.textContent = `${levelProgressXp} / ${levelTargetXp} XP`; }

  // 5. Evaluate Rank
  let activeRank = ranksConfig[0];
  for (let i = 0; i < ranksConfig.length; i++) {
    if (gameState.xp >= ranksConfig[i].xpMin && gameState.xp < ranksConfig[i].xpMax) {
      activeRank = ranksConfig[i];
      break;
    }
  }
  if (gameState.xp >= ranksConfig[ranksConfig.length - 1].xpMin) {
    activeRank = ranksConfig[ranksConfig.length - 1];
  }

  // Update Hero Card Rank Badge & Text
  const rankPill = document.getElementById("rank-pill-val");
  if (rankPill) rankPill.textContent = activeRank.pill;

  // Update Current Rank Card details
  const rankTitleVal = document.getElementById("rank-card-title-val");
  if (rankTitleVal) rankTitleVal.textContent = activeRank.name;
  
  const rankBadgeImg = document.getElementById("rank-card-badge-img");
  if (rankBadgeImg) rankBadgeImg.src = activeRank.badge + "?t=" + Date.now();

  const rankRange = activeRank.xpMax - activeRank.xpMin;
  const rankProgress = gameState.xp - activeRank.xpMin;
  
  let rankPercent = 100;
  let rankLabelText = `${gameState.xp} XP`;
  
  if (activeRank.xpMax < 99999) {
    rankPercent = Math.max(0, Math.min(100, (rankProgress / rankRange) * 100));
    rankLabelText = `${gameState.xp} / ${activeRank.xpMax}`;
  } else {
    rankPercent = 100;
    rankLabelText = `${gameState.xp} XP (MAX)`;
  }
  
  const rankBarFill = document.getElementById("rank-card-bar-fill");
  if (rankBarFill) rankBarFill.style.width = `${rankPercent}%`;
  
  const rankXpLbl = document.getElementById("rank-card-xp-lbl");
  if (rankXpLbl) rankXpLbl.textContent = rankLabelText;

  // 6. Highlight active rank badge in Jalur Rank path
  updateJalurRankVisuals(activeRank.name);
}

// Update equipped border on profile avatar
function updateProfileBorder() {
  const borderImg = document.getElementById("profile-avatar-border-img");
  if (!borderImg) return;

  const equippedId = isViewingOtherUser 
    ? (gameState.equippedBorder || 0) 
    : parseInt(localStorage.getItem("thinkbin_equipped") || (gameState.equippedBorder || "0"), 10);

  if (equippedId && bordersConfig[equippedId]) {
    const border = bordersConfig[equippedId];
    borderImg.src = border.image;
    borderImg.style.filter = border.filter || "none";
    borderImg.style.display = "block";
  } else {
    borderImg.style.display = "none";
  }
}

// Render owned borders in collection grid
function renderOwnedBorders() {
  const grid = document.getElementById("ownedBordersGrid");
  if (!grid || isViewingOtherUser) return;

  let purchased = [];
  try {
    purchased = JSON.parse(localStorage.getItem("thinkbin_purchased") || "[]");
  } catch (e) {}

  const currentEquipped = parseInt(localStorage.getItem("thinkbin_equipped") || "0", 10);
  grid.innerHTML = "";

  // 1. Default (Tanpa Border) slot
  const defaultSlot = document.createElement("div");
  defaultSlot.className = `border-slot-item ${currentEquipped === 0 ? "active" : ""}`;
  defaultSlot.innerHTML = `
    <div class="border-slot-preview">
      <img src="${gameState.userPhoto || defaultAvatarSvg}" class="preview-avatar">
    </div>
    <span class="border-slot-name">Polos</span>
  `;
  defaultSlot.addEventListener("click", () => {
    localStorage.setItem("thinkbin_equipped", "0");
    gameState.equippedBorder = 0;
    playCoinSound();
    updateUI();
    renderOwnedBorders();
  });
  grid.appendChild(defaultSlot);

  // 2. Purchased borders slots
  purchased.forEach(borderId => {
    const border = bordersConfig[borderId];
    if (!border) return;

    const slot = document.createElement("div");
    slot.className = `border-slot-item ${currentEquipped === borderId ? "active" : ""}`;
    slot.innerHTML = `
      <div class="border-slot-preview">
        <img src="${gameState.userPhoto || defaultAvatarSvg}" class="preview-avatar">
        <img src="${border.image}" class="preview-frame" style="filter: ${border.filter || 'none'};">
      </div>
      <span class="border-slot-name">${border.name}</span>
    `;

    slot.addEventListener("click", () => {
      localStorage.setItem("thinkbin_equipped", borderId.toString());
      gameState.equippedBorder = borderId;
      playCoinSound();
      updateUI();
      renderOwnedBorders();
    });

    grid.appendChild(slot);
  });
}

// Highlights current rank in the horizontal path
function updateJalurRankVisuals(activeRankName) {
  ranksConfig.forEach((rankDef) => {
    const el = document.getElementById(`jalur-${rankDef.name.toLowerCase()}`);
    if (!el) return;

    el.classList.remove("active", "unlocked", "locked");

    const activeIdx = ranksConfig.findIndex(r => r.name === activeRankName);
    const thisIdx = ranksConfig.findIndex(r => r.name === rankDef.name);

    if (thisIdx === activeIdx) {
      el.classList.add("active");
    } else if (thisIdx < activeIdx) {
      el.classList.add("unlocked");
    } else {
      el.classList.add("locked");
    }
  });
}
