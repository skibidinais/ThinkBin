/* ==========================================================================
   THINKBIN VICTORY GAME LOGIC & AUDIO SYNTHESIZER
   Ultra-high fidelity reproduction with interactive particle physics & sounds
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Global State
  let soundEnabled = true;
  let audioCtx = null;
  let currentLevel = 1;
  let currentScore = 4604;
  let starCount = 3;
  let isAnimating = false;

  // Mini-Game State
  let miniGameTimer = null;
  let timeLeft = 15;
  let gameScore = 0;
  let combo = 1;

  // DOM Elements
  const soundIcon = document.getElementById('soundIcon');
  const soundText = document.getElementById('soundText');
  const btnSound = document.getElementById('btnSound');
  const viewDevice = document.getElementById('viewDevice');
  const viewFullscreen = document.getElementById('viewFullscreen');
  const deviceFrame = document.getElementById('deviceFrame');
  const btnPlayGame = document.getElementById('btnPlayGame');
  const btnTriggerVictory = document.getElementById('btnTriggerVictory');
  const scoreCounter = document.getElementById('scoreCounter');
  const starPicker = document.getElementById('starPicker');

  // Interactive Game Action Buttons
  const btnMenu = document.getElementById('btnMenu');
  const btnReplay = document.getElementById('btnReplay');
  const btnNext = document.getElementById('btnNext');
  const btnAchievements = document.getElementById('btnAchievements');
  const mascotAvatar = document.getElementById('mascotAvatar');
  const mascotReactions = document.getElementById('mascotReactions');

  // Modals
  const modalLevelSelect = document.getElementById('modalLevelSelect');
  const btnCloseLevelSelect = document.getElementById('btnCloseLevelSelect');
  const levelGridContainer = document.getElementById('levelGridContainer');
  const btnPlayCurrentLevel = document.getElementById('btnPlayCurrentLevel');

  const modalMiniGame = document.getElementById('modalMiniGame');
  const btnCloseMiniGame = document.getElementById('btnCloseMiniGame');
  const gamePlayArea = document.getElementById('gamePlayArea');
  const gameTimer = document.getElementById('gameTimer');
  const gameCurrentScore = document.getElementById('gameCurrentScore');
  const comboBadge = document.getElementById('comboBadge');

  const modalAchievements = document.getElementById('modalAchievements');
  const btnCloseAchievements = document.getElementById('btnCloseAchievements');

  const toastPopup = document.getElementById('toastPopup');
  const toastMessage = document.getElementById('toastMessage');

  // Canvas setup for confetti and sparkles
  const canvas = document.getElementById('effectsCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let sparkles = [];
  let animationFrameId = null;

  function resizeCanvas() {
    const screen = document.getElementById('gameScreen');
    if (screen) {
      canvas.width = screen.clientWidth;
      canvas.height = screen.clientHeight;
    }
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  /* ==========================================================================
     WEB AUDIO SYNTHESIZER (No external audio file dependencies required!)
     ========================================================================== */
  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Play button squish / pop sound
  function playPopSound(freq = 440) {
    if (!soundEnabled) return;
    initAudio();
    try {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.8, now + 0.08);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch (e) {}
  }

  // Star pop chime
  function playStarChime(starIndex) {
    if (!soundEnabled) return;
    initAudio();
    try {
      const freqs = [587.33, 739.99, 880.00]; // D5, F#5, A5
      const freq = freqs[starIndex] || 880;
      const now = audioCtx.currentTime;
      
      const osc = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2, now);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc2.start(now);
      osc.stop(now + 0.45);
      osc2.stop(now + 0.45);
    } catch (e) {}
  }

  // Celebratory victory fanfare chord
  function playFanfare() {
    if (!soundEnabled) return;
    initAudio();
    try {
      const chord = [523.25, 659.25, 783.99, 1046.50]; // C Major
      chord.forEach((note, i) => {
        const now = audioCtx.currentTime + i * 0.06;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.8);
      });
    } catch (e) {}
  }

  // Ticking sound for score countup
  function playScoreTick() {
    if (!soundEnabled) return;
    initAudio();
    try {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.03);
    } catch (e) {}
  }

  /* ==========================================================================
     CONFETTI & PARTICLE PHYSICS SYSTEM
     ========================================================================== */
  const CONFETTI_COLORS = ['#FFD54F', '#FF5722', '#29B6F6', '#69F0AE', '#FF4081', '#FFFFFF', '#FFF176'];

  function spawnConfetti(count = 60) {
    const w = canvas.width || 400;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: w / 2 + (Math.random() - 0.5) * 80,
        y: canvas.height * 0.45,
        vx: (Math.random() - 0.5) * 14,
        vy: -Math.random() * 14 - 4,
        size: Math.random() * 8 + 6,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 12,
        alpha: 1,
        gravity: 0.38,
        shape: Math.random() > 0.4 ? 'rect' : 'circle'
      });
    }
  }

  function spawnSparkleBurst(x, y) {
    for (let i = 0; i < 14; i++) {
      const angle = (Math.PI * 2 / 14) * i;
      const speed = Math.random() * 4 + 2;
      sparkles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4 + 3,
        alpha: 1,
        color: '#FFFFFF'
      });
    }
  }

  function updateAndDrawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render Confetti
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.rotation += p.vRot;
      p.vx *= 0.98;

      if (p.y > canvas.height * 0.7) {
        p.alpha -= 0.02;
      }

      if (p.alpha <= 0 || p.y > canvas.height + 20) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Render Sparkles
    for (let i = sparkles.length - 1; i >= 0; i--) {
      const s = sparkles[i];
      s.x += s.vx;
      s.y += s.vy;
      s.alpha -= 0.04;

      if (s.alpha <= 0) {
        sparkles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, s.alpha);
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    animationFrameId = requestAnimationFrame(updateAndDrawParticles);
  }
  updateAndDrawParticles();

  /* ==========================================================================
     VICTORY ANIMATION SEQUENCE (STARS, CONFETTI, FANFARE & POP-IN)
     ========================================================================== */
  function runVictorySequence(targetScore = 4604, numStars = 3) {
    if (isAnimating) return;
    isAnimating = true;

    // Reset Star Elements
    const star1 = document.getElementById('star1');
    const star2 = document.getElementById('star2');
    const star3 = document.getElementById('star3');
    const stars = [star1, star2, star3];

    stars.forEach(s => {
      if (s) {
        s.classList.remove('star-pop-in', 'star-dimmed');
        s.style.opacity = '0';
      }
    });

    // Medallion & Ribbon Pop-in Effect
    const medallion = document.getElementById('medallionBadge');
    const ribbon = document.getElementById('ribbonBanner');
    if (medallion) {
      medallion.style.animation = 'none';
      medallion.offsetHeight; // trigger reflow
      medallion.style.animation = 'floatMedallion 4s ease-in-out infinite alternate';
    }
    if (ribbon) {
      ribbon.style.transform = 'scale(0.85)';
      setTimeout(() => {
        ribbon.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        ribbon.style.transform = 'scale(1)';
      }, 100);
    }

    // Play initial fanfare sound
    setTimeout(() => {
      playFanfare();
    }, 120);

    // Trigger full confetti cannon explosion
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.55 },
        colors: ['#FFD700', '#FF9800', '#4CAF50', '#29B6F6', '#E91E63']
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.65 }
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.65 }
        });
      }, 450);
    }

    // Staggered Star Pop-In Sequence
    stars.forEach((starEl, index) => {
      setTimeout(() => {
        if (index < numStars && starEl) {
          starEl.style.opacity = '1';
          starEl.classList.add('star-pop-in');
          playStarChime(index);

          // Spawn sparkle burst at star position
          const rect = starEl.getBoundingClientRect();
          const screenEl = document.getElementById('gameScreen');
          if (screenEl) {
            const screenRect = screenEl.getBoundingClientRect();
            const relX = rect.left - screenRect.left + rect.width / 2;
            const relY = rect.top - screenRect.top + rect.height / 2;
            spawnSparkleBurst(relX, relY);
          }

          if (index === 2) {
            spawnConfetti(60);
          }
        } else if (starEl) {
          starEl.style.opacity = '1';
          starEl.classList.add('star-dimmed');
        }
      }, 350 + index * 300);
    });

    // Reset isAnimating flag after sequence finishes
    setTimeout(() => {
      isAnimating = false;
    }, 1500);
  }

  /* ==========================================================================
     INTERACTIVE BUTTON HANDLERS & REACTION
     ========================================================================== */
  
  // Replay Button (Center)
  btnReplay.addEventListener('click', () => {
    playPopSound(520);
    showToast('🔄 Memuat ulang level...');
    runVictorySequence(currentScore, starCount);
  });

  // Replay Trigger from Toolbar
  btnTriggerVictory.addEventListener('click', () => {
    playPopSound(500);
    runVictorySequence(currentScore, starCount);
  });

  // Next Level Button (Right) -> Navigate back to Learning Map
  btnNext.addEventListener('click', () => {
    playPopSound(650);
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'navigate', screen: 'learning-map' }, '*');
    } else {
      window.location.href = '../learning-map/index.html';
    }
  });

  // Menu Button (Left) -> Navigate back to Learning Map
  btnMenu.addEventListener('click', () => {
    playPopSound(480);
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'navigate', screen: 'learning-map' }, '*');
    } else {
      window.location.href = '../learning-map/index.html';
    }
  });

  // Mascot Click Reaction
  mascotAvatar.addEventListener('click', (e) => {
    playPopSound(720 + Math.random() * 200);
    
    // Spawn floating emoji reaction
    const emojis = ['💖', '⭐', '✨', '🎈', '🎉', '🍀'];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    const el = document.createElement('div');
    el.className = 'reaction-pop';
    el.textContent = emoji;
    el.style.left = `${Math.random() * 60 + 20}%`;
    el.style.top = '30%';
    mascotReactions.appendChild(el);

    setTimeout(() => {
      el.remove();
    }, 1000);

    spawnSparkleBurst(canvas.width / 2, canvas.height * 0.42);
  });

  // Bottom Achievement Medal
  if (btnAchievements) {
    btnAchievements.addEventListener('click', () => {
      playPopSound(600);
      modalAchievements.classList.add('open');
    });
  }

  if (btnCloseAchievements) {
    btnCloseAchievements.addEventListener('click', () => {
      playPopSound(400);
      modalAchievements.classList.remove('open');
    });
  }

  // Menu / Level Select Modal
  btnMenu.addEventListener('click', () => {
    playPopSound(480);
    renderLevelGrid();
    modalLevelSelect.classList.add('open');
  });

  btnCloseLevelSelect.addEventListener('click', () => {
    playPopSound(400);
    modalLevelSelect.classList.remove('open');
  });

  function renderLevelGrid() {
    levelGridContainer.innerHTML = '';
    for (let i = 1; i <= 20; i++) {
      const btn = document.createElement('button');
      btn.className = `level-tile-btn ${i === currentLevel ? 'active' : ''} ${i > currentLevel + 2 ? 'locked' : ''}`;
      
      const stars = i < currentLevel ? '⭐⭐⭐' : (i === currentLevel ? '⭐⭐⭐' : '🔒');
      btn.innerHTML = `<span>${i}</span><span class="level-stars">${stars}</span>`;

      if (i <= currentLevel + 2) {
        btn.addEventListener('click', () => {
          playPopSound(540);
          currentLevel = i;
          currentScore = 3200 + i * 380;
          renderLevelGrid();
        });
      }
      levelGridContainer.appendChild(btn);
    }
  }

  btnPlayCurrentLevel.addEventListener('click', () => {
    playPopSound(600);
    modalLevelSelect.classList.remove('open');
    showToast(`🎮 Memulai Level ${currentLevel}!`);
    runVictorySequence(currentScore, starCount);
  });

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      playPopSound(580);
      showToast('Menuju Peta Belajar...');
      localStorage.setItem('thinkbin_last_completed_node', String(currentLevel));
      setTimeout(() => {
        if (window.parent) {
          window.parent.postMessage({ type: 'navigate', screen: 'learning-map' }, '*');
        }
      }, 500);
    });
  }

  /* ==========================================================================
     MINI-GAME POPPING LOGIC
     ========================================================================== */
  btnPlayGame.addEventListener('click', () => {
    playPopSound(500);
    modalMiniGame.classList.add('open');
    startMiniGame();
  });

  btnCloseMiniGame.addEventListener('click', () => {
    playPopSound(400);
    stopMiniGame();
    modalMiniGame.classList.remove('open');
  });

  function startMiniGame() {
    timeLeft = 15;
    gameScore = 0;
    combo = 1;
    gamePlayArea.innerHTML = '';
    gameTimer.textContent = `00:${timeLeft < 10 ? '0' : ''}${timeLeft}`;
    gameCurrentScore.textContent = gameScore;
    comboBadge.textContent = `COMBO x${combo}!`;

    spawnGameItems();

    if (miniGameTimer) clearInterval(miniGameTimer);
    miniGameTimer = setInterval(() => {
      timeLeft--;
      gameTimer.textContent = `00:${timeLeft < 10 ? '0' : ''}${timeLeft}`;

      if (timeLeft <= 0) {
        endMiniGame();
      }
    }, 1000);
  }

  function spawnGameItems() {
    const items = ['🗑️', '📄', '🥤', '📦', '🧹', '⚡', '⭐', '💎'];
    const colors = ['#EF5350', '#FFA726', '#42A5F5', '#AB47BC', '#26A69A', '#7E57C2'];

    for (let i = 0; i < 6; i++) {
      createGameItem(items, colors);
    }
  }

  function createGameItem(items, colors) {
    if (modalMiniGame.classList.contains('open') === false) return;

    const item = document.createElement('div');
    item.className = 'game-pop-item';
    item.textContent = items[Math.floor(Math.random() * items.length)];
    item.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    item.style.left = `${Math.random() * 75 + 5}%`;
    item.style.top = `${Math.random() * 70 + 10}%`;

    item.addEventListener('click', () => {
      playPopSound(600 + combo * 40);
      gameScore += 150 * combo;
      combo = Math.min(combo + 1, 5);
      gameCurrentScore.textContent = gameScore;
      comboBadge.textContent = `COMBO x${combo}!`;

      item.remove();
      setTimeout(() => createGameItem(items, colors), 400);
    });

    gamePlayArea.appendChild(item);
  }

  function stopMiniGame() {
    if (miniGameTimer) {
      clearInterval(miniGameTimer);
      miniGameTimer = null;
    }
  }

  function endMiniGame() {
    stopMiniGame();
    modalMiniGame.classList.remove('open');
    currentScore = Math.max(gameScore + 2000, 4604);
    showToast(`🎉 Skor Mini-game: ${currentScore}!`);
    runVictorySequence(currentScore, 3);
  }

  /* ==========================================================================
     TOOLBAR CONTROLS (Sound, Viewports, Star Picker)
     ========================================================================== */
  btnSound.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundIcon.textContent = soundEnabled ? '🔊' : '🔇';
    soundText.textContent = soundEnabled ? 'ON' : 'OFF';
    playPopSound(500);
  });

  viewDevice.addEventListener('click', () => {
    playPopSound(450);
    viewDevice.classList.add('active');
    viewFullscreen.classList.remove('active');
    deviceFrame.classList.remove('fullscreen-mode');
    setTimeout(resizeCanvas, 350);
  });

  viewFullscreen.addEventListener('click', () => {
    playPopSound(450);
    viewFullscreen.classList.add('active');
    viewDevice.classList.remove('active');
    deviceFrame.classList.add('fullscreen-mode');
    setTimeout(resizeCanvas, 350);
  });

  // Mascot Sprite Reference
  const mascotSprite = document.getElementById('mascotSprite');

  // Star Picker
  starPicker.querySelectorAll('.star-pick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playPopSound(550);
      starPicker.querySelectorAll('.star-pick-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      starCount = parseInt(btn.getAttribute('data-stars'), 10);
      runVictorySequence(currentScore, starCount);
    });
  });

  // Toast Helper
  let toastTimer = null;
  function showToast(msg) {
    toastMessage.textContent = msg;
    toastPopup.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastPopup.classList.remove('show');
    }, 2500);
  }

  // Initial Run on Page Load
  setTimeout(() => {
    runVictorySequence(4604, 3);
  }, 400);

});
