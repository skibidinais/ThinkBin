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
let currentNode = null;
let selectedOption = null;
let isAnswered = false;
let answerWasWrong = false;

// DOM Elements
const questionCounter = document.getElementById("questionCounter");
const qNumberCircle = document.getElementById("qNumberCircle");
const questionText = document.getElementById("questionText");
const optionsList = document.getElementById("optionsList");
const btnJawab = document.getElementById("btnJawab");
const backBtn = document.getElementById("backBtn");
const hintBtn = document.getElementById("hintBtn");
const hintModal = document.getElementById("hintModal");
const hintModalText = document.getElementById("hintModalText");
const closeHintBtn = document.getElementById("closeHintBtn");

// Parse Node ID from URL
function getNodeIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get("nodeId") || params.get("node") || params.get("level") || "1", 10);
  return isNaN(id) ? 1 : id;
}

// Clean and normalize strings for fuzzy comparison
function normalizeStr(str) {
  return (str || "")
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Flexible / Fuzzy Validator for Short Answers
function validateShortAnswer(userAnswer, expectedAnswer) {
  const cleanUser = normalizeStr(userAnswer);
  const cleanExpected = normalizeStr(expectedAnswer);

  if (!cleanUser) return false;
  if (cleanUser === cleanExpected) return true;
  if (cleanExpected.includes(cleanUser) && cleanUser.length >= 3) return true;
  if (cleanUser.includes(cleanExpected)) return true;

  // Keyword extraction for descriptive answers
  const expectedKeywords = cleanExpected.split(" ").filter(w => w.length > 3);
  let matchCount = 0;
  for (const kw of expectedKeywords) {
    if (cleanUser.includes(kw)) matchCount++;
  }

  if (expectedKeywords.length > 0 && matchCount >= Math.ceil(expectedKeywords.length * 0.35)) {
    return true;
  }

  return false;
}

// Render Question for Current Node
function renderQuestion() {
  const nodeId = getNodeIdFromUrl();
  const dataset = (typeof window !== "undefined" && window.modulData) 
    ? window.modulData 
    : ((typeof modulData !== "undefined") ? modulData : []);

  currentNode = dataset.find(n => n.nodeId === nodeId) || dataset[0];

  if (!currentNode || !currentNode.kuis) {
    if (questionText) questionText.textContent = "Soal kuis tidak tersedia untuk node ini.";
    if (optionsList) optionsList.innerHTML = "";
    if (btnJawab) btnJawab.style.display = "none";
    return;
  }

  const kuis = currentNode.kuis;
  if (questionCounter) questionCounter.textContent = `Soal Pemahaman • Node ${currentNode.nodeId}`;
  if (qNumberCircle) qNumberCircle.textContent = currentNode.nodeId;
  if (questionText) questionText.textContent = kuis.pertanyaan;

  if (optionsList) optionsList.innerHTML = "";
  selectedOption = null;
  isAnswered = false;
  answerWasWrong = false;

  if (kuis.tipe === "pilihan_ganda" && kuis.opsi) {
    // 1. Multiple Choice Rendering
    kuis.opsi.forEach((opt) => {
      const item = document.createElement("div");
      item.className = "option-item";
      item.dataset.key = opt.id;

      item.innerHTML = `
        <div class="option-circle">${opt.id.toUpperCase()}</div>
        <div class="option-text">${opt.text}</div>
      `;

      item.addEventListener("click", () => {
        if (isAnswered) return;
        sfx.playPop();
        selectOption(item, opt.id);
      });

      optionsList.appendChild(item);
    });

    if (btnJawab) {
      btnJawab.disabled = true;
      btnJawab.style.opacity = "0.5";
      btnJawab.textContent = "JAWAB";
      btnJawab.style.display = "block";
    }
  } else if (kuis.tipe === "isian_singkat") {
    // 2. Short Answer Text Input Rendering
    const wrapper = document.createElement("div");
    wrapper.className = "short-answer-wrapper";
    wrapper.innerHTML = `
      <label for="shortInput" class="short-answer-label">Ketik Jawaban Singkatmu:</label>
      <input type="text" id="shortInput" class="short-answer-input" placeholder="Tulis jawabanmu di sini..." autocomplete="off">
      <div class="answer-feedback" id="answerFeedback"></div>
    `;

    optionsList.appendChild(wrapper);

    const input = wrapper.querySelector("#shortInput");
    if (input) {
      input.addEventListener("input", () => {
        if (isAnswered) return;
        const hasText = input.value.trim().length > 0;
        if (btnJawab) {
          btnJawab.disabled = !hasText;
          btnJawab.style.opacity = hasText ? "1" : "0.5";
        }
      });

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && input.value.trim()) {
          if (btnJawab) btnJawab.click();
        }
      });
    }

    if (btnJawab) {
      btnJawab.disabled = true;
      btnJawab.style.opacity = "0.5";
      btnJawab.textContent = "PERIKSA JAWABAN";
      btnJawab.style.display = "block";
    }
  }
}

