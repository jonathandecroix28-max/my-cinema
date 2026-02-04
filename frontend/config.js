//mon url de base pour les appels API
export const API_BASE_URL = '/my-cinema/backend/index.php';


// appel simplémentés fréquemment, pour éviter de répéter le code

// 1. Fonction d'appel API générique
export const apiFetch = async (action, options = {}) => {
    const url = `${API_BASE_URL}?action=${action}`;
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
    return await apiFetch(`delete_${type}&id=${id}`, {
        method: 'DELETE'
    });
};
export const apiPut = async (type, id, data) => {
    return await apiFetch(`update_${type}&id=${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}
