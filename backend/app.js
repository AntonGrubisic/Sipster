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
    // 1. Find or create product using INSERT IGNORE (Löser Race Condition)
    const [insertResult] = await pool.query(
        'INSERT IGNORE INTO products (external_product_id) VALUES (?)',
        [externalWineId]
    );
    let productId;
    if (insertResult.insertId > 0) {
      // Produkten skapades nu
      productId = insertResult.insertId;
    } else {
      // Produkten existerade redan, hämta dess ID
      const [productRows] = await pool.query(
          'SELECT id FROM products WHERE external_product_id = ?',
          [externalWineId]
      );
      productId = productRows[0].id;
    }

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
    // 1. Hitta det lokala product_id baserat på externa ID:t
    const [product] = await pool.query('SELECT id FROM products WHERE external_product_id = ?', [externalWineId]);

    if (product.length === 0) {
      // Produkten finns inte i vår referens-tabell (det är okej)
      return res.status(404).json({ error: 'Favorite not found.' });
    }
    const productId = product[0].id;

    // 2. Utför raderingen
    const [result] = await pool.query('DELETE FROM favorites WHERE user_id = ? AND product_id = ?', [userId, productId]);

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