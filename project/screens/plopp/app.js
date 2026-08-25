/* =========================================================
   PLOPP INTERACTIVE APP JS
   Screen Switching, Waving Mascot Extraction & Sound Engine
   ========================================================= */

// Audio Synthesizer for cheerful gamified sound effects
const audioCtx = (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) ? new (window.AudioContext || window.webkitAudioContext)() : null;

function playSound(type) {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const now = audioCtx.currentTime;

  if (type === 'cheer' || type === 'pop') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
    gain.setValueAtTime(0.2, now);
    gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  } else if (type === 'heart') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1);
    osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.25);
    gain.setValueAtTime(0.15, now);
    gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  } else if (type === 'coin') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, now);
    osc.frequency.setValueAtTime(1318.51, now + 0.08);
    gain.setValueAtTime(0.2, now);
    gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  } else if (type === 'levelUp' || type === 'success') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(554.37, now + 0.08);
    osc.frequency.setValueAtTime(659.25, now + 0.16);
    osc.frequency.setValueAtTime(880, now + 0.24);
    gain.setValueAtTime(0.25, now);
    gain.exponentialRampToValueAtTime(0.01, now + 0.45);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.45);
  }
}

// Global Mascot Slices Cache
const mascotSprites = [];

/**
 * High Quality BFS Flood-Fill Background Removal with Alpha Feathering & De-fringing
 */
