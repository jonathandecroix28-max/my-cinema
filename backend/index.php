<?php
require_once 'config/database.php'; // définit $pdo
require_once 'repositories/MovieRepository.php';
require_once 'controllers/MovieController.php';
require_once 'repositories/RoomRepository.php';
require_once 'controllers/RoomController.php';
require_once 'repositories/ScreeningRepository.php';
require_once 'controllers/ScreeningController.php';

$movieRepository = new MovieRepository($pdo);
$roomRepository = new RoomRepository($pdo);
$screeningRepository = new ScreeningRepository($pdo);

$request = $_GET['action'] ?? '';
// Récupération du paramètre d ' URL action indiquant la route API
header('Content-Type: application/json');

switch ($request) {
    case 'list_movies':
        $controller = new MovieController($pdo);
        $controller->list();
        break;
    case 'add_movie':
        $controller = new MovieController($pdo);
        $controller->add();
        break;
    case 'list_rooms':
        $controller = new RoomController($pdo);
        $controller->list();
        break;
    // ... autres actions pour Room et Screening
    default:
        echo json_encode(["error" => "Action not found"]);
        break;
}
?>