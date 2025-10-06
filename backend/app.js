// backend/app.js
require('dotenv').config();

console.log('[app] booting…');

const express = require('express');
const cors = require('cors');

// Services (optional)
let warmCache, warmPairings;
try {
    ({warmCache} = require('./services/winesService'));
} catch (e) {
    console.warn('[app] winesService not loaded:', e.message);
}
try {
    ({warmPairings} = require('./services/pairingsService')); // NOTE: pairingsService.js
} catch (e) {
    console.warn('[app] pairingsService not loaded:', e.message);
}

// Routers
const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ok: true, ts: Date.now()}));

try {
    app.use('/api/wines', require('./routes/wines'));
    console.log('[app] /api/wines mounted');
} catch (e) {
    console.warn('[app] wines routes not mounted:', e.message);
}

try {
    app.use('/api/pairings', require('./routes/pairings'));
    console.log('[app] /api/pairings mounted');
} catch (e) {
    console.warn('[app] pairings routes not mounted:', e.message);
}

const port = process.env.PORT || 8080;

// ✅ Start server immediately; warm caches in background
app.listen(port, () => {
    console.log(`[app] listening on http://localhost:${port}`);

    const tasks = [];
    if (typeof warmPairings === 'function') {
        tasks.push(
            Promise.resolve()
                .then(() => warmPairings())
                .then(() => console.log('[app] pairings warmed'))
                .catch(err => console.warn('[app] pairings warm failed:', err?.message || err))
        );
    }
    if (typeof warmCache === 'function') {
        tasks.push(
            Promise.resolve()
                .then(() => warmCache())
                .then(() => console.log('[app] wines cache warmed'))
                .catch(err => console.warn('[app] wines warm failed:', err?.message || err))
        );
    }

    if (tasks.length) {
        Promise.allSettled(tasks).then(() => console.log('[app] warm-up tasks settled'));
    } else {
        console.log('[app] no warm-up tasks registered');
    }
});

module.exports = app;
