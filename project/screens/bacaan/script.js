// Audio FX synthesizer using Web Audio API
class SoundFX {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
  }

  playPop() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(750, this.ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playPageFlip() {
    this.init();
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 0.06;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    noise.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();
  }

  playComplete() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0.25, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.3);
    });
  }
}

const sfx = new SoundFX();

// State variables
let isSpeaking = false;
let currentNode = null;

// DOM Elements
const readingCounter = document.getElementById("readingCounter");
const readingTitle = document.getElementById("readingTitle");
const passageContent = document.getElementById("passageContent");
const passageScrollArea = document.getElementById("passageScrollArea");
const btnNext = document.getElementById("btnNext");
const readingWrapper = document.getElementById("readingWrapper");
const completeContent = document.getElementById("completeContent");
const btnReread = document.getElementById("btnReread");
const btnToQuiz = document.getElementById("btnToQuiz");
const audioBtn = document.getElementById("audioBtn");
const audioText = document.getElementById("audioText");
const backBtn = document.getElementById("backBtn");

// Stop speech synthesis if playing
function stopSpeech() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  isSpeaking = false;
  audioBtn.classList.remove("playing");
  audioText.textContent = "Dengar Suara";
}

// Get Node ID from URL query parameters
function getNodeIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get("nodeId") || params.get("node") || params.get("level") || "1", 10);
  return isNaN(id) ? 1 : id;
}

// Render Reading Content for Current Node
function renderCurrentNode() {
  stopSpeech();
  const nodeId = getNodeIdFromUrl();
  const dataset = (typeof modulData !== "undefined") ? modulData : [];
  currentNode = dataset.find(n => n.nodeId === nodeId) || dataset[0];

  if (!currentNode) {
    readingTitle.textContent = "Materi Tidak Ditemukan";
    passageContent.innerHTML = "<p>Data modul tidak tersedia.</p>";
    return;
  }

  // Update Header Pill
  readingCounter.textContent = `Node ${currentNode.nodeId} / 16 • Bagian ${currentNode.bagian}`;
  readingTitle.textContent = currentNode.title;

  // Build Dynamic HTML Content
  let contentHtml = "";

  if (currentNode.bacaan) {
    // 1. Konsep Inti
    if (currentNode.bacaan.konsepInti) {
      contentHtml += `
        <div class="konsep-box">
          <p>${currentNode.bacaan.konsepInti}</p>
        </div>
      `;
    }

    // 2. Contoh Nyata
    if (currentNode.bacaan.contoh) {
      contentHtml += `
        <div class="contoh-box">
          <strong>💡 Contoh Nyata:</strong>
          <p>${currentNode.bacaan.contoh}</p>
        </div>
      `;
    }

    // 3. Tabel Referensi (if present, e.g. Node 14)
    if (currentNode.bacaan.tabelReferensi) {
      const tableData = currentNode.bacaan.tabelReferensi.data || [];
      contentHtml += `
        <div class="table-responsive-wrapper">
          <table class="reference-table">
            <thead>
              <tr>
                <th>Jenis Sampah</th>
                <th>Harga Anggota (Rp/kg)</th>
                <th>Harga BSM (Rp/kg)</th>
              </tr>
            </thead>
            <tbody>
              ${tableData.map(row => `
                <tr>
                  <td><strong>${row.jenis}</strong></td>
                  <td>Rp ${row.hargaAnggota}</td>
                  <td>Rp ${row.hargaBSM}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      // (Disclaimer note removed completely per student design)
    }
  }

  // 4. Reflective open input for "bacaan_reflektif" (Node 16)
  if (currentNode.type === "bacaan_reflektif") {
    const placeholderText = (currentNode.reflektif && currentNode.reflektif.formatIsian)
      ? currentNode.reflektif.formatIsian
      : "Aksi hijau yang akan aku lakukan mulai sekarang: ___";

    contentHtml += `
      <div class="reflective-box">
        <label for="reflectiveInput" class="reflective-label">🌱 Komitmen Aksi Nyatamu:</label>
        <textarea id="reflectiveInput" class="reflective-textarea" rows="3" placeholder="${placeholderText}"></textarea>
      </div>
    `;

    btnNext.innerHTML = `SIMPAN KOMITMEN & SELESAI`;
  } else {
    btnNext.innerHTML = `LANJUT`;
  }

  // Render to DOM
  passageContent.style.opacity = "0";
  setTimeout(() => {
    passageContent.innerHTML = contentHtml;
    passageScrollArea.scrollTop = 0;
    passageContent.style.opacity = "1";
  }, 100);
}

// Handle Next Click
btnNext.addEventListener("click", () => {
  sfx.playPageFlip();
  stopSpeech();

  if (!currentNode) return;

  if (currentNode.type === "bacaan_reflektif") {
    // Save reflection text
    const textarea = document.getElementById("reflectiveInput");
    const reflectionText = textarea ? textarea.value.trim() : "";
    if (reflectionText) {
      localStorage.setItem("thinkbin_reflection_node16", reflectionText);
    }

    // Award XP
    const awardedXP = currentNode.xp || 12;
    let prevXP = parseInt(localStorage.getItem("thinkbin_xp") || "252", 10);
    localStorage.setItem("thinkbin_xp", (prevXP + awardedXP).toString());

    // Mark Node 16 Complete in localStorage
    try {
      let completed = JSON.parse(localStorage.getItem("thinkbin_completed_nodes") || "[]");
      if (!completed.includes(16)) completed.push(16);
      localStorage.setItem("thinkbin_completed_nodes", JSON.stringify(completed));
    } catch (e) {}

    // Random celebration variant: 50% Celeb A / 50% Celeb C
    const celebScreen = Math.random() < 0.5 ? 'celeb-a' : 'celeb-c';

    // Navigate to Celebration
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'node-finished',
        nodeId: 16,
        xp: awardedXP,
        screen: celebScreen
      }, '*');
    } else {
      window.location.href = `../${celebScreen}/index.html?nodeId=16&xp=${awardedXP}`;
    }
  } else {
    // Navigate to Kuis Page for this Node
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'navigate',
        screen: 'quiz',
        nodeId: currentNode.nodeId
      }, '*');
    } else {
      window.location.href = `../quiz/index.html?nodeId=${currentNode.nodeId}`;
    }
  }
});

// Audio Read Aloud Feature
audioBtn.addEventListener("click", () => {
  sfx.playPop();

  if (!('speechSynthesis' in window)) {
    alert("Browser tidak mendukung fitur audio pembacaan teks.");
    return;
  }

  if (isSpeaking) {
    stopSpeech();
  } else {
    if (!currentNode) return;
    const speechText = `${currentNode.title}. ${currentNode.bacaan ? currentNode.bacaan.konsepInti : ''}`;
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = 'id-ID';
    utterance.rate = 0.95;

    utterance.onstart = () => {
      isSpeaking = true;
      audioBtn.classList.add("playing");
      audioText.textContent = "Berhenti";
    };

    utterance.onend = () => {
      stopSpeech();
    };

    utterance.onerror = () => {
      stopSpeech();
    };

    window.speechSynthesis.speak(utterance);
  }
});

// Back Button navigation -> Learning Map
backBtn.addEventListener("click", () => {
  sfx.playPop();
  stopSpeech();

  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: 'navigate', screen: 'learning-map' }, '*');
  } else {
    window.location.href = '../learning-map/index.html';
  }
});

// Initialize on page load
renderCurrentNode();
