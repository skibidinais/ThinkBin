/**
 * ThinkBin Kuisioner Engine (Pre-Survey & Post-Survey)
 * 100% Identik dengan Desain Quiz Asli
 */

const surveyQuestionsAwal = [
  {
    id: 1,
    question: "Seberapa sering kamu memilah sampah organik dan anorganik di rumah atau sekolah?",
    options: [
      { key: "A", text: "Selalu memilah setiap saat" },
      { key: "B", text: "Sering memilah saat ingat" },
      { key: "C", text: "Kadang-kadang saja" },
      { key: "D", text: "Belum pernah memilah" }
    ]
  },
  {
    id: 2,
    question: "Apakah kamu tahu jenis sampah mana yang bisa dijual atau disetor ke Bank Sampah?",
    options: [
      { key: "A", text: "Sangat tahu dan paham jenis-jenisnya" },
      { key: "B", text: "Cukup tahu beberapa jenis saja" },
      { key: "C", text: "Kurang tahu" },
      { key: "D", text: "Belum tahu sama sekali" }
    ]
  },
  {
    id: 3,
    question: "Menurutmu, apa dampak paling nyata jika kita membuang sampah sembarangan?",
    options: [
      { key: "A", text: "Menyebabkan banjir dan merusak ekosistem" },
      { key: "B", text: "Lingkungan menjadi kotor dan kumuh" },
      { key: "C", text: "Menimbulkan bau tidak sedap" },
      { key: "D", text: "Tidak terlalu berpengaruh" }
    ]
  },
  {
    id: 4,
    question: "Apa motivasi utamamu saat menggunakan aplikasi ThinkBin?",
    options: [
      { key: "A", text: "Ingin menjaga lingkungan dan bumi tetap asri" },
      { key: "B", text: "Ingin mengumpulkan koin, streak, dan badge seru" },
      { key: "C", text: "Penasaran dengan kuis dan tantangannya" },
      { key: "D", text: "Mengikuti tugas dari guru/sekolah" }
    ]
  }
];

const surveyQuestionsAkhir = [
  {
    id: 1,
    question: "Setelah belajar di ThinkBin, seberapa paham kamu tentang cara memilah sampah?",
    options: [
      { key: "A", text: "Sangat paham dan siap mempraktikkannya" },
      { key: "B", text: "Cukup paham sebagian besar materi" },
      { key: "C", text: "Masih butuh latihan lebih banyak" },
      { key: "D", text: "Belum terlalu paham" }
    ]
  },
  {
    id: 2,
    question: "Apakah kamu kini lebih bersemangat untuk menyetor sampah ke Bank Sampah?",
    options: [
      { key: "A", text: "Sangat bersemangat dan sudah mulai menabung" },
      { key: "B", text: "Bersemangat dan ingin mencoba" },
      { key: "C", text: "Biasa saja" },
      { key: "D", text: "Belum berminat" }
    ]
  },
  {
    id: 3,
    question: "Fitur apa di ThinkBin yang paling membantumu memahami materi?",
    options: [
      { key: "A", text: "Kuis Soal dan Kuis Tantangan Waktu" },
      { key: "B", text: "Bacaan Konsep Inti yang mudah dipahami" },
      { key: "C", text: "Papan Peringkat dan Profil Siswa" },
      { key: "D", text: "Toko Border dan Hadiah Koin" }
    ]
  },
  {
    id: 4,
    question: "Apakah kamu akan mengajak teman dan keluargamu untuk ikut memilah sampah?",
    options: [
      { key: "A", text: "Pasti! Saya akan mengajak mereka semua" },
      { key: "B", text: "Mungkin, jika ada kesempatan" },
      { key: "C", text: "Hanya untuk diri sendiri dulu" },
      { key: "D", text: "Tidak" }
    ]
  }
];

let currentIndex = 0;
let userAnswers = {};
let isAwal = true;
let currentQuestions = surveyQuestionsAwal;

// Audio Synthesizer
let audioCtx = null;
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playSound(type) {
  initAudio();
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const now = audioCtx.currentTime;
    if (type === 'tap') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, now);
      gain.setValueAtTime(0.12, now);
      gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'next') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(659.25, now + 0.08);
      gain.setValueAtTime(0.15, now);
      gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch (e) {}
}

// Kuisioner Akhir Unlock Date: 28 Agustus 2026 (28/08/2026)
const UNLOCK_DATE_AKHIR = new Date(2026, 7, 28, 0, 0, 0); // Month 7 is August (0-indexed)

function isDateLocked(params) {
  // Developer preview mode: ?preview=true or ?unlock=true
  if (params && (params.get('preview') === 'true' || params.get('unlock') === 'true')) {
    return false;
  }
  const now = new Date();
  return now < UNLOCK_DATE_AKHIR;
}

