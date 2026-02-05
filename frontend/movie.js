// ✅ Imports CORRIGÉS (sans movieMetadata)
import { apiFetch, truncateText, apiDelete, apiPost, apiPut } from './config.js';
import { els } from './dom-elements.js';
import { getPaginatedItems, getPageInfo, isFirstPage, isLastPage, disableButton, enableButton, ITEMS_PER_PAGE } from './pagination.js';
import { moviesDatabase, genres } from './movie-data.js'; // ✅ SEULEMENT moviesDatabase et genres

const { movieSelect, formMovie, listScreenings, stockMovie } = els;

// ✅ État de la pagination
let state = {
    currentPage: 1,
    itemsPerPage: ITEMS_PER_PAGE
};

const year = document.getElementById('movieReleaseYear');
const currentYear = new Date().getFullYear();
year.setAttribute('min', '1895');
year.setAttribute('max', currentYear.toString());
// Récupération des films depuis l'API
const movies = await apiFetch('list_movies');

// ✅ Remplir le select avec les films de la DB
if (movieSelect && movies.length > 0) {
    movies.forEach(movie => {
        const option = new Option(movie.title, movie.id);
        movieSelect.appendChild(option);
    });
}

// Boutons de pagination
const btnPrevMovie = document.getElementById('btnPrevMovie');
const btnNextMovie = document.getElementById('btnNextMovie');
const pageInfoMovie = document.getElementById('pageInfoMovie');

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

// ✅ Fonction pour créer une ligne de tableau
const createMovieRow = (movie) => {
    const tr = document.createElement('tr');
    tr.dataset.id = movie.id;
    tr.innerHTML = `
        <td class="movie-id">${movie.id}</td>
        <td class="movie-title">${movie.title}</td>
        <td class="movie-description">${truncateText(movie.description, 100)}</td>
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

// ✅ Fonction pour afficher les films paginés
const renderMovies = () => {
    if (!movieTableBody) return;

    movieTableBody.innerHTML = '';
    const paginatedMovies = getPaginatedItems(movies, state.currentPage, state.itemsPerPage);

    if (paginatedMovies.length > 0) {
        paginatedMovies.forEach(movie => {
            movieTableBody.appendChild(createMovieRow(movie));
        });
    } else {
        movieTableBody.innerHTML = '<tr><td colspan="8" class="text-center">Aucun film trouvé</td></tr>';
    }

    updatePaginationUI();
};

// ✅ Fonction pour mettre à jour l'UI de pagination
const updatePaginationUI = () => {
    if (pageInfoMovie) {
        pageInfoMovie.textContent = getPageInfo(state.currentPage, movies.length, state.itemsPerPage);
    }

    if (isFirstPage(state.currentPage)) {
        disableButton(btnPrevMovie);
    } else {
        enableButton(btnPrevMovie);
    }

    if (isLastPage(state.currentPage, movies.length, state.itemsPerPage)) {
        disableButton(btnNextMovie);
    } else {
        enableButton(btnNextMovie);
    }
};

// ✅ Gestionnaires des boutons de pagination
if (btnPrevMovie) {
    btnPrevMovie.addEventListener('click', () => {
        if (state.currentPage > 1) {
            state.currentPage--;
            renderMovies();
        }
    });
}

if (btnNextMovie) {
    btnNextMovie.addEventListener('click', () => {
        const totalPages = Math.ceil(movies.length / state.itemsPerPage);
        if (state.currentPage < totalPages) {
            state.currentPage++;
            renderMovies();
        }
    });
}

// ✅ Fonction pour transformer une ligne en mode édition
const enableEditMode = (row) => {
    const movieId = row.dataset.id;
    const movie = movies.find(m => m.id == movieId);
    if (!movie) return;

    row.classList.add('editing-mode');

    row.querySelector('.movie-title').innerHTML =
        `<input type="text" class="inline-input" list="listTitle" value="${movie.title}" data-field="title">`;

    row.querySelector('.movie-description').innerHTML =
        `<textarea class="inline-textarea" data-field="description">${movie.description}</textarea>`;

    row.querySelector('.movie-duration').innerHTML =
        `<input type="number" class="inline-input" value="${movie.duration}" data-field="duration">`;

    row.querySelector('.movie-genre').innerHTML =
        `<input type="text" class="inline-input" list="genreList" value="${movie.genre}" data-field="genre">`;

    row.querySelector('.movie-director').innerHTML =
        `<input type="text" class="inline-input" value="${movie.director || ''}" data-field="director">`;

    row.querySelector('.movie-year').innerHTML =
        `<input type="text" class="inline-input" min="1895" max="${new Date().getFullYear()}" value="${movie.release_year}" data-field="release_year">`;

    row.querySelector('.actions').innerHTML = `
        <button class="btn btn-success btn-sm save-row-btn" data-id="${movieId}">
            <i class="bi bi-check-lg"></i> Sauvegarder
        </button>
        <button class="btn btn-secondary btn-sm cancel-edit-btn" data-id="${movieId}">
            <i class="bi bi-x-lg"></i> Annuler
        </button>
    `;
};

// ✅ Fonction pour sauvegarder les modifications
const saveMovie = async (row) => {
    const movieId = row.dataset.id;

    const movieData = {
        title: row.querySelector('[data-field="title"]').value,
        description: row.querySelector('[data-field="description"]').value,
        duration: row.querySelector('[data-field="duration"]').value,
        genre: row.querySelector('[data-field="genre"]').value,
        director: row.querySelector('[data-field="director"]').value,
        release_year: row.querySelector('[data-field="release_year"]').value
    };
    const currentYear = new Date().getFullYear();
    const releaseYear = parseInt(movieData.release_year.value);

    if (releaseYear < 1895 || releaseYear > currentYear) {
        alert(`L'année doit être comprise entre 1895 et ${currentYear}.`);
        return; // On arrête l'exécution ici
    }
    if (!movieData.title || !movieData.description) {
        alert('Le titre et la description sont obligatoires');
        return;
    }

    try {
        const result = await apiPut('movie', movieId, movieData);

        if (result.success) {
            alert('Film modifié avec succès ! 🎬');

            const movieIndex = movies.findIndex(m => m.id == movieId);
            if (movieIndex !== -1) {
                movies[movieIndex] = { ...movies[movieIndex], ...movieData };
            }

            renderMovies();
        } else {
            alert(`Erreur : ${result.error || 'Erreur inconnue'}`);
        }
    } catch (error) {
        alert(`Erreur : ${error.message}`);
    }
};

