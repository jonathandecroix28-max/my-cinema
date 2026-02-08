// ===================================================================
// IMPORTS
// ===================================================================
import { initAuth, requireAdmin } from './auth-ui.js';
import {
    apiList,
    apiPost,
    apiDelete,
    apiPut,
    apiGet,
    isAdmin,
    formatDate
} from './config.js';

// ===================================================================
// INITIALISATION
// ===================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialiser l'authentification
    initAuth();  // ✅ DÉCOMMENTEZ CETTE LIGNE (elle est déjà là, juste commentée)

    // Votre code existant...
    loadMovies();
    loadRooms();
    loadScreenings();

    // Charger les options pour le formulaire de séances
    loadMovieOptions();
    loadRoomOptions();
});
// ===================================================================
// GESTION DES TABS
// ===================================================================
window.showTab = (tabName) => {
    // Désactiver tous les tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.querySelectorAll('.panel').forEach(panel => {
        panel.classList.remove('active');
    });

    // Activer le tab sélectionné
    event.target.classList.add('active');
    document.getElementById(`${tabName}-panel`).classList.add('active');
};

// ===================================================================
// GESTION DES MESSAGES
// ===================================================================
function showMessage(type, text, messageId) {
    const messageDiv = document.getElementById(messageId);
    messageDiv.textContent = text;
    messageDiv.className = `message ${type} active`;

    setTimeout(() => {
        messageDiv.classList.remove('active');
    }, 5000);
}

// ===================================================================
// FILMS - CRUD
// ===================================================================

// Charger la liste des films
async function loadMovies() {
    const container = document.getElementById('movies-list');

    try {
        container.innerHTML = '<div class="loading">Chargement des films...</div>';

        const movies = await apiList('movies');

        if (!movies || movies.length === 0) {
            container.innerHTML = '<div class="empty-state">Aucun film trouvé</div>';
            return;
        }

        container.innerHTML = movies.map(movie => `
            <div class="card">
                <h3>🎬 ${movie.title}</h3>
                <p><strong>Réalisateur:</strong> ${movie.director}</p>
                <p><strong>Genre:</strong> ${movie.genre}</p>
                <p><strong>Durée:</strong> ${movie.duration} min</p>
                <p><strong>Année:</strong> ${movie.release_year}</p>
                ${movie.description ? `<p><strong>Description:</strong> ${movie.description.substring(0, 100)}...</p>` : ''}
                <div class="card-actions admin-only">
                    <button class="btn btn-danger" onclick="deleteMovie(${movie.id})">
                        🗑️ Supprimer
                    </button>
                </div>
            </div>
        `).join('');

        // Mettre à jour l'affichage des éléments admin
        initAuth();

    } catch (error) {
        console.error('Erreur chargement films:', error);
        container.innerHTML = `<div class="empty-state">❌ Erreur: ${error.message}</div>`;
    }
}

// Toggle formulaire d'ajout
window.toggleAddMovieForm = () => {
    const form = document.getElementById('add-movie-form');
    form.classList.toggle('active');

    // Réinitialiser le formulaire si on le ferme
    if (!form.classList.contains('active')) {
        document.querySelector('#add-movie-form form').reset();
    }
};

// Ajouter un film
window.handleAddMovie = async (event) => {
    event.preventDefault();

    if (!requireAdmin()) return;

    const movieData = {
        title: document.getElementById('movie-title').value,
        director: document.getElementById('movie-director').value,
        description: document.getElementById('movie-description').value,
        duration: parseInt(document.getElementById('movie-duration').value),
        genre: document.getElementById('movie-genre').value,
        release_year: parseInt(document.getElementById('movie-year').value)
    };

    try {
        const result = await apiPost('add_movie', movieData);

        if (result.success) {
            showMessage('success', '✅ Film ajouté avec succès !', 'movies-message');
            toggleAddMovieForm();
            loadMovies();
            loadMovieOptions(); // Rafraîchir les options pour les séances
        } else {
            showMessage('error', '❌ Erreur: ' + (result.error || 'Erreur inconnue'), 'movies-message');
        }
    } catch (error) {
        showMessage('error', '❌ Erreur: ' + error.message, 'movies-message');
    }
};

