// =========================================================
// THINK BIN - INTERACTIVE GAME ENGINE & AUDIO SYNTHESIZER
// =========================================================

// State Management
const AppState = {
  coins: parseInt(localStorage.getItem('thinkbin_coins')) || 250,
  score: 0,
  highScore: parseInt(localStorage.getItem('thinkbin_highscore')) || 0,
  equippedHat: localStorage.getItem('thinkbin_hat') || 'safari',
  soundEnabled: true,
  isGameRunning: false,
  gameTimer: 30,
  gameLives: 3,
  playerX: 50, // in percentage
  isDuelActive: false
};

// =========================================================
// PROCEDURAL AUDIO SYNTHESIZER (Web Audio API)
// =========================================================
class SoundController {
  constructor() {
    this.ctx = null;
    this.initContext();
  }

  initContext() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.2) {
    if (!AppState.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playPop() {
    this.playTone(587.33, 'triangle', 0.1, 0.25); // D5
  }

  playClick() {
    this.playTone(880, 'sine', 0.08, 0.15); // A5
  }

  playCatch() {
    if (!AppState.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    // Happy double ding
    this.playTone(523.25, 'triangle', 0.12, 0.2); // C5
    setTimeout(() => this.playTone(783.99, 'triangle', 0.18, 0.25), 60); // G5
  }

  playWrong() {
    if (!AppState.soundEnabled) return;
    this.playTone(220, 'sawtooth', 0.25, 0.2); // Low A3 buzz
  }

  playCoin() {
    if (!AppState.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;
    this.playTone(987.77, 'sine', 0.1, 0.3); // B5
    setTimeout(() => this.playTone(1318.51, 'sine', 0.25, 0.3), 80); // E6
  }

  playFanfare() {
    if (!AppState.soundEnabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.25, 0.3), idx * 100);
    });
  }
}

const AudioFX = new SoundController();

