// ==========================================
// MOVIE.JS - VERSION CORRIGÉE ET OPTIMISÉE
// ==========================================

// ==========================================
// 📦 IMPORTS
// ==========================================
import {
    apiFetch,
    truncateText,
    apiDelete,
    apiPost,
    apiPut,
    apiList
} from './config.js';

import { els } from './dom-elements.js';

import {
    getPaginatedItems,
    getPageInfo,
    isFirstPage,
    isLastPage,
    disableButton,
    enableButton,
    ITEMS_PER_PAGE
} from './pagination.js';

import { moviesDatabase, genres } from './movie-data.js';

// ==========================================
// 🌐 VARIABLES GLOBALES
// ==========================================
const { movieSelect, formMovie, listScreenings, stockMovie } = els;

// Liste complète des films (source de vérité)
let movies = [];

// État de l'application
let state = {
    currentPage: 1,
    itemsPerPage: ITEMS_PER_PAGE,
    filters: {
        genre: '',
        year: '',
        search: ''
    },
    filteredMovies: []  // Films après application des filtres
};

// ==========================================
// 🎯 ÉLÉMENTS DOM
// ==========================================
const currentYear = new Date().getFullYear();

// Champs du formulaire
const titleInput = document.getElementById('movieTitle');
const year = document.getElementById('movieReleaseYear');

// Filtres
const searchInput = document.getElementById('searchMovie');
const filterGenre = document.getElementById('filterGenre');
const filterYear = document.getElementById('filterYear');
const resetButton = document.getElementById('resetFilters');
const applyFiltersBtn = document.getElementById('apply-filters');
const resultCount = document.getElementById('resultCount');

// Pagination
const btnPrevMovie = document.getElementById('btnPrevMovie');
const btnNextMovie = document.getElementById('btnNextMovie');
const pageInfoMovie = document.getElementById('pageInfoMovie');

// ==========================================
// ⚙️ CONFIGURATION INITIALE
// ==========================================

// Configuration de l'input année
if (year) {
    year.setAttribute('min', '1895');
    year.setAttribute('max', currentYear.toString());
    year.setAttribute('type', 'number');
}

// ==========================================
// 📊 CRÉATION DU TABLEAU
// ==========================================
const movieTable = document.createElement('table');
movieTable.className = 'table table-bordered table-striped mt-4 table-hover';
movieTable.innerHTML = `
    <thead class="table-dark">
        <tr>
            <th class="text-center" style="width: 60px;">ID</th>
            <th style="width: 200px;">Titre</th>
            <th>Description</th>
            <th class="text-center" style="width: 100px;">Durée (min)</th>
            <th style="width: 150px;">Genre</th>
            <th style="width: 150px;">Réalisateur</th>
            <th class="text-center" style="width: 80px;">Année</th>
            <th class="text-center" style="width: 140px;">Actions</th>
        </tr>
    </thead>
    <tbody id="movieTableBody"></tbody>
`;

if (listScreenings) {
    listScreenings.appendChild(movieTable);
}

const movieTableBody = document.getElementById('movieTableBody');

// ==========================================
// 🔍 FONCTIONS DE FILTRAGE
// ==========================================

/**
 * Filtre les films côté serveur via l'API
 */
const filterMovies = async () => {
    try {
        const genre = filterGenre?.value || '';
        const year = filterYear?.value || '';
        const search = searchInput?.value || '';

        // Mise à jour de l'état
        state.filters.genre = genre;
        state.filters.year = year;
        state.filters.search = search;
        state.currentPage = 1;

        // Construire les paramètres de filtrage
        const filters = {};
        if (genre) filters.genre = genre;
        if (year) filters.year = year;
        if (search) filters.search = search;

        // Appel API avec filtres
        const results = await apiList('movies', filters);

        // Mise à jour de la liste filtrée
        state.filteredMovies = results;

        // Mise à jour du compteur
        if (resultCount) {
            resultCount.textContent = results.length;
        }

        // Réafficher avec les nouveaux résultats
        renderMovies();

        console.log('✅ Filtrage appliqué:', {
            filters,
            resultats: results.length
        });
    } catch (error) {
        console.error("❌ Erreur lors du filtrage:", error);
        alert('Erreur lors du filtrage des films');
    }
};

/**
 * Configure les menus déroulants de filtrage avec les données réelles
 */
