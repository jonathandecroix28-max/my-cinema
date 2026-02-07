<?php
class RoomService
{
    private $roomRepo;

    public function __construct()
    {
        $this->roomRepo = new RoomRepository();
    }

    /**
     * Lister toutes les salles
     */
    public function listRooms()
    {
        return $this->roomRepo->getAll();
    }

    /**
     * ✅ NOUVEAU : Récupérer une salle par son ID
     */
    public function getRoomById($id)
    {
        // ✅ Validation supplémentaire au niveau Service
        if (!is_numeric($id) || $id < 1) {
            return false;
        }

        return $this->roomRepo->findById((int) $id);
    }

    /**
     * Lister uniquement les salles actives
     */
    public function getActiveRooms()
    {
        return $this->roomRepo->getActiveRooms();
    }

    /**
     * Ajouter une nouvelle salle
     */
    public function addRoom($name, $capacity, $type, $active)
    {
        // ✅ Vérifier si le nom existe déjà
        if ($this->roomRepo->existsByName($name)) {
            return [
                "success" => false,
                "error" => "Une salle avec ce nom existe déjà. Choisissez un autre nom."
            ];
        }

        // ✅ Validation de la capacité
        if ($capacity < 1 || $capacity > 1000) {
            return [
                "success" => false,
                "error" => "La capacité doit être entre 1 et 1000"
            ];
        }

        // ✅ Validation du type
        $allowedTypes = ['2D', '3D', 'IMAX'];
        if (!in_array($type, $allowedTypes)) {
            return [
                "success" => false,
                "error" => "Type invalide. Valeurs autorisées : 2D, 3D, IMAX"
            ];
        }

        // ✅ Validation du nom
        if (empty(trim($name))) {
            return [
                "success" => false,
                "error" => "Le nom de la salle ne peut pas être vide"
            ];
        }

        // ✅ Création de l'objet Room
        $room = new Rooms();
        $room->name = $name;
        $room->capacity = (int) $capacity;
        $room->type = $type;
        $room->active = (int) $active;
        $room->created_at = date('Y-m-d H:i:s');

        try {
            $this->roomRepo->add($room);
            return [
                "success" => true,
                "message" => "Salle ajoutée avec succès !"
            ];
        } catch (Exception $e) {
            return [
                "success" => false,
                "error" => "Erreur lors de l'ajout : " . $e->getMessage()
            ];
        }
    }

    /**
     * Mettre à jour une salle existante
     */
    public function updateRoom($id, $name, $capacity, $type, $active)
    {
        // ✅ Vérifier que la salle existe
        if (!$this->roomRepo->findById($id)) {
            return [
                "success" => false,
                "error" => "La salle n'existe pas"
            ];
        }

        // ✅ Vérifier si le nom existe déjà (en excluant cette salle)
        if ($this->roomRepo->existsByName($name, $id)) {
            return [
                "success" => false,
                "error" => "Une autre salle avec ce nom existe déjà. Choisissez un autre nom."
            ];
        }

        // ✅ Validation de la capacité
        if ($capacity < 1 || $capacity > 1000) {
            return [
                "success" => false,
                "error" => "La capacité doit être entre 1 et 1000"
            ];
        }

        // ✅ Validation du type
        $allowedTypes = ['2D', '3D', 'IMAX'];
        if (!in_array($type, $allowedTypes)) {
            return [
                "success" => false,
                "error" => "Type invalide. Valeurs autorisées : 2D, 3D, IMAX"
            ];
        }

        // ✅ Validation du nom
        if (empty(trim($name))) {
            return [
                "success" => false,
                "error" => "Le nom de la salle ne peut pas être vide"
            ];
        }

        try {
            $this->roomRepo->update($id, $name, $capacity, $type, $active);
            return [
                "success" => true,
                "message" => "Salle modifiée avec succès !"
            ];
        } catch (Exception $e) {
            return [
                "success" => false,
                "error" => "Erreur lors de la modification : " . $e->getMessage()
            ];
        }
    }

    /**
     * Supprimer une salle
     */
    public function deleteRoom($id)
    {
        // ✅ Vérifier que la salle existe
        if (!$this->roomRepo->findById($id)) {
            return [
                "success" => false,
                "error" => "La salle n'existe pas"
            ];
        }

        try {
            $this->roomRepo->delete($id);
            return [
                "success" => true,
                "message" => "Salle supprimée avec succès !"
            ];
        } catch (Exception $e) {
            return [
                "success" => false,
                "error" => "Erreur lors de la suppression : " . $e->getMessage()
            ];
        }
    }
}