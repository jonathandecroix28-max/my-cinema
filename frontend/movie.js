// ✅ Imports
import { apiFetch, truncateText, apiDelete, apiPost, apiPut } from './config.js';
import { els } from './dom-elements.js';

const { movieSelect, formMovie, listScreenings, stockMovie } = els;

// Récupération des films
const movies = await apiFetch('list_movies');

// Création du tableau
const movieTable = document.createElement('table');
movieTable.className = 'table table-bordered table-striped mt-4';
movieTable.innerHTML = `
    <thead>
        <tr>
            <th>ID</th>
            <th>Titre</th>
            <th>Description</th>
            <th>Durée (min)</th>
            <th>Genre</th>
            <th>Réalisateur</th>
            <th>Année de sortie</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody id="movieTableBody"></tbody>
`;

if (listScreenings) {
    listScreenings.appendChild(movieTable);
}

const movieTableBody = document.getElementById('movieTableBody');

// ✅ ÉTAPE 1 : Fonction pour créer une ligne de tableau
const createMovieRow = (movie) => {
    const tr = document.createElement('tr');
    tr.dataset.id = movie.id;
    tr.innerHTML = `
        <td class="movie-id">${movie.id}</td>
        <td class="movie-title">${movie.title}</td>
        <td class="movie-description">${truncateText(movie.description, 50)}</td>
        <td class="movie-duration">${movie.duration}</td>
        <td class="movie-genre">${movie.genre}</td>
        <td class="movie-director">${movie.director || 'N/A'}</td>
        <td class="movie-year">${movie.release_year}</td>
        <td class="actions">
            <button class="btn btn-danger btn-sm delete-row-btn" data-id="${movie.id}">
                <i class="bi bi-trash"></i>
            </button>
            <button class="btn btn-warning btn-sm edit-row-btn" data-id="${movie.id}">
                <i class="bi bi-pencil"></i> Modifier
            </button>
        </td>
    `;
    return tr;
};

// Remplir le tableau
if (movieTableBody && movies.length > 0) {
    movies.forEach(movie => {
        // Remplir le select
        if (movieSelect) {
            const option = new Option(movie.title, movie.id);
            movieSelect.appendChild(option);
        }

        // Ajouter la ligne
        movieTableBody.appendChild(createMovieRow(movie));
    });
}

// ✅ ÉTAPE 2 : Fonction pour transformer une ligne en mode édition
const enableEditMode = (row) => {
    const movieId = row.dataset.id;
    const movie = movies.find(m => m.id == movieId);
    if (!movie) return;

    // Marquer la ligne comme en édition
    row.classList.add('editing-mode');

    // Transformer chaque cellule en input
    row.querySelector('.movie-title').innerHTML =
        `<input type="text" class="inline-input" value="${movie.title}" data-field="title">`;

    row.querySelector('.movie-description').innerHTML =
        `<textarea class="inline-textarea" data-field="description">${movie.description}</textarea>`;

    row.querySelector('.movie-duration').innerHTML =
        `<input type="number" class="inline-input" value="${movie.duration}" data-field="duration">`;

    row.querySelector('.movie-genre').innerHTML =
        `<input type="text" class="inline-input" value="${movie.genre}" data-field="genre">`;

    row.querySelector('.movie-director').innerHTML =
        `<input type="text" class="inline-input" value="${movie.director || ''}" data-field="director">`;

    row.querySelector('.movie-year').innerHTML =
        `<input type="text" class="inline-input" value="${movie.release_year}" data-field="release_year">`;

    // Remplacer les boutons d'action
    row.querySelector('.actions').innerHTML = `
        <button class="btn btn-success btn-sm save-row-btn" data-id="${movieId}">
            <i class="bi bi-check-lg"></i> Sauvegarder
        </button>
        <button class="btn btn-secondary btn-sm cancel-edit-btn" data-id="${movieId}">
            <i class="bi bi-x-lg"></i> Annuler
        </button>
    `;
};

// ✅ ÉTAPE 3 : Fonction pour sauvegarder les modifications
const saveMovie = async (row) => {
    const movieId = row.dataset.id;

    // Récupérer toutes les valeurs des inputs
    const movieData = {
        title: row.querySelector('[data-field="title"]').value,
        description: row.querySelector('[data-field="description"]').value,
        duration: row.querySelector('[data-field="duration"]').value,
        genre: row.querySelector('[data-field="genre"]').value,
        director: row.querySelector('[data-field="director"]').value,
        release_year: row.querySelector('[data-field="release_year"]').value
    };

    // Validation
    if (!movieData.title || !movieData.description) {
        alert('Le titre et la description sont obligatoires');
        return;
    }

    try {
        const result = await apiPut('movie', movieId, movieData);

        if (result.success) {
            alert('Film modifié avec succès ! 🎬');

            // Mettre à jour l'objet dans le tableau movies
            const movieIndex = movies.findIndex(m => m.id == movieId);
            if (movieIndex !== -1) {
                movies[movieIndex] = { ...movies[movieIndex], ...movieData };
            }

            // Recréer la ligne en mode normal
            const newRow = createMovieRow(movies[movieIndex]);
            row.replaceWith(newRow);
        } else {
            alert(`Erreur : ${result.error || 'Erreur inconnue'}`);
        }
    } catch (error) {
        alert(`Erreur : ${error.message}`);
    }
};

// ✅ ÉTAPE 4 : Fonction pour annuler l'édition
const cancelEdit = (row) => {
    const movieId = row.dataset.id;
    const movie = movies.find(m => m.id == movieId);

    if (movie) {
        const newRow = createMovieRow(movie);
        row.replaceWith(newRow);
    }
};

// Fonction de suppression
const executeDelete = async (type, id, rowElement) => {
    try {
        const data = await apiDelete(type, id);

        if (data.success) {
            alert(`${type} supprimé !`);
            rowElement.remove();

            // Supprimer du tableau movies
            const index = movies.findIndex(m => m.id == id);
            if (index !== -1) {
                movies.splice(index, 1);
            }

            // Supprimer du select
            const option = document.querySelector(`select option[value="${id}"]`);
            if (option) option.remove();
        } else {
            alert(data.error);
        }
    } catch (error) {
        alert(`Erreur : ${error.message}`);
    }
};

// ✅ ÉTAPE 5 : Gestionnaire d'événements PRINCIPAL (délégation d'événements)
if (movieTableBody) {
    movieTableBody.addEventListener('click', async (e) => {
        const row = e.target.closest('tr');
        if (!row) return;

        // 🗑️ Suppression
        if (e.target.closest('.delete-row-btn')) {
            const movieId = e.target.closest('.delete-row-btn').dataset.id;
            if (confirm("Supprimer ce film ?")) {
                await executeDelete('movie', movieId, row);
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
            await saveMovie(row);
            return;
        }

        // ❌ Annulation
        if (e.target.closest('.cancel-edit-btn')) {
            cancelEdit(row);
            return;
        }
    });
}

// ✅ Formulaire d'ajout (inchangé)
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
            const result = await apiPost('add_movie', movieData);

            if (result.success) {
                alert('Film ajouté avec succès 🎬');
                location.reload();
            } else {
                alert(`Erreur : ${result.error || 'Erreur inconnue'}`);
            }
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