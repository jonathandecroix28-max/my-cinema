<?php
class MovieService
{
    private $movieRepo;

    public function __construct()
    {
        $this->movieRepo = new MovieRepository();
    }

    /**
     * Lister les films (avec filtres optionnels)
     */
    public function listMovies($genre = null, $year = null, $search = null)
    {
        return $this->movieRepo->findAll($genre, $year, $search);
    }

    /**
     * Récupérer un film par son ID
     */
    public function getMovieById($id)
    {
        if (!is_numeric($id) || $id < 1) {
            return false;
        }

        return $this->movieRepo->findById((int) $id);
    }

    /**
     * Ajouter un nouveau film
     */
    public function addMovie($title, $description, $duration, $genre, $director, $release_year)
    {
        // ✅ Validation du titre
        if (empty(trim($title))) {
            return [
                "success" => false,
                "error" => "Le titre ne peut pas être vide"
            ];
        }

        // ✅ Validation de la description
        if (empty(trim($description))) {
            return [
                "success" => false,
                "error" => "La description ne peut pas être vide"
            ];
        }

        // ✅ Validation de la durée
        if ($duration < 1 || $duration > 500) {
            return [
                "success" => false,
                "error" => "La durée doit être entre 1 et 500 minutes"
            ];
        }

        // ✅ Validation de l'année
        $currentYear = date('Y');
        if ($release_year < 1895 || $release_year > $currentYear) {
            return [
                "success" => false,
                "error" => "L'année doit être entre 1895 et {$currentYear}"
            ];
        }

        // ✅ NOUVEAU : Vérifier si le film existe déjà (titre + année + réalisateur)
        if ($this->movieRepo->existsByTitleYearDirector($title, $release_year, $director)) {
            $directorText = $director ? "réalisé par {$director}" : "sans réalisateur spécifié";
            return [
                "success" => false,
                "error" => "Ce film ({$title}, {$release_year}, {$directorText}) existe déjà dans la base de données."
            ];
        }

        // ✅ Création de l'objet Movie
        $movie = new Movie();
        $movie->title = $title;
        $movie->description = $description;
        $movie->duration = (int) $duration;
        $movie->genre = $genre;
        $movie->director = $director;
        $movie->release_year = (int) $release_year;
        $movie->created_at = date('Y-m-d H:i:s');

        try {
            $this->movieRepo->add($movie);
            return [
                "success" => true,
                "message" => "Film ajouté avec succès !"
            ];
        } catch (Exception $e) {
            return [
                "success" => false,
                "error" => "Erreur lors de l'ajout : " . $e->getMessage()
            ];
        }
    }

    /**
     * Mettre à jour un film
     */
    public function updateMovie($id, $title, $description, $duration, $genre, $director, $release_year)
    {
        // ✅ Vérifier que le film existe
        if (!$this->movieRepo->findById($id)) {
            return [
                "success" => false,
                "error" => "Le film n'existe pas"
            ];
        }

        // ✅ Validation du titre
        if (empty(trim($title))) {
            return [
                "success" => false,
                "error" => "Le titre ne peut pas être vide"
            ];
        }

        // ✅ Validation de la description
        if (empty(trim($description))) {
            return [
                "success" => false,
                "error" => "La description ne peut pas être vide"
            ];
        }

        // ✅ Validation de la durée
        if ($duration < 1 || $duration > 500) {
            return [
                "success" => false,
                "error" => "La durée doit être entre 1 et 500 minutes"
            ];
        }

        // ✅ Validation de l'année
        $currentYear = date('Y');
        if ($release_year < 1895 || $release_year > $currentYear) {
            return [
                "success" => false,
                "error" => "L'année doit être entre 1895 et {$currentYear}"
            ];
        }

        // ✅ NOUVEAU : Vérifier si le film existe déjà (en excluant le film en cours de modification)
        if ($this->movieRepo->existsByTitleYearDirector($title, $release_year, $director, $id)) {
            $directorText = $director ? "réalisé par {$director}" : "sans réalisateur spécifié";
            return [
                "success" => false,
                "error" => "Un autre film avec ces caractéristiques ({$title}, {$release_year}, {$directorText}) existe déjà."
            ];
        }

        try {
            $this->movieRepo->update($id, $title, $description, $duration, $genre, $director, $release_year);
            return [
                "success" => true,
                "message" => "Film mis à jour avec succès !"
            ];
        } catch (Exception $e) {
            return [
                "success" => false,
                "error" => "Erreur lors de la mise à jour : " . $e->getMessage()
            ];
        }
    }

    /**
     * Supprimer un film
     */
    public function deleteMovie($id)
    {
        if (!$this->movieRepo->findById($id)) {
            return [
                "success" => false,
                "error" => "Le film n'existe pas"
            ];
        }

        try {
            $this->movieRepo->delete($id);
            return [
                "success" => true,
                "message" => "Film supprimé avec succès !"
            ];
        } catch (Exception $e) {
            return [
                "success" => false,
                "error" => "Erreur lors de la suppression : " . $e->getMessage()
            ];
        }
    }
}