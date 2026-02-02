
console.log('Frontend loaded');

import { API_BASE_URL } from './config.js';

const movieSelect = document.getElementById('movieSelect');
const roomSelect = document.getElementById('roomSelect');
const stockScreening = document.getElementById('stockScreening');
const stockMovie = document.getElementById('stockMovie');
const stockRoom = document.getElementById('stockRoom');
const form = document.getElementById('screeningForm');
const formMovie = document.getElementById('addMovieForm');
const formRoom = document.getElementById('addRoomForm');
const listScreenings = document.getElementById('screeningsList');

// 1. On récupère les films et les salles
const movies = await fetch(`${API_BASE_URL}?action=list_movies`).then(res => res.json());
const rooms = await fetch(`${API_BASE_URL}?action=list_rooms`).then(res => res.json());

// 1. On crée la structure du tableau une seule fois
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

// 2. On remplit le tableau et le select
movies.forEach(movie => {
    // Remplissage du select
    const option = new Option(movie.title, movie.id);
    movieSelect.appendChild(option);

    // Ajout de la ligne dans le tableau
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${movie.id}</td>
        <td>${movie.title}</td>
        <td>${movie.description.substring(0, 30)}...</td>
        <td>${movie.duration} min</td>
        <td>${movie.genre}</td>
        <td>
            <button class="btn btn-danger btn-sm delete-row-btn" data-id="${movie.id}">
                <i class="bi bi-trash"></i>
            </button>
        </td>
    `;
    movieTableBody.appendChild(tr);
});

// 3. Gestionnaire de clic UNIQUE (Délégation d'événement)
movieTableBody.addEventListener('click', async (e) => {
    const btn = e.target.closest('.delete-row-btn');
    if (!btn) return;

    const movieId = btn.dataset.id;
    if (confirm("Supprimer ce film ?")) {
        await executeDelete('movie', movieId, btn.closest('tr'));
    }
});

async function executeDelete(type, id, elementToRemove = null) {
    try {
        const res = await fetch(`${API_BASE_URL}?action=delete_${type}&id=${id}`, {
            method: 'DELETE' // Ou POST si ton backend est configuré ainsi
        });
        const data = await res.json();

        if (data.success) {
            alert(`${type} supprimé !`);
            if (elementToRemove) elementToRemove.remove(); // Supprime la ligne du tableau
            // On retire aussi du select
            const option = document.querySelector(`select option[value="${id}"]`);
            if (option) option.remove();
        } else {
            alert(data.error);
        }
    } catch (err) {
        alert("Erreur de connexion au serveur");
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
        </td>
    `;
    roomTableBody.appendChild(tr);
});

roomTableBody.addEventListener('click', async (e) => {
    const btn = e.target.closest('.delete-row-btn');
    if (!btn) return;

    const roomId = btn.dataset.id;
    if (confirm("Supprimer cette salle ?")) {
        await executeDelete('room', roomId, btn.closest('tr'));
    }
});




stockRoom.appendChild(document.createTextNode(`Salle${rooms.length > 1 ? 's' : ''} en stock: ${rooms.length} 🏟️`));
stockMovie.appendChild(document.createTextNode(`Film${movies.length > 1 ? 's' : ''} en stock: ${movies.length} 🎬`));
stockScreening.appendChild(document.createTextNode(`Séance${rooms.length > 1 ? 's' : ''} planifiée${rooms.length > 1 ? 's' : ''} : ${rooms.length * movies.length} 🎟️`));
/*const pluralMovie = document.createElement('span');
const bouttons = document.createElement('button');
const icon = document.createElement('i');
icon.className = 'bi bi-trash3-fill';
bouttons.className = 'btn btn-sm btn-danger ms-3';
bouttons.appendChild(icon);
bouttons.type = 'button';
stockRoom.appendChild(document.createTextNode(`Salle${rooms.length > 1 ? 's' : ''} en stock: ${rooms.length} 🏟️`));
//stockRoom.appendChild(boutton);
pluralMovie.textContent = movies.length > 1 ? 's' : '';
stockMovie.appendChild(document.createTextNode(`Film${pluralMovie.textContent} en stock: ${movies.length} 🎬`));
stockScreening.appendChild(document.createTextNode(`Séance${rooms.length > 1 ? 's' : ''} planifiée${rooms.length > 1 ? 's' : ''} : ${rooms.length * movies.length} 🎟️`));
//stockScreening.appendChild(boutton);
//stockMovie.appendChild(boutton);
bouttons.forEach(btn => {

    stockMovie.appendChild(btn);
    stockRoom.appendChild(btn);
    stockScreening.appendChild(btn);
    btn.addEventListener('click', () => {
        alert('Fonctionnalité non implémentée');
    });
});*/



formRoom.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. On récupère les éléments
    const name = document.getElementById('nameRoom').value;
    const capacity = document.getElementById("capacity").value;
    const typeElement = document.getElementById('typeRoom');
    const activeElement = document.getElementById('activeRoom');

    // 2. On extrait les valeurs
    const type = typeElement.value;
    const active = activeElement.value;

    const res = await fetch(`${API_BASE_URL}?action=add_room`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name,
            capacity,
            type,
            active
        })
    });

    const data = await res.json();

    if (!res.ok) {
        alert(data.error || 'Erreur lors de l\'ajout');
        return;
    }
    location.reload();
    formRoom.reset();
    alert('Salle ajoutée 🎬');
});

formMovie.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('movieTitle').value;
    const description = document.getElementById("movieSummary").value;
    const duration = document.getElementById('movieDuration').value;
    const genre = document.getElementById('movieGenre').value;
    const director = document.getElementById('movieDirector').value;
    const release_year = document.getElementById('movieReleaseYear').value;

    const res = await fetch(`${API_BASE_URL}?action=add_movie`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title,
            description,
            duration,
            genre,
            director,
            release_year
        })
    });

    const data = await res.json();

    if (!res.ok) {
        alert(data.error);
        return;
    }
    location.reload();
    formMovie.reset();
    alert('Film ajouté 🎬');
});




form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const movie_id = movieSelect.value;
    const room_id = roomSelect.value;
    const start_time = document.getElementById('startTime').value;

    const res = await fetch(`${API_BASE_URL}?action=add_screening`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            movie_id,
            room_id,
            start_time
        })
    });

    const data = await res.json();

    if (!res.ok) {
        alert(data.error);
        return;
    }
    alert('Séance créée 🎬');
});



/*async function loadData() {
    const moviesRes = await fetch("index.php?action=list_movies");
    const movies = await moviesRes.json();
    console.log(movies);

    const roomsRes = await fetch("index.php?action=list_rooms");
    const rooms = await roomsRes.json();
    console.log(rooms);
}

loadData();
async function addScreening() {
    const res = await fetch('index.php?action=add_screening', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            movie_id: 3,
            room_id: 1,
            start_time: '2026-02-01 18:00:00'
        })
    });

    const data = await res.json();

    if (!res.ok) {
        alert(data.error);
        return;
    }

    alert('Séance créée 🎬');
}
addScreening();*/


/*fetch('index.php?action=add_screening', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        movie_id: 1,
        room_id: 1,
        start_time: '2026-02-01 18:00:00'
    })
})
    .then(res => res.json())
    .then(data => console.log(data)); */
