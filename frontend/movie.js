// ✅ Imports
import { apiFetch, truncateText, apiDelete, apiPost, apiPut } from './config.js';
import { els } from './dom-elements.js';
import { getPaginatedItems, getPageInfo, isFirstPage, isLastPage, disableButton, enableButton, ITEMS_PER_PAGE } from './pagination.js';
import { moviesDatabase, genres } from './movie-data.js';

const { movieSelect, formMovie, listScreenings, stockMovie } = els;

// État de la pagination
let state = {
    currentPage: 1,
    itemsPerPage: ITEMS_PER_PAGE
};

// Gestion de l'année de sortie
const year = document.getElementById('movieReleaseYear');
const currentYear = new Date().getFullYear();
if (year) {
    year.setAttribute('min', '1895');
    year.setAttribute('max', currentYear.toString());
    year.setAttribute('type', 'number');
}

// Récupération des films
const movies = await apiFetch('list_movies');

// Remplir le select
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

// ✅ CRÉATION DU TABLEAU - Description tronquée, reste visible
const movieTable = document.createElement('table');
movieTable.className = 'table table-bordered table-striped mt-4 table-hover';
movieTable.innerHTML = `
    <thead class="table-dark">
        <tr>
            <th class="text-center">ID</th>
            <th>Titre</th>
            <th>Description</th>
            <th class="text-center">Durée (min)</th>
            <th>Genre</th>
            <th>Réalisateur</th>
            <th class="text-center">Année</th>
            <th class="text-center">Actions</th>
        </tr>
    </thead>
    <tbody id="movieTableBody"></tbody>
`;

if (listScreenings) {
    listScreenings.appendChild(movieTable);
}

const movieTableBody = document.getElementById('movieTableBody');

// ✅ FONCTION POUR CRÉER UNE LIGNE
const createMovieRow = (movie) => {
    const tr = document.createElement('tr');
    tr.dataset.id = movie.id;

    // Tronquer UNIQUEMENT la description
    const shortDescription = truncateText(movie.description, 80);
    const fullDescription = (movie.description || '').replace(/"/g, '&quot;');

    tr.innerHTML = `
        <td class="text-center movie-id">${movie.id}</td>
        <td class="movie-title">${movie.title}</td>
        <td class="movie-description" title="${fullDescription}">
            ${shortDescription}
        </td>
        <td class="text-center movie-duration">${movie.duration}</td>
        <td class="movie-genre">${movie.genre}</td>
        <td class="movie-director">${movie.director || 'N/A'}</td>
        <td class="text-center movie-year">${movie.release_year}</td>
        <td class="text-center actions">
            <button class="btn btn-sm btn-danger delete-row-btn" data-id="${movie.id}" title="Supprimer">
                <i class="bi bi-trash"></i>
            </button>
            <button class="btn btn-sm btn-warning edit-row-btn" data-id="${movie.id}" title="Modifier">
                <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-info view-more-btn" data-id="${movie.id}" title="Voir plus">
                <i class="bi bi-eye"></i>
            </button>
        </td>
    `;
    return tr;
};

// Fonction pour afficher les films paginés
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

// Fonction pour mettre à jour l'UI de pagination
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

// Gestionnaires des boutons de pagination
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




// Fonction pour transformer une ligne en mode édition
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
        `<input type="number" class="inline-input" value="${movie.duration}" data-field="duration" min="1" max="500">`;

    row.querySelector('.movie-genre').innerHTML =
        `<input type="text" class="inline-input" list="genreList" value="${movie.genre}" data-field="genre">`;

    row.querySelector('.movie-director').innerHTML =
        `<input type="text" class="inline-input" value="${movie.director || ''}" data-field="director">`;

    row.querySelector('.movie-year').innerHTML =
        `<input type="number" class="inline-input" min="1895" max="${currentYear}" value="${movie.release_year}" data-field="release_year">`;

    row.querySelector('.actions').innerHTML = `
        <button class="btn btn-sm btn-success save-row-btn" data-id="${movieId}" title="Sauvegarder">
            <i class="bi bi-check-lg"></i>
        </button>
        <button class="btn btn-sm btn-secondary cancel-edit-btn" data-id="${movieId}" title="Annuler">
            <i class="bi bi-x-lg"></i>
        </button>
    `;
};

