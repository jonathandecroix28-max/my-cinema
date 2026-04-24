import {
    initSession,
    isAdmin,
    logout,
    getUserInfo
} from './config.js';

export function initAuth() {
    console.log('🔐 initAuth() appelé');

    initSession();

    const userInfo = getUserInfo();
    console.log('👤 UserInfo après initSession:', userInfo);
    console.log('📦 localStorage:', localStorage.getItem('userRole'));

    updateAuthUI();
}

export function updateAuthUI() {
    console.log('🔄 updateAuthUI() appelé');

    const userInfo = getUserInfo();
    updateUserBadge(userInfo);
    toggleAdminElements(userInfo.isAdmin);
}

function updateUserBadge(userInfo) {
    console.log('🏷️ updateUserBadge() appelé, isAdmin:', userInfo.isAdmin);

    const badge = document.getElementById('user-badge');
    if (!badge) {
        console.warn('⚠️ Element #user-badge NOT FOUND');
        return;
    }

    console.log('✅ Badge trouvé');

    if (userInfo.isAdmin) {
        badge.innerHTML = `
            <span style="padding: 8px 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 20px; font-weight: bold;">
                👑 Admin
            </span>
            <button onclick="handleLogout()" style="padding: 8px 15px; background: #ff6b6b; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
                Déconnexion
            </button>
        `;
        console.log('✅ Badge admin affiché');
    } else {
        badge.innerHTML = `
            <span style="padding: 8px 15px; background: #f0f0f0; color: #666; border-radius: 20px; font-weight: bold;">
                👤 Visiteur
            </span>
            <a href="../../login.html" style="padding: 8px 15px; background: #667eea; color: white; border-radius: 8px; text-decoration: none; font-weight: bold;">
                Connexion
            </a>
        `;
        console.log('✅ Badge visiteur affiché');
    }
}

function toggleAdminElements(isAdmin) {
    console.log('🔧 toggleAdminElements() appelé, isAdmin:', isAdmin);

    const adminElements = document.querySelectorAll('.admin-only');
    console.log('🔍 Éléments .admin-only trouvés:', adminElements.length);

    adminElements.forEach((element) => {
        if (isAdmin) {
            // ✅ Force l'affichage avec !important
            element.style.setProperty('display', 'block', 'important');
            element.removeAttribute('disabled');
        } else {
            element.style.setProperty('display', 'none', 'important');
            element.setAttribute('disabled', 'disabled');
        }
    });

    console.log(isAdmin ? `✅ ${adminElements.length} éléments admin AFFICHÉS (forcé)` : `❌ ${adminElements.length} éléments admin MASQUÉS`);
}

window.handleLogout = () => {
    if (confirm('Se déconnecter ?')) {
        logout();
        window.location.href = '../../login.html';
    }
};

export function requireAdmin() {
    const admin = isAdmin();
    console.log('🔒 requireAdmin() appelé, isAdmin:', admin);

    if (!admin) {
        alert('⛔ Action réservée aux administrateurs');
        return false;
    }
    return true;
}