
// ROOM-TRASH.JS - GESTION DE LA CORBEILLE
//ici on gère la corbeille des salles, l'affichage des salles supprimées, la restauration et la suppression définitive, avec une attention particulière à la robustesse et à l'expérience utilisateur

import { apiFetch, apiPermanentDelete, apiRestore, initSession } from './config.js';
import { initAuth, requireAdmin } from './auth-ui.js';

// Initialiser la session et l'authentification
initSession();
initAuth();

// Vérifier que l'utilisateur est admin
if (!requireAdmin()) {
    alert('⛔ Accès refusé : Cette page est réservée aux administrateurs.');
    window.location.href = 'rooms.html';
}

const trashTableBody = document.getElementById('trashTableBody');
const trashStats = document.getElementById('trashStats');

let deletedRooms = [];

// CHARGER LES SALLES SUPPRIMÉES

const loadDeletedRooms = async () => {
    try {
        const response = await apiFetch('deleted_rooms');

        console.log('========================================');
        console.log('📦 Réponse API brute:', response);
        console.log('📦 Type de réponse:', typeof response);
        console.log('📦 Est un tableau ?', Array.isArray(response));

        // Réinitialiser à un tableau vide par défaut
        deletedRooms = [];

        // Analyser tous les cas possibles
        if (response === null || response === undefined) {
            console.warn('⚠️ Réponse null ou undefined');
            deletedRooms = [];
        } else if (Array.isArray(response)) {
            console.log('✅ Cas 1 : Tableau direct');
            deletedRooms = response;
        } else if (response.data && Array.isArray(response.data)) {
            console.log('✅ Cas 2 : Objet avec propriété data');
            deletedRooms = response.data;
        } else if (response.success && response.data && Array.isArray(response.data)) {
            console.log('✅ Cas 3 : Objet avec success et data');
            deletedRooms = response.data;
        } else if (typeof response === 'object') {
            console.warn('⚠️ Objet inconnu, recherche de tableau...');
            for (let key in response) {
                if (Array.isArray(response[key])) {
                    console.log(`✅ Trouvé tableau dans "${key}"`);
                    deletedRooms = response[key];
                    break;
                }
            }
        }

        console.log('📊 Salles finales:', deletedRooms);
        console.log('📊 Nombre:', deletedRooms.length);
        console.log('========================================');

        renderTrash();
    } catch (error) {
        console.error('❌ Erreur chargement:', error);
        deletedRooms = [];
        renderTrash();
        if (trashStats) {
            trashStats.innerHTML = '❌ Erreur lors du chargement : ' + error.message;
            trashStats.className = 'alert alert-danger';
        }
    }
};



// AFFICHER LA CORBEILLE

const renderTrash = () => {
    console.log('🎨 Rendu avec', deletedRooms.length, 'salles');

    //  Sécurité : vérifier que c'est bien un tableau
    if (!Array.isArray(deletedRooms)) {
        console.error('❌ deletedRooms n\'est PAS un tableau:', deletedRooms);
        deletedRooms = [];
    }

    //  Cas 1 : Corbeille vide
    if (deletedRooms.length === 0) {
        trashTableBody.innerHTML = '<tr><td colspan="6" class="text-center">🎉 La corbeille est vide !</td></tr>';
        trashStats.innerHTML = '✅ Aucune salle supprimée';
        trashStats.className = 'alert alert-success';
        return;
    }

    //  Cas 2 : Salles présentes
    trashStats.innerHTML = `🗑️ <strong>${deletedRooms.length}</strong> salle(s) dans la corbeille`;
    trashStats.className = 'alert alert-warning';

    trashTableBody.innerHTML = '';

    deletedRooms.forEach((room, index) => {
        console.log(`  → Salle ${index + 1}:`, room);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="text-center">${room.id || 'N/A'}</td>
            <td>${room.name || 'Sans nom'}</td>
            <td class="text-center">${room.capacity || 0}</td>
            <td class="text-center">
                <span class="badge bg-${room.type === 'IMAX' ? 'danger' : room.type === '3D' ? 'warning' : 'secondary'}">
                    ${room.type || 'N/A'}
                </span>
            </td>
            <td class="text-center">
                <small>${formatDate(room.deleted_at)}</small>
            </td>
            <td class="text-center">
                <button class="btn btn-sm btn-success restore-btn" data-id="${room.id}" title="Restaurer">
                    <i class="bi bi-arrow-counterclockwise"></i> Restaurer
                </button>
                <button class="btn btn-sm btn-danger permanent-delete-btn" data-id="${room.id}" title="Supprimer définitivement">
                    <i class="bi bi-trash3"></i> Supprimer
                </button>
            </td>
        `;
        trashTableBody.appendChild(tr);
    });

    console.log('✅ Rendu terminé');
};


// FORMATER LA DATE

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;

        return new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    } catch (error) {
        return dateString;
    }
};


//RESTAURER UNE SALLE

const restoreRoom = async (id) => {
    console.log('♻️ Restauration de la salle ID:', id);

    try {
        const result = await apiRestore('room', id);

        console.log('📦 Résultat restauration:', result);

        if (result.success) {
            alert('✅ ' + result.message);
            await loadDeletedRooms();
        } else {
            alert('❌ ' + (result.error || 'Erreur inconnue'));
        }
    } catch (error) {
        console.error('❌ Erreur:', error);
        alert('❌ Erreur lors de la restauration : ' + error.message);
    }
};


// 🗑️ SUPPRIMER DÉFINITIVEMENT

// 🗑️ SUPPRIMER DÉFINITIVEMENT

const permanentDelete = async (id) => {
    console.log('����️ Suppression définitive de la salle ID:', id);

    const room = deletedRooms.find(r => r.id == id);
    if (!room) {
        alert('❌ Salle introuvable');
        return;
    }

    if (!confirm(`⚠️ ATTENTION !\n\nSupprimer définitivement "${room.name}" ?\n\nCette action est IRRÉVERSIBLE.`)) {
        return;
    }

    try {
        // ✅ CORRECTION : Pas besoin de .json()
        const result = await apiPermanentDelete('room', id);

        console.log('📦 Résultat suppression:', result);

        if (result.success) {
            alert('✅ ' + result.message);
            await loadDeletedRooms();
        } else {
            alert('❌ ' + (result.error || 'Erreur inconnue'));
        }
    } catch (error) {
        console.error('❌ Erreur:', error);
        alert('❌ Erreur lors de la suppression : ' + error.message);
    }
};


// 🖱️ GESTIONNAIRE D'ÉVÉNEMENTS

if (trashTableBody) {
    trashTableBody.addEventListener('click', async (e) => {
        // Restaurer
        if (e.target.closest('.restore-btn')) {
            const id = e.target.closest('.restore-btn').dataset.id;
            await restoreRoom(id);
            return;
        }

        // Supprimer définitivement
        if (e.target.closest('.permanent-delete-btn')) {
            const id = e.target.closest('.permanent-delete-btn').dataset.id;
            await permanentDelete(id);
            return;
        }
    });
}


// 🎬 CHARGEMENT INITIAL

console.log('🎬 Initialisation de room-trash.js');
loadDeletedRooms();