const setupDynamicFilters = (moviesList) => {
    if (!filterGenre || !filterYear) return;

    // Extraire les valeurs uniques
    const uniqueGenres = [...new Set(moviesList.map(m => m.genre))].filter(g => g).sort();
    const uniqueYears = [...new Set(moviesList.map(m => m.release_year))].sort((a, b) => b - a);

    // Remplir le select Genre
    filterGenre.innerHTML = '<option value="">Tous les genres</option>';
    uniqueGenres.forEach(g => {
        const option = document.createElement('option');
        option.value = g;
        option.textContent = g;
        filterGenre.appendChild(option);
    });

    // Remplir le select Année
    filterYear.innerHTML = '<option value="">Toutes les années</option>';
    uniqueYears.forEach(y => {
        const option = document.createElement('option');
        option.value = y;
        option.textContent = y;
        filterYear.appendChild(option);
    });

    console.log('✅ Filtres configurés:', {
        genres: uniqueGenres.length,
        années: uniqueYears.length
    });
};

// ==========================================
// 🎬 FONCTIONS D'AFFICHAGE
// ==========================================

/**
 * Crée une ligne HTML pour un film
 */
const createMovieRow = (movie) => {
    const tr = document.createElement('tr');
    tr.dataset.id = movie.id;

    // Tronquer la description pour l'affichage
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
            <button class="btn btn-sm btn-info view-more-btn" data-id="${movie.id}" title="Voir plus">
                <i class="bi bi-eye"></i>
            </button>
            <button class="btn btn-sm btn-warning edit-row-btn" data-id="${movie.id}" title="Modifier">
                <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-danger delete-row-btn" data-id="${movie.id}" title="Supprimer">
                <i class="bi bi-trash"></i>
            </button>
        </td>
    `;
    return tr;
};

/**
 * Affiche les films paginés dans le tableau
 */
const renderMovies = () => {
    if (!movieTableBody) return;

    movieTableBody.innerHTML = '';

    // Récupérer les films pour la page actuelle
    const paginatedMovies = getPaginatedItems(
        state.filteredMovies,
        state.currentPage,
        state.itemsPerPage
    );

    if (paginatedMovies.length > 0) {
        // Créer et ajouter les lignes
        paginatedMovies.forEach(movie => {
            movieTableBody.appendChild(createMovieRow(movie));
        });
    } else {
        // Aucun résultat
        movieTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-5 text-muted">
                    <i class="bi bi-search fs-1 d-block mb-2"></i>
                    <p class="mb-0">Aucun film ne correspond à ces critères</p>
                </td>
            </tr>
        `;
    }

    // Mettre à jour la pagination
    updatePaginationUI();
};

/**
 * Met à jour l'interface de pagination
 */
const updatePaginationUI = () => {
    // Texte d'information
    if (pageInfoMovie) {
        pageInfoMovie.textContent = getPageInfo(
            state.currentPage,
            state.filteredMovies.length,  // ✅ Utiliser filteredMovies
            state.itemsPerPage
        );
    }

    // Bouton Précédent
    if (btnPrevMovie) {
        if (isFirstPage(state.currentPage)) {
            disableButton(btnPrevMovie);
        } else {
            enableButton(btnPrevMovie);
        }
    }

    // Bouton Suivant
    if (btnNextMovie) {
        if (isLastPage(state.currentPage, state.filteredMovies.length, state.itemsPerPage)) {
            //                            ✅ Utiliser filteredMovies
            disableButton(btnNextMovie);
        } else {
            enableButton(btnNextMovie);
        }
    }
};

// ==========================================
// ✏️ FONCTIONS D'ÉDITION
// ==========================================

/**
 * Active le mode édition sur une ligne
 */
const enableEditMode = (row) => {
    const movieId = row.dataset.id;
    const movie = state.filteredMovies.find(m => m.id == movieId);

    if (!movie) {
        console.error('❌ Film introuvable:', movieId);
        return;
    }

    row.classList.add('editing-mode');

    // Transformer les cellules en inputs
    row.querySelector('.movie-title').innerHTML =
        `<input type="text" class="inline-input" list="listTitle" value="${movie.title}" data-field="title">`;

    row.querySelector('.movie-description').innerHTML =
        `<textarea class="inline-textarea" data-field="description">${movie.description}</textarea>`;

    row.querySelector('.movie-duration').innerHTML =
        `<input type="number" class="inline-input" value="${movie.duration}" data-field="duration" min="1" max="85740">`;

    row.querySelector('.movie-genre').innerHTML =
        `<input type="text" class="inline-input" list="genreList" value="${movie.genre}" data-field="genre">`;

    row.querySelector('.movie-director').innerHTML =
        `<input type="text" class="inline-input" value="${movie.director || ''}" data-field="director">`;

    row.querySelector('.movie-year').innerHTML =
        `<input type="number" class="inline-input" min="1895" max="${currentYear}" value="${movie.release_year}" data-field="release_year">`;

    // Remplacer les boutons d'action
    row.querySelector('.actions').innerHTML = `
        <button class="btn btn-sm btn-success save-row-btn" data-id="${movieId}" title="Sauvegarder">
            <i class="bi bi-check-lg"></i>
        </button>
        <button class="btn btn-sm btn-secondary cancel-edit-btn" data-id="${movieId}" title="Annuler">
            <i class="bi bi-x-lg"></i>
        </button>
    `;

    console.log('✏️ Mode édition activé pour:', movie.title);
};

