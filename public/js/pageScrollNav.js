// pageScrollNav.js
// Automatically navigate to next/previous section on scroll or swipe for the one-page site
(function() {
  const currentPage = window.location.pathname.split('/').pop();
  const isHomePage = currentPage === '' || currentPage === 'index.html';
  const sections = ['home', 'about', 'projects', 'game', 'contact'];
  const pages = ['index.html', 'about.html', 'projects.html', 'game.html', 'contact.html'];

  function getSectionIndex() {
    if (!isHomePage) {
      const idx = pages.indexOf(currentPage);
      return idx;
    }
    const scrollPosition = window.scrollY + window.innerHeight / 2;
    for (let i = sections.length - 1; i >= 0; i--) {
      const el = document.getElementById(sections[i]);
      if (el && el.offsetTop <= scrollPosition) {
        return i;
      }
    }
    return 0;
  }

  function goToSection(idx) {
    if (idx >= 0 && idx < sections.length) {
      const target = document.getElementById(sections[idx]);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (!isHomePage) {
        window.location.href = pages[idx];
      }
    }
  }

  const currentSectionIndex = getSectionIndex();
  if (!isHomePage && currentSectionIndex === -1) return;

  let scrollTimeout = null;

  function navigateToIndex(idx) {
    if (idx < 0 || idx >= sections.length) return;
    if (isHomePage) {
      const target = document.getElementById(sections[idx]);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      window.location.href = pages[idx];
    }
  }

  // Desktop: scroll wheel
  window.addEventListener('wheel', function(e) {
    const idx = getSectionIndex();
    if (idx === -1 || scrollTimeout) return;

    const game = document.getElementById('game');
    if (game) {
      const gameRect = game.getBoundingClientRect();
      if (
        e.clientX >= gameRect.left && e.clientX <= gameRect.right &&
        e.clientY >= gameRect.top && e.clientY <= gameRect.bottom
      ) {
        return;
      }
    }
    if (e.deltaY > 120) {
      navigateToIndex(idx + 1);
    } else if (e.deltaY < -120) {
      navigateToIndex(idx - 1);
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
    const idx = getSectionIndex();
    if (idx === -1) return;
    touchEndY = e.changedTouches[0].clientY;
    const dy = touchEndY - touchStartY;
    if (Math.abs(dy) > 140) {
      if (dy < 0) {
        navigateToIndex(idx + 1); // swipe up
      } else {
        navigateToIndex(idx - 1); // swipe down
      }
    }
    touchStartY = null;
    touchEndY = null;
    touchTargetIsGame = false;
  });
})();
