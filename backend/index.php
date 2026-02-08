<?php

// ✅ Désactiver l'affichage des erreurs en production
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Activer uniquement en développement
if (getenv('APP_ENV') === 'development') {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
}
ini_set('error_log', __DIR__ . '/logs/php_errors.log');

session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // ✅ CORS pour le frontend
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Gérer les requêtes OPTIONS (preflight CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once(__DIR__ . '/config/database.php');
require_once __DIR__ . '/autoload.php';

$request = $_GET['action'] ?? '';





switch ($request) {
    case '': // action par défaut
        echo json_encode(["message" => "Bienvenue dans l'API de My-Cinema"]);
        break;
    case 'list_movies':
        $controller = new MovieController();
        $controller->list();
        break;
    case 'add_movie':
        $controller = new MovieController();
        $controller->add();
        break;
    case 'get_movie':
        $controller = new MovieController();
        $controller->get();
        break;
    case 'delete_movie':
        $controller = new MovieController();
        $controller->remove();
        break;
    case 'update_movie':
        $controller = new MovieController();
        $controller->update();
        break;
    case 'list_rooms':
        $controller = new RoomController();
        $controller->list();
        break;
    case 'add_room':
        $controller = new RoomController();
        $controller->add();
        break;
    case 'get_room':
        $controller = new RoomController();
        $controller->get();
        break;
    case 'delete_room':
        $controller = new RoomController();
        $controller->remove();
        break;
    case 'update_room':
        $controller = new RoomController();
        $controller->update();
        break;
    case 'list_screenings':
        $controller = new ScreeningController();
        $controller->list();
        break;
    case 'add_screening':
        $controller = new ScreeningController();
        $controller->add();
        break;
    case 'delete_screening':
        $controller = new ScreeningController();
        $controller->remove();
        break;
    case 'update_screening':
        $controller = new ScreeningController();
        $controller->update();
        break;
    default:
        echo json_encode(["error" => "Action non trouvée"]);
        break;
}

