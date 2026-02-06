// ✅ Imports
import { apiFetch, formatDate, apiDelete, apiPost, apiPut } from './config.js';
import { els } from './dom-elements.js';
import { getPaginatedItems, getPageInfo, isFirstPage, isLastPage, disableButton, enableButton, ITEMS_PER_PAGE } from './pagination.js';

const { listScreenings, movieSelect, roomSelect, screeningForm, stockScreening } = els;

// État de la pagination
let state = {
    currentPage: 1,
    itemsPerPage: ITEMS_PER_PAGE
};

// Récupération des données
const screenings = await apiFetch('list_screenings');
const movies = await apiFetch('list_movies');
const rooms = await apiFetch('list_rooms');

console.log('Données chargées:', { screenings: screenings.length, movies: movies.length, rooms: rooms.length });

// Boutons de pagination
const btnPrevScreening = document.getElementById('btnPrevScreening');
const btnNextScreening = document.getElementById('btnNextScreening');
const pageInfoScreening = document.getElementById('pageInfoScreening');

// Remplir les selects
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

// Fonctions utilitaires
const displayMovie = (movie_id) => {
    const movie = movies.find(m => m.id == movie_id);
    return movie ? movie.title : 'Film inconnu';
};

const displayRoom = (room_id) => {
    const room = rooms.find(r => r.id == room_id);
    return room ? `${room.name} (${room.type})` : 'Salle inconnue';
};



// ✅ CRÉATION DU TABLEAU
const screeningTable = document.createElement('table');
screeningTable.className = 'table table-bordered table-striped mt-4 table-hover';
screeningTable.innerHTML = `
    <thead class="table-dark">
        <tr>
            <th class="text-center">ID</th>
            <th>Film</th>
            <th>Salle</th>
            <th class="text-center">Heure de début</th>
            <th class="text-center">Actions</th>
        </tr>
    </thead>
    <tbody id="screeningTableBody"></tbody>
`;

if (listScreenings) {
    listScreenings.appendChild(screeningTable);
}

const screeningTableBody = document.getElementById('screeningTableBody');

// ✅ FONCTION POUR CRÉER UNE LIGNE
const createScreeningRow = (screening) => {
    const tr = document.createElement('tr');
    tr.dataset.id = screening.id;
    tr.innerHTML = `
        <td class="text-center screening-id">${screening.id}</td>
        <td class="screening-movie-id">${displayMovie(screening.movie_id)}</td>
        <td class="screening-room-id">${displayRoom(screening.room_id)}</td>
        <td class="text-center screening-startime">${formatDate(screening.start_time)}</td>
        <td class="text-center actions">
            <button class="btn btn-sm btn-danger delete-row-btn" data-id="${screening.id}" title="Supprimer">
                <i class="bi bi-trash"></i>
            </button>
            <button class="btn btn-sm btn-warning edit-row-btn" data-id="${screening.id}" title="Modifier">
                <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-info view-more-btn" data-id="${screening.id}" title="Détails">
                <i class="bi bi-eye"></i>
            </button>
        </td>
    `;
    return tr;
};

// Fonction pour afficher les séances paginées
const renderScreenings = () => {
    if (!screeningTableBody) return;

    screeningTableBody.innerHTML = '';
    const paginatedScreenings = getPaginatedItems(screenings, state.currentPage, state.itemsPerPage);

    if (paginatedScreenings.length > 0) {
        paginatedScreenings.forEach(screening => {
            screeningTableBody.appendChild(createScreeningRow(screening));
        });
    } else {
        screeningTableBody.innerHTML = '<tr><td colspan="5" class="text-center">Aucune séance programmée</td></tr>';
    }

    updatePaginationUI();
};

