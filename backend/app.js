// app.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
// Importer för autentisering
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('./middleware/auth'); // Importera JWT-skyddet

// Importera databasanslutning
const pool = require('./connectionMySQL');

const app = express();

// Kontrollfunktion för lösenordsstyrka
const validatePassword = (password) => {
  // Måste vara minst 8 tecken, innehålla minst 1 versal, 1 gemen och 1 siffra
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
};



// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json()); // KRITISK: Gör att Express kan läsa JSON från Insomnia/Frontend

// **********************************************
// ** AUTHENTICATION ROUTES (US1 & US2) **
// **********************************************

// US1: Skapa konto (User CREATE)
app.post('/api/users/register', async (req, res) => {
  const { email, username, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  // KÖR VALIDERINGEN HÄR!
  if (!validatePassword(password)) {
    return res.status(400).json({ error: 'Password is too weak. It must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, and one number.' });
  }


  try {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Använder standardkolumnnamn: 'username' och 'password_hash'
    const sql = `
      INSERT INTO users (email, username, password_hash)
      VALUES (?, ?, ?)
    `;
    const [result] = await pool.query(sql, [email, username || null, password_hash]);

    res.status(201).json({
      message: 'User created successfully!',
      userId: result.insertId
    });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email address is already in use.' });
    }
    console.error('Registration error:', error.message);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
});


// US2: Logga in (User READ)
app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password must be provided.' });
  }

  try {
    // Använder standardkolumnnamn: 'username' och 'password_hash'
    const sql = 'SELECT id, email, username, password_hash FROM users WHERE email = ?';
    const [users] = await pool.query(sql, [email]);

    const user = users[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // NY KONTROLL: Förhindrar 500-fel om hashen är NULL/tom i databasen
    if (!user.password_hash) {
      console.error(`User ${email} has no stored hash in database.`);
      return res.status(500).json({ error: 'Account is missing password information.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Skapa JWT
    const payload = { userId: user.id, username: user.username };
    const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful!',
      token: token,
      username: user.username
    });

  } catch (error) {
    console.error('DETAILED LOGIN ERROR:', error.message);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});


// **********************************************
// ** GENERELLA & SKYDDADE ROUTES **
// **********************************************

// Enkelt hälsotest (ej skyddad)
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Snabbt databastest (ej skyddad)
app.get('/api/db-check', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    res.json(rows[0]); // { ok: 1 }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB connection failed' });
  }
});

// Exempel på en skyddad route (Test C)
app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ message: `Welcome, ${req.user.username}! ` });
});


// --- SERVER START ---
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Backend is running on http://localhost:${port}`));
