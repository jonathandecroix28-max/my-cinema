<?php
class ScreeningRepository
{
    private $pdo;

    public function __construct()
    {
        global $pdo;
        $this->pdo = $pdo;
    }

    /**
     * Ajouter une nouvelle séance
     */
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

    /**
     * ✅ Vérifier les conflits de séances dans une salle
     * 
     * @param int $movie_id ID du film
     * @param int $room_id ID de la salle
     * @param string $start_time Heure de début au format 'Y-m-d H:i:s'
     * @param int|null $excludeScreeningId ID de la séance à exclure (pour l'update)
     * @return bool true si conflit détecté, false sinon
     */
    public function checkConflicts($movie_id, $room_id, $start_time, $excludeScreeningId = null)
    {
        $stmtMovie = $this->pdo->prepare("SELECT duration FROM movies WHERE id = :id");
        $stmtMovie->execute([':id' => $movie_id]);
        $newMovie = $stmtMovie->fetch(PDO::FETCH_ASSOC);

        if (!$newMovie)
            return false;

        $newDuration = (int) $newMovie['duration'] + 15;

        $sql = "
        SELECT screenings.* FROM screenings 
        JOIN movies ON screenings.movie_id = movies.id
        WHERE screenings.room_id = :room_id 
        AND :new_start_1 < DATE_ADD(screenings.start_time, INTERVAL (movies.duration + 15) MINUTE)
        AND DATE_ADD(:new_start_2, INTERVAL :new_duration MINUTE) > screenings.start_time
    ";

        if ($excludeScreeningId !== null) {
            $sql .= " AND screenings.id != :exclude_id";
        }

        $stmt = $this->pdo->prepare($sql);

        $params = [
            ':room_id' => (int) $room_id,
            ':new_start_1' => $start_time,
            ':new_start_2' => $start_time,
            ':new_duration' => $newDuration
        ];

        if ($excludeScreeningId !== null) {
            $params[':exclude_id'] = (int) $excludeScreeningId;
        }

        $stmt->execute($params);
        return $stmt->fetch(PDO::FETCH_ASSOC) ? true : false;
    }

    /**
     * Récupérer toutes les séances
     */
    public function getAll()
    {
        $stmt = $this->pdo->query("SELECT * FROM screenings ORDER BY start_time DESC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Supprimer une séance
     */
    public function delete($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM screenings WHERE id = :id");
        $stmt->execute([':id' => $id]);
    }

    /**
     * Vérifier si une séance existe
     */
    public function exists($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM screenings WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ? true : false;
    }

    /**
     * Mettre à jour une séance
     */
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

    /**
     * Récupérer une séance par son ID
     */
    public function findById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM screenings WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function hasFutureScreenings($roomId)
    {
        $sql = "
        SELECT COUNT(*) as count 
        FROM screenings 
        WHERE room_id = :room_id 
        AND start_time > NOW()
    ";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':room_id' => $roomId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        return $result['count'] > 0;
    }

    /**
     * ✅ Compter les séances futures pour une salle
     * 
     */
    public function countFutureScreenings($roomId)
    {
        $sql = "
        SELECT COUNT(*) as count 
        FROM screenings 
        WHERE room_id = :room_id 
        AND start_time > NOW()
    ";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':room_id' => $roomId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        return (int) $result['count'];
    }

    /**
     * Récupérer les séances d'une date donnée avec infos films et salles
     */
    public function getByDate($date)
    {
        $stmt = $this->pdo->prepare("
        SELECT 
            s.id,
            s.movie_id,
            s.room_id,
            s.start_time,
            m.title as movie_title,
            m.duration,
            m.genre,
            r.name as room_name,
            r.type as room_type,
            r.capacity
        FROM screenings s
        INNER JOIN movies m ON s.movie_id = m.id
        INNER JOIN rooms r ON s.room_id = r.id
        WHERE DATE(s.start_time) = :date
        ORDER BY r.name ASC, s.start_time ASC
    ");

        $stmt->execute([':date' => $date]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}

