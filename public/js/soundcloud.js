// SoundCloud player logic (TypeScript)
function setupSoundCloudPlayer() {
        const playerDiv = document.getElementById('soundcloud-player');
        if (!playerDiv) return;

                // Add custom volume dropdown
                const volumeBtn = document.createElement('button');
                volumeBtn.id = 'soundcloud-volume-btn';
                volumeBtn.title = 'Volume';
                const volIcon = document.createElement('img');
                volIcon.src = 'public/assets/assets/volume.png';
                volIcon.alt = 'Volume';
                volumeBtn.appendChild(volIcon);
                volumeBtn.style.marginLeft = '0.7rem';

                const volumeDropdown = document.createElement('div');
                volumeDropdown.id = 'soundcloud-volume-dropdown';
                const volumeSlider = document.createElement('input');
                volumeSlider.type = 'range';
                volumeSlider.id = 'soundcloud-volume';
                volumeSlider.min = '0';
                volumeSlider.max = '100';
                volumeSlider.value = '100';
                volumeSlider.title = 'Volume';
                volumeDropdown.appendChild(volumeSlider);

                // Toggle dropdown
                volumeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const open = volumeDropdown.style.display !== 'block';
                    volumeDropdown.style.display = open ? 'block' : 'none';
                    volumeBtn.classList.toggle('active', open);
                });
                // Hide dropdown on click outside
                document.addEventListener('click', (e) => {
                    if (!volumeDropdown.contains(e.target) && !volumeBtn.contains(e.target)) {
                        volumeDropdown.style.display = 'none';
                        volumeBtn.classList.remove('active');
                    }
                });

        // Load SoundCloud Widget API
        let widgetScriptLoaded = false;
        function loadWidgetScript(cb) {
            if (widgetScriptLoaded) return cb();
            const script = document.createElement('script');
            script.src = 'https://w.soundcloud.com/player/api.js';
            script.onload = () => { widgetScriptLoaded = true; cb(); };
            document.body.appendChild(script);
        }

    // Create icon button for mix selection
    const iconBtn = document.createElement('button');
    iconBtn.style.background = 'none';
    iconBtn.style.border = 'none';
    iconBtn.style.padding = '0 6px 0 0';
    iconBtn.style.cursor = 'pointer';
    iconBtn.title = 'Choose a mix';
    iconBtn.style.transition = 'filter 0.2s';
    const iconImg = document.createElement('img');
    iconImg.src = 'public/assets/assets/swap_mix.png';
    iconImg.alt = 'Choose mix';
    iconImg.style.height = '28px';
    iconImg.style.width = '28px';
    iconImg.style.transition = 'filter 0.2s';
    iconBtn.appendChild(iconImg);
    // Create hidden select
    const select = document.createElement('select');
    select.id = 'mix-select';
    select.style.display = 'none';
    select.style.position = 'absolute';
    select.style.left = '0';
    select.style.top = '36px';
    select.style.zIndex = '999';
    select.style.fontSize = '1rem';
    select.style.minWidth = '120px';
    select.style.background = '#222';
    select.style.color = '#fff';
    select.style.border = '1px solid #444';
    select.style.borderRadius = '4px';
    select.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
    // Toggle select on icon click
    iconBtn.addEventListener('click', () => {
        const open = select.style.display === 'none';
        select.style.display = open ? 'block' : 'none';
        if (open) {
            iconImg.style.filter = 'drop-shadow(0 0 24px #ff0000) brightness(2)';
        } else {
            iconImg.style.filter = 'none';
        }
    });
    const iframe = document.createElement('iframe');
    iframe.width = '100';
    iframe.height = '20';
    iframe.allow = 'autoplay';
    iframe.frameBorder = 'no';
    iframe.scrolling = 'no';
    iframe.style.border = 'none';
    iframe.style.marginLeft = '0.5rem';

    // Fetch RSS feed and parse
    fetch('https://corsproxy.io/?https://feeds.soundcloud.com/users/soundcloud:users:92709842/sounds.rss')
        .then(response => response.text())
        .then(str => (new window.DOMParser()).parseFromString(str, 'text/xml'))
        .then(data => {
            const items = data.querySelectorAll('item');
            const mixes = [];
            items.forEach(item => {
                const title = item.querySelector('title')?.textContent;
                const link = item.querySelector('link')?.textContent;
                // Extract date and initials from title
                let label = '';
                const pubDate = item.querySelector('pubDate')?.textContent;
                if (pubDate) {
                    // Format date as YYYY-MM-DD
                    const d = new Date(pubDate);
                    label += d.toISOString().slice(0, 10);
                }
                if (title) {
                    // Add initials of title (first letters of first 2 words)
                    const initials = title.split(' ').slice(0,2).map(w => w[0]?.toUpperCase() || '').join('');
                    label += ' ' + initials;
                }
                if (label && link) {
                    mixes.push({ title: label.trim(), url: link });
                }
            });
            if (mixes.length > 0) {
                mixes.forEach((mix, i) => {
                    const option = document.createElement('option');
                    option.value = mix.url;
                    option.textContent = mix.title;
                    select.appendChild(option);
                });
                // Zet eerste mix als default
                iframe.src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(mixes[0].url)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false`;
                // Verberg select na keuze
                select.addEventListener('change', () => {
                    select.style.display = 'none';
                    iconImg.style.filter = 'none';
                });
            } else {
                const option = document.createElement('option');
                option.textContent = 'Geen mixes gevonden';
                select.appendChild(option);
            }
        })
        .catch(() => {
            const option = document.createElement('option');
            option.textContent = 'Kan SoundCloud RSS niet laden';
            select.appendChild(option);
        });

    select.addEventListener('change', (e) => {
        const url = e.target.value;
        iframe.src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=true&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false`;
    });
    playerDiv.style.position = 'relative';
    playerDiv.appendChild(iframe);
    playerDiv.appendChild(volumeBtn);
    playerDiv.appendChild(volumeDropdown);
    playerDiv.appendChild(iconBtn);
    playerDiv.appendChild(select);
    // Adjust icon/select position to right of player
    iconBtn.style.marginLeft = '2rem';
    select.style.left = 'auto';
    select.style.right = '0';
    select.style.top = '28px';
    volumeDropdown.style.right = '2.5rem';
    volumeDropdown.style.top = '28px';

        // Volume control logic using SoundCloud Widget API
        let widget = null;
        function setWidgetVolume(val) {
            if (widget && typeof widget.setVolume === 'function') {
                widget.setVolume(val);
            }
        }
        function setupWidget() {
            if (!window.SC || !window.SC.Widget) return;
            widget = window.SC.Widget(iframe);
            widget.bind(window.SC.Widget.Events.READY, function() {
                setWidgetVolume(Number(volumeSlider.value));
            });
            volumeSlider.addEventListener('input', function() {
                setWidgetVolume(Number(this.value));
            });
        }
        loadWidgetScript(setupWidget);
        // Re-setup widget on mix change
        select.addEventListener('change', () => {
            setTimeout(() => loadWidgetScript(setupWidget), 500);
        });
        // Also re-setup widget on iframe src change
        iframe.addEventListener('load', () => {
            setTimeout(() => loadWidgetScript(setupWidget), 500);
        });
// Import custom volume slider CSS
const volCss = document.createElement('link');
volCss.rel = 'stylesheet';
volCss.href = 'public/css/soundcloud-volume.css';
document.head.appendChild(volCss);
const volDropCss = document.createElement('link');
volDropCss.rel = 'stylesheet';
volDropCss.href = 'public/css/soundcloud-volume-dropdown.css';
document.head.appendChild(volDropCss);
}
window.setupSoundCloudPlayer = setupSoundCloudPlayer;
//# sourceMappingURL=soundcloud.js.map