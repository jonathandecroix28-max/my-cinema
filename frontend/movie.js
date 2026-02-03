// ✅ Imports en premier
import { apiFetch, truncateText, apiDelete, apiPost } from './config.js';
import { els } from './dom-elements.js';

const { movieSelect, formMovie, listScreenings, stockMovie } = els;

// Récupération des films
const movies = await apiFetch('list_movies');

// Création du tableau des films
const movieTable = document.createElement('table');
movieTable.className = 'table table-bordered table-striped mt-4';
movieTable.innerHTML = `
    <thead>
        <tr>
            <th>ID</th>
            <th>Titre</th>
            <th>Résumé</th>
            <th>Durée</th>
            <th>Genre</th>
            <th>Réalisateur</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody id="movieTableBody"></tbody>
`;

// ✅ D'abord ajouter au DOM
if (listScreenings) {
    listScreenings.appendChild(movieTable);
}

// ✅ PUIS récupérer le tbody
const movieTableBody = document.getElementById('movieTableBody');

// Remplir le tableau et le select
if (movieTableBody && movies.length > 0) {
    movies.forEach(movie => {
        // Remplir le select (si présent)
        if (movieSelect) {
            const option = new Option(movie.title, movie.id);
            movieSelect.appendChild(option);
        }

        // Créer la ligne du tableau
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${movie.id}</td>
            <td>${movie.title}</td>
            <td>${truncateText(movie.description, 50)}</td>
            <td>${movie.duration} min</td>
            <td>${movie.genre}</td>
            <td>${movie.director || 'N/A'}</td>
            <td>
                <button class="btn btn-danger btn-sm delete-row-btn" data-id="${movie.id}">
                    <i class="bi bi-trash"></i>
                </button>
                <button class="btn btn-secondary btn-sm" disabled>
                    <i class="bi bi-pencil"></i>
                </button>
            </td>
        `;
        movieTableBody.appendChild(tr);
    });
}

// Fonction de suppression
const executeDelete = async (type, id, rowElement) => {
    try {
        const data = await apiDelete(type, id);

        if (data.success) {
            alert(`${type} supprimé !`);
            rowElement.remove();

            // Supprimer du select aussi
            const option = document.querySelector(`select option[value="${id}"]`);
            if (option) option.remove();
        } else {
            alert(data.error);
        }
    } catch (error) {
        alert(`Erreur : ${error.message}`);
    }
};

// ✅ Gestionnaire de suppression avec vérification
if (movieTableBody) {
    movieTableBody.addEventListener('click', async (e) => {
        const btn = e.target.closest('.delete-row-btn');
        if (btn) {
            const movieId = btn.dataset.id;
            if (confirm("Supprimer ce film ?")) {
                await executeDelete('movie', movieId, btn.closest('tr'));
            }
        }
    });
}

// ✅ Formulaire d'ajout avec vérification
if (formMovie) {
    formMovie.addEventListener('submit', async (e) => {
        e.preventDefault();

        const movieData = {
            title: document.getElementById('movieTitle').value,
            description: document.getElementById('movieSummary').value,
            duration: document.getElementById('movieDuration').value,
            genre: document.getElementById('movieGenre').value,
            director: document.getElementById('movieDirector').value,
            release_year: document.getElementById('movieReleaseYear').value
        };

        try {
            await apiPost('add_movie', movieData);
            alert('Film ajouté avec succès 🎬');
            location.reload();
        } catch (error) {
            alert(`Erreur : ${error.message}`);
        }
    });
}

// Afficher le compteur
if (stockMovie) {
    stockMovie.textContent = `Film${movies.length > 1 ? 's' : ''} en stock: ${movies.length} 🎬`;
}

console.log('✅ movie.js chargé', { movies: movies.length });