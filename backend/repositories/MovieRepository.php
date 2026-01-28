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
} ?>