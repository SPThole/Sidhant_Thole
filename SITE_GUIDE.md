# Site Guide

Minimal, **tab-based** single-page site.
Hosted at **https://spthole.github.io/Sidhant_Thole/**.

## Files

```
index.html            Main page (Home / About / Projects / Posts / Portfolio / Resume tabs)
styles.css            All styles (light theme, orange accent, Inter)
script.js             Tab switching + URL hash sync + SVD avatar animation
posts/                One HTML file per blog post
  template.html         Copy this for new posts
apps/                 Optional landing pages for individual projects
  template.html         Copy this for new project pages
images/
  profile/              SVD animation frames + manifest.json (generated)
  profile_source.png    Source avatar (you supply this)
resume/
  Sidhant_Thole.pdf     PDF embedded in the Resume tab
scripts/
  svd_frames.py         Regenerates avatar SVD frames
Projects/             Legacy research project pages
.nojekyll             Disables Jekyll on GitHub Pages (lets all files serve as-is)
```

## Avatar SVD animation

The home tab shows an avatar that animates from a rank-1 SVD reconstruction
up to the full image. Frames are pre-rendered.

**Regenerating the frames:**

```bash
pip install numpy pillow
python3 scripts/svd_frames.py images/profile_source.png
```

This writes `rank_001.png`, `rank_002.png`, … `rank_full.png` and a
`manifest.json` into `images/profile/`. The site's JS reads the manifest
and plays the frames on page load.

To change the rank progression or output size, edit the `RANKS` list and
`TARGET_SIZE` in [scripts/svd_frames.py](scripts/svd_frames.py).

## Local preview

```bash
cd Sidhant_Thole
python3 -m http.server 8080
# open http://localhost:8080
```

## Hosting on GitHub Pages

Already set up. Just push to the default branch and it serves at
`https://spthole.github.io/Sidhant_Thole/`.

The `.nojekyll` file disables Jekyll so all HTML (including templates) is
served exactly as-is — no special filename rules to worry about.

## How tabs work

- Each section (`#home`, `#about`, `#apps`, `#posts`, `#portfolio`) is a
  `<section class="tab-panel">` inside `<main>`.
- `script.js` shows one panel at a time based on `location.hash`.
- Direct links like `…/Sidhant_Thole/#apps` work and are shareable.
- To add a new tab: add a `<li><a href="#newtab" data-tab="newtab">New</a></li>`
  in the nav, and a `<section class="tab-panel" id="newtab" hidden>…</section>`
  in `<main>`. That's it.

---

## Adding a blog post

1. Copy the template:

   ```bash
   cp posts/template.html posts/my-slug.html
   ```

2. Edit `posts/my-slug.html` — fill in `TITLE`, `YYYY-MM-DD`, and the body.

3. In `index.html`, inside the Posts tab (`<ul class="list posts">`), add:

   ```html
   <li>
       <div class="list-row">
           <a href="posts/my-slug.html" class="list-title">My title</a>
           <span class="list-meta">2026-04-20</span>
       </div>
       <p class="list-desc">One-line summary.</p>
   </li>
   ```

   Newest post goes at the top. Remove the placeholder note once you have posts.

## Adding an app

**Option A — link out directly** (simplest). If the app lives on GitHub or has
its own URL, just add a list item in `index.html` under the Apps tab:

```html
<li>
    <div class="list-row">
        <a href="https://github.com/SPThole/my-app" class="list-title" target="_blank" rel="noopener">My App</a>
        <span class="list-meta">Open source</span>
    </div>
    <p class="list-desc">One-line summary.</p>
</li>
```

**Option B — dedicated landing page** on your own site.

1. Copy the template:

   ```bash
   cp apps/template.html apps/my-app.html
   ```

2. Edit `apps/my-app.html` — name, summary, links, sections.

3. Add a list item in `index.html` under the Apps tab pointing to it:

   ```html
   <li>
       <div class="list-row">
           <a href="apps/my-app.html" class="list-title">My App</a>
           <span class="list-meta">Live</span>
       </div>
       <p class="list-desc">One-line summary.</p>
   </li>
   ```

---

## Editing homepage content

- **Hero headline / lede / CTAs** — edit `<div class="hero">` in `index.html`.
- **Affiliations strip** — edit `<div class="logos">`.
- **About tab** — edit `<section id="about">`.
- **Skill tags** — edit `<p class="tags">` inside the About tab.
- **Footer social links** — edit `.footer-links` at the bottom.

## Design tokens

All colors, accent, and column width live at the top of `styles.css`:

```css
:root {
    --text: #111;
    --muted: #5a5a5a;
    --subtle: #9a9a9a;
    --rule: #ececec;
    --bg: #fafaf7;
    --surface: #fff;
    --accent: #ff5b2e;     /* change this to re-theme the site */
    --max-width: 720px;
}
```

Change `--accent` and every call-to-action, active tab, title underline, and
hover highlight shifts with it.
