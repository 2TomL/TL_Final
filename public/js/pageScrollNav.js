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

  const currentSectionIndex = getSectionIndex();
  if (!isHomePage && currentSectionIndex === -1) return;

  let scrollTimeout = null;
  let navInProgress = false;

  function navigateToIndex(idx) {
    if (idx < 0 || idx >= sections.length || navInProgress) return;
    navInProgress = true;
    if (isHomePage) {
      const target = document.getElementById(sections[idx]);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      window.location.href = pages[idx];
    }

    setTimeout(() => {
      navInProgress = false;
    }, 480);
  }

  // Desktop: scroll wheel
  window.addEventListener('wheel', function(e) {
    const idx = getSectionIndex();
    if (idx === -1 || scrollTimeout || navInProgress) return;

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
  let touchStartX = null;
  let touchStartY = null;
  let touchEndX = null;
  let touchEndY = null;
  let touchTargetIsGameCanvas = false;
  let touchTargetIsInteractive = false;

  function resetTouchState() {
    touchStartX = null;
    touchStartY = null;
    touchEndX = null;
    touchEndY = null;
    touchTargetIsGameCanvas = false;
    touchTargetIsInteractive = false;
  }

  function isInteractiveTarget(target) {
    if (!target || !target.closest) return false;
    return !!target.closest(
      '#projects .carousel, #design [data-design-slider], #contact form, #contact input, #contact textarea, #contact button, #contact select, .phone, .phone *, .design-modal, .graphic-slideshow-modal, a, button, input, textarea, select'
    );
  }

  document.addEventListener('touchstart', function(e) {
    if (e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchEndX = touchStartX;
      touchEndY = touchStartY;

      // Keep snake controls playable: ignore section swipe when touch starts on game canvas area.
      touchTargetIsGameCanvas = !!(e.target && e.target.closest && e.target.closest('#game #canvas, #game #canvas canvas'));
      touchTargetIsInteractive = isInteractiveTarget(e.target);
    }
  });
  document.addEventListener('touchmove', function(e) {
    if (!e.touches || e.touches.length !== 1 || touchStartY === null) return;
    touchEndX = e.touches[0].clientX;
    touchEndY = e.touches[0].clientY;
  }, { passive: true });
  document.addEventListener('touchend', function(e) {
    if (touchStartY === null || navInProgress) {
      resetTouchState();
      return;
    }
    if (touchTargetIsGameCanvas || touchTargetIsInteractive) {
      resetTouchState();
      return;
    }
    const idx = getSectionIndex();
    if (idx === -1) {
      resetTouchState();
      return;
    }
    const fallbackTouch = e.changedTouches && e.changedTouches[0];
    if (touchEndX === null && fallbackTouch) touchEndX = fallbackTouch.clientX;
    if (touchEndY === null && fallbackTouch) touchEndY = fallbackTouch.clientY;
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;

    // Prioritize vertical intent while keeping swipe-up responsive.
    if (Math.abs(dy) > 68 && Math.abs(dy) > Math.abs(dx) * 0.95) {
      if (dy < 0) {
        navigateToIndex(idx + 1); // swipe up
      } else {
        navigateToIndex(idx - 1); // swipe down
      }
    }
    resetTouchState();
  });
})();
