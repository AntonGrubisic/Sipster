require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./connectionMySQL'); // keep if you need /api/db-check
const {warmCache} = require('./services/winesService');

const app = express();
app.use(cors());
app.use(express.json());

// health checks
app.get('/api/health', (_req, res) => res.json({ok: true}));

app.get('/api/db-check', async (_req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 AS ok');
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'DB connection failed'});
    }
});

// mount wine routes (search + health)
const wines = require('./routes/wines');
app.use('/api/wines', wines);

const port = process.env.PORT || 8080;

// warm cache, then start
warmCache().finally(() => {
    app.listen(port, () => console.log(`Backend running at http://localhost:${port}`));
});

module.exports = app;
