(function () {
  'use strict';

  const imageExtensionPattern = /\.(avif|bmp|gif|jpe?g|png|svg|webp)$/i;
  const folderCache = new Map();
  const fallbackGalleryByEventFolder = {
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

  const sliders = document.querySelectorAll('[data-design-slider]');
  if (!sliders.length) return;

  sliders.forEach(setupSlider);

  function setupSlider(root) {
    const slides = Array.from(root.querySelectorAll('.design-slide'));
    const prevButton = root.querySelector('.design-slider__btn--prev');
    const nextButton = root.querySelector('.design-slider__btn--next');
    const openButton = root.querySelector('.design-slider__open');
    const counter = root.querySelector('.design-slider__counter');

    if (!slides.length || !prevButton || !nextButton || !openButton || !counter) return;

    let currentIndex = 0;
    let modal = null;
    let currentGallery = [];
    let currentGalleryIndex = 0;
    const imageLoadCache = new Map();

    function normalizeUrl(url) {
      return new URL(url, document.baseURI).href;
    }

    function sourceToFolderPath(source) {
      const cleanSource = (source || '').split('?')[0].split('#')[0];
      const lastSlash = cleanSource.lastIndexOf('/');
      if (lastSlash === -1) return '';
      return cleanSource.slice(0, lastSlash);
    }

    function filenameFromUrl(url) {
      const pathname = new URL(url, document.baseURI).pathname;
      const segments = pathname.split('/');
      return decodeURIComponent(segments[segments.length - 1] || '');
    }

    function eventFolderFromPath(folderPath) {
      const normalized = (folderPath || '').replace(/\\/g, '/');
      const marker = '/events/';
      const markerIndex = normalized.toLowerCase().lastIndexOf(marker);
      if (markerIndex === -1) return '';
      return normalized.slice(markerIndex + marker.length).replace(/^\/+|\/+$/g, '');
    }

    function getFallbackFolderImages(folderPath) {
      const eventFolder = eventFolderFromPath(folderPath);
      const filenames = fallbackGalleryByEventFolder[eventFolder];
      if (!filenames || !filenames.length) return [];

      return filenames.map(filename =>
        new URL(`public/assets/events/${eventFolder}/${filename}`, document.baseURI).href
      );
    }

    function canLoadImage(url) {
      const normalizedUrl = normalizeUrl(url);
      if (imageLoadCache.has(normalizedUrl)) {
        return imageLoadCache.get(normalizedUrl);
      }

      const loadPromise = new Promise(resolve => {
        const probe = new Image();
        probe.onload = () => resolve(true);
        probe.onerror = () => resolve(false);
        probe.src = normalizedUrl;
      });

      imageLoadCache.set(normalizedUrl, loadPromise);
      return loadPromise;
    }

    async function filterLoadableImages(urls) {
      const normalizedUnique = [];
      const seen = new Set();

      urls.forEach(url => {
        const normalizedUrl = normalizeUrl(url);
        if (seen.has(normalizedUrl)) return;
        seen.add(normalizedUrl);
        normalizedUnique.push(normalizedUrl);
      });

      const checks = await Promise.all(
        normalizedUnique.map(async url => ({
          url,
          ok: await canLoadImage(url)
        }))
      );

      return checks.filter(item => item.ok).map(item => item.url);
    }

    function parseDirectoryListing(html, folderPath) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const folderUrl = new URL(`${folderPath.replace(/\/$/, '')}/`, document.baseURI);
      const folderPrefix = folderUrl.pathname;
      const links = Array.from(doc.querySelectorAll('a[href]'));

      const imageUrls = links
        .map(link => link.getAttribute('href') || '')
        .filter(href => href && href !== '../' && href !== './' && href !== '/')
        .map(href => new URL(href, folderUrl))
        .filter(url => url.origin === folderUrl.origin)
        .filter(url => url.pathname.startsWith(folderPrefix))
        .filter(url => !url.pathname.endsWith('/'))
        .filter(url => imageExtensionPattern.test(url.pathname))
        .map(url => url.href);

      const unique = Array.from(new Set(imageUrls));
      unique.sort((a, b) => filenameFromUrl(a).localeCompare(filenameFromUrl(b), undefined, { numeric: true, sensitivity: 'base' }));
      return unique;
    }

    async function loadFolderImages(folderPath) {
      if (!folderPath) return [];
      if (folderCache.has(folderPath)) return folderCache.get(folderPath);

      const folderUrl = `${folderPath.replace(/\/$/, '')}/`;

      try {
        const response = await fetch(folderUrl, { cache: 'no-store' });
        if (!response.ok) {
          folderCache.set(folderPath, []);
          return [];
        }

        const html = await response.text();
        const images = parseDirectoryListing(html, folderPath);
        folderCache.set(folderPath, images);
        return images;
      } catch {
        folderCache.set(folderPath, []);
        return [];
      }
    }

    function updateSlider() {
      slides.forEach((slide, slideIndex) => {
        let relativeIndex = slideIndex - currentIndex;
        if (relativeIndex < -slides.length / 2) relativeIndex += slides.length;
        if (relativeIndex > slides.length / 2) relativeIndex -= slides.length;

        const distance = Math.abs(relativeIndex);
        const hidden = distance > 3;
        const scale = Math.max(0.74, 1 - distance * 0.08);
        const xOffset = relativeIndex * 38;
        const yOffset = distance * 12;
        const rotation = relativeIndex * 7;

        slide.style.opacity = hidden ? '0' : String(Math.max(0.2, 1 - distance * 0.18));
        slide.style.transform = `translate(-50%, -50%) translate3d(${xOffset}px, ${yOffset}px, 0) scale(${scale}) rotate(${rotation}deg)`;
        slide.style.zIndex = String(100 - distance);
        slide.classList.toggle('is-active', relativeIndex === 0);
      });

      counter.textContent = `${currentIndex + 1} / ${slides.length}`;
      openButton.setAttribute('aria-label', `Open ${slides[currentIndex].querySelector('img').alt}`);
    }

    function getActiveSlide() {
      return slides[currentIndex];
    }

    async function getSlideGallery(slide) {
      const image = slide && slide.querySelector('img');
      if (!image) return [];

      const source = image.getAttribute('src') || '';
      const folderPath = sourceToFolderPath(source);
      const folderImages = await loadFolderImages(folderPath);
      const fallbackImages = getFallbackFolderImages(folderPath);
      const mergedImages = Array.from(new Set([...folderImages, ...fallbackImages]));
      const loadableImages = await filterLoadableImages(mergedImages);

      if (!loadableImages.length) {
        return [normalizeUrl(source)];
      }

      return loadableImages;
    }

    async function openSlideGallery(slide) {
      const image = slide && slide.querySelector('img');
      if (!image) return;

      const source = normalizeUrl(image.getAttribute('src') || '');
      currentGallery = await getSlideGallery(slide);
      if (!currentGallery.length) return;

      const initialIndex = currentGallery.findIndex(item => normalizeUrl(item) === source);
      currentGalleryIndex = initialIndex >= 0 ? initialIndex : 0;

      if (modal) {
        modal.remove();
      }

      const captionHtml = slide.querySelector('.design-slide__meta') ? slide.querySelector('.design-slide__meta').innerHTML : '';
      modal = document.createElement('div');
      modal.className = 'design-modal';
      modal.innerHTML = `
        <div class="design-modal__dialog" role="dialog" aria-modal="true" aria-label="Design image viewer">
          <button type="button" class="design-modal__close" aria-label="Close viewer">&times;</button>
          <img class="design-modal__image" src="" alt="">
          <div class="design-modal__caption">${captionHtml}</div>
          <div class="design-modal__controls">
            <button type="button" class="design-modal__nav design-modal__nav--prev" aria-label="Previous image">&#10094;</button>
            <span class="design-modal__count" aria-live="polite"></span>
            <button type="button" class="design-modal__nav design-modal__nav--next" aria-label="Next image">&#10095;</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      const modalImage = modal.querySelector('.design-modal__image');
      const counter = modal.querySelector('.design-modal__count');
      const titleElement = modal.querySelector('.design-modal__caption h3');

      const renderModalSlide = () => {
        if (!modalImage || !counter || !currentGallery.length) return;
        modalImage.src = normalizeUrl(currentGallery[currentGalleryIndex]);
        modalImage.alt = titleElement ? `${titleElement.textContent} ${currentGalleryIndex + 1}` : `Design image ${currentGalleryIndex + 1}`;
        counter.textContent = `${currentGalleryIndex + 1} / ${currentGallery.length}`;
      };

      const goModalPrev = () => {
        currentGalleryIndex = (currentGalleryIndex - 1 + currentGallery.length) % currentGallery.length;
        renderModalSlide();
      };

      const goModalNext = () => {
        currentGalleryIndex = (currentGalleryIndex + 1) % currentGallery.length;
        renderModalSlide();
      };

      const closeModal = () => {
        if (modal) {
          modal.remove();
          modal = null;
          document.removeEventListener('keydown', keyHandler);
        }
      };

      const keyHandler = event => {
        if (!modal) return;
        if (event.key === 'Escape') closeModal();
        if (event.key === 'ArrowLeft') goModalPrev();
        if (event.key === 'ArrowRight') goModalNext();
      };

      const prevButton = modal.querySelector('.design-modal__nav--prev');
      const nextButton = modal.querySelector('.design-modal__nav--next');
      const closeButton = modal.querySelector('.design-modal__close');

      if (currentGallery.length <= 1) {
        if (prevButton) prevButton.style.visibility = 'hidden';
        if (nextButton) nextButton.style.visibility = 'hidden';
      }

      if (prevButton) prevButton.addEventListener('click', goModalPrev);
      if (nextButton) nextButton.addEventListener('click', goModalNext);
      if (closeButton) closeButton.addEventListener('click', closeModal);

      modal.addEventListener('click', event => {
        if (event.target === modal) closeModal();
      });

      document.addEventListener('keydown', keyHandler);
      renderModalSlide();
    }

    function goNext() {
      currentIndex = (currentIndex + 1) % slides.length;
      updateSlider();
    }

    function goPrev() {
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      updateSlider();
    }

    prevButton.addEventListener('click', goPrev);
    nextButton.addEventListener('click', goNext);
    openButton.addEventListener('click', () => openSlideGallery(getActiveSlide()));

    slides.forEach((slide, slideIndex) => {
      slide.addEventListener('click', () => {
        if (currentIndex === slideIndex) {
          openSlideGallery(slide);
          return;
        }
        currentIndex = slideIndex;
        updateSlider();
      });
    });

    let startX = 0;
    let pointerActive = false;

    root.addEventListener('pointerdown', event => {
      pointerActive = true;
      startX = event.clientX;
    });

    root.addEventListener('pointerup', event => {
      if (!pointerActive) return;
      pointerActive = false;

      const deltaX = event.clientX - startX;
      if (Math.abs(deltaX) < 40) return;
      if (deltaX < 0) {
        goNext();
      } else {
        goPrev();
      }
    });

    root.addEventListener('pointerleave', () => {
      pointerActive = false;
    });

    root.addEventListener('keyup', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        openSlideGallery(getActiveSlide());
      }
    });

    updateSlider();
  }
})();