window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const typeParam = params.get('type') || 'awal';
  isAwal = (typeParam !== 'akhir');
  currentQuestions = isAwal ? surveyQuestionsAwal : surveyQuestionsAkhir;

  const badgeEl = document.getElementById('surveyTypeBadge');
  if (badgeEl) {
    badgeEl.textContent = isAwal ? 'Kuisioner Awal' : 'Kuisioner Akhir';
  }

  setupListeners();

  // Check Date Lock for Kuisioner Akhir (< 28/08/2026)
  if (!isAwal && isDateLocked(params)) {
    const quizEl = document.getElementById('quizContent');
    const lockEl = document.getElementById('lockedContent');
    if (quizEl) quizEl.classList.add('hidden');
    if (lockEl) lockEl.classList.remove('hidden');
    return;
  }

  renderQuestion();
});

function setupListeners() {
  const btnNext = document.getElementById('btnNextQuestion');
  if (btnNext) {
    btnNext.addEventListener('click', handleNextClick);
  }

  const btnFinish = document.getElementById('btnFinishSurvey');
  if (btnFinish) {
    btnFinish.addEventListener('click', () => {
      playSound('next');
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'navigate', screen: isAwal ? 'home' : 'learning-map' }, '*');
      } else {
        window.location.href = isAwal ? '../thinkhome/index.html' : '../learning-map/index.html';
      }
    });
  }

  const btnBack = document.getElementById('backBtn');
  if (btnBack) {
    btnBack.addEventListener('click', () => {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'navigate', screen: 'home' }, '*');
      } else {
        window.location.href = '../thinkhome/index.html';
      }
    });
  }

  const btnBackToLearning = document.getElementById('btnBackToLearning');
  if (btnBackToLearning) {
    btnBackToLearning.addEventListener('click', () => {
      playSound('next');
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'navigate', screen: 'learning-map' }, '*');
      } else {
        window.location.href = '../learning-map/index.html';
      }
    });
  }
}

function renderQuestion() {
  const q = currentQuestions[currentIndex];
  if (!q) return;

  const counterEl = document.getElementById('questionCounter');
  const qNumEl = document.getElementById('qNumberCircle');
  const qTextEl = document.getElementById('questionText');
  const optList = document.getElementById('optionsList');
  const btnNext = document.getElementById('btnNextQuestion');

  if (counterEl) counterEl.textContent = `Soal ${currentIndex + 1} / ${currentQuestions.length}`;
  if (qNumEl) qNumEl.textContent = currentIndex + 1;
  if (qTextEl) qTextEl.textContent = q.question;

  if (btnNext) {
    btnNext.textContent = (currentIndex === currentQuestions.length - 1) ? 'SELESAI' : 'LANJUT';
    btnNext.disabled = !userAnswers[q.id];
  }

  if (optList) {
    optList.innerHTML = '';
    q.options.forEach(opt => {
      const item = document.createElement('div');
      item.className = `option-item ${userAnswers[q.id] === opt.key ? 'selected' : ''}`;
      item.innerHTML = `
        <div class="option-circle">${opt.key}</div>
        <div class="option-text">${opt.text}</div>
      `;
      item.addEventListener('click', () => {
        playSound('tap');
        userAnswers[q.id] = opt.key;
        renderQuestion();
      });
      optList.appendChild(item);
    });
  }
}

function handleNextClick() {
  playSound('next');
  if (currentIndex < currentQuestions.length - 1) {
    currentIndex++;
    renderQuestion();
  } else {
    // Selesai kuisioner!
    const key = isAwal ? 'thinkbin_survey_awal' : 'thinkbin_survey_akhir';
    localStorage.setItem(key, JSON.stringify(userAnswers));
    localStorage.setItem('thinkbin_onboarding_completed', 'true');

    // Grant Rewards (+30 Koin & +20 XP)
    const prevCoins = parseInt(localStorage.getItem('thinkbin_coins') || '0', 10);
    const newCoins = prevCoins + 30;
    localStorage.setItem('thinkbin_coins', String(newCoins));

    const prevXp = parseInt(localStorage.getItem('thinkbin_xp') || '0', 10);
    const newXp = prevXp + 20;
    localStorage.setItem('thinkbin_xp', String(newXp));

    // Sync Profile state
    const profileState = localStorage.getItem('thinkbin_layout_profile_state');
    if (profileState) {
      try {
        const parsed = JSON.parse(profileState);
        parsed.coins = newCoins;
        parsed.xp = newXp;
        localStorage.setItem('thinkbin_layout_profile_state', JSON.stringify(parsed));
      } catch (e) {}
    }

    // Broadcast to parent app frame
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'update_coins_xp', coins: newCoins, xp: newXp }, '*');
    }

    // Show result screen
    document.getElementById('quizContent').classList.add('hidden');
    document.getElementById('resultContent').classList.remove('hidden');
  }
}