// backend/routes/pairings.js

const express = require('express');
const router = express.Router();
const { suggestPairings, listDishes } = require('../services/pairingsService');
const { getAllWines, filterByQuery } = require('../services/winesService');

// GET /api/pairings/dishes  (for UI autocomplete/menus)
router.get('/dishes', (_req, res) => {
    try {
        const all = listDishes();
        res.json(all);
    } catch (err) {
        console.error('[pairings/dishes] error:', err);
        res.status(500).json({ error: 'Failed to list dishes' });
    }
});

// GET /api/pairings/suggest?dish=salmon&limit=3
router.get('/suggest', async (req, res) => {
    const dish = (req.query.dish || '').trim();
    const limit = Math.min(Math.max(parseInt(req.query.limit || '3', 10), 1), 12);
    if (!dish) return res.status(400).json({ error: 'Missing query param: dish' });

    try {
        const all = await getAllWines(); // cached
        const ideas = suggestPairings(dish); // [{query, reason, level, fromDish}, ...]

        const recommendations = ideas.map(idea => {
            const matches = filterByQuery(all, idea.query).slice(0, limit).map(w => ({
                id: w.id,
                name: w.name || w.wine || null,
                grape: w.grape || null,
                winery: w.winery || null,
                style: w.style,
                year: w.year ?? null,
                location: (w.location || w.region || '').replace(/\n·\n/g, ' · ').replace(/\s+/g, ' ').trim(),
                rating: typeof w.rating === 'object' ? (w.rating.average ?? null) : (w.rating ?? null),
                image: w.image ?? w.imageUrl ?? null
            }));
            return { idea, matches };
        });

        res.json({ dish, count: recommendations.length, recommendations });
    } catch (err) {
        console.error('[pairings/suggest] error:', err);
        res.status(500).json({ error: 'Pairing suggestion failed' });
    }
});

module.exports = router;
