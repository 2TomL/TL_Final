// Loader hide logic met minimale weergavetijd
window.addEventListener('DOMContentLoaded', function() {
  const loader = document.getElementById('loader-overlay');
  if (!loader) return;
  // Check if loader has already been shown this session
  if (window.sessionStorage.getItem('loaderShown')) {
    loader.style.display = 'none';
    loader.classList.add('loader-hide');
    return;
  }
  const minTime = 1500; // minimaal 1,5s zichtbaar
  const start = Date.now();
  function hideLoader() {
    const elapsed = Date.now() - start;
    if (elapsed < minTime) {
      setTimeout(hideLoader, minTime - elapsed);
    } else {
      loader.classList.add('loader-hide');
      window.sessionStorage.setItem('loaderShown', '1');
    }
  }
  window.addEventListener('load', hideLoader);
});
