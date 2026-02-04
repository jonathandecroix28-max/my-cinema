import { els } from './dom-elements.js';
import { apiFetch, apiDelete, apiPost } from './config.js';

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

// Remplir le tableau et le select
if (roomTableBody && rooms.length > 0) {
    rooms.forEach(room => {
        // 1. Remplir le select (si il existe sur cette page)
        if (roomSelect) {
            const option = new Option(room.name, room.id);
            roomSelect.appendChild(option);
        }

        // 2. Créer la ligne du tableau
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${room.id}</td>
            <td>${room.name}</td>
            <td>${room.capacity}</td>
            <td>${room.type}</td>
            <td>${room.active ? 'Oui' : 'Non'}</td>
            <td>
                <button class="btn btn-danger btn-sm delete-row-btn" data-id="${room.id}">
                    <i class="bi bi-trash"></i>
                </button>
                <button class="btn btn-secondary btn-sm" disabled>
                    <i class="bi bi-pencil"></i>
                </button>
            </td>
        `;
        roomTableBody.appendChild(row);
    });
}

// Fonction de suppression
const executeDelete = async (type, id, rowElement) => {
    try {
        const result = await apiDelete(type, id);

        if (result.success) {
            alert(`${type} supprimé !`);
            rowElement.remove();

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

// ✅ Gestionnaire de suppression avec vérification
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

// ✅ Formulaire d'ajout CORRIGÉ
if (formRoom) {
    formRoom.addEventListener('submit', async (e) => {
        e.preventDefault();

        // ✅ CORRECTION : Récupérer les bonnes valeurs par ID
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