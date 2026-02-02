const session = document.getElementById('list_screenings');
import { API_BASE_URL } from './config.js';
const screenings = await fetch(`${API_BASE_URL}?action=list_screenings`).then(res => res.json())
const movies = await fetch(`${API_BASE_URL}?action=list_movies`).then(res => res.json());
const rooms = await fetch(`${API_BASE_URL}?action=list_rooms`).then(res => res.json());
const displayMovie = (movie_id) => {
    const movie = movies.find(m => m.id === movie_id);
    return movie ? movie.title : 'Film inconnu';
}
const displayRoom = (room_id) => {
    const room = rooms.find(r => r.id === room_id);
    return room ? room.name : 'Salle inconnue';
}
screenings.forEach(screening => {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${screening.id}</td>
        <td>${displayMovie(screening.movie_id)}</td>
        <td>${displayRoom(screening.room_id)}</td>
        <td>${screening.start_time}</td>
    `;
    session.appendChild(row);
})