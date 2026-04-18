(function () {
    // ---------- Tab switching ----------
    const tabs = Array.from(document.querySelectorAll('[data-tab]'));
    const panels = Array.from(document.querySelectorAll('.tab-panel'));
    const navLinks = Array.from(document.querySelectorAll('.nav-links a[data-tab]'));

    const validTabs = new Set(panels.map(p => p.id));

    function activate(tabId, updateHash = true) {
        if (!validTabs.has(tabId)) tabId = 'home';

        panels.forEach(panel => {
            panel.hidden = panel.id !== tabId;
        });

        navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.tab === tabId);
        });

        if (updateHash) {
            const newHash = '#' + tabId;
            if (location.hash !== newHash) {
                history.replaceState(null, '', newHash);
            }
        }

        window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });

        if (tabId === 'home') {
            runSvdAnimation();
        }
    }

    tabs.forEach(el => {
        el.addEventListener('click', e => {
            const target = el.dataset.tab;
            if (!target) return;
            e.preventDefault();
            activate(target);
        });
    });

    window.addEventListener('hashchange', () => {
        const id = location.hash.replace('#', '') || 'home';
        activate(id, false);
    });

    // ---------- SVD frame animation ----------
    const avatarImg = document.getElementById('avatar-img');
    const avatarRank = document.getElementById('avatar-rank');
    let svdRunning = false;
    let svdPlayedOnce = false;

    function runSvdAnimation() {
        if (!avatarImg || svdRunning) return;
        svdRunning = true;

        fetch('images/profile/manifest.json', { cache: 'no-cache' })
            .then(r => r.ok ? r.json() : Promise.reject())
            .then(frames => playFrames(frames))
            .catch(() => { svdRunning = false; });
    }

    function preload(frames) {
        return Promise.all(frames.map(f => new Promise(resolve => {
            const img = new Image();
            img.onload = img.onerror = () => resolve();
            img.src = 'images/profile/' + f.file;
        })));
    }

    function playFrames(frames) {
        preload(frames).then(() => {
            const holdShort = 90;
            const holdLong = 180;
            const finalHold = 600;
            let i = 0;

            function step() {
                if (i >= frames.length) {
                    svdRunning = false;
                    svdPlayedOnce = true;
                    return;
                }
                const f = frames[i];
                avatarImg.src = 'images/profile/' + f.file;
                if (avatarRank) {
                    avatarRank.textContent = (i === frames.length - 1) ? 'full' : f.rank;
                }
                const delay = (i === frames.length - 1) ? finalHold
                           : (i < 4 ? holdLong : holdShort);
                i += 1;
                setTimeout(step, delay);
            }
            step();
        });
    }

    // ---------- Card covers ----------
    function hashString(s) {
        let h = 0;
        for (let i = 0; i < s.length; i++) {
            h = ((h << 5) - h + s.charCodeAt(i)) | 0;
        }
        return Math.abs(h);
    }

    function initialsFor(title) {
        const cleaned = title.replace(/[^A-Za-z0-9\s]/g, ' ').trim();
        const parts = cleaned.split(/\s+/).filter(Boolean);
        if (!parts.length) return '·';
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }

    function initialsSvg(title) {
        const initials = initialsFor(title);
        const hue = hashString(title) % 360;
        const c1 = `hsl(${hue}, 68%, 60%)`;
        const c2 = `hsl(${(hue + 48) % 360}, 72%, 46%)`;
        const gradId = 'g' + hashString(title).toString(36);
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${title.replace(/"/g, '&quot;')}"><defs><linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="200" height="100" fill="url(#${gradId})"/><text x="100" y="58" font-size="44" font-weight="800" fill="rgba(255,255,255,0.95)" text-anchor="middle" font-family="Inter, system-ui, sans-serif" letter-spacing="-0.03em">${initials}</text></svg>`;
        return svg;
    }

    function setCoverSvg(cover, title) {
        cover.innerHTML = initialsSvg(title);
    }

    function setCoverFromRepo(cover, repo, title) {
        const img = new Image();
        img.alt = title;
        img.loading = 'lazy';
        img.decoding = 'async';
        img.referrerPolicy = 'no-referrer';
        img.onload = () => {
            cover.innerHTML = '';
            cover.appendChild(img);
        };
        img.onerror = () => setCoverSvg(cover, title);
        img.src = `https://opengraph.githubassets.com/1/${repo}`;
    }

    document.querySelectorAll('.card').forEach(card => {
        const cover = card.querySelector('.card-cover');
        if (!cover) return;
        const titleEl = card.querySelector('.card-title');
        const title = (titleEl && titleEl.textContent.trim()) || card.textContent.trim().slice(0, 40);
        const repo = card.dataset.repo;
        if (repo) {
            setCoverFromRepo(cover, repo, title);
        } else {
            setCoverSvg(cover, title);
        }
    });

    // ---------- init ----------
    const initial = location.hash.replace('#', '') || 'home';
    activate(initial, false);
})();
