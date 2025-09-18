(function() {
  "use strict";

  const carousel = document.querySelector('.carousel');
  if (!carousel) return;
  const slider = carousel.querySelector('.carousel__slider');
  const items = Array.from(carousel.querySelectorAll('.carousel__slider__item'));
  const prevBtn = carousel.querySelector('.carousel__prev');
  const nextBtn = carousel.querySelector('.carousel__next');
  if (!slider || !items.length) return;

  let currIndex = 0;
  let interval, intervalTime = 4000;
  const itemCount = items.length;
  let theta, radius;

  function updateGeometry() {
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
    updateGeometry();
    slider.style.transformStyle = 'preserve-3d';
    slider.style.position = 'relative';
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
  }

  function update3D() {
    for (let i = 0; i < itemCount; i++) {
      const item = items[i];
      let rel = i - currIndex;
      // wrap-around logic
      if (rel < -Math.floor(itemCount/2)) rel += itemCount;
      if (rel > Math.floor(itemCount/2)) rel -= itemCount;
      // Special case for 3 of 4 items: altijd prev/next tonen
      if (itemCount <= 4) {
        if (rel === -(itemCount-1)) rel = 1;
        if (rel === (itemCount-1)) rel = -1;
        if (itemCount === 3 && rel === 2) rel = -1;
        if (itemCount === 3 && rel === -2) rel = 1;
      }
      let angle = theta * rel;
      item.style.position = 'absolute';
      item.style.top = '0';
      item.style.left = '0';
      item.style.transformOrigin = `50% 50% ${-radius}px`;
      item.style.backfaceVisibility = 'hidden';
      item.style.transition = 'transform 0.9s cubic-bezier(.4,2,.6,1), opacity 0.5s, scale 0.5s';
      item.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;
      // Toon altijd de middelste, links en rechts
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
    slider.style.transform = `translateZ(${-radius}px)`;
  }



  function prev() {
    currIndex = (currIndex - 1 + itemCount) % itemCount;
    update3D();
  }

  function next() {
    currIndex = (currIndex + 1) % itemCount;
    update3D();
  }

  function bindEvents() {
    if (prevBtn) prevBtn.addEventListener('click', prev);
    if (nextBtn) nextBtn.addEventListener('click', next);
    window.addEventListener('resize', () => {
      updateGeometry();
      update3D();
    });
    // Swipe support
    let startX = null;
    slider.addEventListener('touchstart', function(e) {
      startX = e.touches[0].clientX;
    });
    slider.addEventListener('touchend', function(e) {
      if (startX === null) return;
      let endX = e.changedTouches[0].clientX;
      if (endX - startX > 50) prev();
      else if (startX - endX > 50) next();
      startX = null;
    });
  }

  setup3D();
  bindEvents();
})();