// Navbar logic (TypeScript)
function setupNavbar() {
    // Remove any existing hamburger or overlay
    document.querySelectorAll('.hamburger, .menu-overlay').forEach(el => el.remove());
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    navbar.innerHTML = `
  <a href="index.html" title="Go to Home page"><img src="public/assets/pictures/logo_TL.png" alt="Logo" class="logo" title="Go to Home page"></a>
      <div class="soundcloud-player" id="soundcloud-player"></div>
      <nav class="nav-links">
  <a href="index.html" class="nav-link" title="Home page">Home</a>
  <a href="about.html" class="nav-link" title="About me">About</a>
  <a href="projects.html" class="nav-link" title="My projects">Projects</a>
  <a href="game.html" class="nav-link" title="Game page">Game</a>
  <a href="contact.html" class="nav-link" title="Contact me">Contact</a>
      </nav>
    `;

    // Hamburger button
    const hamburger = document.createElement('div');
    hamburger.className = 'hamburger';
    hamburger.innerHTML = '<span></span><span></span><span></span>';
    document.body.appendChild(hamburger);

    // Overlay menu with close icon
    const overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    overlay.innerHTML = `
      <button class="menu-close" aria-label="Close menu">
        <span class="close-line close-line1"></span>
        <span class="close-line close-line2"></span>
      </button>
      <div class="menu-links">
  <a href="index.html" class="menu-link">Home</a>
  <a href="about.html" class="menu-link">About</a>
  <a href="projects.html" class="menu-link">Projects</a>
  <a href="game.html" class="menu-link">Game</a>
  <a href="contact.html" class="menu-link">Contact</a>
      </div>
    `;
    overlay.style.display = 'none'; // Always hidden initially
    document.body.appendChild(overlay);

    // Hamburger click toggles overlay
    hamburger.onclick = () => {
      console.log('Hamburger clicked!');
      const isOpen = overlay.classList.toggle('open');
      overlay.style.display = isOpen ? 'flex' : 'none';
      console.log('Overlay open:', isOpen);
    };
    // Close overlay on link click
    overlay.querySelectorAll('.menu-link').forEach(link => {
      link.addEventListener('click', () => {
        overlay.classList.remove('open');
        overlay.style.display = 'none';
      });
    });
    // Close overlay on close button click
    const closeBtn = overlay.querySelector('.menu-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        overlay.classList.remove('open');
        overlay.style.display = 'none';
      });
    }
}
window.setupNavbar = setupNavbar;
//# sourceMappingURL=navbar.js.map