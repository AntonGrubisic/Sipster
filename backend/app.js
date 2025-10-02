// backend/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./connectionMySQL');
const { warmCache } = require('./services/winesService'); // <-- cache warm-up

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Quick DB connectivity check
app.get('/api/db-check', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    res.json(rows[0]); // { ok: 1 }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB connection failed' });
  }
});

// Routes
const wines = require('./routes/wines');
app.use('/api/wines', wines);

const port = process.env.PORT || 8080;

// Warm the wine cache, then start the server.
// If warm-up fails, we still start and will fetch on-demand.
warmCache().finally(() => {
  app.listen(port, () => console.log(`Backend running at http://localhost:${port}`));
});

module.exports = app;