// Fonction pour mettre à jour l'UI de pagination
const updatePaginationUI = () => {
    if (pageInfoScreening) {
        pageInfoScreening.textContent = getPageInfo(state.currentPage, screenings.length, state.itemsPerPage);
    }

    if (isFirstPage(state.currentPage)) {
        disableButton(btnPrevScreening);
    } else {
        enableButton(btnPrevScreening);
    }

    if (isLastPage(state.currentPage, screenings.length, state.itemsPerPage)) {
        disableButton(btnNextScreening);
    } else {
        enableButton(btnNextScreening);
    }
};

// Gestionnaires des boutons de pagination
if (btnPrevScreening) {
    btnPrevScreening.addEventListener('click', () => {
        if (state.currentPage > 1) {
            state.currentPage--;
            renderScreenings();
        }
    });
}

if (btnNextScreening) {
    btnNextScreening.addEventListener('click', () => {
        const totalPages = Math.ceil(screenings.length / state.itemsPerPage);
        if (state.currentPage < totalPages) {
            state.currentPage++;
            renderScreenings();
        }
    });
}

// Fonction pour activer le mode édition
const enableEditMode = (row) => {
    const screeningId = row.dataset.id;
    const screening = screenings.find(s => s.id == screeningId);
    if (!screening) {
        alert('Séance introuvable');
        return;
    }

    row.classList.add('editing-mode');

    row.querySelector(".screening-startime").innerHTML =
        `<input type="datetime-local" class="inline-input" value="${new Date(screening.start_time).toISOString().slice(0, 16)}" data-field="start_time">`;

    row.querySelector(".screening-movie-id").innerHTML =
        `<select class="inline-select" data-field="movie_id">
            ${movies.map(movie => `<option value="${movie.id}"${movie.id == screening.movie_id ? ' selected' : ''}>${movie.title}</option>`).join('')}
        </select>`;

    row.querySelector(".screening-room-id").innerHTML =
        `<select class="inline-select" data-field="room_id">
            ${rooms.map(room => `<option value="${room.id}"${room.id == screening.room_id ? ' selected' : ''}>${room.name} (${room.type})</option>`).join('')}
        </select>`;

    row.querySelector(".actions").innerHTML = `
        <button class="btn btn-sm btn-success save-row-btn" data-id="${screening.id}" title="Sauvegarder">
            <i class="bi bi-check-lg"></i>
        </button>
        <button class="btn btn-sm btn-secondary cancel-edit-btn" data-id="${screening.id}" title="Annuler">
            <i class="bi bi-x-lg"></i>
        </button>
    `;
};

// Fonction pour sauvegarder
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
        const result = await apiPut('screening', screeningId, screeningData);
        if (result && result.success) {
            alert('Séance mise à jour ! 🎬');

            const screeningIndex = screenings.findIndex(s => s.id == screeningId);
            if (screeningIndex !== -1) {
                screenings[screeningIndex] = { ...screenings[screeningIndex], ...screeningData };
            }

            renderScreenings();
        } else {
            alert(result.error || 'Erreur lors de la mise à jour');
        }
    } catch (error) {
        alert(`Erreur lors de la mise à jour : ${error.message}`);
    }
};

// Fonction pour annuler
const cancelEdit = () => {
    renderScreenings();
};

// Fonction de suppression
const executeDelete = async (type, id) => {
    try {
        const data = await apiDelete(type, id);

        if (data.success) {
            alert(`${type} supprimé !`);

            const index = screenings.findIndex(s => s.id == id);
            if (index !== -1) {
                screenings.splice(index, 1);
            }

            renderScreenings();
        } else {
            alert(data.error || 'Erreur lors de la suppression');
        }
    } catch (error) {
        alert(`Erreur : ${error.message}`);
    }
};

