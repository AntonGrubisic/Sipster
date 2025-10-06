require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { warmCache } = require('./services/winesService');
const { warmPairings } = require('./services/pairingsService'); // ✅ correct file name (pairingsService.js)

const app = express();
app.use(cors());
app.use(express.json());

// health checks
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// mount wine routes (search + health)
const wines = require('./routes/wines');
app.use('/api/wines', wines);

// mount pairing routes
const pairings = require('./routes/pairings');
app.use('/api/pairings', pairings);

const port = process.env.PORT || 8080;

// ✅ Warm both caches before starting
warmPairings(); // preloads basic + gourmet data immediately

warmCache().finally(() => {
    app.listen(port, () => console.log(`Backend running at http://localhost:${port}`));
});

module.exports = app;
