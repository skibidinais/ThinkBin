// Mission state and daily reset logic (00:00)

const MISSIONS_DEF = {
  1: { id: 1, title: 'Login hari ini (buka app)', reward: 10, target: 1 },
  2: { id: 2, title: 'Selesaikan minimal 1 node belajar', reward: 15, target: 1 },
  3: { id: 3, title: 'Kunjungi Papan Peringkat', reward: 10, target: 1 },
  4: { id: 4, title: 'Kunjungi Toko', reward: 10, target: 1 }
};

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function loadMissionState() {
  const today = getTodayKey();
  const savedDate = localStorage.getItem('tb_mission_date');

  let state = {
    1: { progress: 1, claimed: false }, // Misi 1 auto-selesai saat buka app
    2: { progress: 0, claimed: false },
    3: { progress: 0, claimed: false },
    4: { progress: 0, claimed: false }
  };

  if (savedDate === today) {
    try {
      const savedState = JSON.parse(localStorage.getItem('tb_mission_state'));
      if (savedState) {
        state = { ...state, ...savedState };
      }
    } catch (e) {
      console.error('Error parsing mission state:', e);
    }
  } else {
    // Reset baru untuk hari ini
    localStorage.setItem('tb_mission_date', today);
    saveMissionState(state);
  }

  return state;
}

function saveMissionState(state) {
  localStorage.setItem('tb_mission_state', JSON.stringify(state));
}

function getUserCoins() {
  const coins = localStorage.getItem('user_coins');
  return coins ? parseInt(coins, 10) : 640;
}

function setUserCoins(amount) {
  localStorage.setItem('user_coins', amount.toString());
  updateCoinsDisplay();
  
  // Notify other windows/iframes
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: 'coins-updated', coins: amount }, '*');
  }
}

function updateCoinsDisplay() {
  const el = document.getElementById('userCoinsDisplay');
  if (el) {
    el.textContent = getUserCoins().toLocaleString('id-ID');
  }
}

function renderMissions() {
  const state = loadMissionState();
  let completedCount = 0;

  for (let id = 1; id <= 4; id++) {
    const m = state[id];
    const def = MISSIONS_DEF[id];
    const cardEl = document.getElementById(`m${id}`);
    const barEl = document.getElementById(`m${id}-bar`);
    const progEl = document.getElementById(`m${id}-prog`);
    const btnEl = document.getElementById(`m${id}-btn`);

    if (!cardEl || !btnEl) continue;

    const isComplete = m.progress >= def.target;
    if (m.claimed) completedCount++;

    // Update progress bar
    if (barEl) {
      const pct = Math.min(100, Math.round((m.progress / def.target) * 100));
      barEl.style.width = `${pct}%`;
    }
    if (progEl) {
      progEl.textContent = `${m.progress} / ${def.target}`;
    }

    // Update button & card state
    if (m.claimed) {
      cardEl.classList.add('completed-item');
      btnEl.className = 'action-btn claimed-button';
      btnEl.textContent = 'Selesai ✓';
      btnEl.onclick = null;
      btnEl.disabled = true;
    } else if (isComplete) {
      cardEl.classList.remove('completed-item');
      btnEl.className = 'action-btn claim-button';
      btnEl.textContent = 'Klaim!';
      btnEl.disabled = false;
      btnEl.onclick = function() { claimMission(id, def.reward, this); };
    } else {
      cardEl.classList.remove('completed-item');
      btnEl.className = 'action-btn go-button';
      btnEl.textContent = (id === 2) ? 'Mulai' : 'Buka';
      btnEl.disabled = false;
      const targetScreen = (id === 2) ? 'learning-map' : (id === 3 ? 'plopp' : 'toko');
      btnEl.onclick = function() { handleGoMission(id, targetScreen); };
    }
  }

  // Update counter badge
  const counterEl = document.getElementById('missionProgressCount');
  if (counterEl) {
    counterEl.textContent = `${completedCount}/4 Selesai`;
  }
}

function claimMission(id, rewardCoins, btn) {
  // Play celebration confetti
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 65,
      spread: 55,
      origin: { y: 0.6 },
      colors: ['#4CAF50', '#F5B82E', '#EC4899', '#3F82E2', '#8B5CF6']
    });
  }

  // Update state
  const state = loadMissionState();
  if (state[id]) {
    state[id].claimed = true;
    saveMissionState(state);
  }

  // Add coins
  const currentCoins = getUserCoins();
  setUserCoins(currentCoins + rewardCoins);

  renderMissions();
}

function handleGoMission(id, screenName) {
  // Mark mission visited / progressed
  const state = loadMissionState();
  if (state[id] && !state[id].claimed) {
    state[id].progress = 1;
    saveMissionState(state);
  }

  navigateTo(screenName);
}

function navigateTo(screenName) {
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: 'navigate', screen: screenName }, '*');
  } else {
    // Standalone fallback
    const routes = {
      'home': '../home/index.html',
      'learning-map': '../learning-map/index.html',
      'toko': '../toko/index.html',
      'plopp': '../plopp/leaderboard.html',
      'profile': '../profile/index.html',
      'quiz': '../quiz/index.html'
    };
    if (routes[screenName]) {
      window.location.href = routes[screenName];
    }
  }
}

// Countdown timer to next 00:00 midnight reset
function updateCountdown() {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0); // 00:00 besok

  const diff = midnight - now;

  if (diff <= 0) {
    // Reset triggered
    renderMissions();
    return;
  }

  const hours = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0');
  const minutes = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0');
  const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');

  const el = document.getElementById('countdownTimer');
  if (el) {
    el.textContent = `${hours}:${minutes}:${seconds}`;
  }
}

// Cross-window message listener (e.g. node completed in learning-map or quiz completed)
window.addEventListener('message', (event) => {
  if (!event.data) return;
  
  if (event.data.type === 'node-completed') {
    const state = loadMissionState();
    if (state[2]) {
      state[2].progress = 1;
      saveMissionState(state);
      renderMissions();
    }
  } else if (event.data.type === 'visited-screen') {
    const screen = event.data.screen;
    const state = loadMissionState();
    if (screen === 'plopp' && state[3]) {
      state[3].progress = 1;
      saveMissionState(state);
      renderMissions();
    } else if (screen === 'toko' && state[4]) {
      state[4].progress = 1;
      saveMissionState(state);
      renderMissions();
    }
  }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  updateCoinsDisplay();
  renderMissions();
  updateCountdown();
  setInterval(updateCountdown, 1000);
});
