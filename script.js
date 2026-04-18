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

    // ---------- init ----------
    const initial = location.hash.replace('#', '') || 'home';
    activate(initial, false);
})();