/**
 * Sauvegarde les modifications d'un film
 */
const saveMovie = async (row) => {
    const movieId = row.dataset.id;

    // Récupérer les valeurs des inputs
    const movieData = {
        title: row.querySelector('[data-field="title"]').value.trim(),
        description: row.querySelector('[data-field="description"]').value.trim(),
        duration: parseInt(row.querySelector('[data-field="duration"]').value, 10),
        genre: row.querySelector('[data-field="genre"]').value.trim(),
        director: row.querySelector('[data-field="director"]').value.trim(),
        release_year: parseInt(row.querySelector('[data-field="release_year"]').value, 10)
    };

    // Validations
    if (!movieData.title || !movieData.description) {
        alert('Le titre et la description sont obligatoires');
        return;
    }

    if (isNaN(movieData.duration) || movieData.duration < 1 || movieData.duration > 857) {
        alert('La durée doit être entre 1 et 857 minutes');
        return;
    }

    if (isNaN(movieData.release_year) || movieData.release_year < 1895 || movieData.release_year > currentYear) {
        alert(`L'année doit être entre 1895 et ${currentYear}`);
        return;
    }

    try {
        // Appel API pour mise à jour
        const result = await apiPut('movie', movieId, movieData);

        if (result.success) {


            // ✅ Mettre à jour la liste complète
            const movieIndex = movies.findIndex(m => m.id == movieId);
            if (movieIndex !== -1) {
                movies[movieIndex] = {
                    ...movies[movieIndex],
                    ...movieData,
                    id: parseInt(movieId, 10)
                };
            }

            // ✅ Mettre à jour la liste filtrée
            const filteredIndex = state.filteredMovies.findIndex(m => m.id == movieId);
            if (filteredIndex !== -1) {
                state.filteredMovies[filteredIndex] = {
                    ...state.filteredMovies[filteredIndex],
                    ...movieData,
                    id: parseInt(movieId, 10)
                };
            }

            // ✅ Mettre à jour le select
            if (movieSelect) {
                const option = movieSelect.querySelector(`option[value="${movieId}"]`);
                if (option) {
                    option.textContent = movieData.title;
                }
            }

            // Réafficher
            renderMovies();

            console.log('✅ Film mis à jour:', movieData.title);
        } else {
            alert(`❌ Erreur : ${result.error || 'Erreur inconnue'}`);
        }
    } catch (error) {
        console.error('❌ Erreur:', error);
        alert(`❌ Erreur : ${error.message}`);
    }
};

/**
 * Annule l'édition et restaure l'affichage normal
 */
const cancelEdit = () => {
    renderMovies();
    console.log('🚫 Édition annulée');
};

// ==========================================
// 🗑️ FONCTION DE SUPPRESSION
// ==========================================

/**
 * Supprime un film
 */
const executeDelete = async (movieId) => {
    try {
        const result = await apiDelete('movie', movieId);

        if (result.success) {


            // ✅ Supprimer de la liste complète
            const index = movies.findIndex(m => m.id == movieId);
            if (index !== -1) {
                movies.splice(index, 1);
            }

            // ✅ Supprimer de la liste filtrée
            const filteredIndex = state.filteredMovies.findIndex(m => m.id == movieId);
            if (filteredIndex !== -1) {
                state.filteredMovies.splice(filteredIndex, 1);
            }

            // ✅ Supprimer du select
            if (movieSelect) {
                const option = movieSelect.querySelector(`option[value="${movieId}"]`);
                if (option) option.remove();
            }

            // ✅ Mettre à jour les compteurs
            if (stockMovie) {
                stockMovie.textContent = `Film${movies.length > 1 ? 's' : ''} en stock: ${movies.length} 🎬`;
            }
            if (resultCount) {
                resultCount.textContent = state.filteredMovies.length;
            }

            // Réafficher
            renderMovies();

            console.log('🗑️ Film supprimé, ID:', movieId);
        } else {
            alert(`❌ Erreur : ${result.error || 'Erreur inconnue'}`);
        }
    } catch (error) {
        console.error('❌ Erreur:', error);
        alert(`❌ Erreur : ${error.message}`);
    }
};

