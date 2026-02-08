
// ROOM.JS - VERSION DYNAMIQUE COMPLÈTE


// ✅ Imports
import { els } from './dom-elements.js';
import { apiFetch, apiDelete, apiPost, apiPut } from './config.js';
import { getPaginatedItems, getPageInfo, isFirstPage, isLastPage, disableButton, enableButton, ITEMS_PER_PAGE } from './pagination.js';
import { roomsDatabase } from './room-data.js';
import { initAuth, requireAdmin, updateAuthUI } from './auth-ui.js';

const { roomSelect, formRoom, listScreenings, stockRoom } = els;


// VARIABLES GLOBALES

let rooms = []; // ✅ Changé en let pour pouvoir modifier

// État de la pagination
let state = {
    currentPage: 1,
    itemsPerPage: ITEMS_PER_PAGE
};


// FONCTION DE CHARGEMENT DES DONNÉES

const loadRooms = async () => {
    try {
        rooms = await apiFetch('list_rooms');
        console.log('✅ Salles chargées:', rooms.length);
    } catch (error) {
        console.error('❌ Erreur chargement:', error);
        alert('Erreur lors du chargement des salles');
    }
};

// ✅ Chargement initial
await loadRooms();

initAuth();
console.log('✅ Auth initialisée dans room.js');

// 🎯 ÉLÉMENTS DOM

const btnPrevRoom = document.getElementById('btnPrevRoom');
const btnNextRoom = document.getElementById('btnNextRoom');
const pageInfoRoom = document.getElementById('pageInfoRoom');


// 📊 CRÉATION DU TABLEAU

const roomTable = document.createElement('table');
roomTable.className = 'table table-bordered table-striped mt-4 table-hover';
roomTable.innerHTML = `
    <thead class="table-dark">
        <tr>
            <th class="text-center">ID</th>
            <th>Nom</th>
            <th class="text-center">Capacité</th>
            <th class="text-center">Type</th>
            <th class="text-center">Active</th>
            <th class="text-center">Actions</th>
        </tr>
    </thead>
    <tbody id="roomTableBody"></tbody>
`;

if (listScreenings) {
    listScreenings.appendChild(roomTable);
}

const roomTableBody = document.getElementById('roomTableBody');


// 🎨 FONCTION POUR CRÉER UNE LIGNE

const createRoomRow = (room) => {
    const tr = document.createElement('tr');
    tr.dataset.id = room.id;
    tr.innerHTML = `
        <td class="text-center room-id">${room.id}</td>
        <td class="room-name">${room.name}</td>
        <td class="text-center room-capacity">${room.capacity}</td>
        <td class="text-center room-type">
            <span class="badge bg-${room.type === 'IMAX' ? 'danger' : room.type === '3D' ? 'warning' : 'secondary'}">
                ${room.type}
            </span>
        </td>
        <td class="text-center room-active">
            <span class="badge bg-${room.active ? 'success' : 'secondary'}">
                ${room.active ? '✓ Oui' : '✗ Non'}
            </span>
        </td>
        <td class="text-center actions">
           
            <button class="btn btn-sm btn-warning edit-row-btn admin-only" data-id="${room.id}" title="Modifier">
                <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-info view-more-btn" data-id="${room.id}" title="Détails">
                <i class="bi bi-eye"></i>
            </button> 
            <button class="btn btn-sm btn-secondary delete-row-btn admin-only" data-id="${room.id}" title="Mettre dans la corbeille">
                <i class="bi bi-trash"></i>
            </button>
        </td>
    `;
    return tr;
};


// 🖼️ FONCTION POUR AFFICHER LES SALLES

const renderRooms = () => {
    if (!roomTableBody) return;

    roomTableBody.innerHTML = '';
    const paginatedRooms = getPaginatedItems(rooms, state.currentPage, state.itemsPerPage);

    if (paginatedRooms.length > 0) {
        paginatedRooms.forEach(room => {
            roomTableBody.appendChild(createRoomRow(room));
        });
    } else {
        roomTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Aucune salle trouvée</td></tr>';
    }

    updatePaginationUI();
    updateStockCounter();
    updateRoomSelect();
    updateAuthUI();
};


// 🔄 MISE À JOUR DU COMPTEUR

