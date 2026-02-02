import { fetchRooms, deleteRoom } from '../api/roomApi.js';
import { createRoomTable } from '../components/roomTable.js';

export async function initRoomsPage() {
    console.log('Rooms page loaded');
    
    try {
        const rooms = await fetchRooms();
        const roomsList = document.getElementById('roomsList');
        
        if (roomsList) {
            const roomTable = createRoomTable(rooms, handleDeleteRoom);
            roomsList.appendChild(roomTable);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des salles:', error);
    }
}

async function handleDeleteRoom(roomId, rowElement) {
    try {
        const result = await deleteRoom(roomId);
        
        if (result.success) {
            alert('Salle supprimée !');
            rowElement.remove();
        } else {
            alert(result.error || 'Erreur lors de la suppression');
        }
    } catch (error) {
        alert('Erreur de connexion au serveur');
    }
}
