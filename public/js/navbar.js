// Navbar logic (TypeScript)
function setupNavbar() {
    // Remove any existing hamburger or overlay
    document.querySelectorAll('.hamburger, .menu-overlay').forEach(el => el.remove());
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    const hasSection = id => !!document.getElementById(id);
    const pageLinks = {
      home: hasSection('home') ? '#home' : 'index.html',
      about: hasSection('about') ? '#about' : 'about.html',
      projects: hasSection('projects') ? '#projects' : 'projects.html',
      design: hasSection('design') ? '#design' : 'design.html',
      game: hasSection('game') ? '#game' : 'game.html',
      contact: hasSection('contact') ? '#contact' : 'contact.html'
    };

    navbar.innerHTML = `
  <a href="${pageLinks.home}" title="Go to Home"><img src="public/assets/pictures/logo_TL.png" alt="Logo" class="logo" title="Go to Home"></a>
      <div class="soundcloud-player" id="soundcloud-player"></div>
      <nav class="nav-links">
  <a href="${pageLinks.home}" class="nav-link" title="Home">Home</a>
  <a href="${pageLinks.about}" class="nav-link" title="About">About</a>
  <a href="${pageLinks.projects}" class="nav-link" title="Projects">Projects</a>
  <a href="${pageLinks.design}" class="nav-link" title="Design">Design</a>
  <a href="${pageLinks.game}" class="nav-link" title="Game">Game</a>
  <a href="${pageLinks.contact}" class="nav-link" title="Contact">Contact</a>
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
  <a href="#home" class="menu-link">Home</a>
  <a href="#about" class="menu-link">About</a>
  <a href="#projects" class="menu-link">Projects</a>
  <a href="#design" class="menu-link">Design</a>
  <a href="#game" class="menu-link">Game</a>
  <a href="#contact" class="menu-link">Contact</a>
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