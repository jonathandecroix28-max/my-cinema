import { fetchScreenings } from '../api/screeningApi.js';

export async function initScreensPage() {
    console.log('Screens page loaded');
    
    try {
        const screenings = await fetchScreenings();
        const screeningsTable = document.getElementById('screeningsTable');
        
        if (screeningsTable) {
            const tbody = screeningsTable.querySelector('tbody');
            tbody.innerHTML = '';
            
            screenings.forEach(screening => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${screening.movie_title || screening.movie_id}</td>
                    <td>${screening.room_name || screening.room_id}</td>
                    <td>${new Date(screening.start_time).toLocaleString('fr-FR')}</td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (error) {
        console.error('Erreur lors du chargement des séances:', error);
    }
}
