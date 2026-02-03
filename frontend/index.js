/*
console.log('Frontend loaded');

import { apiFetch, formatDate, apiDelete, truncateText, apiPost } from './config.js';

const movieSelect = document.getElementById('movieSelect');
const roomSelect = document.getElementById('roomSelect');
const stockScreening = document.getElementById('stockScreening');
const stockMovie = document.getElementById('stockMovie');
const stockRoom = document.getElementById('stockRoom');
const form = document.getElementById('screeningForm');
const formMovie = document.getElementById('addMovieForm');
const formRoom = document.getElementById('addRoomForm');
const listScreenings = document.getElementById('screeningsList');

const screenings = await fetch(`${API_BASE_URL}?action=list_screenings`).then(res => res.json());
const movies = await fetch(`${API_BASE_URL}?action=list_movies`).then(res => res.json());
const rooms = await fetch(`${API_BASE_URL}?action=list_rooms`).then(res => res.json());

import { els } from './dom-elements.js';

const {
    movieSelect,
    roomSelect,
    form,
    stockScreening,
    stockMovie,
    stockRoom,
    formMovie,
    formRoom,
    listScreenings
} = els;

const screenings = await apiFetch('list_screenings');
const movies = await apiFetch('list_movies');
const rooms = await apiFetch('list_rooms');


const movieTable = document.createElement('table');
movieTable.className = 'table table-bordered table-striped mt-4';
movieTable.innerHTML = `
    <thead>
        <tr>
            <th>ID</th>
            <th>Titre</th>
            <th>Résumé</th>
            <th>Durée</th>
            <th>Genre</th>
            <th>Action</th>
        </tr>
    </thead>
    <tbody id="movieTableBody"></tbody>
`;
listScreenings.appendChild(movieTable);

const movieTableBody = document.getElementById('movieTableBody');


movies.forEach(movie => {

    const option = new Option(movie.title, movie.id);
    movieSelect.appendChild(option);


    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${movie.id}</td>
        <td>${movie.title}</td>
        <td>${truncateText(movie.description)}</td>
        <td>${movie.duration} min</td>
        <td>${movie.genre}</td>
        <td>
            <button class="btn btn-danger btn-sm delete-row-btn" data-id="${movie.id}">
                <i class="bi bi-trash"></i>
            </button>
            <button class="btn btn-secondary btn-sm mt-2" disabled>
                <i class="bi bi-pencil"></i> Édition non disponible
            </button>
        </td>
    `;
    movieTableBody.appendChild(tr);
});


movieTableBody.addEventListener('click', async (e) => {
    const btn = e.target.closest('.delete-row-btn');
    if (btn) {
        const movieId = btn.dataset.id;
        if (confirm("Supprimer ce film ?")) {
            await executeDelete('movie', movieId, btn.closest('tr'));
        }
    }
});

async function executeDelete(type, id, elementToRemove) {
    try {
        // On utilise l'utilitaire importé depuis config.js
        const data = await apiDelete(type, id);

        if (data.success) {
            alert(`${type} supprimé !`);
            // Suppression visuelle immédiate (plus besoin de location.reload !)
            if (elementToRemove) elementToRemove.remove();

            // Supprime l'option dans les menus déroulants si elle existe
            const option = document.querySelector(`select option[value="${id}"]`);
            if (option) option.remove();
        } else {
            alert(data.error);
        }
    } catch (err) {
        alert("Erreur : Impossible de supprimer cet élément (il est peut-être lié à une autre donnée).");
    }
}

const roomTable = document.createElement('table');
roomTable.className = 'table table-bordered table-striped mt-4';
roomTable.innerHTML = `
    <thead>
        <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Capacity</th>
            <th>Type</th>
            <th>Active</th>
            <th>Action</th>
        </tr>
    </thead>
    <tbody id="roomTableBody"></tbody>
`;
listScreenings.appendChild(roomTable);

const roomTableBody = document.getElementById('roomTableBody');

rooms.forEach(room => {
    const option = document.createElement('option');

    option.value = room.id;
    option.textContent = room.name;
    roomSelect.appendChild(option);

    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${room.id}</td>
        <td>${room.name}</td>
        <td>${room.capacity}</td>
        <td>${room.type}</td>
        <td>${room.active ? 'Oui' : 'Non'}</td>
        <td>
            <button class="btn btn-danger btn-sm delete-row-btn" data-id="${room.id}">
                <i class="bi bi-trash"></i>
            </button>
            <button class="btn btn-secondary btn-sm mt-2" disabled>
                <i class="bi bi-pencil"></i> Édition non disponible
            </button>
        </td>
    `;
    roomTableBody.appendChild(tr);
});

roomTableBody.addEventListener('click', async (e) => {
    const btn = e.target.closest('.delete-row-btn');
    if (btn) {
        const roomId = btn.dataset.id;
        if (confirm("Supprimer cette salle ?")) {
            await executeDelete('room', roomId, btn.closest('tr'));
        }
    }
});

screenings.forEach(screening => {
    const div = document.createElement('div');
    div.className = 'border p-3';
    div.innerHTML = `
        <strong>Séance ID:</strong> ${screening.id} <br/>
        <strong>Film ID:</strong> ${screening.movie_id} <br/>
        <strong>Salle ID:</strong> ${screening.room_id} <br/>
        <strong>Heure de début:</strong> ${formatDate(screening.start_time)} <br/>
        <button class="btn btn-danger btn-sm delete-row-btn" data-id="${screening.id}">
            <i class="bi bi-trash"></i> Supprimer la séance
        </button>
        <button class="btn btn-secondary btn-sm mt-2" disabled>
            <i class="bi bi-pencil"></i> Édition non disponible
        </button>
    `;
    listScreenings.appendChild(div);
});

listScreenings.addEventListener('click', async (e) => {
    const btn = e.target.closest('.delete-row-btn');
    if (!btn) return;



    const screeningId = btn.dataset.id;
    if (confirm("Supprimer cette séance ?")) {
        await executeDelete('screening', screeningId, btn.closest('div'));
        location.reload();
    }
});


stockRoom.appendChild(document.createTextNode(`Salle${rooms.length > 1 ? 's' : ''} en stock: ${rooms.length} 🏟️`));
stockMovie.appendChild(document.createTextNode(`Film${movies.length > 1 ? 's' : ''} en stock: ${movies.length} 🎬`));
stockScreening.appendChild(document.createTextNode(`Séance${screenings.length > 1 ? 's' : ''} planifiée${screenings.length > 1 ? 's' : ''} : ${screenings.length} 🎟️`));



formRoom.addEventListener('submit', async (e) => {
    e.preventDefault();

    // On récupère les valeurs
    const roomData = {
        name: document.getElementById('nameRoom').value,
        capacity: document.getElementById("capacity").value,
        type: document.getElementById('typeRoom').value,
        active: document.getElementById('activeRoom').value
    };

    try {
        // Un seul appel propre !
        await apiPost('add_room', roomData);
        alert('Salle ajoutée 🎬');
        location.reload();
    } catch (err) {
        alert(err.message);
    }
});

formMovie.addEventListener('submit', async (e) => {
    e.preventDefault();

    // On prépare l'objet avec les données du formulaire
    const movieData = {
        title: document.getElementById('movieTitle').value,
        description: document.getElementById("movieSummary").value,
        duration: document.getElementById('movieDuration').value,
        genre: document.getElementById('movieGenre').value,
        director: document.getElementById('movieDirector').value,
        release_year: document.getElementById('movieReleaseYear').value
    };

    try {
        // On utilise notre nouvel outil apiPost
        await apiPost('add_movie', movieData);
        alert('Film ajouté 🎬');
        location.reload();
    } catch (err) {
        alert("Erreur lors de l'ajout : " + err.message);
    }
});



form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const screeningData = {
        movie_id: movieSelect.value,
        room_id: roomSelect.value,
        start_time: document.getElementById('startTime').value
    };

    try {
        await apiPost('add_screening', screeningData);
        alert('Séance créée 🎬');
        location.reload();
    } catch (err) {
        alert("Erreur lors de la création de la séance : " + err.message);
    }
}); */


const title = document.getElementById('titre');
setInterval(() => {
    const now = new Date();
    title.innerText = `Gestion des Séances, Films et Salles - ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
}, 1000);
setInterval(() => {
    title.style.textShadow = "0 0 60px rgba(90, 125, 223, 0.8)";
    setTimeout(() => {
        title.style.textShadow = "none";
    }, 500);
}, 1000);
