// backend/services/pairingsService.js
const fs = require('fs');
const path = require('path');

let sets = { basic: [], gourmet: [] };

function loadJsonSafe(relPath) {
    try {
        const file = path.join(__dirname, '..', relPath);
        if (fs.existsSync(file)) {
            const raw = fs.readFileSync(file, 'utf8');
            return JSON.parse(raw);
        }
    } catch (e) {
        console.warn(`[pairingsService] failed to load ${relPath}:`, e.message);
    }
    return [];
}

async function warmPairings() {
    const basic = loadJsonSafe('data/pairings-basic.json');     // optional file
    const gourmet = loadJsonSafe('data/pairings-gourmet.json'); // optional file
    sets.basic = Array.isArray(basic) ? basic : [];
    sets.gourmet = Array.isArray(gourmet) ? gourmet : [];
    console.log(`[pairingsService] loaded: basic=${sets.basic.length}, gourmet=${sets.gourmet.length}`);
    return sets;
}

function getSets() {
    return sets;
}

function suggestPairings(dish) {
    const q = (dish || '').toLowerCase().trim();
    if (!q) return [];
    const all = [...sets.basic, ...sets.gourmet];

    const matches = all.filter(item => {
        const hayDish = (item.dish || '').toLowerCase();
        const hayKeys = (item.keywords || []).join(' ').toLowerCase();
        return hayDish.includes(q) || hayKeys.includes(q);
    });

    // light relevance: shorter dish name first, then alpha
    matches.sort((a, b) => {
        const al = (a.dish || '').length;
        const bl = (b.dish || '').length;
        if (al !== bl) return al - bl;
        return (a.dish || '').localeCompare(b.dish || '');
    });

    return matches;
}

module.exports = {
    warmPairings,
    getSets,
    suggestPairings,
};
