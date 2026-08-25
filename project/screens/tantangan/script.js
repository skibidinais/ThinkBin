// Audio FX synthesizer using Web Audio API
class SoundFX {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
  }

  playPop() {
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {}
  }

  playCorrect() {
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + i * 0.07);
        gain.gain.setValueAtTime(0.25, now + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.25);
      });
    } catch (e) {}
  }

  playWrong() {
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.setValueAtTime(180, now + 0.1);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);
    } catch (e) {}
  }
}

const sfx = new SoundFX();

// State variables
let currentTantangan = null;
let currentQuestionIndex = 0;
let totalQuestions = 5;
let score = 0;
let timerSeconds = 12;
let timerInterval = null;
let isAnswered = false;
let currentNodeId = 4;

// DOM Elements
const backBtn = document.getElementById("backBtn");
const gameHeading = document.getElementById("gameHeading");
const questionCounter = document.getElementById("questionCounter");
const timerBadge = document.getElementById("timerBadge");
const timerSecondsEl = document.getElementById("timerSeconds");
const timerProgressFill = document.getElementById("timerProgressFill");
const scoreVal = document.getElementById("scoreVal");
const qNumberCircle = document.getElementById("qNumberCircle");
const questionText = document.getElementById("questionText");
const optionsList = document.getElementById("optionsList");
const quizContent = document.getElementById("quizContent");
const resultContent = document.getElementById("resultContent");
const starsRating = document.getElementById("starsRating");
const finalScorePill = document.getElementById("finalScorePill");
const btnContinueMap = document.getElementById("btnContinueMap");

function getNodeIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get("nodeId") || params.get("node") || "4", 10);
  return isNaN(id) ? 4 : id;
}

function initGame() {
  currentNodeId = getNodeIdFromUrl();
  const tantanganDict = (typeof window !== "undefined" && window.kuisTantangan) 
    ? window.kuisTantangan 
    : ((typeof kuisTantangan !== "undefined") ? kuisTantangan : {});

  currentTantangan = tantanganDict[`node${currentNodeId}`] || tantanganDict.node4;
  
  if (currentTantangan && currentTantangan.judul) {
    gameHeading.textContent = currentTantangan.judul;
  }

  currentQuestionIndex = 0;
  score = 0;
  scoreVal.textContent = "0";

  loadQuestion(currentQuestionIndex);
}

function loadQuestion(index) {
  if (!currentTantangan || !currentTantangan.soal || !currentTantangan.soal[index]) {
    finishTantangan();
    return;
  }

  const q = currentTantangan.soal[index];
  isAnswered = false;

  questionCounter.textContent = `Soal ${index + 1} / ${currentTantangan.soal.length}`;
  qNumberCircle.textContent = index + 1;
  questionText.textContent = q.pertanyaan;

  // Render options A, B, C, D
  optionsList.innerHTML = "";
  const opsiObj = q.opsi || {};
  
  Object.keys(opsiObj).forEach(key => {
    const item = document.createElement("div");
    item.className = "option-item";
    item.dataset.key = key;

    item.innerHTML = `
      <div class="option-circle">${key.toUpperCase()}</div>
      <div class="option-text">${opsiObj[key]}</div>
    `;

    item.addEventListener("click", () => {
      if (isAnswered) return;
      handleAnswer(key, q.jawaban, item);
    });

    optionsList.appendChild(item);
  });

  // Start 12s timer
  startTimer();
}

function startTimer() {
  clearInterval(timerInterval);
  timerSeconds = 12;
  updateTimerUI();

  timerInterval = setInterval(() => {
    timerSeconds--;
    updateTimerUI();

    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
      if (!isAnswered) {
        handleTimeOut();
      }
    }
  }, 1000);
}

function updateTimerUI() {
  timerSecondsEl.textContent = `${timerSeconds}s`;
  const pct = (timerSeconds / 12) * 100;
  timerProgressFill.style.width = `${pct}%`;

  if (timerSeconds <= 3) {
    timerBadge.classList.add("urgent");
  } else {
    timerBadge.classList.remove("urgent");
  }
}

