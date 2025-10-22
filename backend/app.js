// app.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
// Importer för autentisering
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('./middleware/auth'); // Importera JWT-skyddet

// Kontrollera JWT_SECRET vid startup (ny fix)
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set. Please define it in the environment.');
  process.exit(1);
}

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
// Mer restriktiva CORS-inställningar (ny fix)
const rawOrigins = process.env.CORS_ORIGINS?.split(',').map(s => s.trim()).filter(Boolean) || [];
const allowedOrigins = rawOrigins.map(o => o.replace(/\/$/, ''));
const originOpt = (allowedOrigins.length === 0 || allowedOrigins.includes('*')) ? true : allowedOrigins;
app.use(cors({
  origin: originOpt,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: false
}));
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
// ** USER PROFILE & FAVORITES ROUTES **
// **********************************************

// GET /api/users/profile - Hämta inloggad användares data (US3)
app.get('/api/users/profile', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  try {
    // Hämta endast icke-känslig data (inte lösenordshash)
    const [users] = await pool.query('SELECT id, email, username FROM users WHERE id = ?', [userId]);
    if (!users.length) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json(users[0]);
  } catch (error) {
    console.error('Profile fetch error:', error.message);
    res.status(500).json({ error: 'Could not fetch user profile.' });
  }
});

// GET /api/users/favorites - Hämta alla favoriter för inloggad användare (US8)
app.get('/api/users/favorites', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  try {
    // Denna fråga hämtar ENDAST de externa ID:n från vår lokala 'products' tabell.
    const sql = `
      SELECT p.external_product_id AS wineId
      FROM favorites f
             JOIN products p ON f.product_id = p.id
      WHERE f.user_id = ?
    `;
    const [favorites] = await pool.query(sql, [userId]);
    // Returnera bara en array av ID-strängar (t.ex. ['VIN1001', 'VIN1003'])
    res.json(favorites.map(f => f.wineId));
  } catch (error) {
    console.error('Favorite fetch error:', error.message);
    res.status(500).json({ error: 'Could not fetch favorites.' });
  }
});


// POST /api/users/favorites/:externalWineId - Spara favorit (US7)
app.post('/api/users/favorites/:externalWineId', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const externalWineId = req.params.externalWineId; // T.ex. 'VIN1001'

  try {
    // 1. Upsert product and capture its id in one roundtrip (NY RACE-FIX)
    const [prodResult] = await pool.query(
        `INSERT INTO products (external_product_id)
             VALUES (?)
             ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)`,
        [externalWineId]
    );
    // Hämta det korrekta ID:t från antingen INSERT eller ON DUPLICATE
    const productId = prodResult.insertId;

    // 2. Insert favorite, låt UNIQUE constraint (i databasen) förhindra duplicering
    const sql = 'INSERT INTO favorites (user_id, product_id) VALUES (?, ?)';
    await pool.query(sql, [userId, productId]);
    res.status(201).json({ message: 'Favorite saved successfully.' });

  } catch (error) {
    // Fånga ER_DUP_ENTRY från favorites (Löser Race Condition)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Wine is already a favorite.' });
    }
    console.error('Save favorite error:', error.message);
    res.status(500).json({ error: 'Could not save favorite.' });
  }
});

// DELETE /api/users/favorites/:externalWineId - Ta bort favorit
app.delete('/api/users/favorites/:externalWineId', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const externalWineId = req.params.externalWineId; // T.ex. 'VIN1001'

  try {
    // NY FIX: Förenkla DELETE med ett enda JOINED statement
    const [result] = await pool.query(
        `DELETE f FROM favorites f
             JOIN products p ON p.id = f.product_id
             WHERE f.user_id = ? AND p.external_product_id = ?`,
        [userId, externalWineId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Favorite not found or already deleted.' });
    }
    res.status(200).json({ message: 'Favorite deleted successfully.' });

  } catch (error) {
    console.error('Delete favorite error:', error.message);
    res.status(500).json({ error: 'Could not delete favorite.' });
  }
});


// **********************************************
// ** PUBLIKA OCH HÄLSA ROUTES **
// **********************************************

// GET /api/wines - Publik vinlista (US4)
app.get('/api/wines', async (_req, res) => {
  // Denna route ska anropa det externa Vin-API:et i framtiden.
  res.status(501).json({ message: 'Wine API integration is not implemented yet. External API call needed.' });
});

// Exempel på en skyddad route (Test C)
app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ message: `Welcome, ${req.user.username}! You are successfully authenticated.` });
});


// --- SERVER START ---
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Backend is running on http://localhost:${port}`));