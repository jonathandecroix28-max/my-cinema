// ✅ Les imports DOIVENT être en premier
import { apiFetch, formatDate, apiDelete, apiPost, apiPut } from './config.js';
import { els } from './dom-elements.js';
import { arrowPages } from './dom-elements.js';
import { allFunctions } from './pagination.js';
const { nextPage, prevPage, goToPage, getPageInfo, isFirstPage, isLastPage, getPaginatedItems, disableButton, enableButton } = allFunctions;
const { btnPrev, btnNext, pageInfo } = arrowPages;
let currentPage = 1;
const itemsPerPage = 5;

// Récupération des éléments DOM
const { listScreenings, movieSelect, roomSelect, screeningForm, stockScreening } = els;

// Vérification que les éléments existent
if (!listScreenings) {
    console.error('❌ Élément #screeningsList introuvable dans le DOM');
}

// Récupération des données
const screenings = await apiFetch('list_screenings');
const movies = await apiFetch('list_movies');
const rooms = await apiFetch('list_rooms');

console.log('Données chargées:', { screenings: screenings.length, movies: movies.length, rooms: rooms.length });

// ✅ Remplir les selects
if (movieSelect && movies.length > 0) {
    movies.forEach(movie => {
        const option = new Option(movie.title, movie.id);
        movieSelect.appendChild(option);
    });
}

if (roomSelect && rooms.length > 0) {
    rooms.forEach(room => {
        const option = new Option(`${room.name} (${room.capacity} places - ${room.type})`, room.id);
        roomSelect.appendChild(option);
    });
}

// Fonctions utilitaires pour afficher les noms au lieu des IDs
const displayMovie = (movie_id) => {
    const movie = movies.find(m => m.id == movie_id);
    return movie ? movie.title : 'Film inconnu';
};

const displayRoom = (room_id) => {
    const room = rooms.find(r => r.id == room_id);
    return room ? `${room.name} (${room.type})` : 'Salle inconnue';
};

// Création du tableau des séances
if (listScreenings) {
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
                        <i class="bi bi-trash"></i>
                    </button>
                    <button class="btn btn-secondary btn-sm update-row-btn" data-id="${screening.id}">
                        <i class="bi bi-pencil"></i>
                    </button>
                </td>
            `;
            screeningTableBody.appendChild(row);
        });


        // ✅ Gestionnaire d'événements pour la suppression
        screeningTableBody.addEventListener('click', async (e) => {
            const btn = e.target.closest('.delete-row-btn');
            const btnUpdate = e.target.closest('.update-row-btn');

            if (btn) {
                const screeningId = btn.dataset.id;
                if (confirm("Supprimer cette séance ?")) {
                    await executeDelete('screening', screeningId, btn.closest('tr'));
                }
            }
            if (btnUpdate) {
                const screeningId = btnUpdate.dataset.id;
                const newStartTime = prompt("Nouvelle heure de début (YYYY-MM-DD HH:MM:SS) :");
                if (newStartTime) {
                    const result = await updateScreening(screeningId, { start_time: newStartTime });
                    if (result && result.success) {
                        alert('Séance mise à jour !');
                        // Mettre à jour l'affichage
                        const startTimeCell = btnUpdate.closest('tr').children[3];
                        startTimeCell.textContent = formatDate(newStartTime);
                    } else {
                        alert(result.error || 'Erreur lors de la mise à jour');
                    }
                }
            }
        });
    } else if (screeningTableBody) {
        screeningTableBody.innerHTML = '<tr><td colspan="5" class="text-center">Aucune séance programmée</td></tr>';
    }
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

const updateScreening = async (id, data) => {
    try {
        const result = await apiPut(`update_screening&id=${id}`, data);
        return result;
    } catch (error) {
        alert(`Erreur lors de la mise à jour : ${error.message}`);
    }
}

// ✅ Gestion du formulaire d'ajout de séance
if (screeningForm) {
    screeningForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
            movie_id: parseInt(document.getElementById('movieSelect').value, 10),
            room_id: parseInt(document.getElementById('roomSelect').value, 10),
            start_time: document.getElementById('startTime').value
        };

        // Validation
        if (!data.movie_id || !data.room_id || !data.start_time) {
            alert('Veuillez remplir tous les champs');
            return;
        }

        console.log('Données de la séance:', data);

        try {
            const result = await apiPost('add_screening', data);
            console.log('Réponse du serveur:', result);

            if (result.success) {
                alert('Séance créée avec succès ! 🎬');
                location.reload();
            } else {
                alert(`Erreur : ${result.error || 'Erreur inconnue'}`);
            }
        } catch (error) {
            console.error('Erreur complète:', error);
            alert(`Erreur lors de la création de la séance : ${error.message}`);
        }
    });
}



// Afficher le compteur
if (stockScreening) {
    stockScreening.textContent = `Séance${screenings.length > 1 ? 's' : ''} programmée${screenings.length > 1 ? 's' : ''} : ${screenings.length} 🎟️`;
}

console.log('✅ screen.js chargé avec succès', {
    screenings: screenings.length,
    movies: movies.length,
    rooms: rooms.length
});