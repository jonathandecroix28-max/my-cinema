import { initHomePage } from './pages/homePage.js';
import { initMoviesPage } from './pages/moviesPage.js';
import { initRoomsPage } from './pages/roomsPage.js';
import { initScreensPage } from './pages/screensPage.js';

// Détection de la page actuelle
const currentPage = window.location.pathname.split('/').pop() || 'index.html';

// Router
switch (currentPage) {
    case 'index.html':
    case '':
        initHomePage();
        break;
    case 'movies.html':
        initMoviesPage();
        break;
    case 'rooms.html':
        initRoomsPage();
        break;
    case 'screens.html':
        initScreensPage();
        break;
    default:
        console.warn('Page non reconnue');
}