function processSpriteCell(sourceImg, cellX, cellY, cellW, cellH) {
  const canvas = document.createElement('canvas');
  canvas.width = cellW;
  canvas.height = cellH;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(sourceImg, cellX, cellY, cellW, cellH, 0, 0, cellW, cellH);

  const imgData = ctx.getImageData(0, 0, cellW, cellH);
  const data = imgData.data;
  const bgR = 247, bgG = 247, bgB = 247;

  const visited = new Uint8Array(cellW * cellH);
  const queue = [];

  function isBackgroundPixel(idx) {
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const minVal = Math.min(r, g, b);
    const maxVal = Math.max(r, g, b);
    const isNeutralLight = (minVal > 210) && ((maxVal - minVal) < 25);
    const isVeryBright = (r > 225 && g > 225 && b > 225);
    return isNeutralLight || isVeryBright;
  }

  // Seed BFS queue from all border pixels
  for (let x = 0; x < cellW; x++) {
    queue.push(x, 0);
    visited[0 * cellW + x] = 1;
    queue.push(x, cellH - 1);
    visited[(cellH - 1) * cellW + x] = 1;
  }
  for (let y = 0; y < cellH; y++) {
    queue.push(0, y);
    visited[y * cellW + 0] = 1;
    queue.push(cellW - 1, y);
    visited[y * cellW + (cellW - 1)] = 1;
  }

  let head = 0;
  while (head < queue.length) {
    const x = queue[head++];
    const y = queue[head++];
    const pIdx = y * cellW + x;
    const dIdx = pIdx * 4;

    if (isBackgroundPixel(dIdx)) {
      data[dIdx + 3] = 0;

      const neighbors = [
        [x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]
      ];

      for (let i = 0; i < neighbors.length; i++) {
        const nx = neighbors[i][0];
        const ny = neighbors[i][1];
        if (nx >= 0 && nx < cellW && ny >= 0 && ny < cellH) {
          const npIdx = ny * cellW + nx;
          if (!visited[npIdx]) {
            visited[npIdx] = 1;
            queue.push(nx, ny);
          }
        }
      }
    }
  }

  // De-fringe edge pixels
  let minX = cellW, maxX = 0, minY = cellH, maxY = 0;

  for (let y = 0; y < cellH; y++) {
    for (let x = 0; x < cellW; x++) {
      const idx = (y * cellW + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      if (data[idx + 3] !== 0) {
        const dist = Math.sqrt(
          0.299 * Math.pow(r - bgR, 2) +
          0.587 * Math.pow(g - bgG, 2) +
          0.114 * Math.pow(b - bgB, 2)
        );

        if (dist < 15) {
          data[idx + 3] = 0;
        } else if (dist < 38) {
          const alphaRatio = (dist - 15) / 23;
          data[idx + 3] = Math.round(alphaRatio * 255);
          if (alphaRatio > 0.05) {
            data[idx] = Math.max(0, Math.min(255, Math.round((r - (1 - alphaRatio) * bgR) / alphaRatio)));
            data[idx + 1] = Math.max(0, Math.min(255, Math.round((g - (1 - alphaRatio) * bgR) / alphaRatio)));
            data[idx + 2] = Math.max(0, Math.min(255, Math.round((b - (1 - alphaRatio) * bgR) / alphaRatio)));
          }
        } else {
          data[idx + 3] = 255;
        }

        if (data[idx + 3] > 30) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // Snug crop
  const cropX = Math.max(0, minX - 2);
  const cropY = Math.max(0, minY - 2);
  const cropW = Math.min(cellW - cropX, (maxX - minX) + 4);
  const cropH = Math.min(cellH - cropY, (maxY - minY) + 4);

  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = cropW;
  croppedCanvas.height = cropH;
  const cropCtx = croppedCanvas.getContext('2d');

  cropCtx.drawImage(
    canvas,
    cropX, cropY, cropW, cropH,
    0, 0, cropW, cropH
  );

  return croppedCanvas.toDataURL('image/png');
}

// Render mascot leaderboard pakai foto satuan (mascot_leonardo.png, mascot_max.png, mascot_susan.png)
// Tidak butuh sprite sheet lagi.
function loadAndSliceMascots() {
  renderMascot('leonardoMascotBox', null, 'Leonardo');
  renderMascot('maxMascotBox', null, 'Max');
  renderMascot('susanMascotBox', null, 'Susan');

  // Screen 1 mascot (signup) loaded dari PNG terpisah
  loadSignupMascotDirect();
}

/**
 * Load the dedicated high-res mascot PNG and remove its white background
 * then render it into the signup screen mascot box
 */
function loadSignupMascotDirect() {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = 'assets/mascot_main.png';

  img.onload = () => {
    const W = img.naturalWidth;
    const H = img.naturalHeight;

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, W, H);

    const imgData = ctx.getImageData(0, 0, W, H);
    const data = imgData.data;

    // BFS flood-fill from borders — removes ONLY border-connected background.
    // Interior white pixels (eyes, goggle lens, etc.) are naturally preserved.
    const visited = new Uint8Array(W * H);
    const queue = [];

    // Very strict threshold: only pure/near-pure white or fully transparent
    function isBg(idx) {
      const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3];
      if (a < 20) return true;
      // Only remove very pure white (>245 all channels, low saturation)
      const minV = Math.min(r, g, b);
      const maxV = Math.max(r, g, b);
      return (minV > 238 && (maxV - minV) < 18);
    }

    // Seed borders
    for (let x = 0; x < W; x++) {
      [[x,0],[x,H-1]].forEach(([px,py]) => {
        if (!visited[py*W+px]) { visited[py*W+px]=1; queue.push(px,py); }
      });
    }
    for (let y = 0; y < H; y++) {
      [[0,y],[W-1,y]].forEach(([px,py]) => {
        if (!visited[py*W+px]) { visited[py*W+px]=1; queue.push(px,py); }
      });
    }

    let head = 0;
    while (head < queue.length) {
      const x = queue[head++];
      const y = queue[head++];
      const dIdx = (y*W+x)*4;
      if (isBg(dIdx)) {
        data[dIdx+3] = 0;
        for (const [nx,ny] of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]]) {
          if (nx>=0 && nx<W && ny>=0 && ny<H && !visited[ny*W+nx]) {
            visited[ny*W+nx]=1;
            queue.push(nx,ny);
          }
        }
      }
    }

    // De-fringe: soft-erase residual white halo pixels at edges only
    // Compare each visible pixel to background tone; only affect border pixels
    const bgR = 248, bgG = 248, bgB = 248;
    let minX=W, maxX=0, minY=H, maxY=0;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const idx = (y*W+x)*4;
        if (data[idx+3] === 0) continue; // already transparent
        const r = data[idx], g = data[idx+1], b = data[idx+2];

        // Check if any 4-neighbour was erased (border pixel) — only defringe edges
        const onEdge = (
          (x>0   && data[((y)*W+(x-1))*4+3]===0) ||
          (x<W-1 && data[((y)*W+(x+1))*4+3]===0) ||
          (y>0   && data[((y-1)*W+x)*4+3]===0)   ||
          (y<H-1 && data[((y+1)*W+x)*4+3]===0)
        );

        if (onEdge) {
          const dist = Math.sqrt(
            0.299*Math.pow(r-bgR,2) + 0.587*Math.pow(g-bgG,2) + 0.114*Math.pow(b-bgB,2)
          );
          if (dist < 10) {
            data[idx+3] = 0;
          } else if (dist < 30) {
            const a = (dist-10)/20;
            data[idx+3] = Math.round(a*255);
            if (a > 0.05) {
              data[idx]   = Math.max(0,Math.min(255,Math.round((r-(1-a)*bgR)/a)));
              data[idx+1] = Math.max(0,Math.min(255,Math.round((g-(1-a)*bgG)/a)));
              data[idx+2] = Math.max(0,Math.min(255,Math.round((b-(1-a)*bgB)/a)));
            }
          }
        }

        if (data[idx+3] > 30) {
          if (x<minX) minX=x; if (x>maxX) maxX=x;
          if (y<minY) minY=y; if (y>maxY) maxY=y;
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // Tight crop around character
    const pad = 4;
    const cX = Math.max(0, minX-pad);
    const cY = Math.max(0, minY-pad);
    const cW = Math.min(W-cX, (maxX-minX)+pad*2);
    const cH = Math.min(H-cY, (maxY-minY)+pad*2);

    const out = document.createElement('canvas');
    out.width = cW; out.height = cH;
    out.getContext('2d').drawImage(canvas, cX, cY, cW, cH, 0, 0, cW, cH);

    const container = document.getElementById('signupMascotBox');
    if (container) {
      container.innerHTML = `<img class="signup-mascot-img" src="${out.toDataURL('image/png')}" alt="Plopp Mascot" />`;
    }
  };

  img.onerror = () => {
    console.warn("Could not load mascot_main.png");
  };
}

// Foto mascot satuan (bukan sprite sheet) - dipetakan per nama
const mascotDirectFiles = {
  Leonardo: 'assets/mascot_leonardo.png',
  Max: 'assets/mascot_max.png',
  Susan: 'assets/mascot_susan.png',
};

function renderSignupMascot() {
  const container = document.getElementById('signupMascotBox');
  if (!container) return;
  container.innerHTML = `<img class="signup-mascot-img" src="assets/mascot_main.png" alt="Plopp Waving Mascot" />`;
}

function renderMascot(containerId, spriteIdx, altText) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const src = mascotDirectFiles[altText] || 'assets/mascot_main.png';
  container.innerHTML = `<img class="mascot-sprite-img" src="${src}" alt="${altText}" />`;
}

