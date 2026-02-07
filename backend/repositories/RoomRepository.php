<?php
class RoomRepository
{
    private $pdo;

    public function __construct()
    {
        global $pdo;
        $this->pdo = $pdo;
    }

    /**
     * Ajouter une nouvelle salle
     */
    public function add($room)
    {
        $stmt = $this->pdo->prepare("
            INSERT INTO rooms (name, capacity, type, active, created_at)
            VALUES (:name, :capacity, :type, :active, :created_at)
        ");
        $stmt->execute([
            ':name' => $room->name,
            ':capacity' => $room->capacity,
            ':type' => $room->type,
            ':active' => $room->active,
            ':created_at' => $room->created_at,
        ]);
        return $this->pdo->lastInsertId();
    }

    /**
     * Récupérer toutes les salles
     */
    public function getAll()
    {
        $stmt = $this->pdo->query("SELECT * FROM rooms ORDER BY name ASC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Récupérer uniquement les salles actives
     */
    public function getActiveRooms()
    {
        $stmt = $this->pdo->query("SELECT * FROM rooms WHERE active = 1 ORDER BY name ASC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Supprimer une salle
     */
    public function delete($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM rooms WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->rowCount() > 0;
    }

    /**
     * Mettre à jour une salle
     */
    public function update($id, $name, $capacity, $type, $active)
    {
        $stmt = $this->pdo->prepare("
            UPDATE rooms 
            SET name = :name, capacity = :capacity, type = :type, active = :active
            WHERE id = :id
        ");
        $stmt->execute([
            ':name' => $name,
            ':capacity' => $capacity,
            ':type' => $type,
            ':active' => $active,
            ':id' => $id
        ]);
        return $stmt->rowCount() > 0;
    }

    /**
     * Récupérer une salle par son ID
     */
    public function findById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM rooms WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Vérifier si une salle existe par son ID
     */
    public function existsById($id)
    {
        $stmt = $this->pdo->prepare("SELECT id FROM rooms WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch() ? true : false;
    }

    /**
     * ✅ Vérifier si une salle existe par son nom
     * 
     * @param string $name Nom de la salle
     * @param int|null $excludeId ID à exclure (pour l'update)
     * @return bool true si la salle existe, false sinon
     */
    public function existsByName($name, $excludeId = null)
    {
        $sql = "SELECT id FROM rooms WHERE name = :name";

        if ($excludeId !== null) {
            $sql .= " AND id != :exclude_id";
        }

        $stmt = $this->pdo->prepare($sql);
        $params = [':name' => $name];

        if ($excludeId !== null) {
            $params[':exclude_id'] = $excludeId;
        }

        $stmt->execute($params);
        return $stmt->fetch() ? true : false;
    }

    /**
     * ✅ Vérifier si une salle est active
     * 
     * @param int $id ID de la salle
     * @return bool true si la salle est active, false sinon
     */
    public function isActive($id)
    {
        $stmt = $this->pdo->prepare("SELECT active FROM rooms WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result && $result['active'] == 1;
    }
}