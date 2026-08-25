/**
 * Shared Global Bottom Navigation Bar Logic
 */
function initGlobalNavbar() {
  const navbar = document.querySelector('.global-navbar');
  const navItems = document.querySelectorAll('.global-nav-item');
  const activeIndicator = document.querySelector('.global-active-indicator');

  if (!navbar || !navItems.length || !activeIndicator) return;

  function updateActiveIndicator(activeItem) {
    if (!activeItem) return;
    const left = activeItem.offsetLeft;
    const width = activeItem.offsetWidth;
    const height = activeItem.offsetHeight;

    activeIndicator.style.left = `${left}px`;
    activeIndicator.style.width = `${width}px`;
    activeIndicator.style.height = `${height}px`;
  }

  // Initial indicator position
  const initialActive = document.querySelector('.global-nav-item.active') || navItems[0];
  if (initialActive) {
    // Delay slightly to ensure layout is computed
    setTimeout(() => updateActiveIndicator(initialActive), 60);
  }

  // Handle window resizing
  window.addEventListener('resize', () => {
    const activeItem = document.querySelector('.global-nav-item.active');
    if (activeItem) {
      activeIndicator.style.transition = 'none';
      updateActiveIndicator(activeItem);
      void activeIndicator.offsetHeight;
      activeIndicator.style.transition = 'all 0.38s cubic-bezier(0.34, 1.56, 0.64, 1)';
    }
  });

  // Click handler
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const screenName = item.getAttribute('data-screen');

      // Trigger bounce animation
      const iconWrapper = item.querySelector('.global-icon-wrapper');
      if (iconWrapper) {
        iconWrapper.classList.remove('animate');
        void iconWrapper.offsetWidth;
        iconWrapper.classList.add('animate');
      }

      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      updateActiveIndicator(item);

      // Navigate after small delay for smooth visual feedback
      setTimeout(() => {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ type: 'navigate', screen: screenName }, '*');
        } else {
          // Fallback standalone routes
          const routes = {
            'home': '../thinkhome/index.html',
            'learning-map': '../learning-map/index.html',
            'plopp': '../plopp/leaderboard.html',
            'toko': '../toko/index.html',
            'profile': '../profile/index.html'
          };
          if (routes[screenName]) {
            window.location.href = routes[screenName];
          }
        }
      }, 150);
    });

    const iconWrapper = item.querySelector('.global-icon-wrapper');
    if (iconWrapper) {
      iconWrapper.addEventListener('animationend', () => {
        iconWrapper.classList.remove('animate');
      });
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGlobalNavbar);
} else {
  initGlobalNavbar();
}