// ✅ Fonction pour annuler l'édition
const cancelEdit = (row) => {
    renderMovies();
};

// Fonction de suppression
const executeDelete = async (type, id, rowElement) => {
    try {
        const data = await apiDelete(type, id);

        if (data.success) {
            alert(`${type} supprimé !`);

            const index = movies.findIndex(m => m.id == id);
            if (index !== -1) {
                movies.splice(index, 1);
            }

            const option = movieSelect?.querySelector(`option[value="${id}"]`);
            if (option) option.remove();

            renderMovies();
        } else {
            alert(data.error);
        }
    } catch (error) {
        alert(`Erreur : ${error.message}`);
    }
};

// ✅ Gestionnaire d'événements PRINCIPAL
if (movieTableBody) {
    movieTableBody.addEventListener('click', async (e) => {
        const row = e.target.closest('tr');
        if (!row) return;

        if (e.target.closest('.delete-row-btn')) {
            const movieId = e.target.closest('.delete-row-btn').dataset.id;
            if (confirm("Supprimer ce film ?")) {
                await executeDelete('movie', movieId, row);
            }
            return;
        }

        if (e.target.closest('.edit-row-btn')) {
            enableEditMode(row);
            return;
        }

        if (e.target.closest('.save-row-btn')) {
            await saveMovie(row);
            return;
        }

        if (e.target.closest('.cancel-edit-btn')) {
            cancelEdit(row);
            return;
        }
    });
}

// ✅✨ FONCTIONNALITÉ D'AUTO-COMPLÉTION ✨✅
// Fonction pour remplir automatiquement le formulaire
const autoFillForm = (selectedTitle) => {
    // Chercher d'abord dans la base de données locale (moviesDatabase)
    let movie = moviesDatabase.find(m => m.title.toLowerCase() === selectedTitle.toLowerCase());

    // Si pas trouvé, chercher dans les films de l'API
    if (!movie) {
        movie = movies.find(m => m.title.toLowerCase() === selectedTitle.toLowerCase());
    }

    if (movie) {
        // Remplir tous les champs du formulaire
        const descriptionField = document.getElementById('movieSummary');
        const durationField = document.getElementById('movieDuration');
        const genreField = document.getElementById('movieGenre');
        const directorField = document.getElementById('movieDirector');
        const releaseYearField = document.getElementById('movieReleaseYear');

        if (descriptionField) descriptionField.value = movie.description || '';
        if (durationField) durationField.value = movie.duration || '';
        if (genreField) genreField.value = movie.genre || '';
        if (directorField) directorField.value = movie.director || '';
        if (releaseYearField) releaseYearField.value = movie.release_year || '';

        console.log('✅ Formulaire auto-rempli avec:', movie.title);
    }
};

// ✅ Écouter les changements sur le champ titre
const titleInput = document.getElementById('movieTitle');
if (titleInput) {
    // Méthode 1 : Détecter quand l'utilisateur sélectionne dans la datalist
    titleInput.addEventListener('input', (e) => {
        const selectedTitle = e.target.value;
        if (selectedTitle.trim()) {
            autoFillForm(selectedTitle);
        }
    });

    // Méthode 2 : Détecter quand l'utilisateur quitte le champ (blur)
    titleInput.addEventListener('blur', (e) => {
        const selectedTitle = e.target.value;
        if (selectedTitle.trim()) {
            autoFillForm(selectedTitle);
        }
    });
}

// ✅ Formulaire d'ajout
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

        const currentYear = new Date().getFullYear();
        const releaseYear = parseInt(document.getElementById('movieReleaseYear').value);

        if (releaseYear < 1895 || releaseYear > currentYear) {
            alert(`L'année doit être comprise entre 1895 et ${currentYear}.`);
            return; // On arrête l'exécution ici
        }

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

// ✅ Remplissage de la datalist des genres
const genreDatalist = document.getElementById('genreList');

if (genreDatalist && genres) {
    genres.forEach(genreName => {
        const option = document.createElement('option');
        option.value = genreName;
        genreDatalist.appendChild(option);
    });
}

// ✅ Remplissage de la datalist des titres (avec les films de moviesDatabase)
const titleDataList = document.getElementById('listTitle');

if (titleDataList && moviesDatabase) {
    moviesDatabase.forEach(movie => {
        const option = document.createElement("option");
        option.value = movie.title;
        titleDataList.appendChild(option);
    });
}

// Afficher le compteur
if (stockMovie) {
    stockMovie.textContent = `Film${movies.length > 1 ? 's' : ''} en stock: ${movies.length} 🎬`;
}

// ✅ Affichage initial
renderMovies();

console.log('✅ movie.js chargé', {
    moviesAPI: movies.length,
    moviesDatabase: moviesDatabase.length
});