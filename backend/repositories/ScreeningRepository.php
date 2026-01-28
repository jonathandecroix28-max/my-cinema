<?php
require_once __DIR__ . '/../models/Screening.php';
class ScreeningRepository
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAll()
    {
        $stmt = $this->pdo->query("SELECT * FROM screenings");
        return $stmt->fetchAll(PDO::FETCH_CLASS, 'Screening');
    }
}