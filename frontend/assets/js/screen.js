
// SCREEN.JS - VERSION DYNAMIQUE COMPLÈTE


// Imports
import { apiFetch, getCurrentDateTimeLocal, formatDate, apiDelete, apiPost, apiPut, sqlToDateTimeLocal } from './config.js';
import { els } from './dom-elements.js';
import { getPaginatedItems, getPageInfo, isFirstPage, isLastPage, disableButton, enableButton, ITEMS_PER_PAGE } from './pagination.js';

const { listScreenings, movieSelect, roomSelect, screeningForm, stockScreening } = els;


//  VARIABLES GLOBALES

let screenings = []; // ✅ Changé en let
let movies = [];     // ✅ Changé en let
let rooms = [];      // ✅ Changé en let

// État de la pagination
let state = {
    currentPage: 1,
    itemsPerPage: ITEMS_PER_PAGE
};


//  FONCTION DE CHARGEMENT DES DONNÉES

const loadData = async () => {
    try {
        screenings = await apiFetch('list_screenings');
        movies = await apiFetch('list_movies');
        rooms = await apiFetch('list_rooms');
        console.log('✅ Données chargées:', { screenings: screenings.length, movies: movies.length, rooms: rooms.length });
    } catch (error) {
        console.error('❌ Erreur chargement:', error);
        alert('Erreur lors du chargement des données');
    }
};

//  Chargement initial
await loadData();


// ÉLÉMENTS DOM

const btnPrevScreening = document.getElementById('btnPrevScreening');
const btnNextScreening = document.getElementById('btnNextScreening');
const pageInfoScreening = document.getElementById('pageInfoScreening');


// FONCTION POUR REMPLIR LES SELECTS

const populateSelects = () => {
    // Remplir le select des films
    if (movieSelect && movies.length > 0) {
        movieSelect.innerHTML = '<option value="">Choisissez un film...</option>';
        movies.forEach(movie => {
            const option = new Option(movie.title, movie.id);
            movieSelect.appendChild(option);
        });
    }

    // Remplir le select des salles (SEULEMENT les actives)
    if (roomSelect && rooms.length > 0) {
        roomSelect.innerHTML = '<option value="">Choisissez une salle...</option>';
        const activeRooms = rooms.filter(room => room.active == 1);

        if (activeRooms.length === 0) {
            const option = new Option('Aucune salle active disponible', '');
            option.disabled = true;
            roomSelect.appendChild(option);
        } else {
            activeRooms.forEach(room => {
                const option = new Option(
                    `${room.name} (${room.capacity} places - ${room.type})`,
                    room.id
                );
                roomSelect.appendChild(option);
            });
        }
    }
};

// Remplissage initial
populateSelects();


// FONCTIONS UTILITAIRES

const displayMovie = (movie_id) => {
    const movie = movies.find(m => m.id == movie_id);
    return movie ? movie.title : 'Film inconnu';
};

const displayRoom = (room_id) => {
    const room = rooms.find(r => r.id == room_id);
    return room ? `${room.name} (${room.type})` : 'Salle inconnue';
};


// MISE À JOUR DU COMPTEUR

const updateStockCounter = () => {
    if (stockScreening) {
        stockScreening.textContent = `Séance${screenings.length > 1 ? 's' : ''} programmée${screenings.length > 1 ? 's' : ''} : ${screenings.length} 🎟️`;
    }
};


// CRÉATION DU TABLEAU

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


// FONCTION POUR CRÉER UNE LIGNE

const createScreeningRow = (screening) => {
    const tr = document.createElement('tr');
    tr.dataset.id = screening.id;
    tr.innerHTML = `
        <td class="text-center screening-id">${screening.id}</td>
        <td class="screening-movie-id">${displayMovie(screening.movie_id)}</td>
        <td class="screening-room-id">${displayRoom(screening.room_id)}</td>
        <td class="text-center screening-startime">${formatDate(screening.start_time)}</td>
        <td class="text-center actions">
            <button class="btn btn-sm btn-warning edit-row-btn" data-id="${screening.id}" title="Modifier">
                <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-info view-more-btn" data-id="${screening.id}" title="Détails">
                <i class="bi bi-eye"></i>
            </button>
            <button class="btn btn-sm btn-danger delete-row-btn" data-id="${screening.id}" title="Supprimer">
                <i class="bi bi-trash"></i>
            </button>
        </td>
    `;
    return tr;
};


