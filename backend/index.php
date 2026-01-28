<?php
// On affiche les erreurs pour voir ce qui se passe
echo "Le fichier index.php est lu par le serveur !";

// Le chemin ABSOLU vers ton fichier de base de données
/*$db_file = __DIR__ . '/config/database.php';

if (file_exists($db_file)) {
    require_once $db_file;
} else {
    die("ERREUR : Le fichier est introuvable à cet endroit : " . $db_file);
}


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
    default:
        echo json_encode(["error" => "Action non trouvée"]);
        break;
}