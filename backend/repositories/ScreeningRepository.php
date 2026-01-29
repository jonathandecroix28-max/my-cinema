<?php
class ScreeningRepository
{
    private $pdo;

    public function __construct()
    {
        global $pdo;
        $this->pdo = $pdo;
    }

    public function add($screening)
    {
        $stmt = $this->pdo->prepare("
            INSERT INTO screenings (movie_id, room_id, start_time, created_at, updated_at)
            VALUES (:movie_id, :room_id, :start_time, :created_at, :updated_at)
        ");
        $stmt->execute([
            ':movie_id' => $screening->movie_id,
            ':room_id' => $screening->room_id,
            ':start_time' => $screening->start_time,
            ':created_at' => $screening->created_at,
            ':updated_at' => $screening->updated_at
        ]);
    }

    public function checkConflicts($movie_id, $room_id, $start_time)
    {
        $stmt = $this->pdo->prepare("
            SELECT * FROM screenings 
            WHERE room_id = :room_id AND start_time = :start_time
        ");
        $stmt->execute([
            ':room_id' => $room_id,
            ':start_time' => $start_time
        ]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ? true : false;
    }

    public function getAll()
    {
        $stmt = $this->pdo->query("SELECT * FROM screenings");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>