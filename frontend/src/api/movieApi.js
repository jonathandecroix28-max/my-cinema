import { API_BASE_URL } from '../../config.js';

export async function fetchMovies() {
    const response = await fetch(`${API_BASE_URL}?action=list_movies`);
    return response.json();
}

export async function addMovie(movieData) {
    const response = await fetch(`${API_BASE_URL}?action=add_movie`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(movieData)
    });
    return response.json();
}

export async function deleteMovie(id) {
    const response = await fetch(`${API_BASE_URL}?action=delete_movie&id=${id}`, {
        method: 'DELETE'
    });
    return response.json();
}

export async function updateMovie(id, movieData) {
    const response = await fetch(`${API_BASE_URL}?action=update_movie&id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(movieData)
    });
    return response.json();
}
