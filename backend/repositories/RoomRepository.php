<?php
class RoomRepository
{
    private $pdo;

    public function __construct()
    {
        global $pdo;
        $this->pdo = $pdo;
    }

    public function getAll()
    {
        $stmt = $this->pdo->query("SELECT * FROM rooms");
        return $stmt->fetchAll(PDO::FETCH_CLASS, 'Rooms');
    }

    public function add(Rooms $room)
    {
        $stmt = $this->pdo->prepare(" INSERT INTO rooms (name, capacity, type, active, created_at, updated_at) VALUES (? , ? , ? , ? , ? , ? )");
        $stmt->execute([
            $room->name,
            $room->capacity,
            $room->type,
            $room->active,
            $room->created_at,
            $room->updated_at
        ]);
    }

    public function find($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM rooms WHERE id = ?");
        $stmt->execute([$id]);
        $stmt->setFetchMode(PDO::FETCH_CLASS, 'Rooms');
        return $stmt->fetch();
    }

    public function delete($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM rooms WHERE id = ?");
        $stmt->execute([$id]);
    }

    public function update(Rooms $room)
    {
        $stmt = $this->pdo->prepare(" UPDATE rooms SET name = ?, capacity = ?, type = ?, active = ?, updated_at = ? WHERE id = ? ");
        $stmt->execute([
            $room->name,
            $room->capacity,
            $room->type,
            $room->active,
            $room->updated_at,
            $room->id
        ]);
    }

    public function exists(int $room_id): bool
    {
        // Retourne true si la salle existe dans la table rooms, false sinon
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM rooms WHERE id = ?");
        $stmt->execute([$room_id]);
        return $stmt->fetchColumn() > 0;
    }
}