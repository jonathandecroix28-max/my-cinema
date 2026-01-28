<?php /*
require_once __DIR__ . '/../models/Room.php';
class RoomRepository
{
private $pdo;

public function __construct($pdo)
{
$this->pdo = $pdo;
}

public function getAll()
{
$stmt = $this->pdo->query("SELECT * FROM rooms");
return $stmt->fetchAll(PDO::FETCH_CLASS, 'Rooms');
}
}