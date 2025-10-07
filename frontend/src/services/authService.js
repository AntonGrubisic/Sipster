// src/services/authService.js

// URL:en till din Node.js backend
const API_URL = 'http://localhost:8080/api/users';
const PROTECTED_URL = 'http://localhost:8080/api/protected'; // Ny URL för skyddad data

/**
 * Registrerar en ny användare genom att skicka data till backend.
 * @param {string} email
 * @param {string} username
 * @param {string} password
 * @returns {Promise<object>} JSON response från backend
 */
export async function registerUser(email, username, password) {
    const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, password }),
    });

    // Kastar ett fel om status inte är 2xx (t.ex. 400 Bad Request)
    if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.error || 'Registration failed.');
    }

    return response.json();
}

/**
 * Loggar in en användare och tar emot en JWT-token.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} { token: string, username: string, message: string }
 */
export async function loginUser(email, password) {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    // Kastar ett fel om status inte är 2xx (t.ex. 401 Unauthorized)
    if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.error || 'Login failed.');
    }

    const data = await response.json();

    // VIKTIGT: Spara token i Local Storage
    localStorage.setItem('userToken', data.token);

    return data;
}

// -------------------------------------------------------------
// NY FUNKTIONALITET FÖR LANDINGVIEW
// -------------------------------------------------------------

/**
 * Loggar ut användaren genom att ta bort token från localStorage.
 */
export function logoutUser() {
    localStorage.removeItem('userToken');
}


/**
 * Hämtar skyddad data från backend med hjälp av JWT-token.
 * @returns {Promise<object>} Det skyddade välkomstmeddelandet från /api/protected
 */
export async function getProtectedData() {
    const token = localStorage.getItem('userToken');

    if (!token) {
        throw new Error('Not authenticated. Token missing.');
    }

    const response = await fetch(PROTECTED_URL, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`, // Bifoga token i headern
            'Content-Type': 'application/json',
        },
    });

    // Hantera fel från skyddad rutt (t.ex. 401 Unauthorized om token gått ut)
    if (!response.ok) {
        const errorBody = await response.json();
        // Kastar felet med statuskod för att LandinView kan hantera utloggning (401)
        throw { status: response.status, message: errorBody.error || 'Access denied.' };
    }

    return response.json();
}