// backend/routes/pairings.js
const express = require('express');
const router = express.Router();
const {getSets, suggestPairings} = require('../services/pairingsService');

// GET /api/pairings/health
router.get('/health', (_req, res) => {
    const sets = getSets();
    res.json({
        ok: true,
        sets: {
            basic: Array.isArray(sets.basic) ? sets.basic.length : 0,
            gourmet: Array.isArray(sets.gourmet) ? sets.gourmet.length : 0,
        },
    });
});

// GET /api/pairings/suggest?dish=...
router.get('/suggest', (req, res) => {
    const dish = (req.query.dish || '').trim();
    if (!dish) return res.status(400).json({error: 'Missing query param: dish'});
    const matches = suggestPairings(dish);
    res.json({query: dish, count: matches.length, matches});
});

module.exports = router;
