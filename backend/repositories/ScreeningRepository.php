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
        // 1. Récupérer la durée du film à programmer
        $stmtMovie = $this->pdo->prepare("SELECT duration FROM movies WHERE id = :id");
        $stmtMovie->execute([':id' => $movie_id]);
        $newMovie = $stmtMovie->fetch(PDO::FETCH_ASSOC);

        if (!$newMovie) {
            return false; // Film inexistant, pas de conflit possible
        }

        $newDuration = (int) $newMovie['duration'] + 15; // Durée du film + 15 min de battement

        // 2. Construire la requête SQL pour détecter les chevauchements
        $sql = "
            SELECT s.id 
            FROM screenings s
            JOIN movies m ON s.movie_id = m.id
            WHERE s.room_id = :room_id 
            AND :new_start_1 < DATE_ADD(s.start_time, INTERVAL (m.duration + 15) MINUTE)
            AND DATE_ADD(:new_start_2, INTERVAL :new_duration MINUTE) > s.start_time
        ";

        // ✅ Si on est en mode update, exclure la séance en cours de modification
        if ($excludeScreeningId !== null) {
            $sql .= " AND s.id != :exclude_id";
        }

        // 3. Exécuter la requête avec les paramètres appropriés
        $stmt = $this->pdo->prepare($sql);

        $params = [
            ':room_id' => $room_id,
            ':new_start_1' => $start_time,
            ':new_start_2' => $start_time,
            ':new_duration' => $newDuration
        ];

        // ✅ Ajouter le paramètre d'exclusion si nécessaire
        if ($excludeScreeningId !== null) {
            $params[':exclude_id'] = $excludeScreeningId;
        }

        $stmt->execute($params);

        // 4. Retourner true si un conflit est trouvé, false sinon
        return $stmt->fetch() ? true : false;
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
}