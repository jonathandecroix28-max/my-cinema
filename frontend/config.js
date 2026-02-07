//mon url de base pour les appels API
export const API_BASE_URL = '/my-cinema/backend/index.php';

// utils.js ou config.js (où se trouvent tes autres exports)
// Assure-toi d'importer le dictionnaire


// appel simplémentés fréquemment, pour éviter de répéter le code

// 1. Fonction d'appel API générique
export const apiFetch = async (action, options = {}) => {
    const queryString = new URLSearchParams(options.query || {}).toString();
    const url = `${API_BASE_URL}?action=${action}${queryString ? `&${queryString}` : ''}`;
    const response = await fetch(url, options);

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

// 4. Fonction de suppression générique
export const apiDelete = async (type, id) => {
    return await apiFetch(`delete_${type}`, {
        method: 'DELETE',
        query: { id }  // ✅ Séparé proprement
    });
};

export const apiPut = async (type, id, data) => {
    const url = `${API_BASE_URL}?action=update_${type}&id=${id}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

