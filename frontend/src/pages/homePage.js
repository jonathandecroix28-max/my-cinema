import { fetchMovies } from '../api/movieApi.js';
import { fetchRooms } from '../api/roomApi.js';
import { deleteMovie } from '../api/movieApi.js';
import { deleteRoom } from '../api/roomApi.js';
import { createMovieTable, populateMovieSelect } from '../components/movieTable.js';
import { createRoomTable, populateRoomSelect } from '../components/roomTable.js';
import { initScreeningForm } from '../components/screeningForm.js';
import { updateStockStats } from '../components/stockStats.js';
import { initMovieForm, initRoomForm } from '../utils/helpers.js';

export async function initHomePage() {
    console.log('Home page loaded');
    
    try {
        // Récupérer les données
        const movies = await fetchMovies();
        const rooms = await fetchRooms();
        
        // Éléments du DOM
        const movieSelect = document.getElementById('movieSelect');
        const roomSelect = document.getElementById('roomSelect');
        const listScreenings = document.getElementById('screeningsList');
        const form = document.getElementById('screeningForm');
        const formMovie = document.getElementById('addMovieForm');
        const formRoom = document.getElementById('addRoomForm');
        
        // Peupler les selects
        if (movieSelect) populateMovieSelect(movies, movieSelect);
        if (roomSelect) populateRoomSelect(rooms, roomSelect);
        
        // Créer les tableaux
        if (listScreenings) {
            const movieTable = createMovieTable(movies, handleDeleteMovie);
            const roomTable = createRoomTable(rooms, handleDeleteRoom);
            listScreenings.appendChild(movieTable);
            listScreenings.appendChild(roomTable);
        }
        
        // Initialiser les formulaires
        if (form && movieSelect && roomSelect) {
            initScreeningForm(form, movieSelect, roomSelect);
        }
        
        if (formMovie) {
            initMovieForm(formMovie);
        }
        
        if (formRoom) {
            initRoomForm(formRoom);
        }
        
        // Mettre à jour les stats
        updateStockStats(movies, rooms, []);
        
    } catch (error) {
        console.error('Erreur lors du chargement de la page:', error);
        alert('Erreur lors du chargement des données');
    }
}

async function handleDeleteMovie(movieId, rowElement) {
    try {
        const result = await deleteMovie(movieId);
        
        if (result.success) {
            alert('Film supprimé !');
            rowElement.remove();
            
            // Retirer du select
            const option = document.querySelector(`select option[value="${movieId}"]`);
            if (option) option.remove();
        } else {
            alert(result.error || 'Erreur lors de la suppression');
        }
    } catch (error) {
        alert('Erreur de connexion au serveur');
    }
}

async function handleDeleteRoom(roomId, rowElement) {
    try {
        const result = await deleteRoom(roomId);
        
        if (result.success) {
            alert('Salle supprimée !');
            rowElement.remove();
            
            // Retirer du select
            const option = document.querySelector(`select option[value="${roomId}"]`);
            if (option) option.remove();
        } else {
            alert(result.error || 'Erreur lors de la suppression');
        }
    } catch (error) {
        alert('Erreur de connexion au serveur');
    }
}