// =========================================================
// SCREEN SWITCHER (ONBOARDING <-> LEADERBOARD)
// =========================================================
window.showScreen = function(screenName) {
  playSound('pop');

  const signupScreen = document.getElementById('signupScreen');
  const leaderboardScreen = document.getElementById('leaderboardScreen');
  const btnSignup = document.getElementById('btnShowSignup');
  const btnLeaderboard = document.getElementById('btnShowLeaderboard');

  if (screenName === 'signup') {
    signupScreen.classList.add('active');
    leaderboardScreen.classList.remove('active');
    btnSignup.classList.add('active');
    btnLeaderboard.classList.remove('active');
  } else {
    leaderboardScreen.classList.add('active');
    signupScreen.classList.remove('active');
    btnLeaderboard.classList.add('active');
    btnSignup.classList.remove('active');
  }
};

// Signup mascot cheer reaction
window.triggerSignupMascotCheer = function() {
  playSound('cheer');
  const rect = document.getElementById('signupMascotBox').getBoundingClientRect();
  createFloatingParticle('👋', rect.left + rect.width / 2, rect.top + 40);
  createFloatingParticle('✨', rect.left + rect.width / 2 + 30, rect.top + 20);
};

// State for Plopp Onboarding
const ploppOnboardingState = {
  deviceFingerprint: null,
  googleUser: null,
  selectedClass: null,
  selectedStudent: null,
  studentNumber: null,
  surveyAnswers: {}
};

