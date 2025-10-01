// TypeScript entry point for navbar and page logic
window.addEventListener('DOMContentLoaded', () => {
    if (window.setupNavbar)
        window.setupNavbar();
    if (window.setupSoundCloudPlayer)
        window.setupSoundCloudPlayer();
});
window.addEventListener('load', () => {
  const perfStart = performance.now();
  // Defer heavy background until after first paint & idle
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => import('./public/js/bg.js'));
  } else {
    setTimeout(() => import('./public/js/bg.js'), 120);
  }
  // Optional: reduce letters effect on low-power devices
  const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
  if (isLowEnd) {
    document.documentElement.classList.add('reduced-bg');
  }
  console.debug('Deferred bg init in', (performance.now()-perfStart).toFixed(1),'ms');
});
//# sourceMappingURL=app.js.map