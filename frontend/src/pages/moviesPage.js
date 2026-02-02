import { fetchMovies, deleteMovie } from '../api/movieApi.js';
import { createMovieTable } from '../components/movieTable.js';

export async function initMoviesPage() {
    console.log('Movies page loaded');
    
    try {
        const movies = await fetchMovies();
        const moviesList = document.getElementById('moviesList');
        
        if (moviesList) {
            const movieTable = createMovieTable(movies, handleDeleteMovie);
            moviesList.appendChild(movieTable);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des films:', error);
    }
}

async function handleDeleteMovie(movieId, rowElement) {
    try {
        const result = await deleteMovie(movieId);
        
        if (result.success) {
            alert('Film supprimé !');
            rowElement.remove();
        } else {
            alert(result.error || 'Erreur lors de la suppression');
        }
    } catch (error) {
        alert('Erreur de connexion au serveur');
    }
}