// Generate Device Fingerprint (Layer 1)
function getPloppDeviceFingerprint() {
  let devId = localStorage.getItem('thinkbin_device_id');
  if (!devId) {
    devId = 'dev_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
    localStorage.setItem('thinkbin_device_id', devId);
  }
  const screenInfo = `${window.screen.width}x${window.screen.height}`;
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  const raw = `${devId}|${screenInfo}|${tz}|${navigator.userAgent}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash) + raw.charCodeAt(i);
    hash |= 0;
  }
  return 'FP_' + Math.abs(hash).toString(16);
}

// 1. Google OAuth ONLY Handler
window.handlePloppGoogleLogin = function() {
  playSound('pop');
  
  const mockUser = {
    googleId: "gid_109283746182",
    email: "raka.pratama@sekolah.sch.id",
    name: "Raka Pratama"
  };
  ploppOnboardingState.googleUser = mockUser;
  ploppOnboardingState.deviceFingerprint = getPloppDeviceFingerprint();

  localStorage.setItem('thinkbin_google_user', JSON.stringify(mockUser));

  // Check if returning user already completed onboarding
  const registered = getPloppRegisteredUsers();
  const existingUser = registered.find(u => u.googleId === mockUser.googleId);

  if (existingUser && existingUser.onboardingCompleted) {
    // Returning user: langsung ke Dashboard!
    localStorage.setItem('thinkbin_onboarding_completed', 'true');
    localStorage.setItem('thinkbin_user_profile', JSON.stringify(existingUser));
    redirectToPloppDashboard();
    return;
  }

  // New User: Proceed to Step 2 (Setup Profil)
  populatePloppClasses();
  showPloppSubstep('ploppStepProfile');
};

// 2. Setup Profil 3-Step (Kelas -> Nama -> Absen)
function populatePloppClasses() {
  const selectClass = document.getElementById('ploppSelectClass');
  if (!selectClass || typeof classRosterData === 'undefined') return;

  const uniqueClasses = [...new Set(classRosterData.map(item => item.className))];
  selectClass.innerHTML = `<option value="" disabled selected>-- Pilih Kelas Kamu --</option>`;
  uniqueClasses.forEach(cls => {
    const opt = document.createElement('option');
    opt.value = cls;
    opt.textContent = `Kelas ${cls}`;
    selectClass.appendChild(opt);
  });
}

window.handlePloppClassChange = function() {
  playSound('pop');
  const selectClass = document.getElementById('ploppSelectClass');
  const selectStudent = document.getElementById('ploppSelectStudent');
  const inputAbsen = document.getElementById('ploppInputAbsen');
  const btnNext = document.getElementById('btnPloppGoToSurvey');
  const warnBox = document.getElementById('ploppWarnBox');

  const selectedClass = selectClass.value;
  ploppOnboardingState.selectedClass = selectedClass;

  selectStudent.innerHTML = `<option value="" disabled selected>-- Pilih Nama Kamu --</option>`;
  inputAbsen.value = '';
  ploppOnboardingState.studentNumber = null;
  btnNext.disabled = true;
  if (warnBox) warnBox.style.display = 'none';

  if (!selectedClass) {
    selectStudent.disabled = true;
    return;
  }

  const studentsInClass = classRosterData.filter(item => item.className === selectedClass);
  studentsInClass.forEach(student => {
    const opt = document.createElement('option');
    opt.value = student.id;
    opt.textContent = `${student.studentNumber}. ${student.studentName}`;
    opt.dataset.name = student.studentName;
    opt.dataset.number = student.studentNumber;
    selectStudent.appendChild(opt);
  });

  selectStudent.disabled = false;
};

window.handlePloppStudentChange = function() {
  playSound('pop');
  const selectStudent = document.getElementById('ploppSelectStudent');
  const inputAbsen = document.getElementById('ploppInputAbsen');
  const btnNext = document.getElementById('btnPloppGoToSurvey');
  const warnBox = document.getElementById('ploppWarnBox');
  const warnText = document.getElementById('ploppWarnText');

  const selectedOption = selectStudent.options[selectStudent.selectedIndex];
  if (!selectedOption || !selectedOption.value) return;

  const studentName = selectedOption.dataset.name;
  const studentNumber = parseInt(selectedOption.dataset.number, 10);

  ploppOnboardingState.selectedStudent = studentName;
  ploppOnboardingState.studentNumber = studentNumber;
  inputAbsen.value = studentNumber;

  // Layer 3: Anti-Duplicate validation
  const isDuplicate = checkPloppAntiDuplicate(ploppOnboardingState.selectedClass, studentNumber);

  if (isDuplicate) {
    if (warnBox) {
      warnBox.style.display = 'block';
      warnText.textContent = `Siswa absen ${studentNumber} (${studentName}) di kelas ${ploppOnboardingState.selectedClass} sudah terdaftar dengan akun lain!`;
    }
    btnNext.disabled = true;
  } else {
    if (warnBox) warnBox.style.display = 'none';
    btnNext.disabled = false;
  }
};

function checkPloppAntiDuplicate(className, studentNumber) {
  const registered = getPloppRegisteredUsers();
  const currentGid = ploppOnboardingState.googleUser ? ploppOnboardingState.googleUser.googleId : '';
  return registered.some(u => 
    u.className === className && 
    u.studentNumber === studentNumber && 
    u.googleId !== currentGid
  );
}

function getPloppRegisteredUsers() {
  try {
    return JSON.parse(localStorage.getItem('thinkbin_registered_roster_users') || '[]');
  } catch (e) {
    return [];
  }
}

window.handlePloppProfileNext = function() {
  playSound('success');

  const profile = {
    googleId: ploppOnboardingState.googleUser ? ploppOnboardingState.googleUser.googleId : 'gid_local',
    email: ploppOnboardingState.googleUser ? ploppOnboardingState.googleUser.email : 'siswa@thinkbin.app',
    displayName: ploppOnboardingState.selectedStudent,
    className: ploppOnboardingState.selectedClass,
    studentNumber: ploppOnboardingState.studentNumber,
    deviceFingerprint: ploppOnboardingState.deviceFingerprint,
    createdAt: new Date().toISOString()
  };

  const registered = getPloppRegisteredUsers();
  registered.push(profile);
  localStorage.setItem('thinkbin_registered_roster_users', JSON.stringify(registered));
  localStorage.setItem('thinkbin_user_profile', JSON.stringify(profile));

  const profileState = {
    displayName: profile.displayName,
    className: profile.className,
    studentNumber: profile.studentNumber,
    level: 1, xp: 0, coins: 640, streak: 1, equippedBorder: 0
  };
  localStorage.setItem('thinkbin_layout_profile_state', JSON.stringify(profileState));
  localStorage.setItem('thinkbin_xp', '0');
  localStorage.setItem('thinkbin_coins', '640');

  // Navigate to Kuisioner Awal using quiz page design
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: 'navigate', screen: 'kuisioner', surveyType: 'awal' }, '*');
  } else {
    window.location.href = '../kuisioner/index.html?type=awal';
  }
};

// 3. Kuisioner Awal
window.checkPloppSurvey = function() {
  const form = document.getElementById('ploppSurveyForm');
  const btn = document.getElementById('btnPloppFinish');
  if (!form || !btn) return;

  const q1 = form.querySelector('input[name="pq1"]:checked');
  const q2 = form.querySelector('input[name="pq2"]:checked');
  const q3 = form.querySelector('input[name="pq3"]:checked');
  const q4 = form.querySelector('input[name="pq4"]:checked');

  if (q1 && q2 && q3 && q4) {
    btn.disabled = false;
    ploppOnboardingState.surveyAnswers = {
      q1: q1.value, q2: q2.value, q3: q3.value, q4: q4.value
    };
  } else {
    btn.disabled = true;
  }
};

window.handlePloppSurveySubmit = function(e) {
  e.preventDefault();
  playSound('success');

  const profile = {
    googleId: ploppOnboardingState.googleUser ? ploppOnboardingState.googleUser.googleId : 'gid_local',
    email: ploppOnboardingState.googleUser ? ploppOnboardingState.googleUser.email : 'siswa@thinkbin.app',
    displayName: ploppOnboardingState.selectedStudent,
    className: ploppOnboardingState.selectedClass,
    studentNumber: ploppOnboardingState.studentNumber,
    deviceFingerprint: ploppOnboardingState.deviceFingerprint,
    surveyAnswers: ploppOnboardingState.surveyAnswers,
    onboardingCompleted: true,
    createdAt: new Date().toISOString()
  };

  const registered = getPloppRegisteredUsers();
  registered.push(profile);
  localStorage.setItem('thinkbin_registered_roster_users', JSON.stringify(registered));
  localStorage.setItem('thinkbin_user_profile', JSON.stringify(profile));
  localStorage.setItem('thinkbin_onboarding_completed', 'true');

  const profileState = {
    displayName: profile.displayName,
    className: profile.className,
    studentNumber: profile.studentNumber,
    level: 1, xp: 0, coins: 640, streak: 1, equippedBorder: 0
  };
  localStorage.setItem('thinkbin_layout_profile_state', JSON.stringify(profileState));
  localStorage.setItem('thinkbin_xp', '0');
  localStorage.setItem('thinkbin_coins', '640');

  redirectToPloppDashboard();
};

function showPloppSubstep(substepId) {
  document.querySelectorAll('.onboarding-substep').forEach(el => el.classList.remove('active'));
  const target = document.getElementById(substepId);
  if (target) target.classList.add('active');
}

function redirectToPloppDashboard() {
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: 'navigate', screen: 'home' }, '*');
  } else {
    window.location.href = '../thinkhome/index.html';
  }
}

// Borders definition for modal display
const ploppBordersConfig = {
  1: { image: '../toko/assets/border1.png', filter: '' },
  2: { image: '../toko/assets/border1.png', filter: 'hue-rotate(30deg) saturate(1.2) brightness(0.95)' },
  3: { image: '../toko/assets/border1.png', filter: 'hue-rotate(240deg) saturate(1.4)' },
  4: { image: '../toko/assets/border2.png', filter: 'hue-rotate(180deg) saturate(1.1)' },
  5: { image: '../toko/assets/border2.png', filter: '' },
  6: { image: '../toko/assets/border2.png', filter: 'hue-rotate(90deg) saturate(1.2)' },
  7: { image: '../toko/assets/border3.png', filter: '' },
  8: { image: '../toko/assets/border3.png', filter: 'hue-rotate(70deg) saturate(1.2)' },
  9: { image: '../toko/assets/border3.png', filter: 'hue-rotate(220deg) saturate(1.3)' },
  10: { image: '../toko/assets/border4.png', filter: '' },
  11: { image: '../toko/assets/border4.png', filter: 'hue-rotate(140deg) saturate(1.2)' },
  12: { image: '../toko/assets/border4.png', filter: 'hue-rotate(320deg) brightness(1.1) saturate(1.4)' }
};

// Mock user profiles on leaderboard
const leaderboardUsers = {
  max: {
    displayName: 'Max',
    rank: 'Champion',
    level: 8,
    xp: '4.850 XP',
    coins: '920',
    streak: '14 Hari',
    borderId: 12,
    avatar: 'assets/mascot_max.png'
  },
  leonardo: {
    displayName: 'Leonardo',
    rank: 'Warrior',
    level: 7,
    xp: '3.420 XP',
    coins: '780',
    streak: '10 Hari',
    borderId: 10,
    avatar: 'assets/mascot_leonardo.png'
  },
  susan: {
    displayName: 'Susan',
    rank: 'Guardian',
    level: 6,
    xp: '2.150 XP',
    coins: '650',
    streak: '8 Hari',
    borderId: 4,
    avatar: 'assets/mascot_susan.png'
  },
  aroma: {
    displayName: 'Aroma',
    rank: 'Explorer',
    level: 5,
    xp: '1.450 XP',
    coins: '430',
    streak: '5 Hari',
    borderId: 1,
    avatar: 'assets/mascot_main.png'
  },
  james: {
    displayName: 'James',
    rank: 'Rookie',
    level: 4,
    xp: '880 XP',
    coins: '290',
    streak: '4 Hari',
    borderId: 0,
    avatar: 'assets/mascot_main.png'
  },
  william: {
    displayName: 'William',
    rank: 'Rookie',
    level: 3,
    xp: '620 XP',
    coins: '180',
    streak: '3 Hari',
    borderId: 0,
    avatar: 'assets/mascot_main.png'
  },
  chloe: {
    displayName: 'Chloe',
    rank: 'Rookie',
    level: 3,
    xp: '510 XP',
    coins: '120',
    streak: '2 Hari',
    borderId: 0,
    avatar: 'assets/mascot_main.png'
  }
};

// Open my profile
window.openMyProfile = function() {
  playSound('pop');
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: 'navigate', screen: 'profile' }, '*');
  } else {
    window.location.href = '../profile/index.html';
  }
};

// Mascot Reactions on Podium
let maxPoseIdx = 1;
let leonardoPoseIdx = 3;
let susanPoseIdx = 6;

window.triggerMascotReaction = function(character) {
  if (!mascotSprites.length) return;

  if (character === 'max') {
    playSound('cheer');
    const possiblePoses = [1, 7, 5, 0];
    maxPoseIdx = possiblePoses[(possiblePoses.indexOf(maxPoseIdx) + 1) % possiblePoses.length];
    renderMascot('maxMascotBox', maxPoseIdx, 'Max');
    createFloatingParticle('🎉', event.clientX, event.clientY);
    createFloatingParticle('⭐', event.clientX + 20, event.clientY - 20);
  } else if (character === 'leonardo') {
    playSound('coin');
    const possiblePoses = [3, 0, 5, 11];
    leonardoPoseIdx = possiblePoses[(possiblePoses.indexOf(leonardoPoseIdx) + 1) % possiblePoses.length];
    renderMascot('leonardoMascotBox', leonardoPoseIdx, 'Leonardo');
    createFloatingParticle('✨', event.clientX, event.clientY);
    createFloatingParticle('👍', event.clientX - 20, event.clientY - 20);
  } else if (character === 'susan') {
    playSound('heart');
    const possiblePoses = [6, 0, 2, 7];
    susanPoseIdx = possiblePoses[(possiblePoses.indexOf(susanPoseIdx) + 1) % possiblePoses.length];
    renderMascot('susanMascotBox', susanPoseIdx, 'Susan');
    createFloatingParticle('💖', event.clientX, event.clientY);
    createFloatingParticle('🥰', event.clientX + 15, event.clientY - 15);
  }
};

// Floating particle celebration
function createFloatingParticle(emoji, x, y) {
  const particle = document.createElement('div');
  particle.textContent = emoji;
  particle.style.position = 'fixed';
  particle.style.left = (x || window.innerWidth / 2) + 'px';
  particle.style.top = (y || window.innerHeight / 2) + 'px';
  particle.style.fontSize = '26px';
  particle.style.pointerEvents = 'none';
  particle.style.zIndex = '99999';
  particle.style.transition = 'all 0.9s cubic-bezier(0.2, 0.8, 0.2, 1)';
  particle.style.transform = 'translate(-50%, -50%) scale(0.5)';
  particle.style.opacity = '1';
  document.body.appendChild(particle);

  requestAnimationFrame(() => {
    const offsetX = (Math.random() - 0.5) * 80;
    const offsetY = -60 - Math.random() * 50;
    particle.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px)) scale(1.4)`;
    particle.style.opacity = '0';
  });

  setTimeout(() => {
    particle.remove();
  }, 950);
}

