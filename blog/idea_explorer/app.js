const data = window.EXPLORER_DATA || { meta: {}, clusters: [], nodes: [] };

const state = {
  mode: "both",
  query: "",
  rowFilter: null,
  ideaFilter: null,
  cluster: null,
};

const els = {
  summaryStrip: document.getElementById("summaryStrip"),
  searchInput: document.getElementById("searchInput"),
  rowFilterInput: document.getElementById("rowFilterInput"),
  ideaFilterInput: document.getElementById("ideaFilterInput"),
  clearRowRank: document.getElementById("clearRowRank"),
  clusterList: document.getElementById("clusterList"),
  clusterGrid: document.getElementById("clusterGrid"),
  boardTitle: document.getElementById("boardTitle"),
  boardSubtitle: document.getElementById("boardSubtitle"),
  clearCluster: document.getElementById("clearCluster"),
  hoverCard: document.getElementById("hoverCard"),
  modalBackdrop: document.getElementById("modalBackdrop"),
  modalKicker: document.getElementById("modalKicker"),
  modalTitle: document.getElementById("modalTitle"),
  modalBody: document.getElementById("modalBody"),
  closeModal: document.getElementById("closeModal"),
};

const clusterLabels = new Map(data.clusters.map((cluster) => [cluster.id, cluster.label]));
const nodeById = new Map(data.nodes.map((node) => [node.id, node]));

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function truncate(value, length = 180) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  if (text.length <= length) return text;
  return `${text.slice(0, length - 1).trim()}...`;
}

function modeAllows(node) {
  if (state.mode === "both") return true;
  return node.kind === state.mode;
}

