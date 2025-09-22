// Loader hide logic met minimale weergavetijd
window.addEventListener('DOMContentLoaded', function() {
  const loader = document.getElementById('loader-overlay');
  if (!loader) return;
  const minTime = 1500; // minimaal 1,5s zichtbaar
  const start = Date.now();
  function hideLoader() {
    const elapsed = Date.now() - start;
    if (elapsed < minTime) {
      setTimeout(hideLoader, minTime - elapsed);
    } else {
      loader.classList.add('loader-hide');
    }
  }
  window.addEventListener('load', hideLoader);
});