// 5 RANK TIERS DATA & SWITCHER LOGIC
const LEAGUE_DATA = {
  rookie: {
    title: 'Rank: Rookie',
    days: '5 Hari tersisa',
    emoji: '🌱',
    color: '#84cc16',
    ranks: {
      p1: { name: 'Lucas', xp: 95 },
      p2: { name: 'Oliver', xp: 82 },
      p3: { name: 'Sophia', xp: 74 },
      r4: { name: 'Emily', xp: 61 },
      r5: { name: 'You', xp: 55 },
      r6: { name: 'Daniel', xp: 39 },
      r7: { name: 'Mia', xp: 28 },
      r8: { name: 'Ethan', xp: 18 }
    }
  },
  explorer: {
    title: 'Rank: Explorer',
    days: '3 Hari tersisa',
    emoji: '🧭',
    color: '#f59e0b',
    ranks: {
      p1: { name: 'Max', xp: 234 },
      p2: { name: 'Leonardo', xp: 214 },
      p3: { name: 'Susan', xp: 204 },
      r4: { name: 'Aroma', xp: 173 },
      r5: { name: 'You', xp: 123 },
      r6: { name: 'James', xp: 98 },
      r7: { name: 'William', xp: 76 },
      r8: { name: 'Chloe', xp: 65 }
    }
  },
  guardian: {
    title: 'Rank: Guardian',
    days: '4 Hari tersisa',
    emoji: '🛡️',
    color: '#10b981',
    ranks: {
      p1: { name: 'Alexander', xp: 420 },
      p2: { name: 'Isabella', xp: 395 },
      p3: { name: 'Gabriel', xp: 360 },
      r4: { name: 'Victoria', xp: 310 },
      r5: { name: 'You', xp: 285 },
      r6: { name: 'Sebastian', xp: 240 },
      r7: { name: 'Elijah', xp: 195 },
      r8: { name: 'Harper', xp: 160 }
    }
  },
  warrior: {
    title: 'Rank: Warrior',
    days: '2 Hari tersisa',
    emoji: '⚔️',
    color: '#059669',
    ranks: {
      p1: { name: 'Warrior Kai', xp: 650 },
      p2: { name: 'Leo Knight', xp: 610 },
      p3: { name: 'Susan Blade', xp: 580 },
      r4: { name: 'Alex Prodigy', xp: 520 },
      r5: { name: 'You', xp: 460 },
      r6: { name: 'Valkyrie', xp: 410 },
      r7: { name: 'Titan', xp: 370 },
      r8: { name: 'Phoenix', xp: 330 }
    }
  },
  champion: {
    title: 'Rank: Champion',
    days: '1 Hari tersisa',
    emoji: '👑',
    color: '#eab308',
    ranks: {
      p1: { name: 'Grand Champion', xp: 1250 },
      p2: { name: 'Master Leo', xp: 1180 },
      p3: { name: 'Queen Susan', xp: 1120 },
      r4: { name: 'Dragon Lord', xp: 980 },
      r5: { name: 'You', xp: 920 },
      r6: { name: 'Solaris', xp: 850 },
      r7: { name: 'Aegis', xp: 790 },
      r8: { name: 'Apex', xp: 730 }
    }
  }
};