// FONCTION POUR AFFICHER LES SÉANCES

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
    updateStockCounter();
};


// MISE À JOUR DE L'UI DE PAGINATION

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


// GESTIONNAIRES DE PAGINATION

if (btnPrevScreening) {
    btnPrevScreening.addEventListener('click', () => {
        if (state.currentPage > 1) {
            state.currentPage--;
            renderScreenings();
            console.log('⬅️ Page précédente:', state.currentPage);
        }
    });
}

if (btnNextScreening) {
    btnNextScreening.addEventListener('click', () => {
        const totalPages = Math.ceil(screenings.length / state.itemsPerPage);
        if (state.currentPage < totalPages) {
            state.currentPage++;
            renderScreenings();
            console.log('➡️ Page suivante:', state.currentPage);
        }
    });
}


// FONCTION POUR ACTIVER LE MODE ÉDITION

const cancelAllEdits = () => {
    const editingRows = document.querySelectorAll('.editing-mode');
    if (editingRows.length > 0) {
        console.log('🔒 Annulation de', editingRows.length, 'édition(s) en cours');
        renderScreenings(); // Adapter selon le nom de votre fonction render
    }
};

const enableEditMode = (row) => {
    cancelAllEdits(); // Annuler les autres éditions en cours
    const screeningId = row.dataset.id;
    const screening = screenings.find(s => s.id == screeningId);
    const activeRooms = rooms.filter(room => room.active == 1);

    if (!screening) {
        alert('Séance introuvable');
        return;
    }

    row.classList.add('editing-mode');

    row.querySelector(".screening-startime").innerHTML =
        `<input type="datetime-local" class="inline-input" 
                value="${sqlToDateTimeLocal(screening.start_time)}" 
                data-field="start_time">`;

    row.querySelector(".screening-movie-id").innerHTML =
        `<select class="inline-select" data-field="movie_id">
            ${movies.map(movie => `<option value="${movie.id}"${movie.id == screening.movie_id ? ' selected' : ''}>${movie.title}</option>`).join('')}
        </select>`;
    if (activeRooms.length === 0) {
        const option = new Option('Aucune salle active disponible', '');
        option.disabled = true;
        roomSelect.appendChild(option);
        row.querySelector(".screening-room-id").innerHTML = `<span class="text-danger">Aucune salle active</span>`;
        return;
    } else {
        row.querySelector(".screening-room-id").innerHTML =
            `<select class="inline-select" data-field="room_id">
            ${activeRooms.map(room => `<option value="${room.id}"${room.id == screening.room_id ? ' selected' : ''}>${room.name} (${room.type})</option>`).join('')}
        </select>`;
    }

    row.querySelector(".actions").innerHTML = `
        <button class="btn btn-sm btn-success save-row-btn" data-id="${screening.id}" title="Sauvegarder">
            <i class="bi bi-check-lg"></i>
        </button>
        <button class="btn btn-sm btn-secondary cancel-edit-btn" data-id="${screening.id}" title="Annuler">
            <i class="bi bi-x-lg"></i>
        </button>
    `;
};


// FONCTION POUR SAUVEGARDER

const saveScreening = async (row) => {
    const screeningId = row.dataset.id;
    const screeningData = {
        movie_id: parseInt(row.querySelector('.inline-select[data-field="movie_id"]').value, 10),
        room_id: parseInt(row.querySelector('.inline-select[data-field="room_id"]').value, 10),
        start_time: row.querySelector('.inline-input[data-field="start_time"]').value
    };

    if (!screeningData.movie_id || !screeningData.room_id || !screeningData.start_time) {
        alert('❌ Veuillez remplir tous les champs');
        return;
    }

    try {
        const result = await apiPut('screening', screeningId, screeningData);
        if (result && result.success) {
            alert('✅ Séance mise à jour ! 🎬');

            // ✅ Mise à jour locale
            const screeningIndex = screenings.findIndex(s => s.id == screeningId);
            if (screeningIndex !== -1) {
                screenings[screeningIndex] = { ...screenings[screeningIndex], ...screeningData };
            }

            renderScreenings();
            console.log('✅ Séance modifiée, ID:', screeningId);
        } else {
            alert(`❌ Erreur : ${result.error || 'Erreur lors de la mise à jour'}`);
        }
    } catch (error) {
        console.error('❌ Erreur:', error);
        alert(`❌ Erreur : ${error.message}`);
    }
};


// FONCTION POUR ANNULER

