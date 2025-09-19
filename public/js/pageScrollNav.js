// pageScrollNav.js
// Automatically navigate to next/previous page on scroll or swipe
(function() {
  // Define the order of your pages
  const pages = [
    'index.html',
    'about.html',
    'projects.html',
    'game.html',
    'contact.html'
  ];
  // Get current page index
  const current = window.location.pathname.split('/').pop();
  const idx = pages.indexOf(current);
  if (idx === -1) return;

  let lastScroll = 0;
  let scrollTimeout = null;
  function goToPage(newIdx) {
    if (newIdx >= 0 && newIdx < pages.length) {
      window.location.href = pages[newIdx];
    }
  }

  // Desktop: scroll wheel
  window.addEventListener('wheel', function(e) {
    // Block navigation if event is inside the game area
    if (document.getElementById('game')) {
      const gameRect = document.getElementById('game').getBoundingClientRect();
      if (
        e.clientX >= gameRect.left && e.clientX <= gameRect.right &&
        e.clientY >= gameRect.top && e.clientY <= gameRect.bottom
      ) {
        return;
      }
    }
    if (scrollTimeout) return;
    if (e.deltaY > 120) {
      goToPage(idx + 1);
    } else if (e.deltaY < -120) {
      goToPage(idx - 1);
    }
    scrollTimeout = setTimeout(() => { scrollTimeout = null; }, 800);
  }, { passive: false });

  // Mobile: swipe up/down
  let touchStartY = null;
  let touchEndY = null;
  let touchTargetIsGame = false;
  document.addEventListener('touchstart', function(e) {
    if (e.touches.length === 1) {
      touchStartY = e.touches[0].clientY;
      // Check if touch is on game area
      const game = document.getElementById('game');
      if (game) {
        const rect = game.getBoundingClientRect();
        const x = e.touches[0].clientX;
        const y = e.touches[0].clientY;
        touchTargetIsGame = (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom);
      } else {
        touchTargetIsGame = false;
      }
    }
  });
  document.addEventListener('touchend', function(e) {
    if (touchStartY === null) return;
    if (touchTargetIsGame) {
      touchStartY = null;
      touchEndY = null;
      touchTargetIsGame = false;
      return;
    }
    touchEndY = e.changedTouches[0].clientY;
    const dy = touchEndY - touchStartY;
    if (Math.abs(dy) > 140) {
      if (dy < 0) {
        goToPage(idx + 1); // swipe up
      } else {
        goToPage(idx - 1); // swipe down
      }
    }
    touchStartY = null;
    touchEndY = null;
    touchTargetIsGame = false;
  });
})();
