import { addMovie } from '../api/movieApi.js';
import { addRoom } from '../api/roomApi.js';

export function initMovieForm(formElement) {
    formElement.addEventListener('submit', async (e) => {
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
            const result = await addMovie(movieData);
            
            if (result.success) {
                alert('Film ajouté 🎬');
                formElement.reset();
                location.reload();
            } else {
                alert(result.error || 'Erreur lors de l\'ajout');
            }
        } catch (error) {
            alert('Erreur de connexion au serveur');
        }
    });
}

export function initRoomForm(formElement) {
    formElement.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const roomData = {
            name: document.getElementById('nameRoom').value,
            capacity: document.getElementById('capacity').value,
            type: document.getElementById('typeRoom').value,
            active: document.getElementById('activeRoom').value
        };
        
        try {
            const result = await addRoom(roomData);
            
            if (result.success) {
                alert('Salle ajoutée 🎬');
                formElement.reset();
                location.reload();
            } else {
                alert(result.error || 'Erreur lors de l\'ajout');
            }
        } catch (error) {
            alert('Erreur de connexion au serveur');
        }
    });
}
