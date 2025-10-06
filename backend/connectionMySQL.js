require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;


// 5. Testfunktion (Valfri, men rekommenderas starkt!)
async function testDbConnection() {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS solution');
    console.log("✅ Databasanslutning lyckades! Svar: ", rows[0].solution);
  } catch (error) {
    console.error("❌ Databasanslutning misslyckades: ", error.message);
    // Stäng servern om anslutningen misslyckas
    process.exit(1);
  }
}

// Kör testet när modulen laddas
testDbConnection();