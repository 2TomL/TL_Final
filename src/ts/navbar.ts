declare global {
  interface Window {
    setupNavbar: () => void;
  }
}
// Navbar logic (TypeScript)
function setupNavbar() {
// Zorg dat deze functie globaal beschikbaar is
window.setupNavbar = setupNavbar;
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  navbar.innerHTML = `
    <img src="assets/logo.jpg" alt="Logo" class="logo">
    <div class="soundcloud-player" id="soundcloud-player"></div>
    <nav class="nav-links">
      <a href="index.html" class="nav-link">Home</a>
      <a href="about.html" class="nav-link">About</a>
      <a href="projects.html" class="nav-link">Projects</a>
      <a href="game.html" class="nav-link">Game</a>
      <a href="contact.html" class="nav-link">Contact</a>
    </nav>
  `;
}
