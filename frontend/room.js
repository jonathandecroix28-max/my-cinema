import { els } from './dom-elements.js';
import { apiFetch, apiDelete, apiPost, apiPut } from './config.js';
import { roomsDatabase } from './room-data.js';
const { roomSelect, formRoom, listScreenings, stockRoom } = els;

const rooms = await apiFetch('list_rooms');

const roomTable = document.createElement('table');
roomTable.className = 'table table-bordered table-striped mt-4';
roomTable.innerHTML = `
    <thead>
        <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Capacity</th>
            <th>Type</th>
            <th>Active</th>
            <th>Action</th>
        </tr>
    </thead>
    <tbody id="roomTableBody"></tbody>
`;

// ✅ D'abord ajouter au DOM
if (listScreenings) {
    listScreenings.appendChild(roomTable);
}

// ✅ PUIS récupérer l'élément
const roomTableBody = document.getElementById('roomTableBody');

const createRoomRow = (room) => {
    const tr = document.createElement("tr");
    tr.dataset.id = room.id;
    tr.innerHTML = `
        <td class="room-id">${room.id}</td>
        <td class="room-name">${room.name}</td>
        <td class="room-capacity">${room.capacity}</td>
        <td class="room-type">${room.type}</td>
        <td class="room-active">${room.active ? 'Oui' : 'Non'}</td>
        <td class="actions">
            <button class="btn btn-danger btn-sm delete-row-btn" data-id="${room.id}">
                <i class="bi bi-trash"></i>
            </button>
            <button class="btn btn-warning btn-sm edit-row-btn" data-id="${room.id}">
                <i class="bi bi-pencil"></i> Modifier
            </button>
        </td>
    `;
    return tr;
};

// Remplir le tableau et le select
if (roomTableBody && rooms.length > 0) {
    rooms.forEach(room => {
        // 1. Remplir le select (si il existe sur cette page)
        if (roomSelect) {
            const option = new Option(room.name, room.id);
            roomSelect.appendChild(option);
        }

        roomTableBody.appendChild(createRoomRow(room));
    });
}

const enableEditMode = (row) => {
    const roomId = row.dataset.id;
    const room = rooms.find(r => r.id == roomId);
    if (!room) return;

    row.classList.add('editing-mode');

    row.querySelector(".room-name").innerHTML = `<input type="text" class="inline-input" value="${room.name}" data-field="name">`;

    row.querySelector(".room-capacity").innerHTML = `<input type="number" class="inline-input" value="${room.capacity}" data-field="capacity">`;

    row.querySelector(".room-type").innerHTML = `<select class="inline-select" data-field="type">
        <option value="2D"${room.type === '2D' ? ' selected' : ''}>2D</option>
        <option value="3D"${room.type === '3D' ? ' selected' : ''}>3D</option>
        <option value="IMAX"${room.type === 'IMAX' ? ' selected' : ''}>IMAX</option>
    </select>`;

    row.querySelector(".room-active").innerHTML = `<select class="inline-select" data-field="active">
        <option value="1"${room.active == 1 ? ' selected' : ''}>Oui</option>
        <option value="0"${room.active == 0 ? ' selected' : ''}>Non</option>
    </select>`;

    row.querySelector('.actions').innerHTML = `
        <button class="btn btn-success btn-sm save-row-btn" data-id="${room.id}">
            <i class="bi bi-check-lg"></i> Sauvegarder
        </button>
        <button class="btn btn-secondary btn-sm cancel-edit-btn" data-id="${room.id}">
            <i class="bi bi-x-lg"></i> Annuler
        </button>
    `;
};

const saveRoom = async (row) => {
    const roomId = row.dataset.id;

    const roomData = {
        name: row.querySelector('[data-field="name"]').value,
        capacity: parseInt(row.querySelector('[data-field="capacity"]').value, 10), // ✅ CORRIGÉ
        type: row.querySelector('[data-field="type"]').value,
        active: parseInt(row.querySelector('[data-field="active"]').value, 10)
    };

    if (!roomData.name || !roomData.capacity) {
        alert('Veuillez indiquer le nom et la capacité');
        return;
    }

    try {
        const result = await apiPut('room', roomId, roomData);
        if (result.success) {
            alert('Salle modifiée avec succès !');

            const roomIndex = rooms.findIndex(r => r.id == roomId); // ✅ CORRIGÉ == au lieu de =
            if (roomIndex !== -1) {
                rooms[roomIndex] = { ...rooms[roomIndex], ...roomData };
            }

            const newRow = createRoomRow(rooms[roomIndex]);
            row.replaceWith(newRow);
        } else {
            alert(`Erreur : ${result.error || 'Erreur inconnue'}`);
        }
    } catch (error) { // ✅ CORRIGÉ : Ajout du paramètre error
        alert(`Erreur : ${error.message}`);
    }
};

