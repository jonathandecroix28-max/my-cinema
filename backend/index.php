<?php
// On affiche les erreurs pour voir ce qui se passer
ini_set('display_errors', 1);
error_reporting(E_ALL);
require_once(__DIR__ . '/config/database.php');
//echo "Le fichier index.php est lu par le serveur !";
// Le chemin ABSOLU vers ton fichier de base de données



// autoload de toutes les classes
require_once __DIR__ . '/autoload.php';

// récupérer le paramètre action
$request = $_GET['action'] ?? '';

switch ($request) {
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
    default:
        echo json_encode(["error" => "Action non trouvée"]);
        break;
}
?>