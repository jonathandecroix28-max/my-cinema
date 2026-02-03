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
            INSERT INTO screenings (movie_id, room_id, start_time, created_at)
            VALUES (:movie_id, :room_id, :start_time, :created_at)
        ");
        $stmt->execute([
            ':movie_id' => $screening->movie_id,
            ':room_id' => $screening->room_id,
            ':start_time' => $screening->start_time,
            ':created_at' => $screening->created_at,

        ]);
    }

    public function checkConflicts($movie_id, $room_id, $start_time)
    {
        $stmt = $this->pdo->prepare("
            SELECT * FROM screenings 
            WHERE movie_id = :movie_id AND room_id = :room_id AND start_time = :start_time
        ");
        $stmt->execute([
            ':movie_id' => $movie_id,
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

    public function delete($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM screenings WHERE id = :id");
        $stmt->execute([':id' => $id]);
    }
    public function exists($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM screenings WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ? true : false;
    }
}
?>