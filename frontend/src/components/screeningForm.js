import { addScreening } from '../api/screeningApi.js';

export function initScreeningForm(formElement, movieSelect, roomSelect) {
    formElement.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const screeningData = {
            movie_id: movieSelect.value,
            room_id: roomSelect.value,
            start_time: document.getElementById('startTime').value
        };
        
        try {
            const result = await addScreening(screeningData);
            
            if (result.success) {
                alert('Séance créée 🎬');
                formElement.reset();
            } else {
                alert(result.error || 'Erreur lors de la création');
            }
        } catch (error) {
            alert('Erreur de connexion au serveur');
        }
    });
}
