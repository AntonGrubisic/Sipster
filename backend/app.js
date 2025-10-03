require('dotenv').config();
const express = require('express');
const cors = require('cors');
const {warmCache} = require('./services/winesService');

const app = express();
app.use(cors());
app.use(express.json());

// health checks
app.get('/api/health', (_req, res) => res.json({ok: true}));

// mount wine routes (search + health)
const wines = require('./routes/wines');
app.use('/api/wines', wines);

const port = process.env.PORT || 8080;

// warm cache, then start
warmCache().finally(() => {
    app.listen(port, () => console.log(`Backend running at http://localhost:${port}`));
});

module.exports = app;
