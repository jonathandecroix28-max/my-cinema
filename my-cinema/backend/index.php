<?php

//  Désactiver l'affichage des erreurs en production
if (getenv('APP_ENV') === 'development') {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', 0);
    ini_set('display_startup_errors', 0);
    error_reporting(0);
}
ini_set('error_log', __DIR__ . '/logs/php_errors.log');
//  En-têtes de sécurité et CORS

//  Démarrer la session pour gérer l'authentification
session_start();

//  En-tête pour indiquer que les réponses seront au format JSON
header('Content-Type: application/json');

$request = $_GET['action'] ?? '';

if ($request === 'health') {
    http_response_code(200);
    echo json_encode(["status" => "ok"]);
    exit;
}

//  Liste blanche des origines autorisées
$allowedOrigins = [
    'http://localhost',
    'http://localhost:3000',
    'http://127.0.0.1',
    'http://localhost:8080'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header(header: 'Access-Control-Allow-Headers: Content-Type, Authorization, X-API-Key');

//  Headers de sécurité
header('X-Frame-Options: DENY');
header('X-Content-Type-Options: nosniff');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('Permissions-Policy: geolocation=(), microphone=(), camera=()');

// Gérer les requêtes OPTIONS (preflight CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
// Charger les classes automatiquement
require_once(__DIR__ . '/config/database.php');
require_once __DIR__ . '/autoload.php';

//  PROTECTION : Vérifier authentification pour actions sensibles
if (AuthMiddleware::requiresAuth($request)) {
    AuthMiddleware::checkAuth();
}
//  PROTECTION : Vérifier les permissions pour les actions admin
// le switch est utilisé pour router les différentes actions de l'API vers les contrôleurs correspondants
switch ($request) {
    case '': // action par défaut
        echo json_encode(["message" => "Bienvenue dans l'API de My-Cinema"]);
        break;
    //  Actions liées aux films
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
    //  Actions liées aux salles
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
    case 'deleted_rooms':
        $controller = new RoomController();
        $controller->deleted();
        break;
    case 'restore_room':
        $controller = new RoomController();
        $controller->restore();
        break;
    case 'permanent_delete_room':
        $controller = new RoomController();
        $controller->permanentDelete();
        break;
    case 'check_room_screenings':
        $controller = new RoomController();
        $controller->checkScreenings();
        break;
    //  Actions liées aux séances
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
    //  Action pour récupérer le planning des séances par salle
    case 'planning_by_room':
        $controller = new ScreeningController();
        $controller->getPlanningByRoom();
        break;
    // Si l'action demandée ne correspond à aucune des cases précédentes, retourner une erreur
    default:
        echo json_encode(["error" => "Action non trouvée"]);
        break;
}