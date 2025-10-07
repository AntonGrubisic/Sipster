// backend/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authMiddleware = require('./middleware/auth');
const pool = require('./connectionMySQL');

const { warmCache } = require('./services/winesService');
const { warmPairings, suggestPairings, getSets } = require('./services/pairingsService');

const app = express();
app.use(cors());
app.use(express.json());

// --------------------------------------------------
// 🧠 Password validation helper
// --------------------------------------------------
const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
};

// --------------------------------------------------
// 🍷 Pairings Endpoints (built-in fallback)
// --------------------------------------------------

// Health check for pairings
app.get('/api/pairings/health', (_req, res) => {
    try {
        const sets = getSets?.() || {};
        const basic   = sets.basic   ? Object.keys(sets.basic).length   : 0;
        const gourmet = sets.gourmet ? Object.keys(sets.gourmet).length : 0;
        res.json({ ok: true, basic, gourmet, total: basic + gourmet });
    } catch (e) {
        console.error('[pairings/health] error:', e);
        res.status(500).json({ ok: false, error: 'Health check failed' });
    }
});

// Suggest pairings — GET and POST
function handleSuggest(req, res) {
    try {
        const raw =
            req.query?.dish ||
            req.query?.q ||
            req.params?.dish ||
            (req.body && (req.body.dish || req.body.q)) ||
            '';

        const term = String(raw).trim();
        if (!term) {
            return res.status(400).json({ ok: false, error: 'Missing query param: dish' });
        }

        const out = suggestPairings(term);
        if (Array.isArray(out)) return res.json({ ok: true, results: out });
        return res.json(out || { ok: true, results: [] });
    } catch (e) {
        console.error('[pairings/suggest] failed:', e);
        res.status(500).json({ ok: false, error: 'Failed to suggest pairings' });
    }
}

app.get('/api/pairings/suggest', handleSuggest);       // /api/pairings/suggest?dish=beef
app.get('/api/pairings/suggest/:dish', handleSuggest); // /api/pairings/suggest/beef
app.post('/api/pairings/suggest', handleSuggest);      // POST { dish: "beef" }

// --------------------------------------------------
// 🧩 Mount Routers
// --------------------------------------------------
const wines = require('./routes/wines');
const pairings = require('./routes/pairings');

app.use('/api/wines', wines);
app.use('/api/pairings', pairings);

// --------------------------------------------------
// 👤 Authentication Routes
// --------------------------------------------------

// Register user
app.post('/api/users/register', async (req, res) => {
    const { email, username, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ error: 'Email and password are required.' });
    if (!validatePassword(password)) {
        return res.status(400).json({
            error:
                'Password must be at least 8 characters long and include an uppercase letter, lowercase letter, and a number.',
        });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        const sql = `
      INSERT INTO users (email, username, password_hash)
      VALUES (?, ?, ?)
    `;
        const [result] = await pool.query(sql, [email, username || null, password_hash]);

        res.status(201).json({
            message: 'User created successfully!',
            userId: result.insertId,
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Email address is already in use.' });
        }
        console.error('Registration error:', error.message);
        res.status(500).json({ error: 'Internal server error during registration.' });
    }
});

// Login user
app.post('/api/users/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ error: 'Email and password must be provided.' });

    try {
        const sql = 'SELECT id, email, username, password_hash FROM users WHERE email = ?';
        const [users] = await pool.query(sql, [email]);
        const user = users[0];
        if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ error: 'Invalid email or password.' });

        const payload = { userId: user.id, username: user.username };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({
            message: 'Login successful!',
            token: token,
            username: user.username,
        });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ error: 'Internal server error during login.' });
    }
});

// --------------------------------------------------
// 🩺 Health & Protected routes
// --------------------------------------------------
app.get('/api/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

app.get('/api/db-check', async (_req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 AS ok');
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'DB connection failed' });
    }
});

app.get('/api/protected', authMiddleware, (req, res) => {
    res.json({ message: `Welcome, ${req.user.username}!` });
});

// --------------------------------------------------
// 🚀 Start Server + Warm Caches
// --------------------------------------------------
const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`✅ Backend running at http://localhost:${port}`);

    const tasks = [];
    if (typeof warmPairings === 'function') {
        tasks.push(
            warmPairings()
                .then(() => console.log('[app] pairings warmed'))
                .catch((err) => console.warn('[app] pairings warm failed:', err.message))
        );
    }
    if (typeof warmCache === 'function') {
        tasks.push(
            warmCache()
                .then(() => console.log('[app] wines cache warmed'))
                .catch((err) => console.warn('[app] wines warm failed:', err.message))
        );
    }

    Promise.allSettled(tasks).then(() => console.log('[app] warm-up tasks settled'));
});

module.exports = app;