// Fonction pour sauvegarder les modifications
const saveMovie = async (row) => {
    const movieId = row.dataset.id;

    const movieData = {
        title: row.querySelector('[data-field="title"]').value,
        description: row.querySelector('[data-field="description"]').value,
        duration: parseInt(row.querySelector('[data-field="duration"]').value, 10),
        genre: row.querySelector('[data-field="genre"]').value,
        director: row.querySelector('[data-field="director"]').value,
        release_year: row.querySelector('[data-field="release_year"]').value
    };

    // Validation de la date
    const releaseYear = parseInt(movieData.release_year, 10);

    if (isNaN(releaseYear) || releaseYear < 1895 || releaseYear > currentYear) {
        alert(`L'année doit être comprise entre 1895 et ${currentYear}.`);
        return;
    }

    // Validation de la durée
    if (isNaN(movieData.duration) || movieData.duration < 1 || movieData.duration > 85740) {
        alert('La durée doit être entre 1 et 85740 minutes.');
        return;
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

// Fonction pour annuler l'édition
const cancelEdit = () => {
    renderMovies();
};

// Fonction de suppression
const executeDelete = async (type, id) => {
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

// Fonction pour afficher la description complète dans une modal
const showFullDescription = (movieId) => {
    const movie = movies.find(m => m.id == movieId);
    if (!movie) return;

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
            max-width: 700px;
            max-height: 80vh;
            overflow-y: auto;
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
                ${movie.title}
            </h3>
            
            <div style="margin: 20px 0;">
                <h5 style="color: #555; margin-bottom: 10px;">Description :</h5>
                <p style="color: #666; line-height: 1.6; text-align: center; white-space: pre-wrap;">
                    ${movie.description}
                </p>
            </div>
            
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 14px;">
                <div style="background: #f8f9fa; padding: 10px; border-radius: 5px;">
                    <strong style="color: #2c3e50;">📽️ Durée :</strong> 
                    <span style="color: #555;">${movie.duration} minutes</span>
                </div>
                <div style="background: #f8f9fa; padding: 10px; border-radius: 5px;">
                    <strong style="color: #2c3e50;">🎭 Genre :</strong> 
                    <span style="color: #555;">${movie.genre}</span>
                </div>
                <div style="background: #f8f9fa; padding: 10px; border-radius: 5px;">
                    <strong style="color: #2c3e50;">🎬 Réalisateur :</strong> 
                    <span style="color: #555;">${movie.director || 'N/A'}</span>
                </div>
                <div style="background: #f8f9fa; padding: 10px; border-radius: 5px;">
                    <strong style="color: #2c3e50;">📅 Année :</strong> 
                    <span style="color: #555;">${movie.release_year}</span>
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

// Gestionnaire d'événements PRINCIPAL
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

        if (e.target.closest('.view-more-btn')) {
            const movieId = e.target.closest('.view-more-btn').dataset.id;
            showFullDescription(movieId);
            return;
        }
    });
}

// Fonction d'auto-complétion
const autoFillForm = (selectedTitle) => {
    let movie = moviesDatabase.find(m => m.title.toLowerCase() === selectedTitle.toLowerCase());

    if (!movie) {
        movie = movies.find(m => m.title.toLowerCase() === selectedTitle.toLowerCase());
    }

    if (movie) {
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

const titleInput = document.getElementById('movieTitle');
if (titleInput) {
    titleInput.addEventListener('input', (e) => {
        const selectedTitle = e.target.value;
        if (selectedTitle.trim()) {
            autoFillForm(selectedTitle);
        }
    });

    titleInput.addEventListener('blur', (e) => {
        const selectedTitle = e.target.value;
        if (selectedTitle.trim()) {
            autoFillForm(selectedTitle);
        }
    });
}

// Formulaire d'ajout
if (formMovie) {
    formMovie.addEventListener('submit', async (e) => {
        e.preventDefault();

        const titleValue = document.getElementById('movieTitle').value;
        const descriptionValue = document.getElementById('movieSummary').value;
        const durationValue = document.getElementById('movieDuration').value;
        const genreValue = document.getElementById('movieGenre').value;
        const directorValue = document.getElementById('movieDirector').value;
        const releaseYearValue = document.getElementById('movieReleaseYear').value;

        const releaseYear = parseInt(releaseYearValue, 10);

        if (isNaN(releaseYear) || releaseYear < 1895 || releaseYear > currentYear) {
            alert(`L'année doit être comprise entre 1895 et ${currentYear}.`);
            return;
        }

        const duration = parseInt(durationValue, 10);
        if (isNaN(duration) || duration < 1 || duration > 85740) {
            alert('La durée doit être entre 1 et 85740 minutes.');
            return;
        }

        const movieData = {
            title: titleValue,
            description: descriptionValue,
            duration: duration,
            genre: genreValue,
            director: directorValue,
            release_year: releaseYear
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

// Remplissage de la datalist des genres
const genreDatalist = document.getElementById('genreList');
if (genreDatalist && genres) {
    genres.forEach(genreName => {
        const option = document.createElement('option');
        option.value = genreName;
        genreDatalist.appendChild(option);
    });
}

// Remplissage de la datalist des titres
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

// Affichage initial
renderMovies();

console.log('✅ movie.js chargé', {
    moviesAPI: movies.length,
    moviesDatabase: moviesDatabase.length
});