// ✅ Les imports DOIVENT être en premier
import { apiFetch, formatDate, apiDelete } from './config.js';
import { els } from './dom-elements.js';

// Récupération des éléments DOM
const { listScreenings } = els;

// Vérification que l'élément existe
if (!listScreenings) {
    console.error('❌ Élément #screeningsList introuvable dans le DOM');
    throw new Error('Élément requis manquant');
}

// Récupération des données
const screenings = await apiFetch('list_screenings');
const movies = await apiFetch('list_movies');
const rooms = await apiFetch('list_rooms');

// Fonctions utilitaires pour afficher les noms au lieu des IDs
const displayMovie = (movie_id) => {
    const movie = movies.find(m => m.id == movie_id);
    return movie ? movie.title : 'Film inconnu';
};

const displayRoom = (room_id) => {
    const room = rooms.find(r => r.id == room_id);
    return room ? room.name : 'Salle inconnue';
};

// Création du tableau des séances
const screeningTable = document.createElement('table');
screeningTable.className = 'table table-bordered table-striped mt-4';
screeningTable.innerHTML = `
    <thead>
        <tr>
            <th>ID</th>
            <th>Film</th>
            <th>Salle</th>
            <th>Heure de début</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody id="screeningTableBody"></tbody>
`;

// ✅ D'abord ajouter au DOM
listScreenings.appendChild(screeningTable);

// ✅ PUIS récupérer le tbody
const screeningTableBody = document.getElementById('screeningTableBody');

// Remplir le tableau avec les séances
if (screeningTableBody && screenings.length > 0) {
    screenings.forEach(screening => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${screening.id}</td>
            <td>${displayMovie(screening.movie_id)}</td>
            <td>${displayRoom(screening.room_id)}</td>
            <td>${formatDate(screening.start_time)}</td>
            <td>
                <button class="btn btn-danger btn-sm delete-row-btn" data-id="${screening.id}">
                    <i class="bi bi-trash"></i> Supprimer
                </button>
                <button class="btn btn-secondary btn-sm" disabled>
                    <i class="bi bi-pencil"></i> Édition
                </button>
            </td>
        `;
        screeningTableBody.appendChild(row);
    });
} else {
    console.warn('⚠️ Aucune séance à afficher');
}

// Fonction de suppression
const executeDelete = async (type, id, rowElement) => {
    try {
        const data = await apiDelete(type, id);

        if (data.success) {
            alert(`${type} supprimé !`);
            rowElement.remove();
        } else {
            alert(data.error || 'Erreur lors de la suppression');
        }
    } catch (error) {
        alert(`Erreur : ${error.message}`);
    }
};

// ✅ Gestionnaire d'événements avec vérification
if (screeningTableBody) {
    screeningTableBody.addEventListener('click', async (e) => {
        const btn = e.target.closest('.delete-row-btn');
        if (btn) {
            const screeningId = btn.dataset.id;
            if (confirm("Supprimer cette séance ?")) {
                await executeDelete('screening', screeningId, btn.closest('tr'));
            }
        }
    });
}

console.log('✅ screen.js chargé avec succès', {
    screenings: screenings.length,
    movies: movies.length,
    rooms: rooms.length
});