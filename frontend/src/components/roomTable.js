export function createRoomTable(rooms, onDelete) {
    const table = document.createElement('table');
    table.className = 'table table-bordered table-striped mt-4';
    
    table.innerHTML = `
        <thead>
            <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Capacité</th>
                <th>Type</th>
                <th>Active</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody id="roomTableBody"></tbody>
    `;
    
    const tbody = table.querySelector('#roomTableBody');
    
    rooms.forEach(room => {
        const tr = createRoomRow(room);
        tbody.appendChild(tr);
    });
    
    tbody.addEventListener('click', async (e) => {
        const btn = e.target.closest('.delete-row-btn');
        if (btn && confirm("Supprimer cette salle ?")) {
            const roomId = btn.dataset.id;
            await onDelete(roomId, btn.closest('tr'));
        }
    });
    
    return table;
}

function createRoomRow(room) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${room.id}</td>
        <td>${room.name}</td>
        <td>${room.capacity}</td>
        <td>${room.type}</td>
        <td>${room.active ? 'Oui' : 'Non'}</td>
        <td>
            <button class="btn btn-danger btn-sm delete-row-btn" data-id="${room.id}">
                <i class="bi bi-trash"></i>
            </button>
        </td>
    `;
    return tr;
}

export function populateRoomSelect(rooms, selectElement) {
    selectElement.innerHTML = '';
    rooms.forEach(room => {
        const option = document.createElement('option');
        option.value = room.id;
        option.textContent = room.name;
        selectElement.appendChild(option);
    });
}
