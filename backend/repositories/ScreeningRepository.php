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
        // 1. Récupérer d'abord la durée du film qu'on veut ajouter
        $stmtMovie = $this->pdo->prepare("SELECT duration FROM movies WHERE id = :id");
        $stmtMovie->execute([':id' => $movie_id]);
        $newMovie = $stmtMovie->fetch(PDO::FETCH_ASSOC);

        if (!$newMovie)
            return false; // Le film n'existe pas

        $newDuration = $newMovie['duration'] + 15; // On ajoute 15min de battage (nettoyage)

        // 2. Chercher les chevauchements dans la même salle
        // Formule : (StartA < EndB) AND (EndA > StartB)
        $stmt = $this->pdo->prepare("
        SELECT screenings.* FROM screenings 
        JOIN movies ON screenings.movie_id = movies.id
        WHERE screenings.room_id = :room_id 
        AND :new_start < DATE_ADD(screenings.start_time, INTERVAL (movies.duration + 15) MINUTE)
        AND DATE_ADD(:new_start, INTERVAL :new_duration MINUTE) > screenings.start_time
    ");

        $stmt->execute([
            ':room_id' => $room_id,
            ':new_start' => $start_time,
            ':new_duration' => $newDuration
        ]);

        // Si on trouve une ligne, c'est qu'il y a un conflit
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

    public function update($id, $movie_id, $room_id, $start_time)
    {
        $stmt = $this->pdo->prepare("
            UPDATE screenings 
            SET movie_id = :movie_id, room_id = :room_id, start_time = :start_time
            WHERE id = :id
        ");
        $stmt->execute([
            ':movie_id' => $movie_id,
            ':room_id' => $room_id,
            ':start_time' => $start_time,
            ':id' => $id
        ]);
    }
    public function findById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM screenings WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