// ==========================================
// 👁️ MODAL "VOIR PLUS"
// ==========================================

/**
 * Affiche la description complète dans une modal
 */
const showFullDescription = (movieId) => {
    const movie = movies.find(m => m.id == movieId);

    if (!movie) {
        alert('Film introuvable');
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'movie-modal-overlay';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        animation: fadeIn 0.3s ease;
    `;

    modal.innerHTML = `
        <div style="
            background: white;
            padding: 30px;
            border-radius: 15px;
            max-width: 700px;
            max-height: 85vh;
            overflow-y: auto;
            position: relative;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            animation: slideUp 0.3s ease;
        ">
            <button id="closeModal" style="
                position: absolute;
                top: 15px;
                right: 15px;
                border: none;
                background: #dc3545;
                color: white;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                cursor: pointer;
                font-size: 24px;
                font-weight: bold;
                line-height: 1;
                transition: all 0.2s;
            " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                ×
            </button>
            
            <h3 style="
                margin-top: 0;
                color: #2c3e50;
                border-bottom: 3px solid #3498db;
                padding-bottom: 15px;
                font-size: 1.8rem;
            ">
                🎬 ${movie.title}
            </h3>
            
            <div style="margin: 25px 0;">
                <h5 style="
                    color: #555;
                    margin-bottom: 12px;
                    font-weight: 600;
                ">📝 Description :</h5>
                <p style="
                    color: #666;
                    line-height: 1.8;
                    white-space: pre-wrap;
                    text-align: justify;
                    padding: 15px;
                    background: #f8f9fa;
                    border-radius: 8px;
                    border-left: 4px solid #3498db;
                ">
                    ${movie.description}
                </p>
            </div>
            
            <hr style="margin: 25px 0; border: none; border-top: 2px solid #e0e0e0;">
            
            <div style="
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
            ">
                <div style="
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 15px;
                    border-radius: 10px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                ">
                    <div style="font-size: 0.85rem; opacity: 0.9;">⏱️ Durée</div>
                    <div style="font-size: 1.5rem; font-weight: bold; margin-top: 5px;">
                        ${movie.duration} min
                    </div>
                </div>
                
                <div style="
                    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                    color: white;
                    padding: 15px;
                    border-radius: 10px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                ">
                    <div style="font-size: 0.85rem; opacity: 0.9;">🎭 Genre</div>
                    <div style="font-size: 1.5rem; font-weight: bold; margin-top: 5px;">
                        ${movie.genre}
                    </div>
                </div>
                
                <div style="
                    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                    color: white;
                    padding: 15px;
                    border-radius: 10px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                ">
                    <div style="font-size: 0.85rem; opacity: 0.9;">🎬 Réalisateur</div>
                    <div style="font-size: 1.2rem; font-weight: bold; margin-top: 5px;">
                        ${movie.director || 'N/A'}
                    </div>
                </div>
                
                <div style="
                    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
                    color: white;
                    padding: 15px;
                    border-radius: 10px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                ">
                    <div style="font-size: 0.85rem; opacity: 0.9;">📅 Année</div>
                    <div style="font-size: 1.5rem; font-weight: bold; margin-top: 5px;">
                        ${movie.release_year}
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Fermeture de la modal
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.id === 'closeModal') {
            modal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        }
    });

    console.log('👁️ Modal ouverte pour:', movie.title);
};

// ==========================================
// 🎯 GESTIONNAIRE D'ÉVÉNEMENTS PRINCIPAL
// ==========================================

