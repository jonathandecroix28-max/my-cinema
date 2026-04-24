//mon url de base pour les appels API
export const API_BASE_URL = '/backend/index.php';

// Clé secrète pour l'authentification admin (à ne pas exposer en production)
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

export const isAdmin = () => currentUser.isAdmin;

export const requireAdmin = () => {
    if (!isAdmin()) {
        alert('⛔ Accès refusé : Cette page est réservée aux administrateurs.');
        window.location.href = 'index.html';
        return false;
    }
    return true;
};


// FONCTIONS D'AUTHENTIFICATION ET DE GESTION DE SESSION
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

// Fonction de déconnexion

export const logout = () => {
    currentUser = { role: 'user', isAdmin: false, apiKey: null };
    localStorage.removeItem('userRole');
};


export const getCurrentRole = () => currentUser.role;
// Vérification d'accès admin
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

//  Fonction d'appel API générique avec authentification automatique

export const apiFetch = async (action, options = {}) => {
    //pour les filtres et autres paramètres, on les ajoute proprement à l'URL
    const queryString = new URLSearchParams(options.query || {}).toString();
    const url = `${API_BASE_URL}?action=${action}${queryString ? `&${queryString}` : ''}`;

    // Construire les headers avec authentification automatique
    const headers = options.headers || {};
    if (!PUBLIC_ACTIONS.includes(action) && currentUser.apiKey) {
        headers['X-API-Key'] = currentUser.apiKey;
    }

    // Faire l'appel fetch
    const response = await fetch(url, {
        ...options,
        headers: headers  //Utilisez les headers modifiés
    });

    if (!response.ok) {
        let error;
        try {
            error = await response.json();
        } catch {
            error = { message: `Erreur HTTP ${response.status}` };
        }
        throw new Error(error.message || error.error || 'Erreur API');
    }

    return response.json();
};

//Formatage des dates (pour remplacer tes .substring() ou dates brutes)
export const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });
};

//Gestionnaire d'affichage simplifié (pour éviter les .innerHTML partout)
export const truncateText = (text, limit = 80) => {
    return text.length > limit ? text.substring(0, limit) + '...' : text;
};

// Fonctions API spécifiques
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
        query: { id }  //Séparé proprement
    });
};

// Fonction de suppression générique
export const apiDelete = async (type, id) => {
    return await apiFetch(`delete_${type}`, {
        method: 'DELETE',
        query: { id }
    });
};
// Fonction de restauration générique
export const apiRestore = async (type, id) => {
    return await apiFetch(`restore_${type}`, {
        method: 'POST',
        query: { id }
    });
};
// Fonction de mise à jour générique
export const apiPut = async (type, id, data) => {
    const url = `${API_BASE_URL}?action=update_${type}&id=${id}`;

    // Headers
    const headers = { 'Content-Type': 'application/json' };
    if (currentUser.apiKey) {
        headers['X-API-Key'] = currentUser.apiKey;
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: headers,  // Utilisez la variable
        body: JSON.stringify(data)
    });
    return response.json();
};

export const apiGet = async (type, id) => {
    return await apiFetch(`get_${type}`, {
        query: { id }  // Correction du doublon
    });
};

// Fonction pour lister les éléments avec des filtres optionnels
export const apiList = async (type, filters = {}) => {
    return await apiFetch(`list_${type}`, { query: filters });
};

// Fonction pour obtenir la date/heure actuelle au format datetime-local
export const getCurrentDateTimeLocal = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Fonction pour convertir une date SQL en format datetime-local

export const sqlToDateTimeLocal = (sqlDateTime) => {
    if (!sqlDateTime) return '';
    const [date, time] = sqlDateTime.split(' ');
    if (!time) return date;
    const [h, m] = time.split(':');
    return `${date}T${h}:${m}`;
};