function switchLeague(tierKey, clickEvent) {
  const league = LEAGUE_DATA[tierKey];
  if (!league) return;

  playSound('levelUp');

  document.querySelectorAll('.league-badge-item').forEach(item => {
    item.classList.remove('active-league');
    if (item.getAttribute('data-tier') === tierKey) {
      item.classList.add('active-league');
    }
  });

  const titleEl = document.getElementById('leagueTitle');
  const countdownEl = document.getElementById('leagueCountdown');
  
  if (titleEl) {
    titleEl.textContent = league.title;
    titleEl.style.color = league.color;
  }
  if (countdownEl) {
    countdownEl.textContent = league.days;
  }

  const r = league.ranks;
  updateTextWithAnim('p1Name', r.p1.name);
  updateTextWithAnim('p1Xp', `${r.p1.xp} XP`);

  updateTextWithAnim('p2Name', r.p2.name);
  updateTextWithAnim('p2Xp', `${r.p2.xp} XP`);

  updateTextWithAnim('p3Name', r.p3.name);
  updateTextWithAnim('p3Xp', `${r.p3.xp} XP`);

  updateTextWithAnim('r4Name', r.r4.name);
  updateTextWithAnim('r4Xp', `${r.r4.xp} XP`);

  updateTextWithAnim('r5Name', r.r5.name);
  updateTextWithAnim('r5Xp', `${r.r5.xp} XP`);

  updateTextWithAnim('r6Name', r.r6.name);
  updateTextWithAnim('r6Xp', `${r.r6.xp} XP`);

  updateTextWithAnim('r7Name', r.r7.name);
  updateTextWithAnim('r7Xp', `${r.r7.xp} XP`);

  updateTextWithAnim('r8Name', r.r8.name);
  updateTextWithAnim('r8Xp', `${r.r8.xp} XP`);

  const clientX = clickEvent ? clickEvent.clientX : window.innerWidth / 2;
  const clientY = clickEvent ? clickEvent.clientY : 200;
  createFloatingParticle(league.emoji, clientX, clientY);
  createFloatingParticle('✨', clientX + 25, clientY - 15);
  createFloatingParticle('🎉', clientX - 25, clientY - 15);
}

