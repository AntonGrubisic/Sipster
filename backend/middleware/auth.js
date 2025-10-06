// backend/middleware/auth.js

const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    // Försök hämta token från HTTP-headern 'Authorization' (ska vara i formatet: Bearer [token])
    const authHeader = req.header('Authorization');

    // 1. Kontrollera att headern finns och är korrekt formaterad
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // 401 Unauthorized
        return res.status(401).json({ error: 'Access denied. No valid token provided.' });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
        // 2. Verifiera token med er hemliga nyckel
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Bifoga användarinfo till request-objektet (req.user)
        req.user = decoded;

        // Gå vidare till nästa funktion (route-hanteraren)
        next();

    } catch (e) {
        // 401 Unauthorized om token är ogiltig eller utgången
        res.status(401).json({ error: 'Invalid token.' });
    }
};

module.exports = auth;