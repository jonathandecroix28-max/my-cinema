import { API_BASE_URL } from '../../config.js';

export async function fetchRooms() {
    const response = await fetch(`${API_BASE_URL}?action=list_rooms`);
    return response.json();
}

export async function addRoom(roomData) {
    const response = await fetch(`${API_BASE_URL}?action=add_room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData)
    });
    return response.json();
}

export async function deleteRoom(id) {
    const response = await fetch(`${API_BASE_URL}?action=delete_room&id=${id}`, {
        method: 'DELETE'
    });
    return response.json();
}

export async function updateRoom(id, roomData) {
    const response = await fetch(`${API_BASE_URL}?action=update_room&id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData)
    });
    return response.json();
}
