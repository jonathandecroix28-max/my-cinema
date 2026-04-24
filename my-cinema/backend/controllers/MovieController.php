<?php
// Contrôleur pour gérer les opérations liées aux films
class MovieController
{
    private $service;

    public function __construct()
    {
        $this->service = new MovieService();
    }

    /**
     * Lister tous les films (avec filtres optionnels)
     */
    public function list()
    {
        //  Récupérer et valider les paramètres de filtrage
        $genre = isset($_GET['genre']) && $_GET['genre'] !== '' ? trim($_GET['genre']) : null;
        $year = isset($_GET['year']) && $_GET['year'] !== '' ? (int) $_GET['year'] : null;
        $search = isset($_GET['search']) && $_GET['search'] !== '' ? trim($_GET['search']) : null;

        //  Validation de l'année si fournie
        if ($year !== null && ($year < 1895 || $year > date('Y'))) {
            echo json_encode([
                "success" => false,
                "error" => "Année invalide. Doit être entre 1895 et " . date('Y')
            ]);
            return;
        }

        $movies = $this->service->listMovies($genre, $year, $search);
        echo json_encode($movies);
    }

    /**
     *   Récupérer un film par son ID
     */
    public function get()
    {
        //  Vérifier que l'ID est présent
        $id = $_GET['id'] ?? null;

        if (!$id) {
            echo json_encode([
                "success" => false,
                "error" => "ID manquant"
            ]);
            return;
        }

        //  Valider que l'ID est un nombre positif
        if (!is_numeric($id) || $id < 1) {
            echo json_encode([
                "success" => false,
                "error" => "ID invalide. Doit être un nombre positif"
            ]);
            return;
        }

        //  Convertir en entier pour sécurité
        $id = (int) $id;

        //  Appeler le service
        $movie = $this->service->getMovieById($id);

        if ($movie) {
            echo json_encode($movie);
        } else {
            echo json_encode([
                "success" => false,
                "error" => "Film introuvable"
            ]);
        }
    }

    /**
     * Ajouter un nouveau film
     */
    public function add()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        //  Vérification des données obligatoires
        if (!isset($data['title'], $data['description'], $data['duration'], $data['genre'], $data['release_year'])) {
            echo json_encode([
                "success" => false,
                "error" => "Données manquantes. Champs requis : title, description, duration, genre, release_year"
            ]);
            return;
        }

        //  Nettoyer les données
        $title = trim($data['title']);
        $description = trim($data['description']);
        $duration = (int) $data['duration'];
        $genre = trim($data['genre']);
        $director = isset($data['director']) ? trim($data['director']) : null;
        $release_year = (int) $data['release_year'];

        //  Validations
        if (empty($title)) {
            echo json_encode([
                "success" => false,
                "error" => "Le titre ne peut pas être vide"
            ]);
            return;
        }

        if (empty($description)) {
            echo json_encode([
                "success" => false,
                "error" => "La description ne peut pas être vide"
            ]);
            return;
        }

        if ($duration < 1 || $duration > 85740) {
            echo json_encode([
                "success" => false,
                "error" => "La durée doit être entre 1 et 85740 minutes (reçu : {$duration})"
            ]);
            return;
        }

        $currentYear = date('Y');
        if ($release_year < 1895 || $release_year > $currentYear) {
            echo json_encode([
                "success" => false,
                "error" => "L'année doit être entre 1895 et {$currentYear} (reçu : {$release_year})"
            ]);
            return;
        }

        //  Appeler le service
        $result = $this->service->addMovie(
            $title,
            $description,
            $duration,
            $genre,
            $director,
            $release_year
        );

        echo json_encode($result);
    }

    /**
     * Supprimer un film
     */
    public function remove()
    {
        $id = $_GET['id'] ?? null;

        //  Vérifications de sécurité
        if (!$id) {
            echo json_encode([
                "success" => false,
                "error" => "ID manquant"
            ]);
            return;
        }

        if (!is_numeric($id) || $id < 1) {
            echo json_encode([
                "success" => false,
                "error" => "ID invalide"
            ]);
            return;
        }

        $result = $this->service->deleteMovie((int) $id);
        echo json_encode($result);
    }

    /**
     * Mettre à jour un film
     */
    public function update()
    {
        $id = $_GET['id'] ?? null;

        //  Vérifications de sécurité sur l'ID
        if (!$id) {
            echo json_encode([
                "success" => false,
                "error" => "ID manquant"
            ]);
            return;
        }

        if (!is_numeric($id) || $id < 1) {
            echo json_encode([
                "success" => false,
                "error" => "ID invalide"
            ]);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);

        //  Vérification des données obligatoires
        if (!isset($data['title'], $data['description'], $data['duration'], $data['genre'], $data['release_year'])) {
            echo json_encode([
                "success" => false,
                "error" => "Données manquantes"
            ]);
            return;
        }

        //  Nettoyer les données
        $title = trim($data['title']);
        $description = trim($data['description']);
        $duration = (int) $data['duration'];
        $genre = trim($data['genre']);
        $director = isset($data['director']) ? trim($data['director']) : null;
        $release_year = (int) $data['release_year'];

        //  Validations
        if (empty($title)) {
            echo json_encode([
                "success" => false,
                "error" => "Le titre ne peut pas être vide"
            ]);
            return;
        }

        if (empty($description)) {
            echo json_encode([
                "success" => false,
                "error" => "La description ne peut pas être vide"
            ]);
            return;
        }

        if ($duration < 1 || $duration > 85740) {
            echo json_encode([
                "success" => false,
                "error" => "La durée doit être entre 1 et 85740 minutes"
            ]);
            return;
        }

        $currentYear = date('Y');
        if ($release_year < 1895 || $release_year > $currentYear) {
            echo json_encode([
                "success" => false,
                "error" => "L'année doit être entre 1895 et {$currentYear}"
            ]);
            return;
        }

        //  Appeler le service
        $result = $this->service->updateMovie(
            (int) $id,
            $title,
            $description,
            $duration,
            $genre,
            $director,
            $release_year
        );

        echo json_encode($result);
    }
}