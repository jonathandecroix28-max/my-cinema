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
        $stmt = $this->pdo->query("SELECT * FROM rooms WHERE deleted_at IS NULL ORDER BY name ASC");
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

    // ========================================
    // ✅ NOUVELLES MÉTHODES POUR SOFT DELETE
    // ========================================

    /**
     * ✅ SOFT DELETE : Marquer une salle comme supprimée
     * 
     * @param int $id ID de la salle
     * @return bool true si réussi, false sinon
     */
    public function softDelete($id)
    {
        $stmt = $this->pdo->prepare("
            UPDATE rooms 
            SET deleted_at = NOW() 
            WHERE id = :id AND deleted_at IS NULL
        ");
        $stmt->execute([':id' => $id]);
        return $stmt->rowCount() > 0;
    }

    /**
     * ✅ RESTORE : Restaurer une salle supprimée
     * 
     * @param int $id ID de la salle
     * @return bool true si réussi, false sinon
     */
    public function restore($id)
    {
        $stmt = $this->pdo->prepare("
            UPDATE rooms 
            SET deleted_at = NULL 
            WHERE id = :id AND deleted_at IS NOT NULL
        ");
        $stmt->execute([':id' => $id]);
        return $stmt->rowCount() > 0;
    }

    /**
     * ✅ HARD DELETE : Supprimer définitivement une salle
     * 
     * @param int $id ID de la salle
     * @return bool true si réussi, false sinon
     */
    public function hardDelete($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM rooms WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->rowCount() > 0;
    }

    /**
     * ✅ Récupérer les salles supprimées uniquement
     * 
     * @return array
     */
    public function getDeleted()
    {
        $stmt = $this->pdo->query("
            SELECT * FROM rooms 
            WHERE deleted_at IS NOT NULL 
            ORDER BY deleted_at DESC
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * ✅ Récupérer toutes les salles NON supprimées (alternative à getAll)
     * 
     * @return array
     */
    public function getAllActive()
    {
        $stmt = $this->pdo->query("
            SELECT * FROM rooms 
            WHERE deleted_at IS NULL 
            ORDER BY name ASC
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * ✅ Récupérer toutes les salles incluant les supprimées
     * 
     * @return array
     */
    public function getAllIncludingDeleted()
    {
        $stmt = $this->pdo->query("
            SELECT * FROM rooms 
            ORDER BY name ASC, deleted_at DESC
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * ✅ Récupérer une salle par ID (incluant supprimées si demandé)
     * 
     * @param int $id ID de la salle
     * @param bool $includeDeleted Inclure les salles supprimées
     * @return array|false
     */
    public function findByIdWithDeleted($id, $includeDeleted = false)
    {
        $sql = "SELECT * FROM rooms WHERE id = :id";

        if (!$includeDeleted) {
            $sql .= " AND deleted_at IS NULL";
        }

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * ✅ Vérifier si une salle existe (en excluant les supprimées)
     * 
     * @param int $id ID de la salle
     * @return bool
     */
    public function existsByIdActive($id)
    {
        $stmt = $this->pdo->prepare("
            SELECT id FROM rooms 
            WHERE id = :id AND deleted_at IS NULL
        ");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch() ? true : false;
    }

    /**
     * ✅ Vérifier si une salle existe par nom (excluant les supprimées)
     * 
     * @param string $name Nom de la salle
     * @param int|null $excludeId ID à exclure
     * @return bool
     */
    public function existsByNameActive($name, $excludeId = null)
    {
        $sql = "SELECT id FROM rooms WHERE name = :name AND deleted_at IS NULL";

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
}