const cancelEdit = (row) => {
    const roomId = row.dataset.id;
    const room = rooms.find(r => r.id == roomId); // ✅ CORRIGÉ == au lieu de =

    if (room) {
        const newRow = createRoomRow(room);
        row.replaceWith(newRow);
    }
};

// Fonction de suppression
const executeDelete = async (type, id, rowElement) => {
    try {
        const result = await apiDelete(type, id);

        if (result.success) {
            alert(`${type} supprimé !`);
            rowElement.remove();

            // Supprimer du tableau rooms
            const index = rooms.findIndex(r => r.id == id);
            if (index !== -1) {
                rooms.splice(index, 1);
            }

            // Supprimer du select aussi
            if (roomSelect) {
                const option = roomSelect.querySelector(`option[value="${id}"]`);
                if (option) option.remove();
            }
        } else {
            alert(result.error || 'Erreur lors de la suppression');
        }
    } catch (error) {
        alert(`Erreur lors de la suppression : ${error.message}`);
    }
};

// ✅ UN SEUL GESTIONNAIRE D'ÉVÉNEMENTS (lignes 163-173 SUPPRIMÉES)
if (roomTableBody) {
    roomTableBody.addEventListener('click', async (e) => {
        const row = e.target.closest('tr');
        if (!row) return;

        // 🗑️ Suppression
        if (e.target.closest('.delete-row-btn')) {
            const roomId = e.target.closest('.delete-row-btn').dataset.id;
            if (confirm("Supprimer cette salle ?")) {
                await executeDelete('room', roomId, row);
            }
            return;
        }

        // ✏️ Édition
        if (e.target.closest('.edit-row-btn')) {
            enableEditMode(row);
            return;
        }

        // 💾 Sauvegarde
        if (e.target.closest('.save-row-btn')) {
            await saveRoom(row);
            return;
        }

        // ❌ Annulation
        if (e.target.closest('.cancel-edit-btn')) {
            cancelEdit(row);
            return;
        }
    });
}

// ✅ Formulaire d'ajout
if (formRoom) {
    formRoom.addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
            name: document.getElementById('nameRoom').value,
            capacity: parseInt(document.getElementById('capacity').value, 10),
            type: document.getElementById('typeRoom').value,
            active: parseInt(document.getElementById('activeRoom').value, 10)
        };

        // Validation
        if (!data.name || !data.capacity || data.capacity <= 0) {
            alert('Veuillez remplir tous les champs correctement');
            return;
        }

        console.log('Données envoyées:', data);

        try {
            const result = await apiPost('add_room', data);
            console.log('Réponse du serveur:', result);

            if (result.success) {
                alert('Salle ajoutée avec succès ! 🏟️');
                location.reload();
            } else {
                alert(`Erreur : ${result.error || 'Erreur inconnue'}`);
            }
        } catch (error) {
            console.error('Erreur complète:', error);
            alert(`Erreur lors de l'ajout de la salle : ${error.message}`);
        }
    });
}

const autoFillForm = (selectedRoom) => {
    let room = roomsDatabase.find(r => r.name.toLowerCase() === selectedRoom.toLowerCase());

    if (!room) {
        room = roomsDatabase.find(r => r.name.toLowerCase() === selectedRoom.toLowerCase());
    }

    if (room) {
        const capacityField = document.getElementById("capacity")
        if (capacityField) capacityField.value = room.capacity || "";
        console.log('Formulaire pertiallement rempli avec:', room.name);
    }
}

const nameInput = document.getElementById("nameRoom");
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
    })
}

const roomDataList = document.getElementById('listRoom');

if (roomDataList && roomsDatabase) {
    roomsDatabase.forEach(room => {
        const option = document.createElement('option');
        option.value = room.name;
        roomDataList.appendChild(option);
    })
}

// Afficher le compteur
if (stockRoom) {
    stockRoom.textContent = `Salle${rooms.length > 1 ? 's' : ''} en stock: ${rooms.length} 🏟️`;
}

console.log('✅ room.js chargé', {
    roomSelect,
    roomTableBody,
    formRoom,
    rooms: rooms.length
});