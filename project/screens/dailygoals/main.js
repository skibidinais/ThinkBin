/* =========================================================
   THINKBIN CASUAL GAME LOGIC & CELEBRATION EFFECTS
   ========================================================= */

// Audio Synthesizer via Web Audio API
class GameSound {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  playPop() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  playVictoryChord() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const now = this.ctx.currentTime + i * 0.07;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.6);
    });
  }

  playCoinCollect() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.06); // E6
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }
}

const sound = new GameSound();

// =========================================================
// CONFETTI SYSTEM (Matches Screenshot Aesthetics)
// =========================================================
class ConfettiSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.colors = [
      '#26c6da', // Cyan
      '#ff9800', // Orange
      '#ffeb3b', // Yellow
      '#e91e63', // Pink / Magenta
      '#f44336', // Red
      '#ab47bc', // Purple / Lavender
      '#42a5f5', // Blue
      '#00e676'  // Green
    ];
    this.animationFrame = null;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = this.canvas.parentElement.clientWidth;
    this.canvas.height = this.canvas.parentElement.clientHeight;
  }

  createBurst(count = 70) {
    this.particles = [];
    for (let i = 0; i < count; i++) {
      const type = Math.random() > 0.4 ? 'rect' : (Math.random() > 0.5 ? 'ribbon' : 'star');
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height * 0.85,
        type: type,
        size: Math.random() * 8 + 6,
        length: Math.random() * 18 + 10,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        vx: (Math.random() - 0.5) * 1.5,
        vy: Math.random() * 1.2 + 0.6,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.08,
        swaySpeed: Math.random() * 0.03 + 0.01,
        swayRange: Math.random() * 3 + 1,
        swayPhase: Math.random() * Math.PI * 2
      });
    }
  }

  start() {
    this.createBurst();
    const animate = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.particles.forEach(p => {
        p.rotation += p.vRot;
        p.swayPhase += p.swaySpeed;
        p.x += p.vx + Math.sin(p.swayPhase) * 0.8;
        p.y += p.vy;

        // Wrap around top if falls past bottom
        if (p.y > this.canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * this.canvas.width;
        }

        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rotation);
        this.ctx.fillStyle = p.color;

        if (p.type === 'rect') {
          this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
        } else if (p.type === 'ribbon') {
          // Curved ribbon streamer
          this.ctx.beginPath();
          this.ctx.moveTo(0, -p.length / 2);
          this.ctx.bezierCurveTo(p.size, -p.length / 4, -p.size, p.length / 4, 0, p.length / 2);
          this.ctx.lineWidth = 3;
          this.ctx.strokeStyle = p.color;
          this.ctx.stroke();
        } else if (p.type === 'star') {
          this.ctx.beginPath();
          for (let s = 0; s < 5; s++) {
            this.ctx.lineTo(Math.cos((18 + s * 72) * 0.01745) * p.size * 0.6, -Math.sin((18 + s * 72) * 0.01745) * p.size * 0.6);
            this.ctx.lineTo(Math.cos((54 + s * 72) * 0.01745) * p.size * 0.3, -Math.sin((54 + s * 72) * 0.01745) * p.size * 0.3);
          }
          this.ctx.closePath();
          this.ctx.fill();
        }

        this.ctx.restore();
      });

      this.animationFrame = requestAnimationFrame(animate);
    };

    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    animate();
  }

  stop() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