if (movieTableBody) {
    movieTableBody.addEventListener('click', async (e) => {
        const row = e.target.closest('tr');
        if (!row) return;

        // Bouton Voir plus
        if (e.target.closest('.view-more-btn')) {
            const movieId = parseInt(e.target.closest('.view-more-btn').dataset.id, 10);
            showFullDescription(movieId);
            return;
        }

        // Bouton Modifier
        if (e.target.closest('.edit-row-btn')) {
            enableEditMode(row);
            return;
        }

        // Bouton Sauvegarder
        if (e.target.closest('.save-row-btn')) {
            await saveMovie(row);
            return;
        }

        // Bouton Annuler
        if (e.target.closest('.cancel-edit-btn')) {
            cancelEdit();
            return;
        }

        // Bouton Supprimer
        if (e.target.closest('.delete-row-btn')) {
            const movieId = parseInt(e.target.closest('.delete-row-btn').dataset.id, 10);
            const movie = movies.find(m => m.id === movieId);

            if (movie && confirm(`Supprimer le film "${movie.title}" ?\n\nCette action est irréversible.`)) {
                await executeDelete(movieId);
            }
            return;
        }
    });
}

// ==========================================
// 📄 PAGINATION - ÉVÉNEMENTS
// ==========================================

if (btnPrevMovie) {
    btnPrevMovie.addEventListener('click', () => {
        if (state.currentPage > 1) {
            state.currentPage--;
            renderMovies();
            console.log('⬅️ Page précédente:', state.currentPage);
        }
    });
}

if (btnNextMovie) {
    btnNextMovie.addEventListener('click', () => {
        const totalPages = Math.ceil(state.filteredMovies.length / state.itemsPerPage);
        //                           ✅ Correction : utiliser filteredMovies

        if (state.currentPage < totalPages) {
            state.currentPage++;
            renderMovies();
            console.log('➡️ Page suivante:', state.currentPage);
        }
    });
}

// ==========================================
// 🔍 FILTRES - ÉVÉNEMENTS
// ==========================================

// Bouton Appliquer les filtres
if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', filterMovies);
}

// Bouton Réinitialiser
if (resetButton) {
    resetButton.addEventListener('click', () => {
        if (filterGenre) filterGenre.value = "";
        if (filterYear) filterYear.value = "";
        if (searchInput) searchInput.value = "";
        filterMovies();
        console.log('🔄 Filtres réinitialisés');
    });
}

// Changements automatiques
if (filterGenre) {
    filterGenre.addEventListener('change', filterMovies);
}

if (filterYear) {
    filterYear.addEventListener('change', filterMovies);
}

// Recherche avec debounce
if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(filterMovies, 300);
    });
}

// ==========================================
// 📝 AUTO-COMPLÉTION DU FORMULAIRE
// ==========================================

/**
 * Remplit automatiquement le formulaire si le film existe dans la base de données
 */
const autoFillForm = (selectedTitle) => {
    // Chercher d'abord dans la base locale
    let movie = moviesDatabase?.find(m =>
        m.title.toLowerCase() === selectedTitle.toLowerCase()
    );

    // Sinon chercher dans les films chargés
    if (!movie) {
        movie = movies.find(m =>
            m.title.toLowerCase() === selectedTitle.toLowerCase()
        );
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

        console.log('✅ Formulaire auto-rempli:', movie.title);
    }
};

// Event listeners pour l'auto-complétion
if (titleInput) {
    titleInput.addEventListener('input', (e) => {
        const selectedTitle = e.target.value.trim();
        if (selectedTitle) {
            autoFillForm(selectedTitle);
        }
    });

    titleInput.addEventListener('blur', (e) => {
        const selectedTitle = e.target.value.trim();
        if (selectedTitle) {
            autoFillForm(selectedTitle);
        }
    });
}

// ==========================================
// ➕ FORMULAIRE D'AJOUT
// ==========================================

