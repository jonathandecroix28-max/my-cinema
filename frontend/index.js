
    console.log('Frontend loaded');
    const movieSelect = document.getElementById('movieSelect');
    const roomSelect = document.getElementById('roomSelect');
    const form = document.getElementById('screeningForm');

    const movies = await fetch('index.php?action=list_movies').then(res => res.json());
    const rooms = await fetch('index.php?action=list_rooms').then(res => res.json());

    movies.forEach(movie => {
        const option = document.createElement('option');
        option.value = movie.id;
        option.textContent = movie.title;
        movieSelect.appendChild(option);
    });

    rooms.forEach(room => {
        const option = document.createElement('option');
        option.value = room.id;
        option.textContent = room.name;
        roomSelect.appendChild(option);
    });
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const movie_id = movieSelect.value;
        const room_id = roomSelect.value;
        const start_time = document.getElementById('startTime').value;

        const res = await fetch('index.php?action=add_screening', {
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
