<?php

class MovieController
{
    private $repository;

    public function __construct()
    {
        $this->repository = new MovieRepository(); // repository créé par la suite
    }

    public function list()
    {
        $genre = $_GET['genre'] ?? null;
        $year = $_GET['year'] ?? null;

        $movies = $this->repository->findAll($genre, $year);
        echo json_encode($movies);
    }

    public function add()
    {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        if (!$data) {
            echo json_encode(["success" => false, "error" => "Données JSON invalides"]);
            return;
        }

        // --- ÉTAPE 1 : Validation des formats et types ---
        $errors = $this->validateMovieData($data);
        if (!empty($errors)) {
            echo json_encode(["success" => false, "errors" => $errors]);
            return;
        }
        $title = trim(strip_tags($data['title']));
        $year = (int) substr($data['release_year'], 0, 4);
        $director = isset($data['director']) ? trim(strip_tags($data['director'])) : 'Inconnu';

        // --- ÉTAPE 2 : Vérification des doublons (Logique métier) ---
        // Note : On passe le titre ET l'année pour être précis
        if ($this->repository->exists($title, $year, $director)) {
            echo json_encode([
                "success" => false,
                "error" => "Ce film ($title par $director, sorti en $year) est déjà présent dans le catalogue."
            ]);
            return;
        }

        // --- ÉTAPE 3 : Création de l'objet et enregistrement ---
        $movie = new Movie();
        $movie->title = trim(strip_tags($data['title']));
        $movie->description = trim(strip_tags($data['description']));
        $movie->genre = isset($data['genre']) ? trim(strip_tags($data['genre'])) : null;
        $movie->director = isset($data['director']) ? trim(strip_tags($data['director'])) : null;
        $movie->release_year = (int) substr($data['release_year'], 0, 4);
        $movie->duration = (int) $data['duration'];
        $movie->created_at = date('Y-m-d H:i:s');
        $movie->updated_at = date('Y-m-d H:i:s');

        try {
            $this->repository->add($movie);
            echo json_encode(["success" => true, "message" => "Film ajouté !"]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => "Erreur DB"]);
        }
    }
    private function validateMovieData($data, $isUpdate = false)
    {
        $errors = [];
        $currentYear = (int) date('Y');

        // Si c'est un update, l'ID est obligatoire
        if ($isUpdate && (empty($data['id']) || !is_numeric($data['id']))) {
            $errors[] = "ID du film manquant ou invalide";
        }

        // Titre & Description (Trim et nettoyage)
        $title = isset($data['title']) ? trim(strip_tags($data['title'])) : '';
        if ($title === '' || strlen($title) > 255) {
            $errors[] = "Le titre est requis et doit faire moins de 255 caractères";
        }

        // Année (1895 - Aujourd'hui)
        $year = isset($data['release_year']) ? (int) substr($data['release_year'], 0, 4) : 0;
        if ($year < 1895 || $year > $currentYear) {
            $errors[] = "Année invalide (1895-$currentYear)";
        }

        // Durée (1 - 85740)
        $duration = isset($data['duration']) ? (int) $data['duration'] : 0;
        if ($duration < 1 || $duration > 85740) {
            $errors[] = "La durée doit être comprise entre 1 et 85740 minutes";
        }

        // Genre & Réalisateur (Optionnels mais bridés)
        if (isset($data['genre']) && strlen($data['genre']) > 30)
            $errors[] = "Genre trop long";
        if (isset($data['director']) && strlen($data['director']) > 50)
            $errors[] = "Nom du réalisateur trop long";

        return $errors;
    }


    public function get()
    {
        $id = $_GET['id'] ?? null;
        if ($id === null) {
            echo json_encode(["error" => "ID manquant"]);
            return;
        }

        $movie = $this->repository->find($id);
        if ($movie) {
            echo json_encode($movie);
        } else {
            echo json_encode(["error" => "Film non trouvé"]);
        }
    }

    public function update()
    {
        // 1. Récupération et sécurisation de l'ID
        $id = isset($_GET['id']) ? (int) $_GET['id'] : null;

        if (!$id || $id <= 0) {
            echo json_encode(["success" => false, "error" => "ID manquant ou invalide"]);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);

        // 2. Validation centralisée
        // On peut passer l'ID dans data pour que validateMovieData soit content
        $data['id'] = $id;
        $errors = $this->validateMovieData($data, true);

        if (!empty($errors)) {
            echo json_encode(["success" => false, "errors" => $errors]);
            return;
        }

        // 3. Recherche du film
        $movie = $this->repository->find($id);
        if (!$movie) {
            echo json_encode(["success" => false, "error" => "Film non trouvé"]);
            return;
        }

        $title = trim(strip_tags($data['title']));
        $year = (int) substr($data['release_year'], 0, 4);
        $director = isset($data['director']) ? trim(strip_tags($data['director'])) : 'Inconnu';

        // Vérification du doublon "Triple Sécurité"
        if ($this->repository->exists($title, $year, $director)) {
            echo json_encode([
                "success" => false,
                "error" => "Ce film ($title par $director, sorti en $year) est déjà présent dans le catalogue."
            ]);
            return;
        }

        // 4. Mise à jour avec nettoyage (Sanitization)
        // On utilise strip_tags pour éviter que quelqu'un injecte du JS lors d'un update
        $movie->title = isset($data['title']) ? trim(strip_tags($data['title'])) : $movie->title;
        $movie->description = isset($data['description']) ? trim(strip_tags($data['description'])) : $movie->description;
        $movie->duration = isset($data['duration']) ? (int) $data['duration'] : $movie->duration;
        $movie->release_year = isset($data['release_year']) ? (int) substr($data['release_year'], 0, 4) : $movie->release_year;
        $movie->genre = isset($data['genre']) ? trim(strip_tags($data['genre'])) : $movie->genre;
        $movie->director = isset($data['director']) ? trim(strip_tags($data['director'])) : $movie->director;
        $movie->updated_at = date('Y-m-d H:i:s');

        try {
            $this->repository->update($movie);
            echo json_encode(["success" => true, "message" => "Film mis à jour !"]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => "Erreur lors de la mise à jour."]);
        }
    }
    public function remove()
    {
        $id = $_GET['id'] ?? null;
        if ($id === null) {
            echo json_encode(["error" => "ID manquant"]);
            return;
        }

        try {
            $this->repository->delete($id);
            echo json_encode(["success" => true, "message" => "Film supprimé !"]);
        } catch (Exception $e) {
            echo json_encode(["success" => false, "error" => "Erreur lors de la suppression du film."]);
        }
    }
}