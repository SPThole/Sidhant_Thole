# Site Guide

Transformer-themed portfolio, hosted at **https://spthole.github.io/Sidhant_Thole/**.

Single-page, tab-based. Content is **data-driven** — everything is in `content/*.md` and `content/site.json`, parsed and rendered by `site.js` at load time.

## Files

- `index.html` — skeleton. Empty panels, tweaks UI, matmul transition overlay. No content.
- `styles.css` — blueprint + napkin-math design system (3 themes: blueprint, paper, dark).
- `site.js` — loader. Parses markdown + JSON, renders all panels, wires tabs/tweaks/KV-cache animation.
- `content/site.json` — nav, hero copy, panel titles/notes, publication groups, notes scene, footer links.
- `content/about.md` — bio prose with frontmatter.
- `content/projects/` — one `.md` per project + `index.json` (ordering).
- `content/publications/` — one `.md` per publication + `index.json`. Frontmatter `group:` buckets them.
- `content/notes/` — one `.md` per note + `index.json`. Empty by default.
- `assets/` — images + the resume PDF.

## Adding content

### A project

```md
---
title: My Thing
meta: ★ 12 · open-source
link: https://github.com/you/my-thing
cover: auto
---

One or two sentences about what it is.
```

Save as `content/projects/my-thing.md`, then add `"my-thing.md"` to `content/projects/index.json`.

### A publication

Same shape, saved in `content/publications/`. Frontmatter **must** include `group:` — one of:
- `journal`
- `conference`
- `thesis`
- `competitions`
- `collaborators`

### A note

Same shape, saved in `content/notes/`. As soon as the array in `content/notes/index.json` is non-empty, the "more notes coming soon" empty state disappears and real notes render below the old-man / kv-cache scene.

## Frontmatter keys

| Key     | Meaning                                                |
| ------- | ------------------------------------------------------ |
| `title` | Card title (required)                                  |
| `meta`  | Right-aligned small label (e.g. "2021 · rank 56")     |
| `link`  | Optional link — turns the card into an `<a>`          |
| `cover` | See cover options below                                |
| `group` | (publications only) — bucket heading                   |

### Covers

| `cover:` value         | Result                                                  |
| ---------------------- | ------------------------------------------------------- |
| `auto`                 | GitHub OG image if `link` is github.com, else schematic |
| `contours` / `network` / `waves` / `som` / `molecule` | specific schematic |
| `initials:AB`          | monogram circle                                         |
| `assets/foo.png` or URL | literal image                                          |
| (omitted)              | deterministic schematic from the title                  |

## Editing everything else

- Hero headline, tagline, CTAs, affiliations → `content/site.json → hero`
- Nav labels → `content/site.json → nav`
- Panel headings / notes → `content/site.json → {about|projects|publications|notes|resume}`
- Stack tags on About page → `content/site.json → about.stack`
- Scholar stats → `content/site.json → publications.stats`
- Notes scene dialogue (old-man quote, younger-self reply) → `content/site.json → notes.scene`
- Footer links + copyright → `content/site.json → footer`
- Bio prose → `content/about.md`

## Theme

Three themes, toggled via the Tweaks panel (toolbar toggle):
- `blueprint` (default) — warm off-white with blueprint grid
- `paper` — clean off-white
- `dark` — muted dark blue

Density: `normal` / `compact`. Pencil labels: `on` / `off`.

Defaults live in the `TWEAK_DEFAULTS` block inside `index.html`.

## Local dev

Loader uses `fetch()`, so opening from disk won't work. Run:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/`.

## GitHub Pages

Works out of the box. Repo has `.nojekyll` so paths are served verbatim. No build step.
