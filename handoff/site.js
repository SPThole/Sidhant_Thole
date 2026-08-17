/* =====================================================================
   site.js — dynamic content loader for the Transformer portfolio
   ---------------------------------------------------------------------
   All content lives under content/. This file reads it and renders
   everything. You should never need to touch it to add a project,
   publication, note, or update about-me text.
   ===================================================================== */

(() => {

// --------- tiny markdown (bold, italic, inline code, links, paragraphs)
const md = {
  inline(s) {
    return s
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  },
  render(text) {
    const blocks = text.trim().split(/\n\s*\n/);
    return blocks.map(b => {
      const t = b.trim();
      if (!t) return '';
      if (/^#{1,6}\s/.test(t)) {
        const m = t.match(/^(#{1,6})\s+(.*)$/);
        return `<h${m[1].length}>${this.inline(m[2])}</h${m[1].length}>`;
      }
      if (/^[-*]\s/m.test(t)) {
        const items = t.split(/\n/).filter(l => /^[-*]\s/.test(l))
          .map(l => `<li>${this.inline(l.replace(/^[-*]\s+/, ''))}</li>`).join('');
        return `<ul>${items}</ul>`;
      }
      return `<p>${this.inline(t.replace(/\n/g, ' '))}</p>`;
    }).join('\n');
  }
};

// --------- frontmatter (--- delimited YAML-ish: key: value)
function parseFrontmatter(text) {
  const m = text.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: text };
  const data = {};
  for (const line of m[1].split(/\n/)) {
    const kv = line.match(/^([a-zA-Z_][\w-]*)\s*:\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim();
    // strip optional surrounding quotes
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    data[kv[1]] = v;
  }
  return { data, body: m[2] };
}

// --------- fetch + parse
async function loadJSON(path) {
  const res = await fetch(path, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.json();
}
async function loadText(path) {
  const res = await fetch(path, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.text();
}
async function loadMarkdown(path) {
  const { data, body } = parseFrontmatter(await loadText(path));
  return { data, body };
}
async function loadCollection(folder) {
  const list = await loadJSON(`${folder}/index.json`);
  const items = [];
  for (const file of list) {
    try {
      const { data, body } = await loadMarkdown(`${folder}/${file}`);
      items.push({ ...data, body, _file: file });
    } catch (e) {
      console.warn('skipped', folder + '/' + file, e);
    }
  }
  return items;
}

// --------- html helpers
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);
const h = (html) => {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
};

// --------- Auto-cover generator: picks a schematic based on `cover:` field
const covers = {
  auto(item) {
    // try to derive github OG image from a github.com link
    const m = item.link && item.link.match(/github\.com\/([^/]+)\/([^/?#]+)/);
    if (m) {
      const fallback = covers.schematic(item.title || 'project');
      return `<img src="https://opengraph.githubassets.com/1/${m[1]}/${m[2]}" alt="${esc(item.title)}" referrerpolicy="no-referrer" onerror="this.closest('.card-cover').innerHTML = window.__schematicCover(${JSON.stringify(item.title || '')});" />`;
    }
    return covers.schematic(item.title);
  },
  contours() {
    return `<svg width="100%" height="100%" viewBox="0 0 200 80" preserveAspectRatio="xMidYMid meet" fill="none">
      <rect x="8" y="14" width="184" height="52" stroke="currentColor" stroke-width=".8" stroke-dasharray="3 2" opacity=".4"/>
      <circle cx="60" cy="40" r="14" stroke="currentColor" stroke-width="1" opacity=".6"/>
      <circle cx="90" cy="40" r="10" stroke="currentColor" stroke-width="1" opacity=".8"/>
      <circle cx="120" cy="40" r="7" stroke="currentColor" stroke-width="1"/>
      <circle cx="140" cy="40" r="3" fill="currentColor"/>
      <text x="150" y="44" font-family="JetBrains Mono" font-size="9" fill="currentColor" opacity=".7">optimum</text>
    </svg>`;
  },
  network() {
    return `<svg width="100%" height="100%" viewBox="0 0 200 80" preserveAspectRatio="xMidYMid meet" fill="none">
      <g stroke="currentColor" stroke-width="1">
        <circle cx="40" cy="40" r="5"/><circle cx="70" cy="24" r="5"/><circle cx="70" cy="56" r="5"/>
        <circle cx="110" cy="20" r="5"/><circle cx="110" cy="44" r="5"/><circle cx="110" cy="62" r="5"/>
        <circle cx="150" cy="32" r="5"/><circle cx="150" cy="52" r="5"/>
        <line x1="45" y1="40" x2="65" y2="26"/><line x1="45" y1="40" x2="65" y2="54"/>
        <line x1="75" y1="24" x2="105" y2="20"/><line x1="75" y1="24" x2="105" y2="44"/>
        <line x1="75" y1="56" x2="105" y2="44"/><line x1="75" y1="56" x2="105" y2="62"/>
        <line x1="115" y1="20" x2="145" y2="32"/><line x1="115" y1="44" x2="145" y2="32"/>
        <line x1="115" y1="44" x2="145" y2="52"/><line x1="115" y1="62" x2="145" y2="52"/>
      </g></svg>`;
  },
  waves() {
    return `<svg width="100%" height="100%" viewBox="0 0 200 80" preserveAspectRatio="xMidYMid meet" fill="none">
      <g stroke="currentColor" stroke-width="1" opacity=".8">
        <path d="M10 60 Q 50 20 100 40 T 190 30" />
        <path d="M10 70 Q 50 30 100 50 T 190 40" stroke-dasharray="3 2" opacity=".5"/>
      </g>
      <circle cx="100" cy="40" r="4" fill="currentColor"/>
      <rect x="86" y="26" width="28" height="28" stroke="currentColor" stroke-width=".8" stroke-dasharray="2 2" opacity=".6"/>
    </svg>`;
  },
  som() {
    let rects = '';
    for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) {
      const op = (0.2 + ((r * 5 + c) * 0.61) % 0.6).toFixed(2);
      const y = 16 + r * 16;
      const x = 20 + c * 16;
      const fill = (r + c) % 2 === 0 ? `fill="currentColor" opacity="${op}"` : '';
      rects += `<rect x="${x}" y="${y}" width="12" height="12" ${fill}/>`;
    }
    return `<svg width="100%" height="100%" viewBox="0 0 200 80" preserveAspectRatio="xMidYMid meet" fill="none">
      <g stroke="currentColor" stroke-width=".8">${rects}</g>
      <text x="110" y="34" font-family="JetBrains Mono" font-size="9" fill="currentColor" opacity=".8">SOM</text>
      <text x="110" y="48" font-family="JetBrains Mono" font-size="9" fill="currentColor" opacity=".5">n=5×5</text>
    </svg>`;
  },
  molecule() {
    return `<svg width="100%" height="100%" viewBox="0 0 200 80" preserveAspectRatio="xMidYMid meet" fill="none">
      <g stroke="currentColor" stroke-width="1">
        <circle cx="60" cy="40" r="6"/><circle cx="85" cy="26" r="6"/><circle cx="85" cy="54" r="6"/>
        <circle cx="110" cy="40" r="6"/><circle cx="135" cy="26" r="6"/><circle cx="135" cy="54" r="6"/>
        <line x1="66" y1="40" x2="79" y2="28"/><line x1="66" y1="40" x2="79" y2="52"/>
        <line x1="91" y1="26" x2="104" y2="38"/><line x1="91" y1="54" x2="104" y2="42"/>
        <line x1="116" y1="40" x2="129" y2="28"/><line x1="116" y1="40" x2="129" y2="52"/>
      </g>
      <text x="25" y="44" font-family="JetBrains Mono" font-size="9" fill="currentColor" opacity=".7">InChI</text>
    </svg>`;
  },
  initials(text) {
    return `<svg width="100%" height="100%" viewBox="0 0 200 80" preserveAspectRatio="xMidYMid meet" fill="none">
      <circle cx="100" cy="40" r="22" stroke="currentColor" stroke-width="1"/>
      <text x="100" y="45" font-family="Inter" font-size="16" font-weight="700" fill="currentColor" text-anchor="middle">${esc(text)}</text>
    </svg>`;
  },
  schematic(title) {
    // deterministic pattern from title hash
    const t = (title || '').toLowerCase();
    let hash = 0;
    for (let i = 0; i < t.length; i++) hash = (hash * 31 + t.charCodeAt(i)) | 0;
    const pick = Math.abs(hash) % 5;
    const pats = ['contours','network','waves','som','molecule'];
    return covers[pats[pick]]();
  }
};

function renderCover(item) {
  const c = item.cover;
  if (!c) return `<div class="card-cover cover-schematic">${covers.schematic(item.title)}</div>`;
  if (c === 'auto') {
    const content = covers.auto(item);
    const isImg = content.trim().startsWith('<img');
    return `<div class="card-cover${isImg ? '' : ' cover-schematic'}">${content}</div>`;
  }
  if (c.startsWith('initials:')) {
    return `<div class="card-cover cover-schematic">${covers.initials(c.slice(9))}</div>`;
  }
  if (/^https?:\/\//.test(c) || c.startsWith('assets/') || c.startsWith('./') || c.startsWith('/')) {
    return `<div class="card-cover"><img src="${esc(c)}" alt="${esc(item.title)}" onerror="this.closest('.card-cover').innerHTML = window.__schematicCover(${JSON.stringify(item.title || '')});" /></div>`;
  }
  if (covers[c]) return `<div class="card-cover cover-schematic">${covers[c]()}</div>`;
  return `<div class="card-cover cover-schematic">${covers.schematic(item.title)}</div>`;
}

window.__schematicCover = (title) => `<svg width="100%" height="100%" viewBox="0 0 200 80" preserveAspectRatio="xMidYMid meet" fill="none">
  ${covers.schematic(title).replace(/<svg[^>]*>|<\/svg>/g,'')}
</svg>`;

// --------- card factory
function cardHTML(item, blockLabel) {
  const hasLink = !!item.link;
  const tag = hasLink ? 'a' : 'div';
  const attrs = hasLink ? ` href="${esc(item.link)}" target="_blank" rel="noopener"` : '';
  const body = md.render(item.body || '');
  const meta = item.meta ? `<span class="card-meta">${esc(item.meta)}</span>` : '';
  return `
  <${tag} class="card"${blockLabel ? ` data-block="${esc(blockLabel)}"` : ''}${attrs}>
    ${renderCover(item)}
    <div class="card-body">
      <div class="card-head">
        <span class="card-title">${esc(item.title || 'untitled')}</span>
        ${meta}
      </div>
      <div class="card-desc">${body}</div>
    </div>
  </${tag}>`;
}

// ===========================================================
// Page renderers
// ===========================================================

function renderHeader(site) {
  const header = document.querySelector('.site-header');
  const nav = `
    <nav class="nav">
      <a href="#home" class="nav-home" data-tab="home">
        <span class="nav-home-mark">${esc(site.brand.mark)}</span>
        <span>${esc(site.brand.name)}</span>
      </a>
      <ul class="nav-links" role="tablist">
        ${site.nav.map(n => `<li><a href="${esc(n.hash)}" data-tab="${esc(n.id)}" role="tab">${esc(n.label)}</a></li>`).join('')}
      </ul>
    </nav>`;
  header.innerHTML = nav;
}

const ICONS = {
  grid: `<svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect x="3" y="3" width="6" height="6" stroke="currentColor" stroke-width="1.2"/>
    <rect x="11" y="3" width="6" height="6" stroke="currentColor" stroke-width="1.2" fill="currentColor" opacity=".2"/>
    <rect x="19" y="3" width="6" height="6" stroke="currentColor" stroke-width="1.2"/>
    <rect x="3" y="11" width="6" height="6" stroke="currentColor" stroke-width="1.2" fill="currentColor" opacity=".2"/>
    <rect x="11" y="11" width="6" height="6" stroke="currentColor" stroke-width="1.2"/>
    <rect x="19" y="11" width="6" height="6" stroke="currentColor" stroke-width="1.2" fill="currentColor" opacity=".5"/>
    <rect x="3" y="19" width="6" height="6" stroke="currentColor" stroke-width="1.2"/>
    <rect x="11" y="19" width="6" height="6" stroke="currentColor" stroke-width="1.2" fill="currentColor" opacity=".2"/>
    <rect x="19" y="19" width="6" height="6" stroke="currentColor" stroke-width="1.2"/></svg>`,
  attention: `<svg width="40" height="28" viewBox="0 0 40 28" fill="none">
    <circle cx="6" cy="14" r="3" stroke="currentColor" stroke-width="1.2" fill="currentColor" opacity=".15"/>
    <circle cx="20" cy="6" r="3" stroke="currentColor" stroke-width="1.2"/>
    <circle cx="20" cy="22" r="3" stroke="currentColor" stroke-width="1.2"/>
    <circle cx="34" cy="14" r="3" stroke="currentColor" stroke-width="1.2" fill="currentColor" opacity=".15"/>
    <path d="M9 13 L17 7" stroke="currentColor" stroke-width="1"/>
    <path d="M9 15 L17 22" stroke="currentColor" stroke-width="1"/>
    <path d="M23 7 L31 13" stroke="currentColor" stroke-width="1"/>
    <path d="M23 22 L31 15" stroke="currentColor" stroke-width="1"/></svg>`,
  bars: `<svg width="36" height="28" viewBox="0 0 36 28" fill="none">
    <rect x="4" y="6" width="28" height="3" fill="currentColor" opacity=".7"/>
    <rect x="4" y="12" width="20" height="3" fill="currentColor" opacity=".45"/>
    <rect x="4" y="18" width="12" height="3" fill="currentColor" opacity=".25"/></svg>`,
  doc: `<svg width="24" height="28" viewBox="0 0 24 28" fill="none">
    <rect x="4" y="3" width="16" height="22" stroke="currentColor" stroke-width="1.2" rx="1"/>
    <line x1="8" y1="9" x2="16" y2="9" stroke="currentColor" stroke-width="1"/>
    <line x1="8" y1="13" x2="16" y2="13" stroke="currentColor" stroke-width="1"/>
    <line x1="8" y1="17" x2="14" y2="17" stroke="currentColor" stroke-width="1"/></svg>`
};

function renderHome(site) {
  const hero = site.hero;
  const headline = esc(hero.headline).replace(/\{em\}/g, '<em>').replace(/\{\/em\}/g, '</em>');
  const ctaSecondary = hero.secondary_cta.tab
    ? `<a href="${esc(hero.secondary_cta.href)}" data-tab="${esc(hero.secondary_cta.tab)}" class="cta-secondary">${esc(hero.secondary_cta.label)}</a>`
    : `<a href="${esc(hero.secondary_cta.href)}" class="cta-secondary">${esc(hero.secondary_cta.label)}</a>`;
  const panel = document.getElementById('home');
  panel.innerHTML = `
    <div class="hero">
      <div class="hero-text">
        <p class="eyebrow">${esc(hero.eyebrow)}</p>
        <h1>${headline}</h1>
        <p class="lede">${esc(hero.lede)}</p>
        <div class="cta-row">
          <a href="${esc(hero.primary_cta.href)}" class="cta">${esc(hero.primary_cta.label)}</a>
          ${ctaSecondary}
        </div>
        <div class="logos" aria-label="Affiliations">
          ${hero.affiliations.map(a => `<span class="logo-chip"><i class="tick"></i> ${esc(a)}</span>`).join('')}
        </div>
      </div>
      <div class="hero-schematic">
        <div class="hs-avatar-wrap">
          <img class="hs-avatar" src="${esc(hero.avatar)}" alt="${esc(site.brand.name)}" />
          <span class="hs-corner-label tl">token_0</span>
          <span class="hs-corner-label br">dim · 768</span>
        </div>
        <div class="hs-embedding" aria-hidden="true">${'<i></i>'.repeat(16)}</div>
        <div class="hs-cap">embedding vector</div>
        <div class="hero-napkin">${esc(hero.napkin).replace(/\n/g,'<br/>')}</div>
      </div>
    </div>
    <div class="arch-diagram" id="arch">
      <div class="arch-grid">
        ${site.home_cards.map(c => `
          <a class="arch-block" href="#${esc(c.tab)}" data-tab="${esc(c.tab)}">
            <div class="ab-icon" aria-hidden="true">${ICONS[c.icon] || ICONS.grid}</div>
            <div class="ab-label">${esc(c.label)}</div>
            <div class="ab-name">${esc(c.name)}</div>
            <div class="ab-sub">${esc(c.sub)}</div>
          </a>`).join('')}
      </div>
      <div class="arch-caption">↑ pick a block — each one&nbsp;is a step through the&nbsp;stack</div>
    </div>`;
}

function renderAbout(site, aboutMd) {
  const a = site.about;
  const panel = document.getElementById('about');
  panel.innerHTML = `
    <div class="panel-head">
      <h2 class="panel-title"><span class="n">${esc(a.panel_number)}</span>${esc(a.panel_title)}</h2>
      <span class="schema-stamp">${esc(a.schema_stamp)}</span>
    </div>
    <p class="panel-note">${esc(a.panel_note)}</p>
    <div class="about-grid">
      <div class="prose">${md.render(aboutMd.body)}</div>
      <aside>
        <div class="me-card">
          <img src="${esc(a.profile_image)}" alt="${esc(site.brand.name)}" />
          <div class="me-card-cap">profile · id_0</div>
        </div>
        <div class="stack-card">
          <div class="stack-card-head"><span>vocab · stack</span><span>n=${a.stack.length}</span></div>
          <p class="stack-card-title">${esc(a.stack_title)}</p>
          <div class="tags">${a.stack.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
        </div>
      </aside>
    </div>`;
}

function renderProjects(site, projects) {
  const p = site.projects;
  const panel = document.getElementById('projects');
  panel.innerHTML = `
    <div class="panel-head">
      <h2 class="panel-title"><span class="n">${esc(p.panel_number)}</span>${esc(p.panel_title)}</h2>
      <span class="schema-stamp">${esc(p.schema_stamp)}</span>
    </div>
    <p class="panel-note">${esc(p.panel_note)}</p>
    <div class="cards" id="project-cards">
      ${projects.map((item, i) => cardHTML(item, `block · ${String(i+1).padStart(2,'0')}`)).join('')}
    </div>`;
}

function renderPublications(site, pubs) {
  const p = site.publications;
  const groups = p.groups;
  // bucket publications by group
  const bucketed = {};
  for (const pub of pubs) {
    const g = pub.group || 'journal';
    (bucketed[g] = bucketed[g] || []).push(pub);
  }
  const counters = {};
  const shortFor = (g) => ({journal:'paper', conference:'conf', thesis:'thesis', competitions:'comp', collaborators:'ppl'}[g] || g);
  const groupsHTML = groups.map(g => {
    const items = bucketed[g.id] || [];
    if (!items.length) return '';
    return `
      <h3 class="group-heading">${esc(g.title)}</h3>
      <div class="cards">
        ${items.map(item => {
          counters[g.id] = (counters[g.id] || 0) + 1;
          const num = String(counters[g.id]).padStart(2,'0');
          return cardHTML(item, `${shortFor(g.id)} · ${num}`);
        }).join('')}
      </div>`;
  }).join('');

  const panel = document.getElementById('portfolio');
  panel.innerHTML = `
    <div class="panel-head">
      <h2 class="panel-title"><span class="n">${esc(p.panel_number)}</span>${esc(p.panel_title)}</h2>
      <span class="schema-stamp">${esc(p.schema_stamp)}</span>
    </div>
    <p class="panel-note">${esc(p.panel_note)}</p>
    <div class="scholar-stats">
      ${p.stats.map(s => `<div class="stat"><span class="stat-num">${esc(s.num)}</span><span class="stat-label">${esc(s.label)}</span></div>`).join('')}
      <a class="stat-link" href="${esc(p.scholar_link)}" target="_blank" rel="noopener">scholar →</a>
    </div>
    ${groupsHTML}`;
}

function renderNotes(site, notes) {
  const n = site.notes;
  const panel = document.getElementById('posts');
  const scene = n.scene;
  const notesList = notes.length ? `
    <h3 class="group-heading">writing</h3>
    <div class="cards">
      ${notes.map((item, i) => cardHTML(item, `note · ${String(i+1).padStart(2,'0')}`)).join('')}
    </div>` : `
    <div class="empty-state">
      <div class="es-hand">${esc(n.empty_hand)}</div>
      <div class="es-sub">${esc(n.empty_sub)}</div>
    </div>`;
  panel.innerHTML = `
    <div class="panel-head">
      <h2 class="panel-title"><span class="n">${esc(n.panel_number)}</span>${esc(n.panel_title)}</h2>
      <span class="schema-stamp">${esc(n.schema_stamp)}</span>
    </div>
    <p class="panel-note">${esc(n.panel_note)}</p>
    <div class="notes-hero">
      <figure class="notes-photo">
        <img src="${esc(scene.photo)}" alt="${esc(scene.photo_caption)}" />
        <figcaption>${esc(scene.photo_caption)}</figcaption>
      </figure>
      <div class="notes-chat">
        <div class="chat-bubble from-oldman">
          <div class="bubble-meta">
            <span class="avatar-mono">◉</span>
            <span class="bubble-name">${esc(scene.older.name)}</span>
            <span class="bubble-tag">${esc(scene.older.tag)}</span>
          </div>
          <p class="bubble-text"><span class="bubble-quote">“${esc(scene.older.quote)}”</span></p>
          <div class="bubble-caption">${esc(scene.older.caption)}</div>
        </div>
        <div class="kv-loader" role="progressbar" aria-label="KV cache loading">
          <div class="kv-head">
            <span class="kv-title">kv_cache&nbsp;· warming&nbsp;up</span>
            <span class="kv-pct" data-pct>0%</span>
          </div>
          <div class="kv-grid" id="kv-grid" aria-hidden="true"></div>
          <div class="kv-foot">
            <span>layer <b data-layer>0</b>/12</span>
            <span>head <b data-head>0</b>/8</span>
            <span>seq <b data-seq>0</b>/128</span>
          </div>
        </div>
        <div class="chat-bubble from-younger">
          <div class="bubble-meta">
            <span class="avatar-mono">◎</span>
            <span class="bubble-name">${esc(scene.younger.name)}</span>
            <span class="bubble-tag">${esc(scene.younger.tag)}</span>
          </div>
          <p class="bubble-text bubble-typed"><span id="younger-reply"></span><span class="caret"></span></p>
        </div>
      </div>
    </div>
    ${notesList}`;

  // stash reply text for the animator
  window.__youngerReply = scene.younger.reply;
}

function renderResume(site) {
  const r = site.resume;
  const panel = document.getElementById('resume');
  panel.innerHTML = `
    <div class="resume-header">
      <div class="panel-head" style="flex:1;">
        <h2 class="panel-title"><span class="n">${esc(r.panel_number)}</span>${esc(r.panel_title)}</h2>
        <span class="schema-stamp">${esc(r.schema_stamp)}</span>
      </div>
      <a href="${esc(r.pdf)}" download class="cta">download pdf ↓</a>
    </div>
    <div class="resume-embed">
      <object data="${esc(r.pdf)}#view=FitH" type="application/pdf" width="100%" height="900">
        <p>Your browser can't embed PDFs. <a href="${esc(r.pdf)}">Download it here</a>.</p>
      </object>
    </div>`;
}

function renderFooter(site) {
  const f = site.footer;
  const footer = document.querySelector('.site-footer');
  footer.innerHTML = `
    <ul class="footer-links">
      ${f.links.map(l => {
        const tab = l.tab ? ` data-tab="${esc(l.tab)}"` : '';
        const target = /^https?:\/\/|^mailto:/.test(l.href) ? ' target="_blank" rel="noopener"' : '';
        return `<li><a href="${esc(l.href)}"${tab}${target}>${esc(l.label)}</a></li>`;
      }).join('')}
    </ul>
    <p class="copyright">${esc(f.copyright)}</p>`;
}

// ===========================================================
// Boot
// ===========================================================
async function boot() {
  try {
    const [site, aboutMd, projects, publications, notes] = await Promise.all([
      loadJSON('content/site.json'),
      loadMarkdown('content/about.md'),
      loadCollection('content/projects'),
      loadCollection('content/publications'),
      loadCollection('content/notes')
    ]);

    document.title = `${site.brand.name} — Portfolio`;

    renderHeader(site);
    renderHome(site);
    renderAbout(site, aboutMd);
    renderProjects(site, projects);
    renderPublications(site, publications);
    renderNotes(site, notes);
    renderResume(site);
    renderFooter(site);

    // Let the rest of the app wire up (tabs, tweaks, kv loader, etc.)
    document.dispatchEvent(new CustomEvent('content:ready'));
  } catch (e) {
    console.error('Content load failed:', e);
    document.body.innerHTML = `<div style="padding:40px;font-family:system-ui;max-width:640px;margin:80px auto;">
      <h1 style="margin:0 0 12px">Couldn't load site content.</h1>
      <p style="color:#666;line-height:1.6">
        This site reads its content from <code>content/*.md</code> and <code>content/*.json</code> files
        at runtime. That requires serving the site over HTTP. It won't work when opened directly
        from disk (<code>file://</code>).
      </p>
      <p style="color:#666;line-height:1.6">
        To view locally, run a simple server in this folder:
      </p>
      <pre style="background:#f3efe3;padding:12px 14px;border-radius:4px;font-size:13px;">python3 -m http.server 8000
# then open http://localhost:8000/</pre>
      <p style="color:#666;line-height:1.6;margin-top:16px">
        Or just push to GitHub Pages — it will just work there.
      </p>
      <p style="color:#a00;font-family:monospace;font-size:12px;margin-top:24px">${esc(e.message || e)}</p>
    </div>`;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

})();