// Select Multiple Choice Option
function selectOption(targetItem, key) {
  const allItems = optionsList.querySelectorAll(".option-item");
  allItems.forEach(i => i.classList.remove("selected"));

  targetItem.classList.add("selected");
  selectedOption = key;

  if (btnJawab) {
    btnJawab.disabled = false;
    btnJawab.style.opacity = "1";
  }
}

// Handle Answer Submit & Next Navigation
if (btnJawab) {
  btnJawab.addEventListener("click", () => {
    if (!currentNode || !currentNode.kuis) return;

    // If answer was already marked wrong, clicking LANJUT returns to learning map to retry
    if (answerWasWrong) {
      sfx.playPop();
      goToLearningMapToRetry();
      return;
    }

    if (isAnswered) return;

    const kuis = currentNode.kuis;
    let isCorrect = false;

    if (kuis.tipe === "pilihan_ganda") {
      if (!selectedOption) return;
      isCorrect = (selectedOption.toLowerCase() === kuis.jawabanBenar.toLowerCase());

      const items = optionsList.querySelectorAll(".option-item");
      items.forEach(item => {
        if (item.dataset.key.toLowerCase() === kuis.jawabanBenar.toLowerCase()) {
          item.style.background = "#dcfce7";
          item.style.borderColor = "#22c55e";
        } else if (item.dataset.key === selectedOption && !isCorrect) {
          item.style.background = "#fee2e2";
          item.style.borderColor = "#ef4444";
        }
      });
    } else if (kuis.tipe === "isian_singkat") {
      const input = document.getElementById("shortInput");
      const feedback = document.getElementById("answerFeedback");
      const val = input ? input.value.trim() : "";
      if (!val) return;

      isCorrect = validateShortAnswer(val, kuis.jawabanBenar);

      if (input && feedback) {
        feedback.classList.add("show");
        if (isCorrect) {
          input.classList.add("correct");
          input.classList.remove("wrong");
          feedback.className = "answer-feedback show correct";
          feedback.innerHTML = `<strong>Tepat sekali!</strong> Jawaban: <em>${kuis.jawabanBenar}</em>`;
        } else {
          input.classList.add("wrong");
          input.classList.remove("correct");
          feedback.className = "answer-feedback show wrong";
          feedback.innerHTML = `<strong>Jawaban belum tepat.</strong> Yuk pelajari lagi materinya!`;
        }
      }
    }

    isAnswered = true;

    if (isCorrect) {
      // JAWABAN BENAR: Mainkan audio menang, beri XP, dan langsung ke Selebrasi Acak
      sfx.playCorrect();
      btnJawab.disabled = true;
      btnJawab.style.opacity = "0.7";
      setTimeout(() => {
        finishNodeAndCelebrate();
      }, 600);
    } else {
      // JAWABAN SALAH: Mainkan audio salah, jangan selesaikan node, tampilkan tombol LANJUT ke learning map
      sfx.playWrong();
      answerWasWrong = true;
      btnJawab.textContent = "LANJUT";
      btnJawab.disabled = false;
      btnJawab.style.opacity = "1";
    }
  });
}