function handleAnswer(selectedKey, correctKey, itemEl) {
  isAnswered = true;
  clearInterval(timerInterval);

  const isCorrect = (selectedKey.toLowerCase() === correctKey.toLowerCase());
  const allItems = optionsList.querySelectorAll(".option-item");

  allItems.forEach(i => {
    if (i.dataset.key.toLowerCase() === correctKey.toLowerCase()) {
      i.classList.add("correct");
    } else if (i.dataset.key === selectedKey && !isCorrect) {
      i.classList.add("wrong");
    }
  });

  if (isCorrect) {
    sfx.playCorrect();
    // Base 100 pts + time bonus (10 pts per sec remaining)
    const pts = 100 + (timerSeconds * 10);
    score += pts;
    scoreVal.textContent = score.toString();
  } else {
    sfx.playWrong();
  }

  // Next question after short delay
  setTimeout(() => {
    currentQuestionIndex++;
    if (currentQuestionIndex < currentTantangan.soal.length) {
      loadQuestion(currentQuestionIndex);
    } else {
      finishTantangan();
    }
  }, 800);
}

function handleTimeOut() {
  isAnswered = true;
  sfx.playWrong();

  const q = currentTantangan.soal[currentQuestionIndex];
  const allItems = optionsList.querySelectorAll(".option-item");
  allItems.forEach(i => {
    if (i.dataset.key.toLowerCase() === q.jawaban.toLowerCase()) {
      i.classList.add("correct");
    }
  });

  setTimeout(() => {
    currentQuestionIndex++;
    if (currentQuestionIndex < currentTantangan.soal.length) {
      loadQuestion(currentQuestionIndex);
    } else {
      finishTantangan();
    }
  }, 850);
}

function finishTantangan() {
  clearInterval(timerInterval);
  sfx.playCorrect();

  // Award 12 XP
  let prevXP = parseInt(localStorage.getItem('thinkbin_xp') || '252', 10);
  localStorage.setItem('thinkbin_xp', (prevXP + 12).toString());

  // Mark Node Completed in LocalStorage
  try {
    let completed = JSON.parse(localStorage.getItem('thinkbin_completed_nodes') || '[]');
    if (!completed.includes(currentNodeId)) {
      completed.push(currentNodeId);
    }
    localStorage.setItem('thinkbin_completed_nodes', JSON.stringify(completed));

    // Update current node to next node
    let currentId = parseInt(localStorage.getItem('thinkbin_current_node') || '1', 10);
    if (currentNodeId >= currentId && currentNodeId < 16) {
      localStorage.setItem('thinkbin_current_node', (currentNodeId + 1).toString());
    }
  } catch (e) {}

  // 50/50 Random Celebration Screen (Celeb A or Celeb C)
  const celebrationScreens = ["celeb-a", "celeb-c"];
  const randomCeleb = celebrationScreens[Math.floor(Math.random() * celebrationScreens.length)];

  setTimeout(() => {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'navigate',
        screen: randomCeleb,
        nodeId: currentNodeId
      }, '*');
    } else {
      window.location.href = `../${randomCeleb}/index.html?nodeId=${currentNodeId}`;
    }
  }, 400);
}

// Back Button & Continue Map
if (backBtn) {
  backBtn.addEventListener("click", () => {
    sfx.playPop();
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'navigate', screen: 'learning-map' }, '*');
    } else {
      window.location.href = '../learning-map/index.html';
    }
  });
}

if (btnContinueMap) {
  btnContinueMap.addEventListener("click", () => {
    sfx.playPop();
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'navigate', screen: 'learning-map' }, '*');
    } else {
      window.location.href = '../learning-map/index.html';
    }
  });
}

// Initialize on load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGame);
} else {
  initGame();
}
