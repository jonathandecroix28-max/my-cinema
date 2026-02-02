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
        echo json_encode($this->repository->getAll());
    }

    public function add()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        // Vérification : on s'assure que les champs critiques ne sont pas vides
        if (empty($data['title']) || empty($data['description'])) {
            echo json_encode(["success" => false, "error" => "Le titre et la description sont obligatoires"]);
            return;
        }

        // Création de l'entité
        $movie = new Movie();
        $movie->title = $data['title'];
        $movie->description = $data['description'];
        $movie->duration = $data['duration'] ?? null; // Utilise ?? null pour les champs facultatifs
        // Au lieu de : $movie->release_year = $data['release_year'];
// Fais ceci pour ne garder que les 4 premiers chiffres :
        $movie->release_year = substr($data['release_year'], 0, 4);
        $movie->genre = $data['genre'] ?? null;
        $movie->director = $data['director'] ?? null;
        $movie->created_at = date('Y-m-d H:i:s');
        $movie->updated_at = date('Y-m-d H:i:s');

        try {
            // C'est ici que la magie opère vers la Database
            $this->repository->add($movie);
            echo json_encode(["success" => true, "message" => "Film ajouté avec succès !"]);
        } catch (Exception $e) {
            // En cas d'erreur (ex: problème de connexion SQL)
            http_response_code(500);
            echo json_encode(["success" => false, "error" => "Erreur DB : " . $e->getMessage()]);
        }
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
        $id = $_GET['id'] ?? null;
        if ($id === null) {
            echo json_encode(["error" => "ID manquant"]);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true); // Pour les requêtes POST/PUT

        $movie = $this->repository->find($id);
        if (!$movie) {
            echo json_encode(["error" => "Film non trouvé"]);
            return;
        }

        // Mettre à jour les propriétés du film
        $movie->title = $data['title'] ?? $movie->title;
        $movie->description = $data['description'] ?? $movie->description;
        $movie->duration = $data['duration'] ?? $movie->duration;
        $movie->release_year = $data['release_year'] ?? $movie->release_year;
        $movie->genre = $data['genre'] ?? $movie->genre;
        $movie->director = $data['director'] ?? $movie->director;
        $movie->updated_at = date('Y-m-d H:i:s');

        try {
            $this->repository->update($movie);
            echo json_encode(["success" => true, "message" => "Film mis à jour !"]);
        } catch (Exception $e) {
            echo json_encode(["success" => false, "error" => "Erreur lors de la mise à jour du film."]);
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