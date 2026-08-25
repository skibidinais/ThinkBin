const screens = {
  home: 'screens/thinkhome/index.html',
  'learning-map': 'screens/learning-map/index.html',
  bacaan: 'screens/bacaan/index.html',
  quiz: 'screens/quiz/index.html',
  'celeb-a': 'screens/celeb-a/index.html',
  'celeb-c': 'screens/celeb-c/index.html',
  mission: 'screens/mission/index.html',
  dailygoals: 'screens/dailygoals/index.html',
  plopp: 'screens/plopp/leaderboard.html',
  profile: 'screens/profile/index.html',
  toko: 'screens/toko/index.html',
  onboarding: 'screens/plopp/index.html',
  tantangan: 'screens/tantangan/index.html',
  kuisioner: 'screens/kuisioner/index.html',
};

const celebrationVariants = ['celeb-a', 'celeb-c'];

const frame = document.getElementById('screenFrame');
const navButtons = document.querySelectorAll('.nav-btn');

function goTo(screenName, extraParams = '') {
  if (!screens[screenName]) return;
  
  let targetUrl = screens[screenName];
  if (extraParams) {
    targetUrl += (targetUrl.includes('?') ? '&' : '?') + extraParams;
  }
  
  frame.src = targetUrl;
  window.location.hash = screenName;

  navButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.screen === screenName);
  });
}

// Klik menu nav atas
navButtons.forEach(btn => {
  btn.addEventListener('click', () => goTo(btn.dataset.screen));
});

// Dengarkan pesan dari screen di dalam iframe (home, learning-map, bacaan, quiz, celebration, dll)
window.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || typeof data !== 'object') return;

  if (data.type === 'navigate' && data.screen) {
    let params = '';
    if (data.nodeId) params += `nodeId=${data.nodeId}`;
    if (data.level) params += (params ? '&' : '') + `level=${data.level}`;
    if (data.map) params += (params ? '&' : '') + `map=${data.map}`;
    if (data.user) params += (params ? '&' : '') + `user=${data.user}`;
    if (data.name) params += (params ? '&' : '') + `name=${data.name}`;
    if (data.surveyType) params += (params ? '&' : '') + `type=${data.surveyType}`;
    goTo(data.screen, params);
  }

  if (data.type === 'quiz-finished' || data.type === 'node-finished') {
    // Setelah quiz/node selesai, langsung menuju celebration screen (celeb-a atau celeb-c secara acak)
    let params = '';
    if (data.nodeId) params += `nodeId=${data.nodeId}`;
    if (data.xp) params += (params ? '&' : '') + `xp=${data.xp}`;
    const targetScreen = data.screen || (Math.random() < 0.5 ? 'celeb-a' : 'celeb-c');
    goTo(targetScreen, params);
  }
});

// Initial screen routing: check if user has completed onboarding or hash is set
const initialHash = window.location.hash.replace('#', '');
if (initialHash && screens[initialHash]) {
  goTo(initialHash);
} else {
  const isCompleted = localStorage.getItem('thinkbin_onboarding_completed') === 'true';
  goTo(isCompleted ? 'learning-map' : 'onboarding');
}
