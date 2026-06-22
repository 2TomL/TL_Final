(function() {
  // Expose globally for inline HTML onclick
  window.openMixmasterVideo = function(e) {
    e.preventDefault();
    const videoUrl = 'public/assets/videos/Desktop 2025.08.26 - 20.32.04.03.mp4';
    const videoModal = document.createElement('div');
    videoModal.style.position = 'fixed';
    videoModal.style.top = '0';
    videoModal.style.left = '0';
    videoModal.style.width = '100vw';
    videoModal.style.height = '100vh';
    videoModal.style.background = 'rgba(0,0,0,0.92)';
    videoModal.style.zIndex = '9999';
    videoModal.style.display = 'flex';
    videoModal.style.alignItems = 'center';
    videoModal.style.justifyContent = 'center';
    videoModal.innerHTML = `
      <video src="${videoUrl}" controls autoplay style="max-width:90vw; max-height:80vh; border-radius:12px; box-shadow:0 2px 32px #000; background:#111;" volume="0.3"></video>
      <button style="position:absolute;top:2vw;right:2vw;font-size:2rem;background:none;border:none;color:#fff;cursor:pointer;z-index:10001;" onclick="this.parentElement.remove()">&times;</button>
    `;
    document.body.appendChild(videoModal);
    // Set volume lower after autoplay
    const vid = videoModal.querySelector('video');
    if (vid) vid.volume = 0.3;
  }
})();
(function() {
  "use strict";

  const carousel = document.querySelector('.carousel');
  if (!carousel) return;
  const slider = carousel.querySelector('.carousel__slider');
  let items = Array.from(carousel.querySelectorAll('.carousel__slider__item'));

  const shouldHideGraphicOnDesktop = window.matchMedia('(min-width: 701px) and (hover: hover) and (pointer: fine)').matches;
  if (shouldHideGraphicOnDesktop) {
    items = items.filter(item => {
      const isGraphicProjectsCard = !!item.querySelector('.card-graphic-projects');
      if (isGraphicProjectsCard) {
        item.remove();
      }
      return !isGraphicProjectsCard;
    });
  }

  const prevBtn = carousel.querySelector('.carousel__prev');
  const nextBtn = carousel.querySelector('.carousel__next');
  if (!slider || !items.length) return;

  let currIndex = 0;
  let interval, intervalTime = 4000;
  const itemCount = items.length;
  let theta, radius;
  let eventsBound = false;

  function isIOSDevice() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  function useFlatMobileCarousel() {
    return window.matchMedia('(max-width: 700px)').matches && isIOSDevice();
  }

  function updateFlatCarousel() {
    for (let i = 0; i < itemCount; i++) {
      const item = items[i];
      const isActive = i === currIndex;
      item.style.display = isActive ? 'flex' : 'none';
      item.style.position = 'relative';
      item.style.top = '';
      item.style.left = '';
      item.style.transform = 'none';
      item.style.transformOrigin = '';
      item.style.backfaceVisibility = '';
      item.style.opacity = '1';
      item.style.pointerEvents = isActive ? 'auto' : 'none';
      item.style.zIndex = isActive ? '2' : '0';
      item.classList.toggle('carousel__slider__item--active', isActive);
    }

    const activeCard = items[currIndex] ? items[currIndex].querySelector('.card') : null;
    slider.style.width = '100%';
    slider.style.maxWidth = '100%';
    slider.style.margin = '0 auto';
    slider.style.left = '0';
    slider.style.transform = 'none';
    slider.style.height = activeCard ? (activeCard.offsetHeight + 20) + 'px' : 'auto';
  }

  function updateGeometry() {
    if (useFlatMobileCarousel()) {
      slider.style.width = '100%';
      slider.style.maxWidth = '100%';
      slider.style.height = 'auto';
      slider.style.perspective = 'none';
      return;
    }

    // Card breedte ophalen uit CSS of DOM
    const card = items[0].querySelector('.card');
    const cardWidth = card ? card.offsetWidth : 320;
    theta = 360 / itemCount;
    // radius = (cardWidth / 2) / Math.tan(Math.PI / itemCount);
    // Beter: radius = cardWidth / (2 * Math.tan(Math.PI / itemCount))
    radius = cardWidth / (2 * Math.tan(Math.PI / itemCount));
    // Zorg dat de slider groot genoeg is
    slider.style.width = cardWidth + 'px';
    slider.style.height = card.offsetHeight + 'px';
    slider.style.perspective = '1200px';
    slider.style.overflow = 'visible';
    // Carousel container ook overflow visible
    if (slider.parentElement) slider.parentElement.style.overflow = 'visible';
  }

  function setup3D() {
    if (useFlatMobileCarousel()) {
      slider.style.transformStyle = 'flat';
      slider.style.position = 'relative';
      slider.style.touchAction = 'pan-y';
      updateGeometry();
      updateFlatCarousel();
      return;
    }

    updateGeometry();
    slider.style.transformStyle = 'preserve-3d';
    slider.style.position = 'relative';
    slider.style.touchAction = 'pan-y';
    for (let i = 0; i < itemCount; i++) {
      const item = items[i];
      item.style.position = 'absolute';
      item.style.top = '0';
      item.style.left = '0';
      item.style.transformOrigin = `50% 50% ${-radius}px`;
      item.style.backfaceVisibility = 'hidden';
      item.style.transition = 'transform 0.9s cubic-bezier(.4,2,.6,1), opacity 0.5s';
      item.style.opacity = '1';
      item.style.zIndex = '1';
    }
    update3D();
    // Force a reflow to ensure the initial state is correct
    void slider.offsetWidth;
  }

  function update3D() {
    if (useFlatMobileCarousel()) {
      updateFlatCarousel();
      return;
    }

    // Always use 3D carousel, also on mobile
    for (let i = 0; i < itemCount; i++) {
      const item = items[i];
      let rel = i - currIndex;
      // wrap-around logic
      if (rel < -Math.floor(itemCount/2)) rel += itemCount;
      if (rel > Math.floor(itemCount/2)) rel -= itemCount;
      // Special case for 3 of 4 items: always show prev/next
      if (itemCount <= 4) {
        if (rel === -(itemCount-1)) rel = 1;
        if (rel === (itemCount-1)) rel = -1;
        if (itemCount === 3 && rel === 2) rel = -1;
        if (itemCount === 3 && rel === -2) rel = 1;
      }
      let angle = theta * rel;
      item.style.display = 'flex';
      item.style.position = 'absolute';
      item.style.top = '0';
      item.style.left = '0';
      item.style.transformOrigin = `50% 50% ${-radius}px`;
      item.style.backfaceVisibility = 'hidden';
      item.style.transition = 'transform 0.9s cubic-bezier(.4,2,.6,1), opacity 0.5s, scale 0.5s';
      item.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;
      // Show always the center, left and right
      if (rel === 0) {
        item.style.opacity = '1';
        item.style.scale = '1';
        item.style.pointerEvents = 'auto';
        item.style.zIndex = '2';
        item.classList.add('carousel__slider__item--active');
      } else if (rel === -1 || rel === 1) {
        item.style.opacity = '0.7';
        item.style.scale = '0.92';
        item.style.pointerEvents = 'auto';
        item.style.zIndex = '1';
        item.classList.remove('carousel__slider__item--active');
      } else {
        item.style.opacity = '0';
        item.style.scale = '0.85';
        item.style.pointerEvents = 'none';
        item.style.zIndex = '0';
        item.classList.remove('carousel__slider__item--active');
      }
    }
    // Dynamically adjust slider size to active card
    let maxCardHeight = 0;
    items.forEach(item => {
      const card = item.querySelector('.card');
      if (card) {
        maxCardHeight = Math.max(maxCardHeight, card.offsetHeight);
      }
    });
    slider.style.width = 'fit-content';
    slider.style.margin = '0 auto';
    slider.style.left = '';
    slider.style.transform = `translateZ(${-radius}px)`;
    slider.style.height = (maxCardHeight + 80) + 'px';
  }



  // Move isSwiping outside bindEvents to persist across function calls
  let isSwiping = false;

  function prev() {
    currIndex = (currIndex - 1 + itemCount) % itemCount;
    update3D();
  }

  function next() {
    currIndex = (currIndex + 1) % itemCount;
    update3D();
  }

  function bindEvents() {
    if (eventsBound) return;
    eventsBound = true;

    if (prevBtn) prevBtn.addEventListener('click', prev);
    if (nextBtn) nextBtn.addEventListener('click', next);
    window.addEventListener('resize', () => {
      setup3D();
    });
    
    // Swipe support
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchDeltaX = 0;
    let touchDeltaY = 0;
    
    slider.addEventListener('touchstart', function(e) {
      if (isSwiping) return; // Ignore new swipes during animation
      if (!e.changedTouches || !e.changedTouches.length) return;
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
      touchDeltaX = 0;
      touchDeltaY = 0;
    }, { passive: true });

    slider.addEventListener('touchmove', function(e) {
      if (isSwiping) return;
      if (!e.changedTouches || !e.changedTouches.length) return;

      touchDeltaX = e.changedTouches[0].screenX - touchStartX;
      touchDeltaY = e.changedTouches[0].screenY - touchStartY;

      // Keep vertical page scroll, but block horizontal page panning while swiping carousel.
      if (Math.abs(touchDeltaX) > Math.abs(touchDeltaY) && Math.abs(touchDeltaX) > 10) {
        if (e.cancelable) e.preventDefault();
      }
    }, { passive: false });
    
    slider.addEventListener('touchend', function(e) {
      if (isSwiping) return; // Ignore if already swiping
      if (!e.changedTouches || !e.changedTouches.length) return;
      touchEndX = e.changedTouches[0].screenX;
      touchDeltaX = touchEndX - touchStartX;
      handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
      const swipeThreshold = 50;
      const diff = touchDeltaX;
      
      if (Math.abs(diff) > swipeThreshold) {
        isSwiping = true;
        if (diff > 0) {
          // Swipe right - go to previous
          prev();
        } else {
          // Swipe left - go to next
          next();
        }
        // Reset after animation completes
        setTimeout(() => {
          isSwiping = false;
        }, 950); // Slightly longer than transition duration
      }
    }
  }

  function initCarousel() {
    setup3D();
    bindEvents();
  }

  // Initial setup
  initCarousel();

  // Re-initialize on window load to correct for image loading
  window.addEventListener('load', () => {
    setTimeout(initCarousel, 100);
  });

  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      setup3D();
    }, 120);
  });

})();

