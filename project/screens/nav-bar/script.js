document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.getElementById('navbar');
  const navItems = document.querySelectorAll('.nav-item');
  const activeIndicator = document.getElementById('active-indicator');

  // Function to calculate and update active indicator dimensions and left coordinate
  function updateActiveIndicator(activeItem) {
    if (!activeItem) return;
    
    // Calculate coordinates relative to parent navbar
    const left = activeItem.offsetLeft;
    const width = activeItem.offsetWidth;
    const height = activeItem.offsetHeight;

    // Apply coordinates to the indicator
    activeIndicator.style.left = `${left}px`;
    activeIndicator.style.width = `${width}px`;
    activeIndicator.style.height = `${height}px`;
  }

  // Set initial position of indicator on page load
  const initialActive = document.querySelector('.nav-item.active');
  if (initialActive) {
    updateActiveIndicator(initialActive);
  }

  // Reposition active indicator on window resizing
  window.addEventListener('resize', () => {
    const activeItem = document.querySelector('.nav-item.active');
    if (activeItem) {
      // Temporarily disable transition during resize for snappiness
      activeIndicator.style.transition = 'none';
      updateActiveIndicator(activeItem);
      // Force reflow and re-enable transition
      void activeIndicator.offsetHeight;
      activeIndicator.style.transition = 'all 0.38s cubic-bezier(0.34, 1.56, 0.64, 1)';
    }
  });

  // Add click event listeners to all nav items
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      // If clicked item is already active, just replay the animation
      const wasActive = item.classList.contains('active');
      
      if (!wasActive) {
        // Remove active state from all items and add to clicked one
        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        // Move the active indicator background
        updateActiveIndicator(item);
      }

      // Trigger the bounce/squish animation on the clicked icon wrapper
      const iconWrapper = item.querySelector('.icon-wrapper');
      iconWrapper.classList.remove('animate');
      // Force browser layout reflow to restart animation from 0%
      void iconWrapper.offsetWidth;
      iconWrapper.classList.add('animate');
    });

    // Clear the animation class once it finishes to keep HTML clean
    const iconWrapper = item.querySelector('.icon-wrapper');
    iconWrapper.addEventListener('animationend', () => {
      iconWrapper.classList.remove('animate');
    });
  });
});
