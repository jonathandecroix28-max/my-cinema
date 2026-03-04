export const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost/my-cinema/backend/index.php'  // Local
    : 'https://my-cinema-w64t.onrender.com';           // Production Render

console.log('🌐 API URL:', API_BASE_URL);


// ==========================================
const API_KEY = 'cinema_admin_2026_secret_key_xyz';

const PUBLIC_ACTIONS = [
    'list_movies', 'get_movie',
    'list_rooms', 'get_room',
    'list_screenings'
];

let currentUser = {
    role: 'user',
    isAdmin: false,
    apiKey: null
};

export const loginAsAdmin = (password) => {
    if (password === 'admin123') {
        currentUser = {
            role: 'admin',
            isAdmin: true,
            apiKey: API_KEY
        };
        localStorage.setItem('userRole', 'admin');
        return true;
    }
    return false;
};

export const logout = () => {
    currentUser = { role: 'user', isAdmin: false, apiKey: null };
    localStorage.removeItem('userRole');
};

export const isAdmin = () => currentUser.isAdmin;

export const getCurrentRole = () => currentUser.role;

export const initSession = () => {
    const savedRole = localStorage.getItem('userRole');
    if (savedRole === 'admin') {
        currentUser = {
            role: 'admin',
            isAdmin: true,
            apiKey: API_KEY
        };
    }
};

export const getUserInfo = () => ({
    role: currentUser.role,
    isAdmin: currentUser.isAdmin
});

// ✅ MODIFIÉ : Fonction d'appel API générique avec authentification automatique
// ✅ REMPLACEZ votre apiFetch actuel par celui-ci
export const apiFetch = async (action, options = {}) => {
    const queryString = new URLSearchParams(options.query || {}).toString();
    const url = `${API_BASE_URL}?action=${action}${queryString ? `&${queryString}` : ''}`;

    // ✅ AJOUTEZ CES 4 LIGNES
    const headers = options.headers || {};
    if (!PUBLIC_ACTIONS.includes(action) && currentUser.apiKey) {
        headers['X-API-Key'] = currentUser.apiKey;
    }

    const response = await fetch(url, {
        ...options,
        headers  // ✅ UTILISEZ headers au lieu de options.headers
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur API');
    }
    return response.json();
};

// 2. Formatage des dates (pour remplacer tes .substring() ou dates brutes)
export const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// 3. Gestionnaire d'affichage simplifié (pour éviter les .innerHTML partout)
export const truncateText = (text, limit = 80) => {
    return text.length > limit ? text.substring(0, limit) + '...' : text;
};

export const apiPost = async (action, data) => {
    return await apiFetch(action, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
};

export const apiPermanentDelete = async (type, id) => {
    return await apiFetch(`permanent_delete_${type}`, {
        method: 'DELETE',
        query: { id }  // ✅ Séparé proprement
    });
};

// 4. Fonction de suppression générique
export const apiDelete = async (type, id) => {
    return await apiFetch(`delete_${type}`, {
        method: 'DELETE',
        query: { id }  // ✅ Séparé proprement
    });
};

export const apiRestore = async (type, id) => {
    return await apiFetch(`restore_${type}`, {
        method: 'POST',
        query: { id }  // ✅ Séparé proprement
    });
};

export const apiPut = async (type, id, data) => {
    const url = `${API_BASE_URL}?action=update_${type}&id=${id}`;

    // ✅ MODIFIEZ headers
    const headers = { 'Content-Type': 'application/json' };
    if (currentUser.apiKey) {
        headers['X-API-Key'] = currentUser.apiKey;
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: headers,  // ✅ Utilisez la variable
        body: JSON.stringify(data)
    });
    return response.json();
};

export const apiGet = async (type, id) => {
    return await apiFetch(`get_${type}`, {
        query: { id }  // ✅ Correction du doublon
    });
};

export const apiList = async (type, filters = {}) => {
    return await apiFetch(`list_${type}`, { query: filters });
};

// ✅ Fonction pour obtenir la date/heure actuelle au format datetime-local
export const getCurrentDateTimeLocal = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const sqlToDateTimeLocal = (sqlDateTime) => {
    if (!sqlDateTime) return '';
    const [date, time] = sqlDateTime.split(' ');
    if (!time) return date;
    const [h, m] = time.split(':');
    return `${date}T${h}:${m}`;
};