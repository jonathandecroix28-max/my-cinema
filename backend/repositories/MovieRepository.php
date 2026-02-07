<?php
class MovieRepository
{
    private $pdo;

    public function __construct()
    {
        global $pdo;
        $this->pdo = $pdo;
    }

    /**
     * Récupérer tous les films (avec filtres optionnels sécurisés)
     */
    public function findAll($genre = null, $year = null, $search = null)
    {
        $sql = "SELECT * FROM movies WHERE 1=1";
        $params = [];

        if ($genre !== null && $genre !== '') {
            $sql .= " AND genre = :genre";
            $params[':genre'] = $genre;
        }

        if ($year !== null && $year !== '') {
            $sql .= " AND release_year = :year";
            $params[':year'] = (int) $year;
        }

        if ($search !== null && $search !== '') {
            $sql .= " AND (title LIKE :search OR director LIKE :search OR description LIKE :search)";
            $params[':search'] = '%' . $search . '%';
        }

        $sql .= " ORDER BY title ASC";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Récupérer un film par son ID
     */
    public function findById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM movies WHERE id = :id");
        $stmt->execute([':id' => (int) $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * ✅ NOUVEAU : Vérifier si un film existe (titre + année + réalisateur)
     * 
     * @param string $title Titre du film
     * @param int $release_year Année de sortie
     * @param string|null $director Réalisateur (peut être null)
     * @param int|null $excludeId ID à exclure (pour l'update)
     * @return bool true si le film existe, false sinon
     */
    public function existsByTitleYearDirector($title, $release_year, $director, $excludeId = null)
    {
        // Si director est null, on vérifie uniquement titre + année
        if ($director === null || trim($director) === '') {
            $sql = "SELECT id FROM movies WHERE title = :title AND release_year = :year AND (director IS NULL OR director = '')";
            $params = [
                ':title' => $title,
                ':year' => (int) $release_year
            ];
        } else {
            $sql = "SELECT id FROM movies WHERE title = :title AND release_year = :year AND director = :director";
            $params = [
                ':title' => $title,
                ':year' => (int) $release_year,
                ':director' => $director
            ];
        }

        // Si on est en mode update, exclure le film en cours de modification
        if ($excludeId !== null) {
            $sql .= " AND id != :exclude_id";
            $params[':exclude_id'] = (int) $excludeId;
        }

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetch() ? true : false;
    }

    /**
     * ✅ ALTERNATIVE SIMPLE : Vérifier uniquement par titre
     * (Moins strict, mais plus simple)
     */
    public function existsByTitle($title, $excludeId = null)
    {
        $sql = "SELECT id FROM movies WHERE title = :title";

        if ($excludeId !== null) {
            $sql .= " AND id != :exclude_id";
        }

        $stmt = $this->pdo->prepare($sql);
        $params = [':title' => $title];

        if ($excludeId !== null) {
            $params[':exclude_id'] = (int) $excludeId;
        }

        $stmt->execute($params);
        return $stmt->fetch() ? true : false;
    }

    /**
     * Ajouter un nouveau film
     */
    public function add($movie)
    {
        $stmt = $this->pdo->prepare("
            INSERT INTO movies (title, description, duration, genre, director, release_year, created_at)
            VALUES (:title, :description, :duration, :genre, :director, :release_year, :created_at)
        ");
        $stmt->execute([
            ':title' => $movie->title,
            ':description' => $movie->description,
            ':duration' => (int) $movie->duration,
            ':genre' => $movie->genre,
            ':director' => $movie->director,
            ':release_year' => (int) $movie->release_year,
            ':created_at' => $movie->created_at,
        ]);
        return $this->pdo->lastInsertId();
    }

    /**
     * Mettre à jour un film
     */
    public function update($id, $title, $description, $duration, $genre, $director, $release_year)
    {
        $stmt = $this->pdo->prepare("
            UPDATE movies 
            SET title = :title, description = :description, duration = :duration, 
                genre = :genre, director = :director, release_year = :release_year
            WHERE id = :id
        ");
        $stmt->execute([
            ':title' => $title,
            ':description' => $description,
            ':duration' => (int) $duration,
            ':genre' => $genre,
            ':director' => $director,
            ':release_year' => (int) $release_year,
            ':id' => (int) $id
        ]);
        return $stmt->rowCount() > 0;
    }

    /**
     * Supprimer un film
     */
    public function delete($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM movies WHERE id = :id");
        $stmt->execute([':id' => (int) $id]);
        return $stmt->rowCount() > 0;
    }
}