function updateTextWithAnim(elementId, newText) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
  el.style.opacity = '0.3';
  el.style.transform = 'translateY(-3px)';
  
  setTimeout(() => {
    el.textContent = newText;
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  }, 120);
}

document.querySelectorAll('.league-badge-item').forEach(badge => {
  badge.addEventListener('click', (e) => {
    const tier = badge.getAttribute('data-tier');
    if (tier) {
      switchLeague(tier, e);
    }
  });
});

document.querySelectorAll('.stat-pill').forEach(pill => {
  pill.addEventListener('click', (e) => {
    playSound('coin');
    const isCoin = pill.classList.contains('coins-pill');
    createFloatingParticle(isCoin ? '🪙' : '⚡', e.clientX, e.clientY);
  });
});

const langSelector = document.getElementById('langSelector');
if (langSelector) {
  const flags = ['🇬🇧', '🇺🇸', '🇪🇸', '🇫🇷', '🇩🇪', '🇯🇵', '🇮🇩'];
  let currentFlagIdx = 0;
  langSelector.addEventListener('click', (e) => {
    playSound('pop');
    currentFlagIdx = (currentFlagIdx + 1) % flags.length;
    langSelector.querySelector('.flag-icon').textContent = flags[currentFlagIdx];
    createFloatingParticle(flags[currentFlagIdx], e.clientX, e.clientY);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadAndSliceMascots();

  // Buka langsung ke screen tertentu kalau ada ?screen=leaderboard di URL
  const params = new URLSearchParams(window.location.search);
  const targetScreen = params.get('screen');
  if (targetScreen === 'leaderboard') {
    window.showScreen('leaderboard');
  }
});
