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

    const THEMES = {
        springer:   { c1: '#0b6a63', c2: '#024d4a', accent: '#7ed4c4', icon: 'book' },
        heliyon:    { c1: '#e65100', c2: '#a02000', accent: '#ffd180', icon: 'sun'  },
        conference: { c1: '#1f4fa8', c2: '#0c2a63', accent: '#7aa7ff', icon: 'podium' },
        iitm:       { c1: '#7a1b1b', c2: '#4a0d0d', accent: '#f5c97b', icon: 'shield' },
        kaggle:     { c1: '#20beff', c2: '#0b7bbf', accent: '#ffffff', icon: 'atom' },
        faculty:    { c1: '#2b3a55', c2: '#1a2436', accent: '#e5c07b', icon: 'person' },
    };

    const ICON_PATHS = {
        // Each icon is centered in a 30×30 viewBox drawn at SVG coords (150,20).
        book:   '<path d="M4 5h22v20H6a2 2 0 0 1-2-2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M4 5a2 2 0 0 1 2-2h20v20H6a2 2 0 0 0-2 2" fill="none" stroke="currentColor" stroke-width="2"/>',
        sun:    '<circle cx="15" cy="15" r="5" fill="currentColor"/><g stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="15" y1="2" x2="15" y2="6"/><line x1="15" y1="24" x2="15" y2="28"/><line x1="2" y1="15" x2="6" y2="15"/><line x1="24" y1="15" x2="28" y2="15"/><line x1="5" y1="5" x2="8" y2="8"/><line x1="22" y1="22" x2="25" y2="25"/><line x1="5" y1="25" x2="8" y2="22"/><line x1="22" y1="8" x2="25" y2="5"/></g>',
        podium: '<rect x="5" y="14" width="6" height="12" fill="currentColor"/><rect x="12" y="8" width="6" height="18" fill="currentColor"/><rect x="19" y="18" width="6" height="8" fill="currentColor"/><polygon points="15,2 17,6 13,6" fill="currentColor"/>',
        shield: '<path d="M15 2 L26 6 V14 C26 21 21 26 15 28 C9 26 4 21 4 14 V6 Z" fill="currentColor"/>',
        atom:   '<circle cx="15" cy="15" r="3" fill="currentColor"/><g fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="15" cy="15" rx="11" ry="5"/><ellipse cx="15" cy="15" rx="11" ry="5" transform="rotate(60 15 15)"/><ellipse cx="15" cy="15" rx="11" ry="5" transform="rotate(-60 15 15)"/></g>',
        person: '<circle cx="15" cy="10" r="5" fill="currentColor"/><path d="M4 28 C4 20 8 17 15 17 C22 17 26 20 26 28 Z" fill="currentColor"/>',
    };

    function escapeXml(s) {
        return String(s).replace(/[<>&"']/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));
    }

    function themedSvg(theme, badge, sub, title) {
        const t = THEMES[theme];
        const iconSrc = ICON_PATHS[t.icon] || ICON_PATHS.book;
        const gradId = 'g_' + theme + '_' + hashString(title).toString(36);
        const badgeText = escapeXml(badge || '');
        const subText = escapeXml(sub || '');
        return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${escapeXml(title)}">
    <defs>
        <linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="${t.c1}"/>
            <stop offset="1" stop-color="${t.c2}"/>
        </linearGradient>
        <pattern id="${gradId}_dots" x="0" y="0" width="18" height="18" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="${t.accent}" fill-opacity="0.14"/>
        </pattern>
    </defs>
    <rect width="320" height="160" fill="url(#${gradId})"/>
    <rect width="320" height="160" fill="url(#${gradId}_dots)"/>
    <g transform="translate(30,24)" color="${t.accent}">${iconSrc}</g>
    <text x="30" y="112" fill="#fff" font-family="Inter, system-ui, sans-serif" font-weight="800" font-size="28" letter-spacing="-0.02em">${badgeText}</text>
    <text x="30" y="136" fill="${t.accent}" font-family="Inter, system-ui, sans-serif" font-weight="600" font-size="13" letter-spacing="0.04em">${subText}</text>
    <rect x="280" y="20" width="20" height="3" fill="${t.accent}" opacity="0.8"/>
</svg>`.trim();
    }

    function initialsSvg(title, badgeOverride) {
        const initials = badgeOverride || initialsFor(title);
        const hue = hashString(title) % 360;
        const c1 = `hsl(${hue}, 68%, 60%)`;
        const c2 = `hsl(${(hue + 48) % 360}, 72%, 46%)`;
        const gradId = 'g' + hashString(title).toString(36);
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${escapeXml(title)}"><defs><linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="200" height="100" fill="url(#${gradId})"/><text x="100" y="58" font-size="44" font-weight="800" fill="rgba(255,255,255,0.95)" text-anchor="middle" font-family="Inter, system-ui, sans-serif" letter-spacing="-0.03em">${escapeXml(initials)}</text></svg>`;
    }

    function setCoverSvg(cover, card, title) {
        const theme = card.dataset.theme;
        const badge = card.dataset.badge;
        const sub = card.dataset.sub;
        if (theme && THEMES[theme]) {
            cover.innerHTML = themedSvg(theme, badge, sub, title);
        } else {
            cover.innerHTML = initialsSvg(title, badge);
        }
    }

    function setCoverFromRepo(cover, card, title, repo) {
        const img = new Image();
        img.alt = title;
        img.loading = 'lazy';
        img.decoding = 'async';
        img.referrerPolicy = 'no-referrer';
        img.onload = () => {
            cover.innerHTML = '';
            cover.appendChild(img);
        };
        img.onerror = () => setCoverSvg(cover, card, title);
        img.src = `https://opengraph.githubassets.com/1/${repo}`;
    }

    document.querySelectorAll('.card').forEach(card => {
        const cover = card.querySelector('.card-cover');
        if (!cover) return;
        const titleEl = card.querySelector('.card-title');
        const title = (titleEl && titleEl.textContent.trim()) || card.textContent.trim().slice(0, 40);
        const repo = card.dataset.repo;
        if (repo) {
            setCoverFromRepo(cover, card, title, repo);
        } else {
            setCoverSvg(cover, card, title);
        }
    });

    // ---------- init ----------
    const initial = location.hash.replace('#', '') || 'home';
    activate(initial, false);
})();
