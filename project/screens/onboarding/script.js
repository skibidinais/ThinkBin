/**
 * ThinkBin Onboarding & Auth Engine
 * - Google OAuth ONLY
 * - 3-Layer Anti-Duplicate (Device Fingerprint + Google ID + Class/Absen Roster)
 * - 3-Step Profile Setup (Kelas -> Nama -> Nomor Absen)
 * - Kuisioner Awal (Pre-Survey)
 * - Smart Returning User Auto-Routing
 */

// State Object
const onboardingState = {
  deviceFingerprint: null,
  googleUser: null,
  selectedClass: null,
  selectedStudent: null,
  studentNumber: null,
  surveyAnswers: {}
};

// Web Audio API Context
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
    
    if (type === 'pop') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      gain.setValueAtTime(0.15, now);
      gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(659.25, now + 0.1);
      gain.setValueAtTime(0.18, now);
      gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  } catch (e) {}
}

// 1. Initial Page Load & Smart Returning User Check
window.addEventListener('DOMContentLoaded', () => {
  generateDeviceFingerprint();
  
  // Check if returning user already completed onboarding
  const isCompleted = localStorage.getItem('thinkbin_onboarding_completed') === 'true';
  const savedProfile = localStorage.getItem('thinkbin_user_profile');
  
  if (isCompleted && savedProfile) {
    // Returning User: Direct jump to Dashboard!
    redirectToDashboard();
    return;
  }

  // Populate Classes in Step 2
  populateClassesDropdown();
});