// Fonction pour afficher les détails
const showScreeningDetails = (screeningId) => {
    const screening = screenings.find(s => s.id == screeningId);
    if (!screening) return;

    const movie = movies.find(m => m.id == screening.movie_id);
    const room = rooms.find(r => r.id == screening.room_id);

    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    `;

    modal.innerHTML = `
        <div style="
            background: white;
            padding: 30px;
            border-radius: 10px;
            max-width: 600px;
            position: relative;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        ">
            <button id="closeModal" style="
                position: absolute;
                top: 15px;
                right: 15px;
                border: none;
                background: #dc3545;
                color: white;
                border-radius: 50%;
                width: 35px;
                height: 35px;
                cursor: pointer;
                font-size: 20px;
                font-weight: bold;
                line-height: 1;
            ">×</button>
            
            <h3 style="margin-top: 0; color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
                🎬 Séance #${screening.id}
            </h3>
            
            <div style="margin: 20px 0;">
                <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
                    <strong style="color: #1976d2; display: block; margin-bottom: 8px;">🎥 Film :</strong>
                    <span style="color: #333; font-size: 1.2rem; font-weight: 600;">${movie ? movie.title : 'Inconnu'}</span>
                    ${movie ? `<p style="margin-top: 8px; color: #666; font-size: 0.9rem; white-space: pre-wrap;">${movie.description}</p>` : ''}
                </div>
                
                <div style="background: #f3e5f5; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
                    <strong style="color: #7b1fa2; display: block; margin-bottom: 8px;">🏟️ Salle :</strong>
                    <span style="color: #333; font-size: 1.1rem; font-weight: 600;">${room ? room.name : 'Inconnue'}</span>
                    ${room ? `<p style="margin-top: 5px; color: #666; font-size: 0.9rem;">Type: ${room.type} • Capacité: ${room.capacity} places</p>` : ''}
                </div>
                
                <div style="background: #fff3e0; padding: 15px; border-radius: 5px;">
                    <strong style="color: #f57c00; display: block; margin-bottom: 8px;">📅 Horaire :</strong>
                    <span style="color: #333; font-size: 1.1rem; font-weight: 600;">${formatDate(screening.start_time)}</span>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.id === 'closeModal') {
            document.body.removeChild(modal);
        }
    });
};

// Gestionnaire d'événements PRINCIPAL
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

        if (e.target.closest('.view-more-btn')) {
            const screeningId = e.target.closest('.view-more-btn').dataset.id;
            showScreeningDetails(screeningId);
            return;
        }
    });
}

// Formulaire d'ajout
if (screeningForm) {
    screeningForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
            movie_id: parseInt(document.getElementById('movieSelect').value, 10),
            room_id: parseInt(document.getElementById('roomSelect').value, 10),
            start_time: document.getElementById('startTime').value
        };

        if (!data.movie_id || !data.room_id || !data.start_time) {
            alert('Veuillez remplir tous les champs');
            return;
        }

        try {
            const result = await apiPost('add_screening', data);

            if (result.success) {
                alert('Séance créée avec succès ! 🎬');
                location.reload();
            } else {
                alert(`Erreur : ${result.error || 'Erreur inconnue'}`);
            }
        } catch (error) {
            alert(`Erreur lors de la création de la séance : ${error.message}`);
        }
    });
}

const startTimeInput = document.getElementById('startTime');

if (startTimeInput) {
    const now = new Date();

    // On formate la date en YYYY-MM-DDTHH:mm (ex: 2026-02-06T14:30)
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    const minDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;

    // Applique la limite min : l'utilisateur ne peut plus choisir avant "maintenant"
    startTimeInput.setAttribute('min', minDateTime);

    // Optionnel : on peut aussi pré-remplir le champ avec cette valeur
    startTimeInput.value = minDateTime;
}
// Afficher le compteur
if (stockScreening) {
    stockScreening.textContent = `Séance${screenings.length > 1 ? 's' : ''} programmée${screenings.length > 1 ? 's' : ''} : ${screenings.length} 🎟️`;
}

// Affichage initial
renderScreenings();

console.log('✅ screen.js chargé avec succès', {
    screenings: screenings.length,
    movies: movies.length,
    rooms: rooms.length
});