// =========================================================
// UI CONTROLS & DOM REFS
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const coinDisplay = document.getElementById('coinDisplay');
  const coinPill = document.getElementById('coinPill');
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const soundIcon = document.getElementById('soundIcon');
  const fullscreenToggle = document.getElementById('fullscreenToggle');
  const deviceFrame = document.getElementById('deviceFrame');
  const mascotInteractive = document.getElementById('mascotInteractive');
  const btnPlayMain = document.getElementById('btnPlayMain');
  const profileWidget = document.getElementById('profileWidget');
  const spinWheelTrigger = document.getElementById('spinWheelTrigger');
  const btnLucy = document.getElementById('btnLucy');

  // Modals
  const gameModal = document.getElementById('gameModal');
  const btnCloseGame = document.getElementById('btnCloseGame');
  const btnStartGameNow = document.getElementById('btnStartGameNow');
  const gameStartPrompt = document.getElementById('gameStartPrompt');
  const gameResultOverlay = document.getElementById('gameResultOverlay');
  const btnPlayAgain = document.getElementById('btnPlayAgain');
  const btnExitGame = document.getElementById('btnExitGame');

  const duelModal = document.getElementById('duelModal');
  const btnCloseDuel = document.getElementById('btnCloseDuel');
  const profileModal = document.getElementById('profileModal');
  const btnCloseProfile = document.getElementById('btnCloseProfile');
  const wheelModal = document.getElementById('wheelModal');
  const btnCloseWheel = document.getElementById('btnCloseWheel');
  const btnSpinNow = document.getElementById('btnSpinNow');
  const modalWheelSpinner = document.getElementById('modalWheelSpinner');
  const wheelResultMsg = document.getElementById('wheelResultMsg');
  const shopModal = document.getElementById('shopModal');
  const btnCloseShop = document.getElementById('btnCloseShop');

  // Confetti Canvas
  const confettiCanvas = document.getElementById('confettiCanvas');
  const confettiCtx = confettiCanvas.getContext('2d');
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function resizeCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }

  // Update Coin Display
  function updateCoins(amount) {
    AppState.coins += amount;
    localStorage.setItem('thinkbin_coins', AppState.coins);
    coinDisplay.textContent = AppState.coins;
  }
  coinDisplay.textContent = AppState.coins;

  // Sound Toggle
  soundToggleBtn.addEventListener('click', () => {
    AppState.soundEnabled = !AppState.soundEnabled;
    AudioFX.initContext();
    if (AppState.soundEnabled) {
      soundToggleBtn.style.color = '#2d4b2d';
      AudioFX.playClick();
    } else {
      soundToggleBtn.style.color = '#e74c3c';
    }
  });

  // Fit Screen Toggle
  fullscreenToggle.addEventListener('click', () => {
    AudioFX.playClick();
    deviceFrame.classList.toggle('fullscreen');
    fullscreenToggle.textContent = deviceFrame.classList.contains('fullscreen') ? '📱 Mobile Frame' : '⛶ Fit Screen';
  });

  // Mascot tap reaction
  mascotInteractive.addEventListener('click', () => {
    AudioFX.playPop();
    triggerMascotCheer();
  });

  function triggerMascotCheer() {
    mascotInteractive.style.transition = 'transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    mascotInteractive.style.transform = 'scale(1.15) translateY(-14px)';
    setTimeout(() => {
      mascotInteractive.style.transform = '';
    }, 250);
  }

  // =========================================================
  // MINI GAME: THINK BIN RECYCLING SORTING
  // =========================================================
  let gameInterval = null;
  let spawnInterval = null;
  let activeItems = [];
  const gamePlayfield = document.getElementById('gamePlayfield');
  const binPlayer = document.getElementById('binPlayer');
  const gameScoreEl = document.getElementById('gameScore');
  const gameLivesEl = document.getElementById('gameLives');
  const gameTimerEl = document.getElementById('gameTimer');
  const finalScoreVal = document.getElementById('finalScoreVal');
  const earnedCoins = document.getElementById('earnedCoins');

  const RECYCLE_ITEMS = [
    { type: 'good', icon: '🧴', name: 'Plastic' },
    { type: 'good', icon: '📦', name: 'Cardboard' },
    { type: 'good', icon: '🥫', name: 'Can' },
    { type: 'good', icon: '🍾', name: 'Glass' },
    { type: 'good', icon: '📰', name: 'Paper' },
    { type: 'bad',  icon: '🔋', name: 'Battery' },
    { type: 'bad',  icon: '☣️', name: 'Biohazard' }
  ];

  // Play button -> langsung ke Quiz (skip minigame)
  btnPlayMain.addEventListener('click', () => {
    AudioFX.playClick();
    if (window.parent) {
      window.parent.postMessage({ type: 'navigate', screen: 'quiz' }, '*');
    }
  });

  btnCloseGame.addEventListener('click', () => {
    AudioFX.playClick();
    stopGame();
    gameModal.classList.add('hidden');
  });

  btnStartGameNow.addEventListener('click', () => {
    AudioFX.playClick();
    gameStartPrompt.classList.add('hidden');
    startGame();
  });

  btnPlayAgain.addEventListener('click', () => {
    AudioFX.playClick();
    gameResultOverlay.classList.add('hidden');
    startGame();
  });

  btnExitGame.addEventListener('click', () => {
    AudioFX.playClick();
    gameModal.classList.add('hidden');
  });

  // Player Bin Movement
  let isDraggingBin = false;
  gamePlayfield.addEventListener('mousedown', (e) => {
    isDraggingBin = true;
    moveBinTo(e.clientX);
  });
  window.addEventListener('mousemove', (e) => {
    if (isDraggingBin && AppState.isGameRunning) {
      moveBinTo(e.clientX);
    }
  });
  window.addEventListener('mouseup', () => {
    isDraggingBin = false;
  });

  // Touch Support for Mobile
  gamePlayfield.addEventListener('touchstart', (e) => {
    isDraggingBin = true;
    if (e.touches.length > 0) {
      moveBinTo(e.touches[0].clientX);
    }
  }, { passive: true });
  window.addEventListener('touchmove', (e) => {
    if (isDraggingBin && AppState.isGameRunning && e.touches.length > 0) {
      moveBinTo(e.touches[0].clientX);
    }
  }, { passive: true });
  window.addEventListener('touchend', () => {
    isDraggingBin = false;
  });

  // Keyboard controls
  window.addEventListener('keydown', (e) => {
    if (!AppState.isGameRunning) return;
    if (e.key === 'ArrowLeft' || e.key === 'a') {
      AppState.playerX = Math.max(10, AppState.playerX - 6);
      binPlayer.style.left = `${AppState.playerX}%`;
    } else if (e.key === 'ArrowRight' || e.key === 'd') {
      AppState.playerX = Math.min(90, AppState.playerX + 6);
      binPlayer.style.left = `${AppState.playerX}%`;
    }
  });

  function moveBinTo(clientX) {
    const rect = gamePlayfield.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    let pct = (relativeX / rect.width) * 100;
    pct = Math.max(10, Math.min(90, pct));
    AppState.playerX = pct;
    binPlayer.style.left = `${pct}%`;
  }

  function startGame() {
    AppState.isGameRunning = true;
    AppState.score = 0;
    AppState.gameLives = 3;
    AppState.gameTimer = 30;
    AppState.playerX = 50;
    binPlayer.style.left = '50%';

    gameScoreEl.textContent = '0';
    gameLivesEl.textContent = '❤️❤️❤️';
    gameTimerEl.textContent = '30s';

    // Clear old items
    activeItems.forEach(item => item.el.remove());
    activeItems = [];

    // Game Timer Loop
    clearInterval(gameInterval);
    gameInterval = setInterval(() => {
      AppState.gameTimer--;
      gameTimerEl.textContent = `${AppState.gameTimer}s`;
      if (AppState.gameTimer <= 0) {
        endGame(true);
      }
    }, 1000);

    // Item Spawner
    clearInterval(spawnInterval);
    spawnInterval = setInterval(spawnRecycleItem, 700);

    // Frame Loop for physics and collision
    requestAnimationFrame(gameLoop);
  }

  function spawnRecycleItem() {
    if (!AppState.isGameRunning) return;
    const itemData = RECYCLE_ITEMS[Math.floor(Math.random() * RECYCLE_ITEMS.length)];
    const el = document.createElement('div');
    el.className = 'falling-item';
    el.textContent = itemData.icon;
    el.style.left = `${10 + Math.random() * 80}%`;
    el.style.top = '-40px';
    gamePlayfield.appendChild(el);

    activeItems.push({
      el,
      type: itemData.type,
      y: -40,
      xPct: parseFloat(el.style.left),
      speed: 2.5 + Math.random() * 2.5
    });
  }

  function gameLoop() {
    if (!AppState.isGameRunning) return;

    const playfieldHeight = gamePlayfield.clientHeight;
    const binTop = playfieldHeight - 80;

    for (let i = activeItems.length - 1; i >= 0; i--) {
      const item = activeItems[i];
      item.y += item.speed;
      item.el.style.top = `${item.y}px`;

      // Collision Check with Bin
      if (item.y >= binTop && item.y <= binTop + 45) {
        const binX = AppState.playerX;
        if (Math.abs(item.xPct - binX) < 14) {
          // Caught item!
          if (item.type === 'good') {
            AppState.score += 10;
            gameScoreEl.textContent = AppState.score;
            AudioFX.playCatch();
            showFloatingText('+10 ♻️', item.xPct, item.y, '#2ecc71');
          } else {
            AppState.gameLives--;
            AudioFX.playWrong();
            gameLivesEl.textContent = '❤️'.repeat(Math.max(0, AppState.gameLives));
            showFloatingText('-1 ❤️', item.xPct, item.y, '#e74c3c');
            if (AppState.gameLives <= 0) {
              item.el.remove();
              activeItems.splice(i, 1);
              endGame(false);
              return;
            }
          }
          item.el.remove();
          activeItems.splice(i, 1);
          continue;
        }
      }

      // Fell off bottom
      if (item.y > playfieldHeight) {
        item.el.remove();
        activeItems.splice(i, 1);
      }
    }

    requestAnimationFrame(gameLoop);
  }

  function showFloatingText(text, xPct, yPx, color) {
    const floatEl = document.createElement('div');
    floatEl.style.position = 'absolute';
    floatEl.style.left = `${xPct}%`;
    floatEl.style.top = `${yPx}px`;
    floatEl.style.color = color;
    floatEl.style.fontFamily = 'Fredoka, sans-serif';
    floatEl.style.fontWeight = '800';
    floatEl.style.fontSize = '16px';
    floatEl.style.pointerEvents = 'none';
    floatEl.style.transition = 'all 0.6s ease-out';
    floatEl.style.zIndex = '50';
    floatEl.textContent = text;
    gamePlayfield.appendChild(floatEl);

    setTimeout(() => {
      floatEl.style.transform = 'translateY(-30px) scale(1.2)';
      floatEl.style.opacity = '0';
    }, 20);

    setTimeout(() => floatEl.remove(), 700);
  }

  function stopGame() {
    AppState.isGameRunning = false;
    clearInterval(gameInterval);
    clearInterval(spawnInterval);
    activeItems.forEach(item => item.el.remove());
    activeItems = [];
  }

  function endGame(isWin) {
    stopGame();
    const coinsWon = Math.floor(AppState.score / 2) + (isWin ? 25 : 5);
    updateCoins(coinsWon);

    finalScoreVal.textContent = AppState.score;
    earnedCoins.textContent = coinsWon;
    
    const resultTitle = document.getElementById('resultTitle');
    if (isWin) {
      resultTitle.textContent = '🌟 Nature Protected! 🎉';
      AudioFX.playFanfare();
      launchConfetti();
    } else {
      resultTitle.textContent = 'Game Over! Keep Trying! 🌿';
    }

    gameResultOverlay.classList.remove('hidden');
  }

  // =========================================================
  // 1v1 DUEL BATTLE SYSTEM (Mark, Mary, Lucy)
  // =========================================================
  const duelOpponentName = document.getElementById('opponentName');
  const opponentLabel = document.getElementById('opponentLabel');
  const opponentAvatarIcon = document.getElementById('opponentAvatarIcon');
  const playerProgress = document.getElementById('playerProgress');
  const opponentProgress = document.getElementById('opponentProgress');
  const playerDuelScore = document.getElementById('playerDuelScore');
  const opponentDuelScore = document.getElementById('opponentDuelScore');
  const duelQuestionText = document.getElementById('duelQuestionText');
  const duelAnswersGrid = document.getElementById('duelAnswersGrid');

  const DUEL_QUESTIONS = [
    {
      q: 'Which bin does an <strong>Apple Core</strong> belong to?',
      answers: [
        { text: '🍂 Organic Compost', correct: true },
        { text: '🧴 Plastic Bin', correct: false },
        { text: '📦 Paper Bin', correct: false },
        { text: '⚡ Battery Hazard', correct: false }
      ]
    },
    {
      q: 'Where should an empty <strong>Soda Aluminum Can</strong> go?',
      answers: [
        { text: '🥫 Metal / Can Recycling', correct: true },
        { text: '🍂 Forest Soil', correct: false },
        { text: '🚯 General Landfill', correct: false },
        { text: '🌊 River Stream', correct: false }
      ]
    },
    {
      q: 'How many years does a <strong>Plastic Bottle</strong> take to decompose?',
      answers: [
        { text: '⏳ Up to 450 Years!', correct: true },
        { text: '⏳ 2 Weeks', correct: false },
        { text: '⏳ 6 Months', correct: false },
        { text: '⏳ 3 Years', correct: false }
      ]
    }
  ];

  let currentQuestionIdx = 0;
  let pScore = 0;
  let oppScore = 0;
  let duelAIInterval = null;

  document.querySelectorAll('[data-action="duel"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const opp = e.target.getAttribute('data-opponent');
      openDuel(opp);
    });
  });

  if (btnLucy) {
    btnLucy.addEventListener('click', () => {
      AudioFX.playClick();
      alert('Lucy is currently gathering timber in the forest! 🪵\nStatus: Waiting for challenge');
    });
  }

  // Daily Missions (Misi Harian) button navigation
  const btnMisiHarian = document.getElementById('btnMisiHarian');
  if (btnMisiHarian) {
    btnMisiHarian.addEventListener('click', () => {
      AudioFX.playClick();
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'navigate', screen: 'mission' }, '*');
      } else {
        window.location.href = '../mission/index.html';
      }
    });
  }

  function openDuel(oppKey) {
    AudioFX.playClick();
    const oppNames = { mark: 'Mark (Otter)', mary: 'Mary (Raccoon)' };
    const oppIcons = { mark: '🦦', mary: '🦝' };

    duelOpponentName.textContent = oppNames[oppKey] || 'Challenger';
    opponentLabel.textContent = oppNames[oppKey] || 'Opponent';
    opponentAvatarIcon.textContent = oppIcons[oppKey] || '🐾';

    pScore = 0;
    oppScore = 0;
    currentQuestionIdx = 0;
    updateDuelUI();
    renderDuelQuestion();

    duelModal.classList.remove('hidden');

    // AI Opponent Progress Simulation
    clearInterval(duelAIInterval);
    duelAIInterval = setInterval(() => {
      if (oppScore < 100 && pScore < 100) {
        oppScore += Math.floor(Math.random() * 12) + 5;
        oppScore = Math.min(100, oppScore);
        updateDuelUI();
        if (oppScore >= 100) {
          clearInterval(duelAIInterval);
          alert('Match Over! ' + oppNames[oppKey] + ' reached 100 pts first! Good game!');
          duelModal.classList.add('hidden');
        }
      }
    }, 1800);
  }

  function renderDuelQuestion() {
    const curQ = DUEL_QUESTIONS[currentQuestionIdx % DUEL_QUESTIONS.length];
    duelQuestionText.innerHTML = curQ.q;
    duelAnswersGrid.innerHTML = '';

    curQ.answers.forEach(ans => {
      const btn = document.createElement('button');
      btn.className = 'duel-btn-choice';
      btn.textContent = ans.text;
      btn.addEventListener('click', () => {
        if (ans.correct) {
          btn.classList.add('correct');
          AudioFX.playCatch();
          pScore += 35;
          pScore = Math.min(100, pScore);
          updateDuelUI();
          if (pScore >= 100) {
            clearInterval(duelAIInterval);
            AudioFX.playFanfare();
            launchConfetti();
            updateCoins(100);
            setTimeout(() => {
              alert('🏆 VICTORY! You won the Duel match and earned +100 Coins! 🪙');
              duelModal.classList.add('hidden');
            }, 400);
            return;
          }
        } else {
          btn.classList.add('wrong');
          AudioFX.playWrong();
        }

        setTimeout(() => {
          currentQuestionIdx++;
          renderDuelQuestion();
        }, 600);
      });
      duelAnswersGrid.appendChild(btn);
    });
  }

  function updateDuelUI() {
    playerProgress.style.width = `${pScore}%`;
    opponentProgress.style.width = `${oppScore}%`;
    playerDuelScore.textContent = `${pScore} pts`;
    opponentDuelScore.textContent = `${oppScore} pts`;
  }

  btnCloseDuel.addEventListener('click', () => {
    AudioFX.playClick();
    clearInterval(duelAIInterval);
    duelModal.classList.add('hidden');
  });

  // =========================================================
  // PROFILE & HATS LOCKER (Optional)
  // =========================================================
  if (profileWidget && profileModal) {
    profileWidget.addEventListener('click', () => {
      AudioFX.playPop();
      profileModal.classList.remove('hidden');
    });
  }

  if (btnCloseProfile && profileModal) {
    btnCloseProfile.addEventListener('click', () => {
      AudioFX.playClick();
      profileModal.classList.add('hidden');
    });
  }

  document.querySelectorAll('.hat-item').forEach(hatBtn => {
    hatBtn.addEventListener('click', () => {
      AudioFX.playClick();
      document.querySelectorAll('.hat-item').forEach(b => b.classList.remove('active'));
      hatBtn.classList.add('active');
    });
  });

  // =========================================================
  // LUCKY SPIN WHEEL MODAL
  // =========================================================
  let isSpinning = false;
  let currentWheelDeg = 0;

  spinWheelTrigger.addEventListener('click', () => {
    AudioFX.playPop();
    wheelModal.classList.remove('hidden');
  });

  btnCloseWheel.addEventListener('click', () => {
    AudioFX.playClick();
    wheelModal.classList.add('hidden');
  });

  btnSpinNow.addEventListener('click', () => {
    if (isSpinning) return;
    isSpinning = true;
    AudioFX.playClick();
    wheelResultMsg.textContent = 'Spinning the wheel of fortune... 🍀';

    const extraRounds = 5 + Math.floor(Math.random() * 4); // 5 to 8 full spins
    const randomStop = Math.floor(Math.random() * 360);
    const totalSpin = extraRounds * 360 + randomStop;
    currentWheelDeg += totalSpin;

    modalWheelSpinner.style.transform = `rotate(${currentWheelDeg}deg)`;

    // Audio ticking simulation
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      AudioFX.playTone(600 + (tickCount % 4) * 80, 'sine', 0.04, 0.08);
      tickCount++;
      if (tickCount > 24) clearInterval(tickInterval);
    }, 120);

    setTimeout(() => {
      isSpinning = false;
      const normalizedDeg = (360 - (currentWheelDeg % 360)) % 360;
      const sliceIdx = Math.floor(normalizedDeg / 60);

      const rewards = [
        { label: '+50 Coins 🪙', amount: 50 },
        { label: '+100 Stars ⭐', amount: 30 },
        { label: '+25 Coins 🪙', amount: 25 },
        { label: 'Eco Mystery Box 🎁', amount: 75 },
        { label: '+200 Coins 🪙', amount: 200 },
        { label: '1 Forest Gem 💎', amount: 150 }
      ];

      const reward = rewards[sliceIdx] || rewards[0];
      wheelResultMsg.innerHTML = `🎉 Won <strong>${reward.label}</strong>!`;
      updateCoins(reward.amount);
      AudioFX.playFanfare();
      launchConfetti();
    }, 3600);
  });

  // =========================================================
  // COIN SHOP MODAL
  // =========================================================
  coinPill.addEventListener('click', () => {
    AudioFX.playCoin();
    shopModal.classList.remove('hidden');
  });

  btnCloseShop.addEventListener('click', () => {
    AudioFX.playClick();
    shopModal.classList.add('hidden');
  });

  document.querySelectorAll('.buy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cost = parseInt(btn.getAttribute('data-cost'));
      if (AppState.coins >= cost) {
        updateCoins(-cost);
        AudioFX.playCoin();
        btn.textContent = 'Purchased!';
        btn.style.background = '#95a5a6';
        btn.disabled = true;
        alert('🎉 Upgrade Purchased successfully!');
      } else {
        AudioFX.playWrong();
        alert('Not enough coins! Play mini-games or spin the lucky wheel to get more!');
      }
    });
  });

  // =========================================================
  // CONFETTI PARTICLE SYSTEM
  // =========================================================
  let confettiParticles = [];

  function launchConfetti() {
    confettiParticles = [];
    const colors = ['#2ecc71', '#3498db', '#f1c40f', '#e74c3c', '#9b59b6', '#1abc9c', '#f39c12'];
    for (let i = 0; i < 70; i++) {
      confettiParticles.push({
        x: Math.random() * confettiCanvas.width,
        y: -10,
        w: 6 + Math.random() * 8,
        h: 10 + Math.random() * 12,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 6,
        vy: 3 + Math.random() * 5,
        rot: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 10
      });
    }
    requestAnimationFrame(renderConfetti);
  }

  function renderConfetti() {
    if (confettiParticles.length === 0) return;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    for (let i = confettiParticles.length - 1; i >= 0; i--) {
      const p = confettiParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vRot;

      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate((p.rot * Math.PI) / 180);
      confettiCtx.fillStyle = p.color;
      confettiCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      confettiCtx.restore();

      if (p.y > confettiCanvas.height) {
        confettiParticles.splice(i, 1);
      }
    }

    if (confettiParticles.length > 0) {
      requestAnimationFrame(renderConfetti);
    } else {
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }
});
