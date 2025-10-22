const express = require('express');
const router = express.Router();
const {getAllWines, filterByQuery} = require('../services/winesService');

// ✅ GET /api/wines/health
router.get('/health', async (_req, res) => {
    try {
        const all = await getAllWines();
        const count = Array.isArray(all) ? all.length : 0;
        res.json({
            ok: true,
            items: count,
            note: 'Data served from in-memory cache with stale-while-revalidate.'
        });
    } catch (err) {
        console.error('[wines/health] error:', err);
        res.status(502).json({ok: false, error: 'Upstream source unavailable'});
    }
});

// ✅ GET /api/wines/search?q=...&limit=20&offset=0
router.get('/search', async (req, res) => {
    const q = (req.query.q || '').trim();
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
    const offset = Math.max(parseInt(req.query.offset || '0', 10), 0);
    if (!q) return res.status(400).json({ error: 'Missing query param: q' });

    try {
        const all = await getAllWines(); // cached
        const filtered = filterByQuery(all, q); // strict: name OR grape

        if (filtered.length === 0) {
            return res.json({
                query: q, count: 0, total: 0, limit, offset, results: [],
                message: `No wines matched "${q}".`
            });
        }

        const cleanLocation = s => (s ?? '').replace(/\n·\n/g, ' · ').replace(/\s+/g, ' ').trim();

        const page = filtered.slice(offset, offset + limit).map(w => ({
            id: w.id,
            name: w.name || w.wine || null,
            grape: w.grape || null,
            winery: w.winery || null,
            location: cleanLocation(w.location || w.region || ''),
            year: w.year ?? null,
            rating: typeof w.rating === 'object' ? (w.rating.average ?? null) : (w.rating ?? null),
            reviews: typeof w.rating === 'object' ? (w.rating.reviews ?? null) : null,
            price: w.price ?? null,
            style: w.style
        }));

        res.json({query: q, count: page.length, total: filtered.length, limit, offset, results: page});
    } catch (err) {
        console.error('[wines/search] error:', err);
        res.status(502).json({error: 'Upstream source unavailable'});
    }
});

// ✅ NEW: GET /api/wines/by-style?style=reds|whites|sparkling|rose|dessert&limit=50&offset=0
router.get('/by-style', async (req, res) => {
    const VALID = ['reds', 'whites', 'sparkling', 'rose', 'dessert'];
    const style = (req.query.style || '').toLowerCase();
    const limit = Math.min(Math.max(parseInt(req.query.limit || '50', 10), 1), 100);
    const offset = Math.max(parseInt(req.query.offset || '0', 10), 0);

    if (!VALID.includes(style)) {
        return res.status(400).json({error: `Invalid style. Use one of: ${VALID.join(', ')}`});
    }

    try {
        const all = await getAllWines(); // cached
        const filtered = all.filter(w => (w.style || '').toLowerCase() === style);

        const cleanLocation = s => (s ?? '').replace(/\n·\n/g, ' · ').replace(/\s+/g, ' ').trim();
        const page = filtered.slice(offset, offset + limit).map(w => ({
            id: w.id,
            name: w.name || w.wine || null,
            grape: w.grape || null,
            winery: w.winery || null,
            location: cleanLocation(w.location || w.region || ''),
            year: w.year ?? null,
            rating: typeof w.rating === 'object' ? (w.rating.average ?? null) : (w.rating ?? null),
            reviews: typeof w.rating === 'object' ? (w.rating.reviews ?? null) : null,
            price: w.price ?? null,
            style: w.style,
            image: w.image ?? w.imageUrl ?? null
        }));

        res.json({style, count: page.length, total: filtered.length, limit, offset, results: page});
    } catch (err) {
        console.error('[wines/by-style] error:', err);
        res.status(502).json({error: 'Upstream source unavailable'});
    }
});

module.exports = router;