const updateStockCounter = () => {
    if (stockRoom) {
        stockRoom.textContent = `Salle${rooms.length > 1 ? 's' : ''} en stock: ${rooms.length} 🏟️`;
    }
};


// 🔄 MISE À JOUR DU SELECT

const updateRoomSelect = () => {
    if (roomSelect) {
        roomSelect.innerHTML = '<option value="">Choisissez une salle...</option>';
        rooms.forEach(room => {
            const option = new Option(
                `${room.name} (${room.capacity} places - ${room.type})`,
                room.id
            );
            if (!room.active) option.disabled = true;
            roomSelect.appendChild(option);
        });
    }
};


// 📄 MISE À JOUR DE L'UI DE PAGINATION

const updatePaginationUI = () => {
    if (pageInfoRoom) {
        pageInfoRoom.textContent = getPageInfo(state.currentPage, rooms.length, state.itemsPerPage);
    }

    if (isFirstPage(state.currentPage)) {
        disableButton(btnPrevRoom);
    } else {
        enableButton(btnPrevRoom);
    }

    if (isLastPage(state.currentPage, rooms.length, state.itemsPerPage)) {
        disableButton(btnNextRoom);
    } else {
        enableButton(btnNextRoom);
    }
};


// 📄 GESTIONNAIRES DE PAGINATION

if (btnPrevRoom) {
    btnPrevRoom.addEventListener('click', () => {
        if (state.currentPage > 1) {
            state.currentPage--;
            renderRooms();
            console.log('⬅️ Page précédente:', state.currentPage);
        }
    });
}

if (btnNextRoom) {
    btnNextRoom.addEventListener('click', () => {
        const totalPages = Math.ceil(rooms.length / state.itemsPerPage);
        if (state.currentPage < totalPages) {
            state.currentPage++;
            renderRooms();
            console.log('➡️ Page suivante:', state.currentPage);
        }
    });
}


// �� AUTO-REMPLISSAGE DU FORMULAIRE

const autoFillForm = (selectedRoom) => {
    let room = roomsDatabase.find(r => r.name.toLowerCase() === selectedRoom.toLowerCase());
    if (!room) {
        room = rooms.find(r => r.name.toLowerCase() === selectedRoom.toLowerCase());
    }

    if (room) {
        const capacityInput = document.getElementById('capacity');
        const typeInput = document.getElementById('typeRoom');
        const activeInput = document.getElementById('activeRoom');

        if (capacityInput) {
            capacityInput.value = room.capacity;
            capacityInput.style.backgroundColor = '#d4edda';
            setTimeout(() => { capacityInput.style.backgroundColor = ''; }, 1000);
        }
        if (typeInput) {
            typeInput.value = room.type;
            typeInput.style.backgroundColor = '#d4edda';
            setTimeout(() => { typeInput.style.backgroundColor = ''; }, 1000);
        }
        if (activeInput) {
            activeInput.value = room.active;
            activeInput.style.backgroundColor = '#d4edda';
            setTimeout(() => { activeInput.style.backgroundColor = ''; }, 1000);
        }
    }
};


// ✏️ FONCTION POUR ACTIVER LE MODE ÉDITION



// 🔒 DÉSACTIVER TOUTES LES ÉDITIONS EN COURS


/**
 * Annule toutes les éditions en cours et réaffiche le tableau
 */
const cancelAllEdits = () => {
    const editingRows = document.querySelectorAll('.editing-mode');
    if (editingRows.length > 0) {
        console.log('🔒 Annulation de', editingRows.length, 'édition(s) en cours');
        renderRooms(); // Réafficher pour tout réinitialiser
    }
};

