// Popout player logic
function setupSoundCloudPopout() {
    const iframe = document.getElementById('sc-iframe');
    const mixBtn = document.getElementById('mix-btn');
    const mixSelect = document.getElementById('mix-select');
    // Volume bar logic
    const volumeSlider = document.getElementById('popout-volume');
    // Load SoundCloud Widget API
    function loadWidgetScript(cb) {
        if (window.SC && window.SC.Widget) return cb();
        const script = document.createElement('script');
        script.src = 'https://w.soundcloud.com/player/api.js';
        script.onload = () => cb();
        document.body.appendChild(script);
    }
    function setWidgetVolume(val) {
        if (window.SC && window.SC.Widget && iframe) {
            const widget = window.SC.Widget(iframe);
            widget.bind(window.SC.Widget.Events.READY, function() {
                widget.setVolume(val);
            });
            widget.setVolume(val);
        }
    }
    if (volumeSlider) {
        loadWidgetScript(() => {
            setWidgetVolume(Number(volumeSlider.value));
        });
        volumeSlider.addEventListener('input', function() {
            loadWidgetScript(() => setWidgetVolume(Number(this.value)));
        });
    }
    fetch('https://corsproxy.io/?https://feeds.soundcloud.com/users/soundcloud:users:92709842/sounds.rss')
        .then(response => response.text())
        .then(str => (new window.DOMParser()).parseFromString(str, 'text/xml'))
        .then(data => {
            const items = data.querySelectorAll('item');
            if(items.length > 0) {
                items.forEach((item, i) => {
                    const link = item.querySelector('link')?.textContent;
                    const title = item.querySelector('title')?.textContent;
                    let label = '';
                    const pubDate = item.querySelector('pubDate')?.textContent;
                    if(pubDate) {
                        const d = new Date(pubDate);
                        label += d.toISOString().slice(0, 10);
                    }
                    if(title) {
                        label += ' - ' + title.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase();
                    }
                    const option = document.createElement('option');
                    option.value = link;
                    option.textContent = label;
                    mixSelect.appendChild(option);
                    if(i === 0 && link) {
                        iframe.src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(link)}&color=%23ff5500&auto_play=true&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false`;
                    }
                });
            }
        });
    mixBtn.onclick = function() {
        mixSelect.style.display = mixSelect.style.display === 'none' ? 'inline-block' : 'none';
    };
    mixSelect.onchange = function() {
        if(this.value) {
            iframe.src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(this.value)}&color=%23ff5500&auto_play=true&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false`;
            mixSelect.style.display = 'none';
        }
    };
}
// SoundCloud player logic (TypeScript)
function setupSoundCloudPlayer() {
    // Add popout icon and 'My Music' text, hide on mobile
    const popoutWrapper = document.createElement('span');
    popoutWrapper.className = 'navbar-mymusic';
    const popoutBtn = document.createElement('button');
    popoutBtn.title = 'Open player in pop-out';
    popoutBtn.style.background = 'none';
    popoutBtn.style.border = 'none';
    popoutBtn.style.cursor = 'pointer';
    popoutBtn.style.marginLeft = '0.7rem';
    const popoutImg = document.createElement('img');
    popoutImg.src = 'public/assets/assets/vinyl.png';
    popoutImg.alt = 'Pop-out';
    popoutImg.style.width = '32px';
    popoutImg.style.height = '32px';
    popoutBtn.appendChild(popoutImg);
    popoutBtn.onclick = function() {
        window.open('soundcloud-popout.html', 'scpopout', 'width=420,height=180,menubar=no,toolbar=no,location=no,status=no');
    };
    const musicText = document.createElement('span');
    musicText.textContent = 'My Music';
    musicText.className = 'navbar-mymusic-text';
    musicText.style.cursor = 'pointer';
    musicText.onclick = function() {
        popoutBtn.onclick();
    };
    popoutWrapper.appendChild(popoutBtn);
    popoutWrapper.appendChild(musicText);
    const playerDiv = document.getElementById('soundcloud-player');
    if (!playerDiv) return;
    playerDiv.innerHTML = '';
    playerDiv.appendChild(popoutWrapper);
}
//# sourceMappingURL=soundcloud.js.map