// Supprimer un film
window.deleteMovie = async (id) => {
    if (!requireAdmin()) return;

    if (!confirm('Êtes-vous sûr de vouloir supprimer ce film ?')) {
        return;
    }

    try {
        const result = await apiDelete('movie', id);

        if (result.success) {
            showMessage('success', '✅ Film supprimé avec succès !', 'movies-message');
            loadMovies();
            loadMovieOptions();
        } else {
            showMessage('error', '❌ Erreur: ' + (result.error || 'Erreur inconnue'), 'movies-message');
        }
    } catch (error) {
        showMessage('error', '❌ Erreur: ' + error.message, 'movies-message');
    }
};

// ===================================================================
// SALLES - CRUD
// ===================================================================

// Charger la liste des salles
async function loadRooms() {
    const container = document.getElementById('rooms-list');

    try {
        container.innerHTML = '<div class="loading">Chargement des salles...</div>';

        const rooms = await apiList('rooms');

        if (!rooms || rooms.length === 0) {
            container.innerHTML = '<div class="empty-state">Aucune salle trouvée</div>';
            return;
        }

        container.innerHTML = rooms.map(room => `
            <div class="card">
                <h3>🎭 ${room.name}</h3>
                <p><strong>Type:</strong> ${room.type || 'Standard'}</p>
                <p><strong>Capacité:</strong> ${room.capacity} places</p>
                <p><strong>Statut:</strong> ${room.active == 1 ? '✅ Active' : '❌ Inactive'}</p>
                <div class="card-actions admin-only">
                    <button class="btn btn-danger" onclick="deleteRoom(${room.id})">
                        🗑️ Supprimer
                    </button>
                </div>
            </div>
        `).join('');

        initAuth();

    } catch (error) {
        console.error('Erreur chargement salles:', error);
        container.innerHTML = `<div class="empty-state">❌ Erreur: ${error.message}</div>`;
    }
}

// Toggle formulaire d'ajout salle
window.toggleAddRoomForm = () => {
    const form = document.getElementById('add-room-form');
    form.classList.toggle('active');

    if (!form.classList.contains('active')) {
        document.querySelector('#add-room-form form').reset();
    }
};

// Ajouter une salle
window.handleAddRoom = async (event) => {
    event.preventDefault();

    if (!requireAdmin()) return;

    const roomData = {
        name: document.getElementById('room-name').value,
        capacity: parseInt(document.getElementById('room-capacity').value),
        type: document.getElementById('room-type').value,
        active: parseInt(document.getElementById('room-active').value)
    };

    try {
        const result = await apiPost('add_room', roomData);

        if (result.success) {
            showMessage('success', '✅ Salle ajoutée avec succès !', 'rooms-message');
            toggleAddRoomForm();
            loadRooms();
            loadRoomOptions();
        } else {
            showMessage('error', '❌ Erreur: ' + (result.error || 'Erreur inconnue'), 'rooms-message');
        }
    } catch (error) {
        showMessage('error', '❌ Erreur: ' + error.message, 'rooms-message');
    }
};

// Supprimer une salle
window.deleteRoom = async (id) => {
    if (!requireAdmin()) return;

    if (!confirm('Êtes-vous sûr de vouloir supprimer cette salle ?')) {
        return;
    }

    try {
        const result = await apiDelete('room', id);

        if (result.success) {
            showMessage('success', '✅ Salle supprimée avec succès !', 'rooms-message');
            loadRooms();
            loadRoomOptions();
        } else {
            showMessage('error', '❌ Erreur: ' + (result.error || 'Erreur inconnue'), 'rooms-message');
        }
    } catch (error) {
        showMessage('error', '❌ Erreur: ' + error.message, 'rooms-message');
    }
};

// ===================================================================
// SÉANCES - CRUD
// ===================================================================