const enableEditMode = async (row) => {
    if (!requireAdmin()) return;
    cancelAllEdits(); // Annuler les autres éditions en cours
    const roomId = row.dataset.id;
    const room = rooms.find(r => r.id == roomId);
    if (!room) return;

    // ✅ NOUVELLE VÉRIFICATION : Vérifier les séances futures
    if (room.active == 1) {
        try {
            const response = await fetch(`../backend/index.php?action=check_room_screenings&id=${roomId}`);
            const result = await response.json();

            if (result.has_future_screenings && result.count > 0) {
                const msg = `⚠️ ATTENTION !\n\nCette salle a ${result.count} séance(s) future(s).\n\nSi vous la désactivez, ces séances ne seront plus disponibles à la réservation.\n\nVoulez-vous continuer ?`;
                if (!confirm(msg)) {
                    return;
                }
            }
        } catch (error) {
            console.warn('Impossible de vérifier les séances:', error);
        }
    }

    row.classList.add('editing-mode');

    row.querySelector('.room-name').innerHTML =
        `<input type="text" class="inline-input" value="${room.name}" data-field="name">`;

    row.querySelector('.room-capacity').innerHTML =
        `<input type="number" class="inline-input" value="${room.capacity}" data-field="capacity" min="1" max="1000">`;

    row.querySelector('.room-type').innerHTML =
        `<select class="inline-select" data-field="type">
            <option value="2D"${room.type === '2D' ? ' selected' : ''}>2D</option>
            <option value="3D"${room.type === '3D' ? ' selected' : ''}>3D</option>
            <option value="IMAX"${room.type === 'IMAX' ? ' selected' : ''}>IMAX</option>
        </select>`;

    row.querySelector('.room-active').innerHTML =
        `<select class="inline-select" data-field="active">
            <option value="1"${room.active == 1 ? ' selected' : ''}>Oui</option>
            <option value="0"${room.active == 0 ? ' selected' : ''}>Non</option>
        </select>`;

    row.querySelector('.actions').innerHTML = `
        <button class="btn btn-sm btn-success save-row-btn" data-id="${roomId}" title="Sauvegarder">
            <i class="bi bi-check-lg"></i>
        </button>
        <button class="btn btn-sm btn-secondary cancel-edit-btn" data-id="${roomId}" title="Annuler">
            <i class="bi bi-x-lg"></i>
        </button>
    `;
};


// 💾 FONCTION POUR SAUVEGARDER LES MODIFICATIONS

const saveRoom = async (row) => {
    if (!requireAdmin()) return;
    const roomId = row.dataset.id;

    const roomData = {
        name: row.querySelector('[data-field="name"]').value,
        capacity: parseInt(row.querySelector('[data-field="capacity"]').value, 10),
        type: row.querySelector('[data-field="type"]').value,
        active: parseInt(row.querySelector('[data-field="active"]').value, 10)
    };

    if (!roomData.name || !roomData.capacity) {
        alert('Veuillez indiquer le nom et la capacité');
        return;
    }

    if (roomData.capacity < 1 || roomData.capacity > 1000) {
        alert('La capacité doit être entre 1 et 1000 places.');
        return;
    }

    try {
        const result = await apiPut('room', roomId, roomData);
        if (result.success) {
            alert('✅ Salle modifiée avec succès ! 🏟️');

            // ✅ Mise à jour locale
            const roomIndex = rooms.findIndex(r => r.id == roomId);
            if (roomIndex !== -1) {
                rooms[roomIndex] = { ...rooms[roomIndex], ...roomData };
            }

            renderRooms();
            console.log('✅ Salle modifiée, ID:', roomId);
        } else {
            alert(`❌ Erreur : ${result.error || 'Erreur inconnue'}`);
        }
    } catch (error) {
        console.error('❌ Erreur:', error);
        alert(`❌ Erreur : ${error.message}`);
    }
};


// ❌ FONCTION POUR ANNULER L'ÉDITION

const cancelEdit = () => {
    renderRooms();
};


// 🗑️ FONCTION DE SUPPRESSION

const executeDelete = async (type, id) => {
    if (!requireAdmin()) return;
    try {
        const result = await apiDelete(type, id);

        if (result.success) {
            alert('✅ Salle supprimée !');

            // ✅ Suppression locale
            const index = rooms.findIndex(r => r.id == id);
            if (index !== -1) {
                rooms.splice(index, 1);
            }

            renderRooms();
            console.log('🗑️ Salle supprimée, ID:', id);
        } else {
            alert(`❌ Erreur : ${result.error || 'Erreur inconnue'}`);
        }
    } catch (error) {
        console.error('❌ Erreur:', error);
        alert(`❌ Erreur : ${error.message}`);
    }
};


// 👁️ FONCTION POUR AFFICHER LES DÉTAILS

