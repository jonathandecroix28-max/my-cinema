<?php
class MovieRepository
{
    private $pdo;
    public function __construct()
    {
        global $pdo;
        $this->pdo = $pdo;
    }
    public function getAll()
    {
        $stmt = $this->pdo->query(" SELECT * FROM movies ");
        return $stmt->fetchAll(PDO::FETCH_CLASS, "Movie");
    }
    public function add(Movie $movie)
    {
        $stmt = $this->pdo->prepare(" INSERT INTO movies (title, description, duration,
release_year, genre, director, created_at, updated_at) VALUES (? , ? , ?, ? , ?, ?, ? , ? )");
        $stmt->execute([
            $movie->title,
            $movie->description,
            $movie->duration,
            $movie->release_year,
            $movie->genre,
            $movie->director,
            $movie->created_at,
            $movie->updated_at
        ]);
    }
    // Méthodes update , delete , find , etc similaires

    public function find($id)
    {
        $stmt = $this->pdo->prepare(" SELECT * FROM movies WHERE id = ? ");
        $stmt->execute([$id]);
        return $stmt->fetchObject("Movie");
    }

    public function delete($id)
    {
        $stmt = $this->pdo->prepare(" DELETE FROM movies WHERE id = ? ");
        $stmt->execute([$id]);
    }
    public function update(Movie $movie)
    {
        $stmt = $this->pdo->prepare(" UPDATE movies SET title = ?, description = ?, duration = ?,
        release_year = ?, genre = ?, director = ?, updated_at = ? WHERE id = ? ");
        $stmt->execute([
            $movie->title,
            $movie->description,
            $movie->duration,
            $movie->release_year,
            $movie->genre,
            $movie->director,
            $movie->updated_at,
            $movie->id
        ]);
    }
    // Dans ton MovieRepository
    // Fichier : MovieRepository.php
    public function exists(string $title, int $year, ?string $director = null): bool
    {
        $sql = "SELECT COUNT(*) FROM movies WHERE title = :title AND release_year = :year";
        $params = [
            ':title' => $title,
            ':year' => $year
        ];

        // On n'ajoute la condition réalisateur que si on a reçu la donnée
        if ($director !== null) {
            $sql .= " AND director = :director";
            $params[':director'] = $director;
        }

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return (int) $stmt->fetchColumn() > 0;
    }

    public function findAll($genre = null, $year = null)
    {
        $sql = "SELECT * FROM movies WHERE 1=1"; // Le 1=1 facilite l'ajout de conditions
        $params = [];

        if ($genre) {
            $sql .= " AND genre = :genre";
            $params[':genre'] = $genre;
        }
        if ($year) {
            $sql .= " AND release_year = :year";
            $params[':year'] = $year;
        }

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }
}