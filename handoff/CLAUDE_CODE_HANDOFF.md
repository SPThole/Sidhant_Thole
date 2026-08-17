# Handoff to Claude Code — Portfolio Redesign

You are Claude Code working in the local clone of **`SPThole/Sidhant_Thole`** (branch `master`, served via GitHub Pages at https://spthole.github.io/Sidhant_Thole/).

Your job: replace the old site with the new content-driven design bundled in this folder, on a branch, then push and open a PR. **Do not auto-merge** — the user will review and merge.

---

## What's in this bundle

```
handoff/
├── CLAUDE_CODE_HANDOFF.md     ← this file (do not copy to repo)
├── SITE_GUIDE.md              ← new site guide (replaces existing one)
├── content/README.md          ← authoring guide for content/ (new file)
├── index.html                 ← new (replaces existing)
├── styles.css                 ← new (replaces existing)
├── site.js                    ← new (was script.js — rename intentional)
├── content/                   ← new folder, site data lives here
│   ├── site.json
│   ├── about.md
│   ├── projects/
│   │   ├── index.json
│   │   └── *.md
│   ├── publications/
│   │   ├── index.json
│   │   └── *.md
│   └── notes/
│       ├── index.json
│       └── (empty — no notes yet)
└── assets/                    ← new folder
    ├── profile_ghibli.png     ← hero avatar (Ghibli style portrait)
    ├── tholesidhant.jpg       ← About-page profile photo
    ├── oldman_bench.jpg       ← Notes scene photo
    ├── iitmlogo.png           ← carried over from images/
    └── Sidhant_Thole.pdf      ← resume pdf (was at resume/, moved)
```

---

## About the design

These files **ARE** the site — not a React mock to reimplement. They are vanilla HTML + CSS + one JS file, plus a Markdown/JSON content layer. Fidelity is **high**: ship as-is.

- **Theme:** blueprint + napkin-math — transformer architecture metaphor (nav reads input → embed → attention → output), hand-drawn accents, KV-cache loader in the Notes section.
- **Content model:** everything textual lives under `content/`. Adding a project is: drop `content/projects/foo.md` + add `"foo.md"` to `content/projects/index.json`. No HTML edits.
- **Loader:** `site.js` fetches content at runtime. This means the site must be served over HTTP — `file://` won't work locally. GitHub Pages is fine.

---

## Steps

### 1. Create a branch

```bash
git checkout -b redesign/transformer-portfolio
```

### 2. Remove old site files

From the repo root, delete:

```bash
git rm index.html script.js styles.css SITE_GUIDE.md
```

Leave these alone (they are legacy but not harmful):
- `Projects/` — old research pages, still linked around the internet
- `apps/template.html`, `posts/template.html`, `blogs/README.md` — unused but harmless
- `scripts/svd_frames.py` — the old avatar-generator; not used by the new site. Keep unless the user says otherwise.
- `images/` — old image folder. The new site does not read from it. You may leave it for legacy links or `git rm -r images/` if you want a clean repo. **Ask the user before deleting `images/`.**
- `resume/` — empty folder (the real PDF is now in `assets/`). Safe to `git rm -r resume/` or leave.
- `.nojekyll` — **KEEP**. Required for GitHub Pages to serve `content/*.json` and `content/**/*.md` as-is.
- `README.md` — keep as-is (it just points to the live URL and SITE_GUIDE).

### 3. Copy the new files in

From this handoff folder, copy into the repo root:

| From (in this bundle)         | To (in repo)                |
|-------------------------------|-----------------------------|
| `index.html`                  | `index.html`                |
| `styles.css`                  | `styles.css`                |
| `site.js`                     | `site.js`                   |
| `SITE_GUIDE.md`               | `SITE_GUIDE.md`             |
| `content/` (entire folder)    | `content/`                  |
| `content/README.md`           | `content/README.md`         |
| `assets/` (entire folder)     | `assets/`                   |

Then `git add` everything.

### 4. Verify locally

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

Walk every tab — input (home), embed (about), attention (projects), notes, output (publications), resume. The resume tab should embed the PDF inline. In the Notes tab, a KV-cache loader should animate and fill, then `younger_self` should type out a reply.

### 5. Commit and push

```bash
git add -A
git status              # sanity-check the file list
git commit -m "Redesign: content-driven transformer-themed portfolio

- Replace hand-edited HTML with a content/ folder (markdown + JSON)
- New blueprint + napkin-math visual theme
- site.js loads and renders content at runtime
- Navigation mirrors a transformer stack (input → embed → attention → output)
- New SITE_GUIDE.md + content/README.md document the authoring flow"
git push -u origin redesign/transformer-portfolio
```

### 6. Open a PR — do NOT merge

Use `gh` if available:

```bash
gh pr create --base master \
  --title "Redesign: content-driven transformer-themed portfolio" \
  --body "$(cat <<'EOF'
Replaces the old hand-edited HTML site with a content-driven build.

**What's new**
- `content/` folder holds all text + metadata (markdown with frontmatter + index.json per collection)
- `site.js` loads content at runtime and renders every section — no HTML edits needed to add a project, publication, or note
- New visual theme: blueprint paper + napkin math + transformer architecture metaphor
- Notes section has a KV-cache loader animation between two chat bubbles ("older_self" → "younger_self")
- New SITE_GUIDE.md and content/README.md explain the authoring flow

**What's preserved**
- `.nojekyll` (required for Pages)
- `Projects/` legacy research pages (unchanged)
- `README.md` (unchanged)

**Verify locally before merging**
\`\`\`bash
python3 -m http.server 8080
# open http://localhost:8080 and click every tab
\`\`\`

Once merged, GitHub Pages will rebuild automatically.
EOF
)"
```

If `gh` is not installed, print the branch name and the PR URL pattern:
`https://github.com/SPThole/Sidhant_Thole/compare/master...redesign/transformer-portfolio?expand=1`

**Stop here.** Do not merge. Report the PR URL and wait for the user.

---

## Gotchas

1. **`.nojekyll` must stay.** Without it, GitHub Pages runs Jekyll, which hides files starting with `_` and can mangle unfamiliar folders. With it, every file serves as-is, including `content/**/*.md` (which the loader fetches as raw text) and `content/**/index.json`.

2. **Relative paths only.** All asset references in `site.json` are relative (`assets/foo.png`), and all fetches in `site.js` are relative (`content/site.json`). This lets the site work at both `/` and `/Sidhant_Thole/` without changes.

3. **File protocol doesn't work.** Opening `index.html` directly (double-click) will hit CORS errors because `fetch()` can't read local files. The loader catches this and shows a friendly message telling the user to run `python3 -m http.server`. On GitHub Pages this is a non-issue.

4. **Adding content after this PR** — read `content/README.md`. TL;DR: drop a markdown file, add its name to the adjacent `index.json`, commit, push. No HTML changes.

5. **The old `script.js`** animated an SVD avatar reconstruction. That feature is **gone** in the new design — replaced by a static Ghibli portrait + embedding-vector schematic. The `scripts/svd_frames.py` and `images/profile/*` are therefore orphaned. Ask the user before deleting them; they may want to keep the script for future use.

---

## If anything breaks

- Console errors on load → check that `content/site.json` exists and is valid JSON (`python3 -c "import json; json.load(open('content/site.json'))"`).
- A section renders empty → its `index.json` probably lists a file that doesn't exist, or the markdown has a malformed frontmatter block (must start with `---\n` and end with `\n---\n`).
- Images broken → paths in `site.json` or markdown frontmatter must be relative, like `assets/foo.png`, and the file must exist at that path.
