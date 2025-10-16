// src/services/authService.js


const API_URL = import.meta.env.VITE_API_URL;
const PROTECTED_URL = import.meta.env.VITE_PROTECTED_URL;
const BASE_URL = 'http://localhost:8080/api'; // Ny bas-URL för generiska anrop

/**
 * Hjälpfunktion för att hantera fetch-svar och fel.
 * @param {Response} response
 * @returns {Promise<any>}
 */
async function handleResponse(response) {
    // Försök läsa JSON. Vissa DELETE-svar kanske är tomma.
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
        // Kasta ett felobjekt med status och felmeddelande från backend
        throw { status: response.status, message: data.error || data.message || 'Unknown error' };
    }
    return data;
}

// --- AUTENTISERING & PROFIL ---

/**
 * Registrerar en ny användare.
 * @param {object} credentials { email, username, password }
 */
export async function registerUser(credentials) {
    const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });
    return handleResponse(response);
}

/**
 * Loggar in användaren och sparar JWT-token i localStorage.
 * @param {object} credentials { email, password }
 * @returns {Promise<any>}
 */
export async function loginUser(credentials) {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });

    const data = await handleResponse(response);

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
 * Hämtar den inloggade användarens profilinformation (US3).
 * @returns {Promise<object>}
 */
export async function getUserProfile() {
    const token = localStorage.getItem('userToken');
    if (!token) throw { status: 401, message: 'Not authenticated.' };

    const response = await fetch(`${API_URL}/profile`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    return handleResponse(response);
}


// --- FAVORITER & VINLISTA ---

/**
 * Hämtar skyddad data (används för att testa token)
 * @returns {Promise<any>}
 */
export async function getProtectedData() {
    const token = localStorage.getItem('userToken');
    if (!token) throw { status: 401, message: 'Not authenticated.' };

    const response = await fetch(PROTECTED_URL, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    return handleResponse(response);
}

/**
 * Hämtar den fullständiga vinlistan (US4)
 * Denna är publik (ska anropa externt API i framtiden)
 * @returns {Promise<Array>}
 */
export async function getWineList() {
    // Denna route ska bytas ut mot det externa Vin-API:et när ni implementerar det!
    const response = await fetch(`${BASE_URL}/wines`);
    return handleResponse(response);
}

/**
 * Hämtar en lista med de externa ID:na för alla sparade favoriter (US8).
 * @returns {Promise<Array<string>>} - En array av externa ID-strängar (t.ex., ['VIN1001', 'VIN1002'])
 */
export async function getFavorites() {
    const token = localStorage.getItem('userToken');
    if (!token) throw { status: 401, message: 'Not authenticated.' };

    const response = await fetch(`${API_URL}/favorites`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    return handleResponse(response);
}

/**
 * Sparar ett vin som favorit för den inloggade användaren (US7)
 * @param {string} externalWineId - Det externa ID:t (t.ex. 'VIN1001')
 */
export async function saveFavorite(externalWineId) {
    const token = localStorage.getItem('userToken');
    if (!token) throw { status: 401, message: 'Not authenticated.' };

    const response = await fetch(`${API_URL}/favorites/${externalWineId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    return handleResponse(response);
}

/**
 * Raderar ett vin från favoriter för den inloggade användaren
 * @param {string} externalWineId - Det externa ID:t (t.ex. 'VIN1001')
 */
export async function deleteFavorite(externalWineId) {
    const token = localStorage.getItem('userToken');
    if (!token) throw { status: 401, message: 'Not authenticated.' };

    const response = await fetch(`${API_URL}/favorites/${externalWineId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    return handleResponse(response);
}