// Return to Learning Map so the student can retry the node
function goToLearningMapToRetry() {
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: 'navigate', screen: 'learning-map' }, '*');
  } else {
    window.location.href = '../learning-map/index.html';
  }
}

// Complete Node, Award XP & Save Progression (Only when correct)
function finishNodeAndCelebrate() {
  const awardedXP = (currentNode && currentNode.xp) ? currentNode.xp : 12;

  // 1. Award XP
  let prevXP = parseInt(localStorage.getItem('thinkbin_xp') || '252', 10);
  localStorage.setItem('thinkbin_xp', (prevXP + awardedXP).toString());

  // 2. Mark Node Completed in thinkbin_completed_nodes
  try {
    let completed = JSON.parse(localStorage.getItem('thinkbin_completed_nodes') || '[]');
    if (currentNode && !completed.includes(currentNode.nodeId)) {
      completed.push(currentNode.nodeId);
    }
    localStorage.setItem('thinkbin_completed_nodes', JSON.stringify(completed));

    // Update current node to next node
    let currentId = parseInt(localStorage.getItem('thinkbin_current_node') || '1', 10);
    if (currentNode && currentNode.nodeId >= currentId && currentNode.nodeId < 16) {
      localStorage.setItem('thinkbin_current_node', (currentNode.nodeId + 1).toString());
    }
  } catch (e) {}

  // 3. Update Mission 2 progress
  const missionState = localStorage.getItem('tb_mission_state');
  if (missionState) {
    try {
      const parsed = JSON.parse(missionState);
      if (parsed[2] && !parsed[2].claimed) {
        parsed[2].progress = 1;
        localStorage.setItem('tb_mission_state', JSON.stringify(parsed));
      }
    } catch (e) {}
  }

  // 4. Random celebration variant: 50% Celeb A / 50% Celeb C
  const celebScreen = Math.random() < 0.5 ? 'celeb-a' : 'celeb-c';
  const nodeId = currentNode ? currentNode.nodeId : 1;

  if (window.parent && window.parent !== window) {
    window.parent.postMessage({
      type: 'quiz-finished',
      nodeId: nodeId,
      xp: awardedXP,
      screen: celebScreen
    }, '*');
  } else {
    window.location.href = `../${celebScreen}/index.html?nodeId=${nodeId}&xp=${awardedXP}`;
  }
}

// Hint (Bantuan) Modal Interaction
if (hintBtn) {
  hintBtn.addEventListener("click", () => {
    sfx.playPop();
    if (hintModalText) {
      if (currentNode && currentNode.bacaan && currentNode.bacaan.konsepInti) {
        hintModalText.innerHTML = `<strong>Petunjuk Materi:</strong><br><br>${currentNode.bacaan.konsepInti}`;
      } else {
        hintModalText.innerHTML = "<strong>Petunjuk:</strong><br><br>Ingat kembali konsep pemilahan dan pengelolaan sampah ramah lingkungan yang telah kamu pelajari.";
      }
    }
    if (hintModal) hintModal.classList.remove("hidden");
  });
}

if (closeHintBtn) {
  closeHintBtn.addEventListener("click", () => {
    sfx.playPop();
    if (hintModal) hintModal.classList.add("hidden");
  });
}

if (hintModal) {
  hintModal.addEventListener("click", (e) => {
    if (e.target === hintModal) {
      hintModal.classList.add("hidden");
    }
  });
}

// Back Button -> Bacaan for current node
if (backBtn) {
  backBtn.addEventListener("click", () => {
    sfx.playPop();
    const nodeId = currentNode ? currentNode.nodeId : 1;
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'navigate', screen: 'bacaan', nodeId: nodeId }, '*');
    } else {
      window.location.href = `../bacaan/index.html?nodeId=${nodeId}`;
    }
  });
}

// Initialize on DOM load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderQuestion);
} else {
  renderQuestion();
}
