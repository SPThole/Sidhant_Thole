# Idea Explorer

This folder contains a static interactive explorer for the Test of Taste artifacts.

Open [`index.html`](index.html) in a browser to browse:

- human leaderboard rows;
- frozen AI ideas from each row;
- tag-family clusters;
- scorecard links between prior AI predictions and later human rows;
- full `ideas.json` details and matching row README excerpts.

The explorer has three modes:

- Human plus AI
- AI only
- Human only

It also has a row/idea jump filter:

- Row only: shows that human row and all AI ideas made at that row boundary.
- Idea only: shows that idea rank across all rows.
- Row plus idea: shows the specific AI idea for that row and rank.

Data is generated into [`data.js`](data.js) so the page can be opened directly from disk without a local server.

To rebuild after changing row outputs or the scorecard:

```bash
python3 records/track_3_optimization/research_taste/taste/idea_explorer/build_explorer.py
```
