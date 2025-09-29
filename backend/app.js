require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./connectionMySQL');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// snabb DB-koll
app.get('/api/db-check', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    res.json(rows[0]); // { ok: 1 }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB connection failed' });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Backend kör på http://localhost:${port}`));

