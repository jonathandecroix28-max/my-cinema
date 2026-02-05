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
if (listScreenings) { listScreenings.appendChild(screeningTable) };

// ✅ PUIS récupérer le tbody
const screeningTableBody = document.getElementById('screeningTableBody');


//creation des ligne de tableau pour afficher les donnees de la DB
const createScreeningRow = (screening) => {
    const tr = document.createElement('tr');
    tr.dataset.id = screening.id;
    tr.innerHTML = `
                <td class="screening-id">${screening.id}</td>
                <td class="screening-movie-id">${displayMovie(screening.movie_id)}</td>
                <td class="screening-room-id">${displayRoom(screening.room_id)}</td>
                <td class="screening-startime">${formatDate(screening.start_time)}</td>
                <td class="actions">
                    <button class="btn btn-danger btn-sm delete-row-btn" data-id="${screening.id}">
                        <i class="bi bi-trash"></i>
                    </button>
                    <button class="btn btn-warning btn-sm edit-row-btn" data-id="${screening.id}">
                        <i class="bi bi-pencil"></i> Modifier
                    </button>
                </td>
            `;
    return tr;
};

const enableEditMode = (row) => {
    const screeningId = row.dataset.id;
    const screening = screenings.find(s => s.id == screeningId);
    if (!screening) {
        alert('Séance introuvable');
        return;
    }
    row.classList.add('editing-mode');
    row.querySelector(".screening-startime").innerHTML = `<input type="datetime-local" class="inline-input" value="${new Date(screening.start_time).toISOString().slice(0, 16)}" data-field="start_time">`;

    row.querySelector(".screening-movie-id").innerHTML = `<select class="inline-select" data-field="movie_id">
                ${movies.map(movie => `<option value="${movie.id}"${movie.id == screening.movie_id ? ' selected' : ''}>${movie.title}</option>`).join('')}
            </select>`;

    row.querySelector(".screening-room-id").innerHTML = `<select class="inline-select" data-field="room_id">
                ${rooms.map(room => `<option value="${room.id}"${room.id == screening.room_id ? ' selected' : ''}>${room.name} (${room.type})</option>`).join('')}
            </select>`;

    row.querySelector(".actions").innerHTML = `
                <button class="btn btn-success btn-sm save-row-btn" data-id="${screening.id}">
                    <i class="bi bi-check-lg"></i> Sauvegarder
                </button>
                <button class="btn btn-secondary btn-sm cancel-edit-btn" data-id="${screening.id}">
                    <i class="bi bi-x"></i> Annuler
                </button>
            `;
}

const saveScreening = async (row) => {
    const screeningId = row.dataset.id;
    const screeningData = {
        movie_id: parseInt(row.querySelector('.inline-select[data-field="movie_id"]').value, 10),
        room_id: parseInt(row.querySelector('.inline-select[data-field="room_id"]').value, 10),
        start_time: row.querySelector('.inline-input[data-field="start_time"]').value
    };
    if (!screeningData.movie_id || !screeningData.room_id || !screeningData.start_time) {
        alert('Veuillez remplir tous les champs');
        return;
    }
    try {
        const result = await apiPut(`update_screening&id=${screeningId}`, screeningData);
        if (result && result.success) {
            alert('Séance mise à jour !');
            // Mettre à jour l'affichage
            row.querySelector(".screening-movie-id").textContent = displayMovie(screeningData.movie_id);
            row.querySelector(".screening-room-id").textContent = displayRoom(screeningData.room_id);
            row.querySelector(".screening-startime").textContent = formatDate(screeningData.start_time);
            // Revenir en mode affichage
            row.classList.remove('editing-mode');
            row.querySelector('.actions').innerHTML = `
                    <button class="btn btn-danger btn-sm delete-row-btn" data-id="${screeningId}">
                        <i class="bi bi-trash"></i>
                    </button>
                    <button class="btn btn-warning btn-sm edit-row-btn" data-id="${screeningId}">
                        <i class="bi bi-pencil"></i> Modifier
                    </button>
                `;
        } else {
            alert(result.error || 'Erreur lors de la mise à jour');
        }
    } catch (error) {
        alert(`Erreur lors de la mise à jour : ${error.message}`);
    }
}

// Remplir le tableau
if (screeningTableBody && screenings.length > 0) {
    screenings.forEach(screening => {
        screeningTableBody.appendChild(createScreeningRow(screening));
    });
} else if (screeningTableBody) {
    screeningTableBody.innerHTML = '<tr><td colspan="5" class="text-center">Aucune séance programmée</td></tr>';
}

const cancelEdit = (row) => {
    const screeningId = row.dataset.id;
    const screening = screenings.find(s => s.id == screeningId);
    if (!screening) return;

    if (screening) {
        const newRow = createScreeningRow(screening);
        row.replaceWith(newRow);
    }
};

const executeDelete = async (type, id, rowElement) => {
    try {
        const data = await apiDelete(type, id);

        if (data.success) {
            alert(`${type} supprimé !`);
            rowElement.remove();

            const index = screenings.findIndex(s => s.id == id);
            if (index !== -1) {
                screenings.splice(index, 1);
            }

            const option = document.querySelector(`select option[value="${id}"]`);
            if (option) option.remove();
        } else {
            alert(data.error || 'Erreur lors de la suppression');
        }
    } catch (error) {
        alert(`Erreur : ${error.message}`);
    }
};


if (screeningTableBody) {
    screeningTableBody.addEventListener('click', async (e) => {
        const row = e.target.closest('tr');
        if (!row) return;

        if (e.target.closest('.delete-row-btn')) {
            const screeningId = e.target.closest('.delete-row-btn').dataset.id;
            if (confirm("Supprimer cette séance ?")) {
                await executeDelete('screening', screeningId, row);
            }
            return;
        }

        if (e.target.closest('.edit-row-btn')) {
            enableEditMode(row);
            return;
        }

        if (e.target.closest('.save-row-btn')) {
            await saveScreening(row);
            return;
        }

        if (e.target.closest('.cancel-edit-btn')) {
            cancelEdit(row);
            return;
        }
    });
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