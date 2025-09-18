declare global {
  interface Window {
    setupSoundCloudPlayer: () => void;
  }
}
// SoundCloud player logic (TypeScript)
function setupSoundCloudPlayer() {
  const playerDiv = document.getElementById('soundcloud-player');
  if (!playerDiv) return;

  // Placeholder mixes (kan later dynamisch via RSS)
  const mixes = [
    { title: 'Mix 1', url: 'https://soundcloud.com/mickedy_mike/mickedy-mike-mix-1' },
    { title: 'Mix 2', url: 'https://soundcloud.com/mickedy_mike/mickedy-mike-mix-2' },
    { title: 'Mix 3', url: 'https://soundcloud.com/mickedy_mike/mickedy-mike-mix-3' }
  ];

  const select = document.createElement('select');
  select.id = 'mix-select';
  mixes.forEach((mix, i) => {
    const option = document.createElement('option');
    option.value = mix.url;
    option.textContent = mix.title;
    select.appendChild(option);
  });

  const iframe = document.createElement('iframe');
  iframe.width = '180';
  iframe.height = '40';
  iframe.allow = 'autoplay';
  iframe.frameBorder = 'no';
  iframe.scrolling = 'no';
  iframe.style.border = 'none';
  iframe.style.marginLeft = '0.5rem';
  if (mixes.length > 0 && mixes[0]?.url) {
    iframe.src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(mixes[0].url)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false`;
  }
// Zorg dat deze functie globaal beschikbaar is
window.setupSoundCloudPlayer = setupSoundCloudPlayer;

  select.addEventListener('change', (e) => {
    const url = (e.target as HTMLSelectElement).value;
    iframe.src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=true&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false`;
  });

  playerDiv.appendChild(select);
  playerDiv.appendChild(iframe);
}