// Charger la liste des séances
async function loadScreenings() {
    const container = document.getElementById('screenings-list');

    try {
        container.innerHTML = '<div class="loading">Chargement des séances...</div>';

        const screenings = await apiList('screenings');

        if (!screenings || screenings.length === 0) {
            container.innerHTML = '<div class="empty-state">Aucune séance trouvée</div>';
            return;
        }

        container.innerHTML = screenings.map(screening => `
            <div class="card">
                <h3>📅 ${screening.movie_title || 'Film inconnu'}</h3>
                <p><strong>Salle:</strong> ${screening.room_name || 'N/A'}</p>
                <p><strong>Date:</strong> ${new Date(screening.screening_date).toLocaleDateString('fr-FR')}</p>
                <p><strong>Horaire:</strong> ${screening.start_time} - ${screening.end_time}</p>
                <p><strong>Prix:</strong> ${screening.price} €</p>
                <div class="card-actions admin-only">
                    <button class="btn btn-danger" onclick="deleteScreening(${screening.id})">
                        🗑️ Supprimer
                    </button>
                </div>
            </div>
        `).join('');

        initAuth();

    } catch (error) {
        console.error('Erreur chargement séances:', error);
        container.innerHTML = `<div class="empty-state">❌ Erreur: ${error.message}</div>`;
    }
}

// Charger les options de films pour le formulaire
async function loadMovieOptions() {
    try {
        const movies = await apiList('movies');
        const select = document.getElementById('screening-movie');

        select.innerHTML = '<option value="">Sélectionner un film</option>' +
            movies.map(movie => `<option value="${movie.id}">${movie.title}</option>`).join('');
    } catch (error) {
        console.error('Erreur chargement options films:', error);
    }
}

// Charger les options de salles pour le formulaire
async function loadRoomOptions() {
    try {
        const rooms = await apiList('rooms');
        const select = document.getElementById('screening-room');

        select.innerHTML = '<option value="">Sélectionner une salle</option>' +
            rooms.map(room => `<option value="${room.id}">${room.name} (${room.capacity} places)</option>`).join('');
    } catch (error) {
        console.error('Erreur chargement options salles:', error);
    }
}

// Toggle formulaire d'ajout séance
window.toggleAddScreeningForm = () => {
    const form = document.getElementById('add-screening-form');
    form.classList.toggle('active');

    if (!form.classList.contains('active')) {
        document.querySelector('#add-screening-form form').reset();
    }
};

// Ajouter une séance
window.handleAddScreening = async (event) => {
    event.preventDefault();

    if (!requireAdmin()) return;

    const screeningData = {
        movie_id: parseInt(document.getElementById('screening-movie').value),
        room_id: parseInt(document.getElementById('screening-room').value),
        screening_date: document.getElementById('screening-date').value,
        start_time: document.getElementById('screening-start').value + ':00',
        end_time: document.getElementById('screening-end').value + ':00',
        price: parseFloat(document.getElementById('screening-price').value)
    };

    try {
        const result = await apiPost('add_screening', screeningData);

        if (result.success) {
            showMessage('success', '✅ Séance ajoutée avec succès !', 'screenings-message');
            toggleAddScreeningForm();
            loadScreenings();
        } else {
            showMessage('error', '❌ Erreur: ' + (result.error || 'Erreur inconnue'), 'screenings-message');
        }
    } catch (error) {
        showMessage('error', '❌ Erreur: ' + error.message, 'screenings-message');
    }
};

// Supprimer une séance
window.deleteScreening = async (id) => {
    if (!requireAdmin()) return;

    if (!confirm('Êtes-vous sûr de vouloir supprimer cette séance ?')) {
        return;
    }

    try {
        const result = await apiDelete('screening', id);

        if (result.success) {
            showMessage('success', '✅ Séance supprimée avec succès !', 'screenings-message');
            loadScreenings();
        } else {
            showMessage('error', '❌ Erreur: ' + (result.error || 'Erreur inconnue'), 'screenings-message');
        }
    } catch (error) {
        showMessage('error', '❌ Erreur: ' + error.message, 'screenings-message');
    }
};