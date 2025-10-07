// src/services/authService.js


const API_URL = import.meta.env.VITE_API_URL;
const PROTECTED_URL = import.meta.env.VITE_PROTECTED_URL;

/**
 * Hjälpfunktion för att hantera fetch-svar och fel.
 * @param {Response} response
 * @returns {Promise<any>}
 */
async function handleResponse(response) {
    const data = await response.json();
    if (!response.ok) {
        // Kasta ett felobjekt med status och felmeddelande från backend
        throw { status: response.status, message: data.error || 'Unknown error' };
    }
    return data;
}

/**
 * Registrerar en ny användare.
 * @param {string} email
 * @param {string} username
 * @param {string} password
 */
export async function registerUser({ email, username, password }) {
    const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, password }),
    });
    return handleResponse(response);
}

/**
 * Loggar in användaren och sparar JWT-token i localStorage.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<any>}
 */
export async function loginUser({ email, password }) {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    const data = await handleResponse(response);

    // Spara JWT-token vid lyckad inloggning
    if (data.token) {
        localStorage.setItem('userToken', data.token);
    }
    return data;
}

/**
 * Loggar ut användaren genom att ta bort token.
 */
export function logoutUser() {
    localStorage.removeItem('userToken');
}

/**
 * Hämtar skyddad data från backend med hjälp av JWT-token.
 * @returns {Promise<any>}
 */
export async function getProtectedData() {
    const token = localStorage.getItem('userToken');
    if (!token) {
        throw { status: 401, message: 'Not authenticated.' };
    }

    // Använd rutt som vi definierade i app.js
    const response = await fetch(PROTECTED_URL, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`, // Skickar token i headern
            'Content-Type': 'application/json',
        },
    });

    return handleResponse(response);
}