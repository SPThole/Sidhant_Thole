# Deploy — Sidhant_Thole portfolio

New dynamic, content-driven version of the site. Works on GitHub Pages as-is.

## What changed (vs. the old repo)

The old site hardcoded every project/publication/note into `index.html`. The new version reads from `content/*.md` and `content/site.json` at runtime, so you never touch HTML to update the site.

| Old file            | Action  | New file           |
| ------------------- | ------- | ------------------ |
| `index.html`        | replace | `index.html`       |
| `styles.css`        | replace | `styles.css`       |
| `script.js`         | delete  | — (replaced by `site.js`) |
| —                   | add     | `site.js`          |
| —                   | add     | `content/` (folder) |
| —                   | add     | `assets/` (folder, or keep existing images/) |
| `SITE_GUIDE.md`     | replace | `SITE_GUIDE.md` (see below, new content model doc) |
| `README.md`         | keep    | keep               |
| `.nojekyll`         | keep    | keep               |

Old folders (`Projects/`, `blogs/`, `posts/`, `apps/`, `scripts/`, `images/`, `resume/`) can be deleted — everything now lives in `content/` and `assets/`. Keep them if you have inbound links you don't want to break.

## File map to push

Drop the contents of this folder **at the repo root**:

```
index.html               ← replaces old index.html
styles.css               ← replaces old styles.css
site.js                  ← new (loader)
content/
  site.json
  about.md
  projects/
    index.json
    coexistai.md
    smallgpt.md
    parameter-golf.md
    bpb-wtf.md
  publications/
    index.json
    dse-som-smo.md
    social-capital-heliyon.md
    robust-som-wcsmo.md
    interpretable-som-thesis.md
    kaggle-bms.md
    ramu-palaniappan.md
    rajan-sudhir.md
  notes/
    index.json
assets/
  profile_ghibli.png
  oldman_bench.jpg
  tholesidhant.jpg
  Sidhant_Thole.pdf
  iitmlogo.png
```

## Claude Code commit steps

```bash
# from inside the Sidhant_Thole repo
rm -f script.js
cp -R /absolute/path/to/handoff/. .
git add -A
git commit -m "Transformer-themed portfolio + data-driven content model"
git push origin master
```

After push, GitHub Pages serves from `master` root and the `.nojekyll` file is already there.

## Local dev

`file://` will **not** work (the loader uses `fetch()`). Run:

```bash
python3 -m http.server 8000
# open http://localhost:8000/
```

## How to update content

### Add a project

1. Create `content/projects/my-thing.md`:
   ```md
   ---
   title: My Thing
   meta: ★ 12 · open-source
   link: https://github.com/you/my-thing
   cover: auto
   ---

   One or two sentences about what it is.
   ```
2. Add `"my-thing.md"` to `content/projects/index.json` in the order you want it to appear.

### Add a publication

Same pattern in `content/publications/`. Frontmatter must include `group:` — one of `journal`, `conference`, `thesis`, `competitions`, `collaborators`.

### Add a note

Drop `content/notes/your-note.md`, add to `content/notes/index.json`. The empty-state disappears automatically.

### Edit bio / headline / nav / footer

Edit `content/site.json` (all static copy lives there) or `content/about.md` (the bio prose).

### Cover images

The `cover:` frontmatter field controls cards' cover art:

| Value                  | Result                                                  |
| ---------------------- | ------------------------------------------------------- |
| `auto`                 | GitHub OG image if `link:` is a github.com URL, else a deterministic schematic |
| `contours` / `network` / `waves` / `som` / `molecule` | specific schematic |
| `initials:SR`          | monogram circle                                         |
| `assets/foo.png` or any URL | literal image                                      |
| (omitted)              | schematic deterministically picked from the title       |

If an image fails to load, the fallback schematic kicks in automatically — you never end up with a broken image.

## What's in each file

- **`index.html`** — empty panel skeleton + tweaks + matmul transition overlay. Don't edit unless you're changing the transition or the tweaks UI.
- **`site.js`** — content loader + renderers. Don't edit for content changes.
- **`styles.css`** — design tokens (blueprint/paper/dark themes, napkin-math look).
- **`content/site.json`** — site chrome copy (nav labels, hero, panel headings, scholar stats, notes scene dialogue, footer links).
- **`content/about.md`** — bio prose.
- **`content/{projects,publications,notes}/*.md`** — one per entry.
- **`content/{projects,publications,notes}/index.json`** — explicit ordering of entries.