if (formMovie) {
    formMovie.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Récupérer les valeurs
        const movieData = {
            title: document.getElementById('movieTitle')?.value.trim() || '',
            description: document.getElementById('movieSummary')?.value.trim() || '',
            duration: parseInt(document.getElementById('movieDuration')?.value, 10) || 0,
            genre: document.getElementById('movieGenre')?.value.trim() || '',
            director: document.getElementById('movieDirector')?.value.trim() || '',
            release_year: parseInt(document.getElementById('movieReleaseYear')?.value, 10) || 0
        };

        // Validations
        if (!movieData.title || !movieData.description) {
            alert('❌ Le titre et la description sont obligatoires');
            return;
        }

        if (isNaN(movieData.duration) || movieData.duration < 1 || movieData.duration > 857) {
            alert('❌ La durée doit être entre 1 et 857 minutes');
            return;
        }

        if (isNaN(movieData.release_year) || movieData.release_year < 1895 || movieData.release_year > currentYear) {
            alert(`❌ L'année doit être entre 1895 et ${currentYear}`);
            return;
        }

        try {
            // Appel API
            const result = await apiPost('add_movie', movieData);

            if (result.success) {


                // ✅ Créer l'objet film avec l'ID retourné
                const newMovie = {
                    id: result.id || (Math.max(...movies.map(m => m.id), 0) + 1),
                    ...movieData
                };

                // ✅ Ajouter à la liste complète
                movies.push(newMovie);

                // ✅ Ajouter au select
                if (movieSelect) {
                    const option = new Option(newMovie.title, newMovie.id);
                    movieSelect.appendChild(option);
                }

                // ✅ Réappliquer les filtres (pour mettre à jour l'affichage)
                await filterMovies();

                // ✅ Réinitialiser le formulaire
                formMovie.reset();

                // ✅ Mettre à jour le compteur global
                if (stockMovie) {
                    stockMovie.textContent = `Film${movies.length > 1 ? 's' : ''} en stock: ${movies.length} 🎬`;
                }

                console.log('✅ Film ajouté:', newMovie.title);
            } else {
                alert(`❌ Erreur : ${result.error || 'Erreur inconnue'}`);
            }
        } catch (error) {
            console.error('❌ Erreur:', error);
            alert(`❌ Erreur : ${error.message}`);
        }
    });
}

// ==========================================
// 📋 REMPLISSAGE DES DATALISTS
// ==========================================

// Datalist des genres
const genreDatalist = document.getElementById('genreList');
if (genreDatalist && genres) {
    genres.forEach(genreName => {
        const option = document.createElement('option');
        option.value = genreName;
        genreDatalist.appendChild(option);
    });
    console.log('✅ Datalist genres remplie:', genres.length);
}

// Datalist des titres
const titleDataList = document.getElementById('listTitle');
if (titleDataList && moviesDatabase) {
    moviesDatabase.forEach(movie => {
        const option = document.createElement("option");
        option.value = movie.title;
        titleDataList.appendChild(option);
    });
    console.log('✅ Datalist titres remplie:', moviesDatabase.length);
}

// ==========================================
// 🚀 REMPLIR LE SELECT
// ==========================================

/**
 * Remplit le select avec la liste des films
 */
const fillMovieSelect = (moviesList) => {
    if (movieSelect && moviesList.length > 0) {
        // Vider le select
        movieSelect.innerHTML = '<option value="">-- Sélectionner un film --</option>';

        // Ajouter les options
        moviesList.forEach(movie => {
            const option = new Option(movie.title, movie.id);
            movieSelect.appendChild(option);
        });

        console.log('✅ Select rempli:', moviesList.length, 'films');
    }
};

// ==========================================
// 🎬 INITIALISATION
// ==========================================

/**
 * Initialise l'application
 */
const init = async () => {
    try {
        console.log('🎬 Initialisation de movie.js...');

        // ✅ Charger les films (UNE SEULE FOIS)
        movies = await apiFetch('list_movies');
        state.filteredMovies = movies;

        console.log('✅ Films chargés:', movies.length);

        // Configurer les filtres dynamiques
        setupDynamicFilters(movies);

        // Remplir le select
        fillMovieSelect(movies);

        // Afficher les films
        renderMovies();

        // Mettre à jour les compteurs
        if (stockMovie) {
            stockMovie.textContent = `Film${movies.length > 1 ? 's' : ''} en stock: ${movies.length} 🎬`;
        }

        if (resultCount) {
            resultCount.textContent = movies.length;
        }

        console.log('✅ movie.js initialisé avec succès!', {
            filmsAPI: movies.length,
            filmsDatabase: moviesDatabase?.length || 0,
            genres: genres?.length || 0
        });
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
        alert('❌ Erreur lors du chargement des films. Veuillez recharger la page.');
    }
};

// ==========================================
// ▶️ DÉMARRER L'APPLICATION
// ==========================================
init();

// ==========================================
// 🎨 STYLES CSS POUR LES ANIMATIONS
// ==========================================
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .editing-mode {
        background-color: #fff3cd !important;
    }
    
    .inline-input {
        width: 100%;
        padding: 5px;
        border: 1px solid #ced4da;
        border-radius: 4px;
    }
    
    .inline-textarea {
        width: 100%;
        min-height: 60px;
        padding: 5px;
        border: 1px solid #ced4da;
        border-radius: 4px;
        resize: vertical;
    }
    
    .inline-input:focus,
    .inline-textarea:focus {
        outline: none;
        border-color: #80bdff;
        box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }
`;
document.head.appendChild(style);