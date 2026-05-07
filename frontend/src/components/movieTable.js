export function createMovieTable(movies, onDelete) {
    const table = document.createElement('table');
    table.className = 'table table-bordered table-striped mt-4';
    
    table.innerHTML = `
        <thead>
            <tr>
                <th>ID</th>
                <th>Titre</th>
                <th>Résumé</th>
                <th>Durée</th>
                <th>Genre</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody id="movieTableBody"></tbody>
    `;
    
    const tbody = table.querySelector('#movieTableBody');
    
    movies.forEach(movie => {
        const tr = createMovieRow(movie);
        tbody.appendChild(tr);
    });
    
    tbody.addEventListener('click', async (e) => {
        const btn = e.target.closest('.delete-row-btn');
        if (btn && confirm("Supprimer ce film ?")) {
            const movieId = btn.dataset.id;
            await onDelete(movieId, btn.closest('tr'));
        }
    });
    
    return table;
}

function createMovieRow(movie) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${movie.id}</td>
        <td>${movie.title}</td>
        <td>${movie.description.substring(0, 30)}...</td>
        <td>${movie.duration} min</td>
        <td>${movie.genre}</td>
        <td>
            <button class="btn btn-danger btn-sm delete-row-btn" data-id="${movie.id}">
                <i class="bi bi-trash"></i>
            </button>
        </td>
    `;
    return tr;
}

export function populateMovieSelect(movies, selectElement) {
    selectElement.innerHTML = '';
    movies.forEach(movie => {
        const option = new Option(movie.title, movie.id);
        selectElement.appendChild(option);
    });
}