const cancelEdit = () => {
    renderScreenings();
};


// FONCTION DE SUPPRESSION

const executeDelete = async (type, id) => {
    try {
        const data = await apiDelete(type, id);

        if (data.success) {
            alert('✅ Séance supprimée !');

            // ✅ Suppression locale
            const index = screenings.findIndex(s => s.id == id);
            if (index !== -1) {
                screenings.splice(index, 1);
            }

            renderScreenings();
            console.log('🗑️ Séance supprimée, ID:', id);
        } else {
            alert(`❌ Erreur : ${data.error || 'Erreur lors de la suppression'}`);
        }
    } catch (error) {
        console.error('❌ Erreur:', error);
        alert(`❌ Erreur : ${error.message}`);
    }
};


// FONCTION POUR AFFICHER LES DÉTAILS

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


// GESTIONNAIRE D'ÉVÉNEMENTS PRINCIPAL

if (screeningTableBody) {
    screeningTableBody.addEventListener('click', async (e) => {
        const row = e.target.closest('tr');
        if (!row) return;

        // Suppression
        if (e.target.closest('.delete-row-btn')) {
            const screeningId = e.target.closest('.delete-row-btn').dataset.id;
            const screening = screenings.find(s => s.id == screeningId);

            if (screening && confirm(`Supprimer la séance "${displayMovie(screening.movie_id)}" ?\n\nCette action est irréversible.`)) {
                await executeDelete('screening', screeningId);
            }
            return;
        }

        // Modification
        if (e.target.closest('.edit-row-btn')) {
            enableEditMode(row);
            return;
        }

        // Sauvegarde
        if (e.target.closest('.save-row-btn')) {
            await saveScreening(row);
            return;
        }

        // Annulation
        if (e.target.closest('.cancel-edit-btn')) {
            cancelEdit();
            return;
        }

        // Détails
        if (e.target.closest('.view-more-btn')) {
            const screeningId = e.target.closest('.view-more-btn').dataset.id;
            showScreeningDetails(screeningId);
            return;
        }
    });
}


// FORMULAIRE D'AJOUT (DYNAMIQUE)

if (screeningForm) {
    screeningForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
            movie_id: parseInt(document.getElementById('movieSelect').value, 10),
            room_id: parseInt(document.getElementById('roomSelect').value, 10),
            start_time: document.getElementById('startTime').value
        };

        if (!data.movie_id || !data.room_id || !data.start_time) {
            alert('❌ Veuillez remplir tous les champs');
            return;
        }

        try {
            const result = await apiPost('add_screening', data);

            if (result.success) {
                alert('✅ Séance créée avec succès ! 🎬');

                // ✅ Recharger les données dynamiquement
                await loadData();

                // ✅ Réinitialiser le formulaire
                screeningForm.reset();

                // ✅ Réinitialiser l'heure par défaut
                initializeStartTime();

                // ✅ Mettre à jour les selects
                populateSelects();

                // ✅ Réafficher la première page
                state.currentPage = 1;
                renderScreenings();

                console.log('✅ Séance ajoutée');
            } else {
                alert(`❌ Erreur : ${result.error || 'Erreur inconnue'}`);
            }
        } catch (error) {
            console.error('❌ Erreur:', error);
            alert(`❌ Erreur : ${error.message}`);
        }
    });
}


// INITIALISATION DU CHAMP DATE/HEURE

const initializeStartTime = () => {
    const startTimeInput = document.getElementById('startTime');

    if (startTimeInput) {
        const minDateTime = getCurrentDateTimeLocal();

        // Empêcher la sélection de dates passées
        startTimeInput.setAttribute('min', minDateTime);

        // Pré-remplir avec l'heure actuelle + 1h
        const oneHourLater = new Date();
        oneHourLater.setHours(oneHourLater.getHours() + 1);
        const year = oneHourLater.getFullYear();
        const month = String(oneHourLater.getMonth() + 1).padStart(2, '0');
        const day = String(oneHourLater.getDate()).padStart(2, '0');
        const hours = String(oneHourLater.getHours()).padStart(2, '0');
        const minutes = '00'; // Arrondir à l'heure pile
        startTimeInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
    }
};

// Initialisation au chargement
initializeStartTime();


// AFFICHAGE INITIAL

renderScreenings();

console.log('✅ screen.js chargé avec succès', {
    screenings: screenings.length,
    movies: movies.length,
    rooms: rooms.length
});