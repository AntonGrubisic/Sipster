// backend/services/pairingsService.js
// Loads both pairing datasets (basic + gourmet) and suggests wine ideas for a dish.
// English-only code/comments, deduped results, and "level" tagging for UI styling.

const fs = require('fs');
const path = require('path');

// Cache in memory
let DATA = {
  basic: [],
  gourmet: [],
  merged: [] // [{ dish, level, recommends: [{query, reason}, ...] }]
};
let loaded = false;

function loadJSON(relPath) {
  const p = path.resolve(__dirname, '..', 'data', relPath);
  const raw = fs.readFileSync(p, 'utf8');
  return JSON.parse(raw);
}

function loadAll() {
  const basic = loadJSON('pairings-basic.json').map(row => ({
    dish: row.dish,
    level: 'basic',
    recommends: row.recommends
  }));
  const gourmet = loadJSON('pairings-gourmet.json').map(row => ({
    dish: row.dish,
    level: 'gourmet',
    recommends: row.recommends
  }));

  DATA.basic = basic;
  DATA.gourmet = gourmet;
  DATA.merged = [...basic, ...gourmet];
  loaded = true;
  console.log(`[pairingsService] loaded: basic=${basic.length}, gourmet=${gourmet.length}`);
}

// Public: call once on server start (optional)
function warmPairings() {
  if (!loaded) loadAll();
}

// Utility: simple normalize
function norm(s) {
  return (s || '').toString().trim().toLowerCase();
}

/**
 * Suggest pairings for a dish text.
 * Matches:
 *  - exact/substring against gourmet dish names
 *  - exact/substring against basic keywords
 * Returns a flat list of ideas:
 *   [{ query, reason, level, fromDish }]
 */
function suggestPairings(dishText) {
  if (!loaded) loadAll();

  const q = norm(dishText);
  if (!q) return [];

  // Find all rows that match either by dish including query or query including dish
  const hits = DATA.merged.filter(row => {
    const dish = norm(row.dish);
    return dish.includes(q) || q.includes(dish);
  });

  // If nothing matched, fall back to sensible defaults
  const rows = hits.length > 0 ? hits : [
    {
      dish: 'general',
      level: 'basic',
      recommends: [
        { query: 'Pinot Noir',       reason: 'Versatile light red for many dishes.' },
        { query: 'Chardonnay',       reason: 'Textural white for creamy/buttery flavors.' },
        { query: 'Sauvignon Blanc',  reason: 'Crisp white for herbs, salads, seafood.' }
      ]
    }
  ];

  // Flatten, tag with level and source dish, and dedupe by query
  const seen = new Set();
  const ideas = [];
  for (const row of rows) {
    for (const rec of row.recommends) {
      const key = norm(rec.query);
      if (key && !seen.has(key)) {
        seen.add(key);
        ideas.push({
          query: rec.query,
          reason: rec.reason,
          level: row.level,
          fromDish: row.dish
        });
      }
    }
  }
  return ideas;
}

/**
 * Expose all dishes for UI (e.g., autocomplete sections).
 * Returns: { basic: [dish], gourmet: [dish] }
 */
function listDishes() {
  if (!loaded) loadAll();
  return {
    basic: DATA.basic.map(r => r.dish),
    gourmet: DATA.gourmet.map(r => r.dish)
  };
}

module.exports = { warmPairings, suggestPairings, listDishes };