// =========================================================
// GAME CONTROLLER & UI INTERACTIONS
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
  let userCoins = 5000;
  
  const celebrationOverlay = document.getElementById('celebrationOverlay');
  const continueBtn = document.getElementById('continueBtn');
  const coinsDisplay = document.getElementById('coinsDisplay');
  const topCoinAnchor = document.getElementById('topCoinAnchor');
  const rewardCoinSource = document.getElementById('rewardCoinSource');
  const dailyGoalsBanner = document.getElementById('dailyGoalsBanner');
  const diffTabs = document.querySelectorAll('.diff-tab');
  const levelCards = document.querySelectorAll('.level-card');
  const levelPlayModal = document.getElementById('levelPlayModal');
  const playLevelTitle = document.getElementById('playLevelTitle');
  const closePlayBtn = document.getElementById('closePlayBtn');
  const puzzleBoard = document.getElementById('puzzleBoard');
  const confettiCanvas = document.getElementById('confettiCanvas');
  
  // Desktop control buttons
  const toggleFrameBtn = document.getElementById('toggleFrameBtn');
  const reopenModalBtn = document.getElementById('reopenModalBtn');
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const soundStatus = document.getElementById('soundStatus');
  const resetProgressBtn = document.getElementById('resetProgressBtn');
  const deviceWrapper = document.getElementById('deviceWrapper');
  const addCoinsBtn = document.getElementById('addCoinsBtn');

  // Initialize Confetti
  const confetti = new ConfettiSystem(confettiCanvas);
  confetti.start();
  sound.playVictoryChord();

  // Continue Button Click Handler
  continueBtn.addEventListener('click', (e) => {
    sound.playPop();
    animateCoinCollection();
  });

  // Coin Collection Flying Animation
  function animateCoinCollection() {
    const sourceRect = rewardCoinSource.getBoundingClientRect();
    const targetRect = topCoinAnchor.getBoundingClientRect();

    const coinCount = 10;
    let completed = 0;

    for (let i = 0; i < coinCount; i++) {
      setTimeout(() => {
        const flying = document.createElement('div');
        flying.className = 'flying-coin';
        flying.innerHTML = '★';
        document.body.appendChild(flying);

        // Initial position near the +50 coin
        const startX = sourceRect.left + sourceRect.width / 2 - 14 + (Math.random() - 0.5) * 30;
        const startY = sourceRect.top + sourceRect.height / 2 - 14 + (Math.random() - 0.5) * 30;
        flying.style.left = `${startX}px`;
        flying.style.top = `${startY}px`;

        requestAnimationFrame(() => {
          flying.style.transform = `translate(${targetRect.left - startX}px, ${targetRect.top - startY}px) scale(0.6)`;
          flying.style.opacity = '0.9';
        });

        setTimeout(() => {
          sound.playCoinCollect();
          flying.remove();
          completed++;
          
          // Increment coins progressively
          userCoins += 5;
          coinsDisplay.textContent = userCoins;

          if (completed >= coinCount) {
            userCoins = 5050; // Total 5000 + 50
            coinsDisplay.textContent = userCoins;
            // Close celebration overlay
            celebrationOverlay.classList.remove('active');
            confetti.stop();
          }
        }, 650);
      }, i * 70);
    }
  }

  // Re-open celebration modal
  dailyGoalsBanner.addEventListener('click', () => {
    sound.playPop();
    openCelebrationModal();
  });

  reopenModalBtn.addEventListener('click', () => {
    openCelebrationModal();
  });

  function openCelebrationModal() {
    celebrationOverlay.classList.add('active');
    confetti.start();
    sound.playVictoryChord();
  }

  // Difficulty Tabs Switching
  diffTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      sound.playPop();
      diffTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const diff = tab.dataset.diff;

      levelCards.forEach(card => {
        if (diff === 'all' || card.dataset.difficulty === diff) {
          card.style.display = 'flex';
          card.style.animation = 'modalPopIn 0.3s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Level Cards Click to Play Mini Game
  levelCards.forEach((card, index) => {
    card.addEventListener('click', () => {
      sound.playPop();
      const levelNum = card.dataset.level || (index + 1);
      playLevelTitle.textContent = `Level ${levelNum} - Puzzle Challenge`;
      generatePuzzleBoard();
      levelPlayModal.classList.add('active');
    });
  });

  closePlayBtn.addEventListener('click', () => {
    sound.playPop();
    levelPlayModal.classList.remove('active');
  });

  function generatePuzzleBoard() {
    puzzleBoard.innerHTML = '';
    for (let i = 0; i < 36; i++) {
      const cell = document.createElement('div');
      cell.className = 'puzzle-cell';
      cell.addEventListener('click', () => {
        sound.playPop();
        cell.classList.toggle('filled');
      });
      puzzleBoard.appendChild(cell);
    }
  }

  // Header quick buttons
  addCoinsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    sound.playCoinCollect();
    userCoins += 100;
    coinsDisplay.textContent = userCoins;
  });

  // Desktop Controls Handlers
  toggleFrameBtn.addEventListener('click', () => {
    sound.playPop();
    deviceWrapper.classList.toggle('frameless');
    const isFrameless = deviceWrapper.classList.contains('frameless');
    toggleFrameBtn.textContent = isFrameless ? '📱 Enable Frame' : '📱 Toggle Device Frame';
  });

  soundToggleBtn.addEventListener('click', () => {
    sound.enabled = !sound.enabled;
    soundStatus.textContent = sound.enabled ? 'ON' : 'OFF';
  });

  resetProgressBtn.addEventListener('click', () => {
    sound.playPop();
    userCoins = 5000;
    coinsDisplay.textContent = userCoins;
  });
});
