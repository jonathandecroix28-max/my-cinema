<?php
require_once __DIR__ . '/../models/Movie.php';
class MovieRepository
{
    private $pdo;
    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }
    public function getAll()
    {
        $stmt = $this->pdo->query(" SELECT * FROM movies");
        return $stmt->fetchAll(PDO::FETCH_CLASS, "Movie");
    }
    public function add(Movie $movie)
    {
        $stmt = $this->pdo->prepare("INSERT INTO movies (title, description, duration,
release_year,genre, director) VALUES (? , ?, ?, ?, ?, ?) ");
        $stmt->execute([
            $movie->title,
            $movie->description,
            $movie->duration,
            $movie->release_year,
            $movie->genre,
            $movie->director
        ]);
    }
    // Méthodes update , delete , find , etc similaires
} ?>