// --- Graphic Material Slideshow Popup ---
const graphicEventImages = {
  BITEBACK: [
    '25% zwarte tshirt - versie A1.png',
    'Affiche A4 - 25% zwarte tshirt .png',
    'graphic work 1.png',
    'graphic work 3.png'
  ],
  BOUM: [
    'BOUM Koffie 2.png',
    'BOUM Koffie.png',
    'flexi post 2 minder hoog.png',
    'graphic work 2.png'
  ],
  SomSomSat: [
    '472334539_910380054631391_2791230436867479031_n.jpg',
    '496948385_9733384780086985_2704374218500600342_n.jpg',
    '498223728_9752928164799313_1900043364006079112_n.jpg',
    '498557848_9733397090085754_5018291291344556034_n.jpg',
    '498639343_9733397280085735_924811236822040607_n.jpg'
  ],
  'TheGYM 1': [
    '514436863_24403243832607117_384529343356360637_n.jpg',
    '514439259_24405673389030828_842109083036563276_n.jpg',
    '514670273_24403242002607300_5762102013712317161_n.jpg',
    '515508907_24449800901284743_755654626629366881_n.jpg'
  ],
  'TheGym 2': [
    '514286939_24430114539920046_8224763668355133891_n.jpg',
    '514341560_24436146722650161_1556353330939209083_n.jpg',
    '515082657_24438066012458232_3410211601796381998_n.jpg',
    '72393593_2781331285225017_4255198681977847808_n.jpg'
  ]
};