const showRoomDetails = (roomId) => {
    const room = rooms.find(r => r.id == roomId);
    if (!room) return;

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
            max-width: 500px;
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
                🏟️ ${room.name}
            </h3>
            
            <div style="margin: 20px 0; display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
                    <strong style="color: #2c3e50; display: block; margin-bottom: 5px;">ID :</strong>
                    <span style="color: #555; font-size: 1.2rem;">#${room.id}</span>
                </div>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
                    <strong style="color: #2c3e50; display: block; margin-bottom: 5px;">Capacité :</strong>
                    <span style="color: #555; font-size: 1.2rem;">${room.capacity} places</span>
                </div>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
                    <strong style="color: #2c3e50; display: block; margin-bottom: 5px;">Type :</strong>
                    <span style="color: #555; font-size: 1.2rem;">${room.type}</span>
                </div>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
                    <strong style="color: #2c3e50; display: block; margin-bottom: 5px;">Statut :</strong>
                    <span style="color: ${room.active ? '#28a745' : '#6c757d'}; font-size: 1.2rem; font-weight: bold;">
                        ${room.active ? '✓ Active' : '✗ Inactive'}
                    </span>
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


// 🖱️ GESTIONNAIRE D'ÉVÉNEMENTS PRINCIPAL

if (roomTableBody) {
    roomTableBody.addEventListener('click', async (e) => {
        const row = e.target.closest('tr');
        if (!row) return;

        // Suppression
        if (e.target.closest('.delete-row-btn')) {
            const roomId = e.target.closest('.delete-row-btn').dataset.id;
            const room = rooms.find(r => r.id == roomId);

            if (room && confirm(`Mettre dans la corbeille ? "${room.name}" ?\n\n`)) {
                await executeDelete('room', roomId);
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
            await saveRoom(row);
            return;
        }

        // Annulation
        if (e.target.closest('.cancel-edit-btn')) {
            cancelEdit();
            return;
        }

        // Détails
        if (e.target.closest('.view-more-btn')) {
            const roomId = e.target.closest('.view-more-btn').dataset.id;
            showRoomDetails(roomId);
            return;
        }
    });
}


// 📝 FORMULAIRE D'AJOUT (DYNAMIQUE)

if (formRoom) {
    formRoom.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!requireAdmin()) return;
        const data = {
            name: document.getElementById('nameRoom').value,
            capacity: parseInt(document.getElementById('capacity').value, 10),
            type: document.getElementById('typeRoom').value,
            active: parseInt(document.getElementById('activeRoom').value, 10)
        };

        if (!data.name || !data.capacity || data.capacity <= 0 || data.capacity > 1000) {
            alert('❌ Veuillez remplir tous les champs correctement (capacité entre 1 et 1000)');
            return;
        }

        try {
            const result = await apiPost('add_room', data);

            if (result.success) {
                alert('✅ Salle ajoutée avec succès ! 🏟️');

                // ✅ Recharger les données dynamiquement
                await loadRooms();

                // ✅ Réinitialiser le formulaire
                formRoom.reset();

                // ✅ Réafficher la première page
                state.currentPage = 1;
                renderRooms();

                console.log('✅ Salle ajoutée');
            } else {
                alert(`❌ Erreur : ${result.error || 'Erreur inconnue'}`);
            }
        } catch (error) {
            console.error('❌ Erreur:', error);
            alert(`❌ Erreur : ${error.message}`);
        }
    });
}


// 🤖 ÉVÉNEMENTS AUTO-COMPLÉTION

const nameInput = document.getElementById('nameRoom');
if (nameInput) {
    nameInput.addEventListener('input', (e) => {
        const selectedRoom = e.target.value;
        if (selectedRoom.trim()) {
            autoFillForm(selectedRoom);
        }
    });

    nameInput.addEventListener('blur', (e) => {
        const selectedRoom = e.target.value;
        if (selectedRoom.trim()) {
            autoFillForm(selectedRoom);
        }
    });
}


// 📋 DATALIST POUR AUTO-COMPLÉTION

const roomDataList = document.getElementById('listRoom');
if (roomDataList && roomsDatabase) {
    roomsDatabase.forEach(room => {
        const option = document.createElement('option');
        option.value = room.name;
        roomDataList.appendChild(option);
    });
}


// 🎬 AFFICHAGE INITIAL

renderRooms();

console.log('✅ room.js chargé avec succès', {
    rooms: rooms.length
});