// backend/routes/pairings.js
const express = require('express');
const router = express.Router();

const { getSets, suggestPairings } = require('../services/pairingsService');

// 🩺 Health check
router.get('/health', (_req, res) => {
    try {
        const sets = getSets?.() || {};
        const basic   = sets.basic   ? Object.keys(sets.basic).length   : 0;
        const gourmet = sets.gourmet ? Object.keys(sets.gourmet).length : 0;
        res.json({ ok: true, basic, gourmet, total: basic + gourmet });
    } catch (e) {
        console.error('[pairings/health] error:', e);
        res.status(500).json({ ok: false, error: 'health check failed' });
    }
});

// 🍽️ Return all pairings (basic + gourmet)
router.get('/all', (_req, res) => {
    try {
        const sets = getSets?.();
        if (!sets) {
            return res.status(500).json({ ok: false, error: 'Pairings not available' });
        }

        const { basic, gourmet } = sets;

        res.json({
            ok: true,
            results: [
                {
                    title: 'Everyday Classics',
                    subtitle: 'Approachable pairings for common dishes',
                    items: Object.keys(basic || {})
                },
                {
                    title: 'Gourmet Selections',
                    subtitle: 'Refined matches for elevated dining',
                    items: Object.keys(gourmet || {})
                }
            ]
        });
    } catch (err) {
        console.error('[pairings/all] error:', err);
        res.status(500).json({ ok: false, error: 'Failed to load all pairings' });
    }
});

// 🔍 Common suggestion handler
function handleSuggest(req, res) {
    try {
        const raw =
            req.query?.dish ||
            req.query?.q ||
            req.params?.dish ||
            (req.body && (req.body.dish || req.body.q)) ||
            '';

        const term = String(raw).trim();
        if (!term) return res.status(400).json({ ok: false, error: 'Missing query param: dish' });

        const out = suggestPairings(term);
        if (Array.isArray(out)) return res.json({ ok: true, results: out });
        return res.json(out || { ok: true, results: [] });
    } catch (e) {
        console.error('[pairings/suggest] failed:', e);
        res.status(500).json({ ok: false, error: 'Failed to suggest pairings' });
    }
}

// 🧠 Register suggest routes
router.get('/suggest', handleSuggest);        // /api/pairings/suggest?dish=beef
router.get('/suggest/:dish', handleSuggest);  // /api/pairings/suggest/beef
router.post('/suggest', handleSuggest);       // POST { dish:"beef" }

module.exports = router;
