import { apiFetch } from './config.js';
import { initAuth } from './auth-ui.js';

// Initialiser l'authentification
initAuth();

// Date par défaut : aujourd'hui
const dateSelector = document.getElementById('dateSelector');
dateSelector.value = new Date().toISOString().split('T')[0];

// Charger le planning au chargement de la page
window.addEventListener('DOMContentLoaded', () => {
    loadPlanning();
});

/**
 * Charger le planning par salle
 */
window.loadPlanning = async () => {
    const selectedDate = dateSelector.value;
    const container = document.getElementById('planningContainer');
    const statsDiv = document.getElementById('stats');

    try {
        container.innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Chargement...</span>
                </div>
                <p class="mt-3">Chargement du planning...</p>
            </div>
        `;

        const result = await apiFetch('planning_by_room', {
            query: { date: selectedDate }
        });

        if (!result.success) {
            throw new Error(result.error || 'Erreur lors du chargement');
        }

        renderPlanning(result.planning, result.date);
        updateStats(result.planning);
        statsDiv.style.display = 'flex';

    } catch (error) {
        console.error('Erreur:', error);
        container.innerHTML = `
            <div class="alert alert-danger">
                <i class="bi bi-exclamation-triangle"></i>
                Erreur lors du chargement du planning : ${error.message}
            </div>
        `;
    }
};

/**
 * Afficher le planning
 */
function renderPlanning(planning, date) {
    const container = document.getElementById('planningContainer');

    if (!planning || planning.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info text-center">
                <i class="bi bi-calendar-x fs-1 d-block mb-3"></i>
                <h4>Aucune séance programmée</h4>
                <p class="mb-0">Aucune séance n'est prévue pour le ${formatDate(date)}</p>
            </div>
        `;
        return;
    }

    let html = `<h3 class="mb-4">Planning du ${formatDate(date)}</h3>`;

    planning.forEach(room => {
        html += `
            <div class="card room-card mb-4">
                <div class="card-header bg-primary text-white">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h4 class="mb-0">
                                <i class="bi bi-door-open"></i> ${room.room_name}
                            </h4>
                        </div>
                        <div>
                            <span class="badge bg-light text-dark">${room.room_type}</span>
                            <span class="badge bg-light text-dark">${room.capacity} places</span>
                            <span class="badge bg-light text-dark">${room.screenings.length} séance(s)</span>
                        </div>
                    </div>
                </div>
                <div class="card-body">
        `;

        if (room.screenings.length === 0) {
            html += `<div class="empty-room">Aucune séance programmée</div>`;
        } else {
            room.screenings.forEach(screening => {
                const startTime = new Date(screening.start_time);
                const endTime = new Date(screening.end_time);

                html += `
                    <div class="screening-block">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <div class="screening-time">
                                    <i class="bi bi-clock"></i> 
                                    ${formatTime(startTime)} - ${formatTime(endTime)}
                                </div>
                                <div class="screening-title">
                                    <i class="bi bi-film"></i> ${screening.movie_title}
                                </div>
                                <div class="screening-duration">
                                    Durée : ${screening.duration} minutes
                                </div>
                            </div>
                            <div>
                                <span class="badge bg-light text-dark">ID: ${screening.id}</span>
                            </div>
                        </div>
                    </div>
                `;
            });
        }

        html += `
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

/**
 * Mettre à jour les statistiques
 */
function updateStats(planning) {
    const totalRooms = planning.length;
    const totalScreenings = planning.reduce((sum, room) => sum + room.screenings.length, 0);
    const totalCapacity = planning.reduce((sum, room) => sum + (room.capacity * room.screenings.length), 0);

    document.getElementById('totalRooms').textContent = totalRooms;
    document.getElementById('totalScreenings').textContent = totalScreenings;
    document.getElementById('totalCapacity').textContent = totalCapacity.toLocaleString();
}

/**
 * Formater la date (DD/MM/YYYY)
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Formater l'heure (HH:MM)
 */
function formatTime(date) {
    return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
    });
}