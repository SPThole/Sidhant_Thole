# Handoff: Sidhant_Thole — Transformer-themed portfolio

## Overview

A rebuild of the `SPThole/Sidhant_Thole` GitHub Pages site. Transformer-architecture theme (subtle — blocks, projections, attention, kv-cache), **fully data-driven** so future content updates never require touching HTML or JS.

## About the files in this bundle

These are **shippable, production-ready static files** — not mocks. Plain HTML + CSS + vanilla JS + markdown, no build step. They are designed to drop into the existing GitHub Pages repo as-is.

## Fidelity

**High-fidelity and production-ready.** Nothing needs to be recreated in another framework. The only task is:

1. Mirror this folder into the repo root
2. Delete the legacy files it replaces
3. Commit + push

## Deployment

See **`DEPLOY.md`** for the exact file map, commit steps, and a table of old→new replacements.

## Content model

See **`SITE_GUIDE.md`** for how to add projects / publications / notes / edit the bio / change headlines etc.

## Fork Claude Code

From the `Sidhant_Thole` repo root, run Claude Code and paste:

> Apply the handoff in `<abs-path-to>/handoff/`. Follow `DEPLOY.md` step-by-step:
> - Replace the root `index.html`, `styles.css`
> - Delete `script.js`
> - Add `site.js`, `content/`, `assets/`
> - Replace `SITE_GUIDE.md`
> - Leave `README.md` and `.nojekyll` alone
> - Stage all, commit with the message from DEPLOY.md, push to `master`
> Verify `python3 -m http.server 8000` loads cleanly before committing.

## Design Tokens

All tokens are in `styles.css` under `:root` and `body[data-theme="..."]`:

- Paper: `#f5f1e8` (light), dark `#12151c`
- Ink: `#1a1a1a` / `#e7e2d3`
- Blueprint blue: `#1a4b7a`
- Accent red: `#d64a1f`
- Rule/grid: `#d7cfb8` / `#b8ad91`
- Fonts: Inter (body), JetBrains Mono (mono), Kalam (hand-drawn napkin labels)

## Assets used

- `assets/profile_ghibli.png` — hero avatar (Ghibli portrait)
- `assets/tholesidhant.jpg` — About sidebar portrait
- `assets/oldman_bench.jpg` — Notes scene (Jungfraujoch)
- `assets/Sidhant_Thole.pdf` — resume embed + download
- `assets/iitmlogo.png` — kept for legacy references