function buildEventImagePath(folder, file) {
  return `public/assets/events/${encodeURIComponent(folder)}/${encodeURIComponent(file)}`;
}

const graphicSlides = Object.entries(graphicEventImages).flatMap(([folder, files]) =>
  files.map(file => buildEventImagePath(folder, file))
);

function openGraphicSlideshow(startIdx = 0) {
  let current = startIdx;
  const modal = document.createElement('div');
  modal.className = 'graphic-slideshow-modal';
  modal.innerHTML = `
    <div class="graphic-slideshow-content">
      <button class="graphic-slideshow-close" title="Sluiten">&times;</button>
      <img class="graphic-slideshow-img" src="${graphicSlides[current]}" alt="Grafisch materiaal ${current+1}">
      <div class="graphic-slideshow-controls">
        <button class="graphic-slideshow-btn prev" title="Vorige foto">
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="15" stroke="#c00" stroke-width="2" fill="none"/>
            <polyline points="19,9 12,16 19,23" stroke="#c00" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <span style="color:#fff;font-size:1.1rem;">${current+1} / ${graphicSlides.length}</span>
        <button class="graphic-slideshow-btn next" title="Volgende foto">
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="15" stroke="#c00" stroke-width="2" fill="none"/>
            <polyline points="13,9 20,16 13,23" stroke="#c00" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  const img = modal.querySelector('.graphic-slideshow-img');
  const closeBtn = modal.querySelector('.graphic-slideshow-close');
  const prevBtn = modal.querySelector('.graphic-slideshow-btn.prev');
  const nextBtn = modal.querySelector('.graphic-slideshow-btn.next');
  const counter = modal.querySelector('.graphic-slideshow-controls span');

  function updateSlide(idx) {
    img.src = graphicSlides[idx];
    img.alt = `Grafisch materiaal ${idx+1}`;
    counter.textContent = `${idx+1} / ${graphicSlides.length}`;
  }
  prevBtn.addEventListener('click', () => {
    current = (current - 1 + graphicSlides.length) % graphicSlides.length;
    updateSlide(current);
  });
  nextBtn.addEventListener('click', () => {
    current = (current + 1) % graphicSlides.length;
    updateSlide(current);
  });
  closeBtn.addEventListener('click', () => {
    modal.remove();
  });
  modal.addEventListener('click', e => {
    if (e.target === modal) modal.remove();
  });
  // Keyboard navigation
  function keyHandler(e) {
    if (!document.body.contains(modal)) return;
    if (e.key === 'Escape') modal.remove();
    if (e.key === 'ArrowLeft') prevBtn.click();
    if (e.key === 'ArrowRight') nextBtn.click();
  }
  document.addEventListener('keydown', keyHandler);
  modal.addEventListener('remove', () => {
    document.removeEventListener('keydown', keyHandler);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.graphic-popup-trigger').forEach(el => {
    el.addEventListener('click', function(e) {
      e.preventDefault();
      openGraphicSlideshow(0);
    });
  });
});