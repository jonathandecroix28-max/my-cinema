export function updateStockStats(movies, rooms, screenings) {
    const stockMovie = document.getElementById('stockMovie');
    const stockRoom = document.getElementById('stockRoom');
    const stockScreening = document.getElementById('stockScreening');
    
    if (stockMovie) {
        stockMovie.textContent = `Film${movies.length > 1 ? 's' : ''} en stock: ${movies.length} 🎬`;
    }
    
    if (stockRoom) {
        stockRoom.textContent = `Salle${rooms.length > 1 ? 's' : ''} en stock: ${rooms.length} 🏟️`;
    }
    
    if (stockScreening) {
        const screeningCount = screenings?.length || (rooms.length * movies.length);
        stockScreening.textContent = `Séance${screeningCount > 1 ? 's' : ''} planifiée${screeningCount > 1 ? 's' : ''} : ${screeningCount} 🎟️`;
    }
}
