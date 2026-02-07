<?php
class RoomController
{
    private $service;

    public function __construct()
    {
        $this->service = new RoomService();
    }

    /**
     * Lister toutes les salles
     */
    public function list()
    {
        echo json_encode($this->service->listRooms());
    }

    /**
     * ✅ NOUVEAU : Récupérer une salle par son ID
     */
    public function get()
    {
        // ✅ Vérifier que l'ID est présent
        $id = $_GET['id'] ?? null;

        if (!$id) {
            echo json_encode([
                "success" => false, 
                "error" => "ID manquant"
            ]);
            return;
        }

        // ✅ Valider que l'ID est un nombre positif
        if (!is_numeric($id) || $id < 1) {
            echo json_encode([
                "success" => false, 
                "error" => "ID invalide. Doit être un nombre positif"
            ]);
            return;
        }

        // ✅ Convertir en entier pour sécurité
        $id = (int) $id;

        // ✅ Appeler le service
        $room = $this->service->getRoomById($id);
        
        if ($room) {
            echo json_encode($room);
        } else {
            echo json_encode([
                "success" => false, 
                "error" => "Salle introuvable"
            ]);
        }
    }

    /**
     * Ajouter une nouvelle salle
     */
    public function add()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        // ✅ Vérification des données obligatoires
        if (!isset($data['name'], $data['capacity'], $data['type'], $data['active'])) {
            echo json_encode([
                "success" => false, 
                "error" => "Données manquantes. Champs requis : name, capacity, type, active"
            ]);
            return;
        }

        // ✅ Nettoyer et valider le nom
        $name = trim($data['name']);
        if (empty($name)) {
            echo json_encode([
                "success" => false, 
                "error" => "Le nom de la salle ne peut pas être vide"
            ]);
            return;
        }

        // ✅ Convertir et valider la capacité
        $capacity = (int) $data['capacity'];
        if ($capacity < 1 || $capacity > 1000) {
            echo json_encode([
                "success" => false, 
                "error" => "La capacité doit être entre 1 et 1000 (reçu : {$capacity})"
            ]);
            return;
        }

        // ✅ Normaliser et valider le type (convertir en majuscules)
        $type = strtoupper(trim($data['type']));
        $allowedTypes = ['2D', '3D', 'IMAX'];
        if (!in_array($type, $allowedTypes)) {
            echo json_encode([
                "success" => false, 
                "error" => "Type invalide. Valeurs autorisées : 2D, 3D, IMAX (reçu : {$data['type']})"
            ]);
            return;
        }

        // ✅ Convertir active en entier (0 ou 1)
        $active = (int) $data['active'];
        if (!in_array($active, [0, 1])) {
            echo json_encode([
                "success" => false, 
                "error" => "Active invalide. Valeurs autorisées : 0 ou 1 (reçu : {$data['active']})"
            ]);
            return;
        }

        // ✅ Appeler le service
        $result = $this->service->addRoom($name, $capacity, $type, $active);
        echo json_encode($result);
    }

    /**
     * Supprimer une salle
     */
    public function remove()
    {
        $id = $_GET['id'] ?? null;

        // ✅ Vérifications de sécurité
        if (!$id) {
            echo json_encode([
                "success" => false, 
                "error" => "ID manquant"
            ]);
            return;
        }

        if (!is_numeric($id) || $id < 1) {
            echo json_encode([
                "success" => false, 
                "error" => "ID invalide"
            ]);
            return;
        }

        $result = $this->service->deleteRoom((int) $id);
        echo json_encode($result);
    }

    /**
     * Mettre à jour une salle
     */
    public function update()
    {
        $id = $_GET['id'] ?? null;

        // ✅ Vérifications de sécurité sur l'ID
        if (!$id) {
            echo json_encode([
                "success" => false, 
                "error" => "ID manquant"
            ]);
            return;
        }

        if (!is_numeric($id) || $id < 1) {
            echo json_encode([
                "success" => false, 
                "error" => "ID invalide"
            ]);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);

        // ✅ Vérification des données obligatoires
        if (!isset($data['name'], $data['capacity'], $data['type'], $data['active'])) {
            echo json_encode([
                "success" => false, 
                "error" => "Données manquantes. Champs requis : name, capacity, type, active"
            ]);
            return;
        }

        // ✅ Nettoyer et valider le nom
        $name = trim($data['name']);
        if (empty($name)) {
            echo json_encode([
                "success" => false, 
                "error" => "Le nom de la salle ne peut pas être vide"
            ]);
            return;
        }

        // ✅ Convertir et valider la capacité
        $capacity = (int) $data['capacity'];
        if ($capacity < 1 || $capacity > 1000) {
            echo json_encode([
                "success" => false, 
                "error" => "La capacité doit être entre 1 et 1000"
            ]);
            return;
        }

        // ✅ Normaliser et valider le type
        $type = strtoupper(trim($data['type']));
        $allowedTypes = ['2D', '3D', 'IMAX'];
        if (!in_array($type, $allowedTypes)) {
            echo json_encode([
                "success" => false, 
                "error" => "Type invalide. Valeurs autorisées : 2D, 3D, IMAX"
            ]);
            return;
        }

        // ✅ Convertir active en entier
        $active = (int) $data['active'];
        if (!in_array($active, [0, 1])) {
            echo json_encode([
                "success" => false, 
                "error" => "Active invalide. Valeurs autorisées : 0 ou 1"
            ]);
            return;
        }

        // ✅ Appeler le service
        $result = $this->service->updateRoom((int) $id, $name, $capacity, $type, $active);
        echo json_encode($result);
    }
}