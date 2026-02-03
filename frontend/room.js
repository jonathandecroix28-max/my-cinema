import { els } from './dom-elements.js';
import { apiFetch, apiDelete, apiPost } from './config.js';

const { roomSelect, formRoom, listScreenings } = els;

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

// ✅ CORRECTION : D'abord ajouter au DOM
listScreenings.appendChild(roomTable);

// ✅ PUIS récupérer l'élément
const roomTableBody = document.getElementById('roomTableBody');

// On vérifie que le corps du tableau existe avant de boucler
if (roomTableBody) {
    rooms.forEach(room => {
        // 1. Remplir le select (si il existe sur cette page)
        if (roomSelect) {
            const option = new Option(room.name, room.id);
            roomSelect.appendChild(option);
        }

        // 2. Créer la ligne du tableau (DANS la boucle !)
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${room.id}</td>
            <td>${room.name}</td>
            <td>${room.capacity}</td>
            <td>${room.type}</td>
            <td>${room.active ? 'Oui' : 'Non'}</td>
            <td>
                <button class="btn btn-danger delete-row-btn" data-id="${room.id}"><i class="bi bi-trash"></i> Supprimer</button>
                <button class="btn btn-secondary btn-sm" disabled>Édition</button>
            </td>
        `;
        roomTableBody.appendChild(row);
    });
}

const executeDelete = async (type, id, rowElement) => {
    try {
        await apiDelete(type, id);
        rowElement.remove();
    } catch (error) {
        alert(`Erreur lors de la suppression : ${error.message}`);
    }
};

// ✅ CORRECTION : Vérification avant addEventListener
if (roomTableBody) {
    roomTableBody.addEventListener('click', async (e) => {
        const btn = e.target.closest('.delete-row-btn');
        if (btn) {
            const roomId = btn.dataset.id;
            if (confirm("Supprimer cette salle ?")) {
                await executeDelete('room', roomId, btn.closest('tr'));
            }
        }
    });
}

// ✅ CORRECTION : Vérification du formulaire
if (formRoom) {
    formRoom.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(formRoom);
        const data = {
            name: formData.get('name'),
            capacity: parseInt(formData.get('capacity'), 10)
        };
        try {
            await apiPost('add_room', data);
            alert('Salle ajoutée avec succès !');
            location.reload();
        } catch (error) {
            alert(`Erreur lors de l'ajout de la salle : ${error.message}`);
        }
    });
}

console.log({ roomSelect, roomTableBody, formRoom });