function queryAllows(node) {
  if (!state.query) return true;
  const haystack = [
    node.title,
    node.subtitle,
    node.summary,
    node.row,
    node.rank,
    ...(node.tags || []),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(state.query.toLowerCase());
}

function clusterAllows(node) {
  return !state.cluster || node.cluster === state.cluster;
}

function rowRankAllows(node) {
  if (state.rowFilter && node.row !== state.rowFilter) return false;
  if (state.ideaFilter) {
    if (node.kind !== "ai") return false;
    return node.rank === state.ideaFilter;
  }
  return true;
}

function filteredNodes() {
  return data.nodes.filter((node) => modeAllows(node) && queryAllows(node) && rowRankAllows(node) && clusterAllows(node));
}

function groupedNodes(nodes) {
  const groups = new Map();
  for (const cluster of data.clusters) groups.set(cluster.id, []);
  for (const node of nodes) {
    if (!groups.has(node.cluster)) groups.set(node.cluster, []);
    groups.get(node.cluster).push(node);
  }
  return [...groups.entries()]
    .map(([cluster, items]) => ({
      cluster,
      label: clusterLabels.get(cluster) || "Other Tags",
      items: items.sort((a, b) => {
        if (a.row !== b.row) return a.row - b.row;
        if (a.kind !== b.kind) return a.kind === "human" ? -1 : 1;
        return (a.rank || 0) - (b.rank || 0);
      }),
    }))
    .filter((group) => group.items.length);
}

function renderSummary() {
  const meta = data.meta || {};
  els.summaryStrip.innerHTML = [
    ["Human rows", meta.humanRows || 0],
    ["AI ideas", meta.aiIdeas || 0],
    ["Scored matches", meta.scoredMatches || 0],
    ["Tag clusters", data.clusters.length],
  ]
    .map(
      ([label, value]) => `
        <div class="summary-item">
          <strong>${escapeHtml(value)}</strong>
          <span>${escapeHtml(label)}</span>
        </div>
      `
    )
    .join("");
}

function renderClusterList() {
  const visible = data.nodes.filter((node) => modeAllows(node) && queryAllows(node) && rowRankAllows(node));
  const counts = new Map();
  for (const node of visible) counts.set(node.cluster, (counts.get(node.cluster) || 0) + 1);
  els.clusterList.innerHTML = data.clusters
    .filter((cluster) => counts.get(cluster.id))
    .map(
      (cluster) => `
        <button class="cluster-button ${state.cluster === cluster.id ? "is-active" : ""}" type="button" data-cluster="${escapeHtml(cluster.id)}">
          <span>${escapeHtml(cluster.label)}</span>
          <span class="cluster-count">${counts.get(cluster.id) || 0}</span>
        </button>
      `
    )
    .join("");
}

function renderBoard() {
  const nodes = filteredNodes();
  const groups = groupedNodes(nodes);
  const modeLabel = state.mode === "both" ? "Human plus AI" : state.mode === "ai" ? "AI only" : "Human only";
  const clusterLabel = state.cluster ? clusterLabels.get(state.cluster) : "All Tag Clusters";
  const jumpParts = [];
  if (state.rowFilter) jumpParts.push(`row ${state.rowFilter}`);
  if (state.ideaFilter) jumpParts.push(`idea ${state.ideaFilter}`);
  const jumpText = jumpParts.length ? ` Filtered to ${jumpParts.join(", ")}.` : "";
  els.boardTitle.textContent = clusterLabel;
  els.boardSubtitle.textContent = `${nodes.length} visible nodes in ${modeLabel} mode.${jumpText}`;

  if (!groups.length) {
    els.clusterGrid.innerHTML = `<div class="empty-state">No rows or ideas match the current filters.</div>`;
    return;
  }

  els.clusterGrid.innerHTML = groups
    .map(
      (group) => `
        <section class="cluster-panel">
          <header class="cluster-header">
            <h3>${escapeHtml(group.label)}</h3>
            <p>${group.items.length} visible ${group.items.length === 1 ? "node" : "nodes"}</p>
          </header>
          <div class="node-list">
            ${group.items.map(renderNodeCard).join("")}
          </div>
        </section>
      `
    )
    .join("");
}

function renderNodeCard(node) {
  const isAi = node.kind === "ai";
  const meta = isAi
    ? `row ${node.row} / rank ${node.rank}`
    : `row ${node.row} / ${node.revealed?.steps || "steps unknown"}`;
  const matchText = node.matches?.length
    ? isAi
      ? `${node.matches.length} later human match${node.matches.length === 1 ? "" : "es"}`
      : `${node.matches.length} prior prediction match${node.matches.length === 1 ? "" : "es"}`
    : "No scored matches";
  return `
    <button class="node-card is-${escapeHtml(node.kind)}" type="button" data-node="${escapeHtml(node.id)}">
      <div class="node-meta">
        <span class="type-pill ${escapeHtml(node.kind)}">${isAi ? "AI" : "Human"}</span>
        <span>${escapeHtml(meta)}</span>
      </div>
      <h4 class="node-title">${escapeHtml(node.title)}</h4>
      <p class="node-summary">${escapeHtml(truncate(node.summary || node.subtitle, 210))}</p>
      <div class="tags">${(node.tags || []).slice(0, 6).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div>
      <div class="match-line">${escapeHtml(matchText)}</div>
    </button>
  `;
}

function render() {
  renderSummary();
  renderClusterList();
  renderBoard();
}

function showHover(node, event) {
  const score = node.matches?.reduce((sum, match) => sum + (match.score || 0), 0) || 0;
  els.hoverCard.innerHTML = `
    <h3>${escapeHtml(node.title)}</h3>
    <p>${escapeHtml(truncate(node.summary || node.subtitle, 220))}</p>
    <p><strong>${node.kind === "ai" ? "AI idea" : "Human row"}</strong> / row ${escapeHtml(node.row)}${node.rank ? ` / rank ${escapeHtml(node.rank)}` : ""}</p>
    <p>${escapeHtml(node.matches?.length || 0)} scored links${score ? ` / ${score.toFixed(3)} total score` : ""}</p>
  `;
  const x = Math.min(event.clientX + 16, window.innerWidth - 380);
  const y = Math.min(event.clientY + 16, window.innerHeight - 220);
  els.hoverCard.style.left = `${Math.max(12, x)}px`;
  els.hoverCard.style.top = `${Math.max(12, y)}px`;
  els.hoverCard.hidden = false;
}

function hideHover() {
  els.hoverCard.hidden = true;
}

function stat(label, value) {
  return `
    <div class="detail-stat">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value ?? "not specified")}</strong>
    </div>
  `;
}

function matchesTable(matches, perspective) {
  if (!matches?.length) return `<p>No scorecard links for this node.</p>`;
  const headers =
    perspective === "ai"
      ? ["Human row", "Match", "Exact", "Rows ahead", "Score", "Notes"]
      : ["Prediction", "Match", "Exact", "Rows ahead", "Score", "Notes"];
  const rows = matches
    .map((match) => {
      const first = perspective === "ai" ? `row ${match.humanRow}` : `row ${match.predRow} #${match.rank}`;
      return `
        <tr>
          <td>${escapeHtml(first)}</td>
          <td>${escapeHtml(match.matchClass)}</td>
          <td>${escapeHtml(match.exact)}</td>
          <td>${escapeHtml(match.rowsAhead)}</td>
          <td>${escapeHtml(match.score?.toFixed ? match.score.toFixed(3) : match.score)}</td>
          <td>${escapeHtml(match.notes)}</td>
        </tr>
      `;
    })
    .join("");
  return `
    <table class="match-table">
      <thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function detailForAi(node) {
  return `
    <div class="detail-grid">
      ${stat("Prediction row", `row ${node.row}`)}
      ${stat("Rank", `#${node.rank}`)}
      ${stat("Confidence", node.confidence)}
      ${stat("Expected step gain", node.expectedStepGain)}
      ${stat("Effort", node.effort)}
      ${stat("Matches", node.matches?.length || 0)}
    </div>

    <section class="detail-section">
      <h3>Summary</h3>
      <p>${escapeHtml(node.summary)}</p>
    </section>

    <section class="detail-section">
      <h3>Why It Might Work</h3>
      <p>${escapeHtml(node.whyMightWork)}</p>
    </section>

    <section class="detail-section">
      <h3>Experiment</h3>
      <p>${escapeHtml(node.experiment)}</p>
    </section>

    <section class="detail-section">
      <h3>Risk</h3>
      <p>${escapeHtml(node.risk)}</p>
    </section>

    <section class="detail-section">
      <h3>Scorecard Links</h3>
      ${matchesTable(node.matches, "ai")}
    </section>

    <section class="detail-section">
      <h3>README Detail For This Idea</h3>
      <pre>${escapeHtml(node.readmeDetail || "No matching README section found for this rank.")}</pre>
    </section>

    <section class="detail-section">
      <h3>Raw ideas.json Entry</h3>
      <pre>${escapeHtml(JSON.stringify(node.ideaJson, null, 2))}</pre>
    </section>

    <section class="detail-section">
      <h3>Row Context</h3>
      <pre>${escapeHtml(node.rowContext || "No row context extracted.")}</pre>
    </section>
  `;
}

function detailForHuman(node) {
  const revealed = node.revealed || {};
  return `
    <div class="detail-grid">
      ${stat("Human row", `row ${node.row}`)}
      ${stat("Steps", revealed.steps)}
      ${stat("Evidence", revealed.evidence)}
      ${stat("Date", revealed.date)}
      ${stat("Prior matches", node.matches?.length || 0)}
    </div>

    <section class="detail-section">
      <h3>Description</h3>
      <p>${escapeHtml(revealed.description || node.summary)}</p>
    </section>

    <section class="detail-section">
      <h3>Contributors</h3>
      <p>${escapeHtml(revealed.contributors || "not specified")}</p>
    </section>

    <section class="detail-section">
      <h3>Earlier AI Predictions Matched To This Row</h3>
      ${matchesTable(node.matches, "human")}
    </section>

    <section class="detail-section">
      <h3>README Detail For This Human Row</h3>
      <pre>${escapeHtml(node.readmeDetail || "No README detail extracted.")}</pre>
    </section>
  `;
}

function openModal(node) {
  hideHover();
  els.modalKicker.textContent = node.kind === "ai" ? `AI idea / row ${node.row} / rank ${node.rank}` : `Human row / row ${node.row}`;
  els.modalTitle.textContent = node.kind === "ai" ? node.title : node.summary || node.title;
  els.modalBody.innerHTML = node.kind === "ai" ? detailForAi(node) : detailForHuman(node);
  els.modalBackdrop.hidden = false;
  els.closeModal.focus();
}

function closeModal() {
  els.modalBackdrop.hidden = true;
}

document.querySelectorAll(".mode-button").forEach((button) => {
  button.addEventListener("click", () => {
    state.mode = button.dataset.mode;
    document.querySelectorAll(".mode-button").forEach((item) => item.classList.toggle("is-active", item === button));
    render();
  });
});

els.searchInput.addEventListener("input", () => {
  state.query = els.searchInput.value.trim();
  render();
});

function parsePositiveInt(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

els.rowFilterInput.addEventListener("input", () => {
  state.rowFilter = parsePositiveInt(els.rowFilterInput.value);
  render();
});

els.ideaFilterInput.addEventListener("input", () => {
  state.ideaFilter = parsePositiveInt(els.ideaFilterInput.value);
  render();
});

els.clearRowRank.addEventListener("click", () => {
  state.rowFilter = null;
  state.ideaFilter = null;
  els.rowFilterInput.value = "";
  els.ideaFilterInput.value = "";
  render();
});

els.clearCluster.addEventListener("click", () => {
  state.cluster = null;
  render();
});

els.clusterList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-cluster]");
  if (!button) return;
  state.cluster = button.dataset.cluster === state.cluster ? null : button.dataset.cluster;
  render();
});

els.clusterGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-node]");
  if (!button) return;
  const node = nodeById.get(button.dataset.node);
  if (node) openModal(node);
});

els.clusterGrid.addEventListener("mousemove", (event) => {
  const button = event.target.closest("[data-node]");
  if (!button) return hideHover();
  const node = nodeById.get(button.dataset.node);
  if (node) showHover(node, event);
});

els.clusterGrid.addEventListener("mouseleave", hideHover);
els.closeModal.addEventListener("click", closeModal);
els.modalBackdrop.addEventListener("click", (event) => {
  if (event.target === els.modalBackdrop) closeModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
});

state.rowFilter = parsePositiveInt(els.rowFilterInput.value);
state.ideaFilter = parsePositiveInt(els.ideaFilterInput.value);
render();
