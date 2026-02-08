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

        // ✅ NOUVELLE VÉRIFICATION : Si désactivation, vérifier les séances futures
        $currentRoom = $this->roomRepo->findById($id);
        if ($currentRoom['active'] == 1 && $active == 0) {
            // On essaie de désactiver une salle active
            $screeningRepo = new ScreeningRepository();
            $futureCount = $screeningRepo->countFutureScreenings($id);

            if ($futureCount > 0) {
                return [
                    "success" => false,
                    "error" => "Impossible de désactiver cette salle : elle a {$futureCount} séance(s) future(s). Veuillez d'abord annuler ou déplacer ces séances."
                ];
            }
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
     * Supprimer une salle (SOFT DELETE)
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

        // ✅ NOUVELLE VÉRIFICATION : Vérifier les séances futures
        $screeningRepo = new ScreeningRepository();
        $futureCount = $screeningRepo->countFutureScreenings($id);

        if ($futureCount > 0) {
            return [
                "success" => false,
                "error" => "Impossible de supprimer cette salle : elle a {$futureCount} séance(s) future(s). Veuillez d'abord annuler ou déplacer ces séances."
            ];
        }

        try {
            $this->roomRepo->softDelete($id);  // ✅ Soft delete
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

    // ========================================
    // ✅ NOUVELLES MÉTHODES POUR SOFT DELETE
    // ========================================

    /**
     * ✅ NOUVEAU : Récupérer les salles supprimées
     */
    public function getDeletedRooms()
    {
        return $this->roomRepo->getDeleted();
    }

    /**
     * ✅ NOUVEAU : Restaurer une salle supprimée
     */
    public function restoreRoom($id)
    {
        // ✅ Vérifier que la salle existe (incluant les supprimées)
        $room = $this->roomRepo->findByIdWithDeleted($id, true);

        if (!$room) {
            return [
                "success" => false,
                "error" => "La salle n'existe pas"
            ];
        }

        // ✅ Vérifier que la salle est bien supprimée
        if ($room['deleted_at'] === null) {
            return [
                "success" => false,
                "error" => "La salle n'est pas supprimée"
            ];
        }

        try {
            $this->roomRepo->restore($id);
            return [
                "success" => true,
                "message" => "Salle restaurée avec succès !"
            ];
        } catch (Exception $e) {
            return [
                "success" => false,
                "error" => "Erreur lors de la restauration : " . $e->getMessage()
            ];
        }
    }

    /**
     * ✅ NOUVEAU : Supprimer définitivement une salle (hard delete)
     */
    public function permanentlyDeleteRoom($id)
    {
        // ✅ Vérifier que la salle existe
        $room = $this->roomRepo->findByIdWithDeleted($id, true);

        if (!$room) {
            return [
                "success" => false,
                "error" => "La salle n'existe pas"
            ];
        }

        // ✅ Vérifier que la salle est déjà soft-deleted
        if ($room['deleted_at'] === null) {
            return [
                "success" => false,
                "error" => "La salle doit d'abord être supprimée (soft delete) avant d'être supprimée définitivement"
            ];
        }

        try {
            $this->roomRepo->hardDelete($id);
            return [
                "success" => true,
                "message" => "Salle supprimée définitivement !"
            ];
        } catch (Exception $e) {
            return [
                "success" => false,
                "error" => "Erreur lors de la suppression définitive : " . $e->getMessage()
            ];
        }
    }

    /**
     * ✅ NOUVEAU : Vérifier si une salle a des séances futures
     */
    public function checkRoomScreenings($id)
    {
        $screeningRepo = new ScreeningRepository();
        $count = $screeningRepo->countFutureScreenings($id);

        return [
            "success" => true,
            "has_future_screenings" => $count > 0,
            "count" => $count
        ];
    }
}