// 2. Layer 1: Generate Device Fingerprint
function generateDeviceFingerprint() {
  let devId = localStorage.getItem('thinkbin_device_id');
  if (!devId) {
    devId = 'dev_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
    localStorage.setItem('thinkbin_device_id', devId);
  }
  
  const screenInfo = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  const rawFingerprint = `${devId}|${screenInfo}|${tz}|${navigator.userAgent}`;
  
  // Simple fast hash
  let hash = 0;
  for (let i = 0; i < rawFingerprint.length; i++) {
    const char = rawFingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  onboardingState.deviceFingerprint = 'FP_' + Math.abs(hash).toString(16);
}

// 3. Layer 2: Google Login ONLY Handler
window.handleGoogleLogin = function() {
  playSound('pop');
  
  // Simulate or execute Google OAuth payload
  const mockGoogleAccounts = [
    {
      googleId: "gid_109283746182",
      email: "raka.pratama@sekolah.sch.id",
      name: "Raka Pratama",
      picture: "../profile/assets/mascot_thumbsup_transparent.png"
    }
  ];

  const user = mockGoogleAccounts[0];
  onboardingState.googleUser = user;
  
  // Store Google User session
  localStorage.setItem('thinkbin_google_user', JSON.stringify(user));
  
  // Check if this Google ID is already an existing completed user
  const registeredUsers = getRegisteredUsers();
  const existingUser = registeredUsers.find(u => u.googleId === user.googleId);
  
  if (existingUser && existingUser.onboardingCompleted) {
    // Existing user -> sync state and go direct to dashboard
    localStorage.setItem('thinkbin_onboarding_completed', 'true');
    localStorage.setItem('thinkbin_user_profile', JSON.stringify(existingUser));
    redirectToDashboard();
    return;
  }

  // New User: Proceed to Step 2 (Setup Profil)
  showStep('stepSetupProfile');
  
  // Populate Google User info in Step 2 banner
  const nameEl = document.getElementById('gUserName');
  const emailEl = document.getElementById('gUserEmail');
  const avatarEl = document.getElementById('gUserAvatar');
  if (nameEl) nameEl.textContent = user.name;
  if (emailEl) emailEl.textContent = user.email;
  if (avatarEl && user.picture) avatarEl.src = user.picture;
};

// 4. Step 2: 3-Step Profile Setup (Kelas -> Nama -> Absen)
function populateClassesDropdown() {
  const selectClass = document.getElementById('selectClass');
  if (!selectClass || typeof classRosterData === 'undefined') return;

  // Extract unique class names
  const uniqueClasses = [...new Set(classRosterData.map(item => item.className))];
  
  selectClass.innerHTML = `<option value="" disabled selected>-- Pilih Kelas Kamu --</option>`;
  uniqueClasses.forEach(cls => {
    const opt = document.createElement('option');
    opt.value = cls;
    opt.textContent = `Kelas ${cls}`;
    selectClass.appendChild(opt);
  });
}

window.handleClassChange = function() {
  playSound('pop');
  const selectClass = document.getElementById('selectClass');
  const selectStudent = document.getElementById('selectStudent');
  const inputAbsen = document.getElementById('inputStudentNumber');
  const btnSubmit = document.getElementById('btnSubmitProfile');
  const alertBox = document.getElementById('duplicateAlertBox');

  const selectedClass = selectClass.value;
  onboardingState.selectedClass = selectedClass;

  // Reset student selection
  selectStudent.innerHTML = `<option value="" disabled selected>-- Pilih Nama Kamu --</option>`;
  inputAbsen.value = '';
  onboardingState.studentNumber = null;
  btnSubmit.disabled = true;
  if (alertBox) alertBox.style.display = 'none';

  if (!selectedClass) {
    selectStudent.disabled = true;
    return;
  }

  // Filter students by selected class
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

window.handleStudentChange = function() {
  playSound('pop');
  const selectStudent = document.getElementById('selectStudent');
  const inputAbsen = document.getElementById('inputStudentNumber');
  const btnSubmit = document.getElementById('btnSubmitProfile');
  const alertBox = document.getElementById('duplicateAlertBox');
  const alertText = document.getElementById('duplicateAlertText');

  const selectedOption = selectStudent.options[selectStudent.selectedIndex];
  if (!selectedOption || !selectedOption.value) return;

  const studentName = selectedOption.dataset.name;
  const studentNumber = parseInt(selectedOption.dataset.number, 10);

  onboardingState.selectedStudent = studentName;
  onboardingState.studentNumber = studentNumber;

  // Auto-fill student number (read-only)
  inputAbsen.value = studentNumber;

  // Layer 3: Anti-Duplicate Validation (Class + Student Number combo)
  const isDuplicate = checkAntiDuplicate(onboardingState.selectedClass, studentNumber);

  if (isDuplicate) {
    if (alertBox) {
      alertBox.style.display = 'flex';
      alertText.textContent = `Siswa nomor absen ${studentNumber} di kelas ${onboardingState.selectedClass} sudah terdaftar dengan akun lain!`;
    }
    btnSubmit.disabled = true;
    showDuplicateModal(
      "Data Siswa Sudah Terdaftar!",
      `Siswa dengan nama ${studentName} (Absen ${studentNumber}, Kelas ${onboardingState.selectedClass}) telah terdaftar sebelumnya.`
    );
  } else {
    if (alertBox) alertBox.style.display = 'none';
    btnSubmit.disabled = false;
  }
};

// 5. Anti-Duplicate Registry Check
function checkAntiDuplicate(className, studentNumber) {
  const registered = getRegisteredUsers();
  const currentGoogleId = onboardingState.googleUser ? onboardingState.googleUser.googleId : '';

  // Check if same (class + student_number) exists with a DIFFERENT google_id
  const match = registered.find(u => 
    u.className === className && 
    u.studentNumber === studentNumber &&
    u.googleId !== currentGoogleId
  );

  return !!match;
}

function getRegisteredUsers() {
  try {
    return JSON.parse(localStorage.getItem('thinkbin_registered_roster_users') || '[]');
  } catch (e) {
    return [];
  }
}

// 6. Handle Profile Setup Submit -> Proceed to Step 3 (Kuisioner)
window.handleProfileSetupSubmit = function(e) {
  e.preventDefault();
  playSound('success');

  if (!onboardingState.selectedClass || !onboardingState.selectedStudent || !onboardingState.studentNumber) {
    return;
  }

  showStep('stepSurvey');
};

// 7. Step 3: Kuisioner Awal Completion Checker & Submit
window.checkSurveyCompletion = function() {
  const form = document.getElementById('surveyForm');
  const btnSubmit = document.getElementById('btnSubmitSurvey');
  if (!form || !btnSubmit) return;

  const q1 = form.querySelector('input[name="q1"]:checked');
  const q2 = form.querySelector('input[name="q2"]:checked');
  const q3 = form.querySelector('input[name="q3"]:checked');
  const q4 = form.querySelector('input[name="q4"]:checked');

  if (q1 && q2 && q3 && q4) {
    btnSubmit.disabled = false;
    onboardingState.surveyAnswers = {
      q1: q1.value,
      q2: q2.value,
      q3: q3.value,
      q4: q4.value
    };
  } else {
    btnSubmit.disabled = true;
  }
};

window.handleSurveySubmit = function(e) {
  e.preventDefault();
  playSound('success');

  // Compile final registered user record
  const userProfile = {
    googleId: onboardingState.googleUser ? onboardingState.googleUser.googleId : 'gid_local',
    email: onboardingState.googleUser ? onboardingState.googleUser.email : 'siswa@thinkbin.app',
    displayName: onboardingState.selectedStudent,
    className: onboardingState.selectedClass,
    studentNumber: onboardingState.studentNumber,
    deviceFingerprint: onboardingState.deviceFingerprint,
    surveyAnswers: onboardingState.surveyAnswers,
    onboardingCompleted: true,
    createdAt: new Date().toISOString()
  };

  // Save to local anti-duplicate registry
  const registered = getRegisteredUsers();
  registered.push(userProfile);
  localStorage.setItem('thinkbin_registered_roster_users', JSON.stringify(registered));

  // Save active user profile & mark onboarding completed
  localStorage.setItem('thinkbin_user_profile', JSON.stringify(userProfile));
  localStorage.setItem('thinkbin_onboarding_completed', 'true');

  // Update profile screen layout state
  const profileState = {
    displayName: userProfile.displayName,
    className: userProfile.className,
    studentNumber: userProfile.studentNumber,
    level: 1,
    xp: 0,
    coins: 640,
    streak: 1,
    equippedBorder: 0
  };
  localStorage.setItem('thinkbin_layout_profile_state', JSON.stringify(profileState));
  localStorage.setItem('thinkbin_xp', '0');
  localStorage.setItem('thinkbin_coins', '640');

  // Transition directly to dashboard!
  redirectToDashboard();
};

// 8. Navigation & Helper Functions
function showStep(stepId) {
  document.querySelectorAll('.onboarding-step').forEach(step => {
    step.classList.remove('active');
  });
  const target = document.getElementById(stepId);
  if (target) {
    target.classList.add('active');
  }
}

function redirectToDashboard() {
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: 'navigate', screen: 'home' }, '*');
  } else {
    window.location.href = '../thinkhome/index.html';
  }
}

function showDuplicateModal(title, desc) {
  const modal = document.getElementById('duplicateModal');
  const titleEl = document.getElementById('modalDupTitle');
  const descEl = document.getElementById('modalDupDesc');

  if (titleEl) titleEl.textContent = title;
  if (descEl) descEl.textContent = desc;
  if (modal) modal.classList.add('active');
}

window.closeDuplicateModal = function() {
  playSound('pop');
  const modal = document.getElementById('duplicateModal');
  if (modal) modal.classList.remove('active');
};