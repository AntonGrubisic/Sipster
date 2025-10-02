// backend/services/winesService.js

const BASE = 'https://api.sampleapis.com/wines';
const CATEGORIES = ['reds', 'whites', 'sparkling', 'rose', 'dessert'];

// In-memory cache
let cache = { data: null, fetchedAt: 0 };
const TTL_MS = 5 * 60 * 1000; // 5 minutes

function isFresh() {
    return cache.data && (Date.now() - cache.fetchedAt) < TTL_MS;
}

async function fetchRemote() {
    const urls = CATEGORIES.map(c => `${BASE}/${c}`);
    const resps = await Promise.all(urls.map(u => fetch(u)));
    for (const r of resps) {
        if (!r.ok) throw new Error(`Upstream fetch failed: ${r.status} ${r.statusText}`);
    }
    const jsons = await Promise.all(resps.map(r => r.json()));
    const merged = jsons.flatMap((arr, i) => (arr || []).map(w => ({ ...w, style: CATEGORIES[i] })));
    return merged;
}

/**
 * Get all wines with stale-while-revalidate behavior:
 * - If fresh: return cache
 * - If stale + have data: return stale data and refresh in background
 * - If empty: fetch now (throws if fails)
 */
async function getAllWines() {
    if (isFresh()) return cache.data;

    if (cache.data) {
        // stale-while-revalidate: kick off background refresh
        refreshInBackground();
        return cache.data;
    }

    // cold start: must fetch now
    const data = await fetchRemote();
    cache = { data, fetchedAt: Date.now() };
    return data;
}

async function refreshInBackground() {
    try {
        const data = await fetchRemote();
        cache = { data, fetchedAt: Date.now() };
    } catch (err) {
        // swallow errors on background refresh; keep stale cache
        console.error('[winesService] background refresh failed:', err.message);
    }
}

/** Warm the cache during server start (optional but recommended). */
async function warmCache() {
    try {
        await getAllWines();
        console.log('[winesService] cache warmed');
    } catch (err) {
        console.warn('[winesService] warm cache failed (will retry on demand):', err.message);
    }
}

/** Strictly match by wine name OR grape per acceptance criteria. */
function filterByQuery(wines, q) {
    const needle = (q ?? '').toString().toLowerCase();
    return wines.filter(w => {
        const wineName = (w.name || w.wine || '').toLowerCase(); // SampleAPIs often uses "wine"
        const grape = (w.grape || '').toLowerCase();
        return wineName.includes(needle) || grape.includes(needle);
    });
}

module.exports = {
    getAllWines,
    warmCache,
    filterByQuery,
};
