import { API_BASE_URL } from '../../config.js';

export async function fetchScreenings() {
    const response = await fetch(`${API_BASE_URL}?action=list_screenings`);
    return response.json();
}

export async function addScreening(screeningData) {
    const response = await fetch(`${API_BASE_URL}?action=add_screening`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(screeningData)
    });
    return response.json();
}
