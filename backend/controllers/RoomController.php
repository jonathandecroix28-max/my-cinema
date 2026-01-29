<?php

class RoomController
{
    private $repository;

    public function __construct()
    {
        $this->repository = new RoomRepository(); // repository créé par la suite
    }

    public function list()
    { // Méthode appelée par le fichier index . php
        echo json_encode($this->repository->getAll());
    }

    public function add()
    {
        $data = json_decode(file_get_contents('php://input'), true); // Pour les requêtes POST/PUT
        if (!isset($data['name'], $data['capacity'], $data['type'], $data['active'])) {
            echo json_encode(["success" => false, "error" => "Données manquantes"]);
            return;
        }
        $room = new Rooms();
        $room->name = $data['name'];
        $room->capacity = $data['capacity'];
        $room->type = $data['type'];
        $room->active = $data['active'];
        $room->created_at = date('Y-m-d H:i:s');
        $room->updated_at = date('Y-m-d H:i:s');

        try {
            $this->repository->add($room);
            echo json_encode(["success" => true, "message" => "Salle ajoutée !"]);
        } catch (Exception $e) {
            echo json_encode(["success" => false, "error" => "Erreur lors de l'ajout de la salle."]);
        }

    }

    public function get()
    {
        $id = $_GET['id'] ?? null;
        if ($id === null) {
            echo json_encode(["error" => "ID manquant"]);
            return;
        }

        $room = $this->repository->find($id);
        if ($room) {
            echo json_encode($room);
        } else {
            echo json_encode(["error" => "Salle non trouvée"]);
        }
    }

    public function remove()
    {
        $id = $_GET['id'] ?? null;
        if ($id === null) {
            echo json_encode(["error" => "ID manquant"]);
            return;
        }

        try {
            $this->repository->delete($id);
            echo json_encode(["success" => true, "message" => "Salle supprimée !"]);
        } catch (Exception $e) {
            echo json_encode(["success" => false, "error" => "Erreur lors de la suppression de la salle."]);
        }
    }

    public function update()
    {
        $id = $_GET['id'] ?? null;
        if ($id === null) {
            echo json_encode(["error" => "ID manquant"]);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true); // Pour les requêtes POST/PUT

        $room = $this->repository->find($id);
        if (!$room) {
            echo json_encode(["error" => "Salle non trouvée"]);
            return;
        }

        // Mettre à jour les propriétés de la salle
        $room->name = $data['name'] ?? $room->name;
        $room->capacity = $data['capacity'] ?? $room->capacity;
        $room->type = $data['type'] ?? $room->type;
        $room->active = $data['active'] ?? $room->active;
        $room->updated_at = date('Y-m-d H:i:s');

        try {
            $this->repository->update($room);
            echo json_encode(["success" => true, "message" => "Salle mise à jour !"]);
        } catch (Exception $e) {
            echo json_encode(["success" => false, "error" => "Erreur lors de la mise à jour de la salle."]);
        }
    }
    // Autres méthodes correspondant aux autres routes API .
}
?>