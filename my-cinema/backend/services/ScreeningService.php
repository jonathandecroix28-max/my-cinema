<?php
// Service pour gérer la logique métier liée aux séances (ajout, modification, suppression, validation, etc.)
class ScreeningService
{
    private $screeningRepo;
    private $movieRepo;
    private $roomRepo;

    public function __construct()
    {
        $this->screeningRepo = new ScreeningRepository();
        $this->movieRepo = new MovieRepository();
        $this->roomRepo = new RoomRepository();
    }

    public function addScreening($movie_id, $room_id, $start_time)
    {
        //  Vérification film
        if (!$this->movieRepo->findById((int) $movie_id)) {
            return ["success" => false, "error" => "Le film sélectionné n'existe pas"];
        }

        //  Vérification salle existe
        if (!$this->roomRepo->findById((int) $room_id)) {
            return ["success" => false, "error" => "La salle sélectionnée n'existe pas"];
        }

        //  Vérification que la salle est active
        if (!$this->roomRepo->isActive((int) $room_id)) {
            return [
                "success" => false,
                "error" => "La salle sélectionnée est actuellement inactive. Impossible de programmer une séance."
            ];
        }

        //  Vérification format date
        try {
            new DateTime($start_time);
        } catch (Exception $e) {
            return ["success" => false, "error" => "Format de date invalide"];
        }

        //  Vérification conflits
        if ($this->screeningRepo->checkConflicts($movie_id, $room_id, $start_time)) {
            return [
                "success" => false,
                "error" => "Conflit avec une séance existante dans cette salle. Choisissez un autre horaire."
            ];
        }

        // Création de l'objet Screening
        $screening = new Screening();
        $screening->movie_id = (int) $movie_id;
        $screening->room_id = (int) $room_id;
        $screening->start_time = $start_time;
        $screening->created_at = date('Y-m-d H:i:s');

        try {
            $this->screeningRepo->add($screening);
            return ["success" => true, "message" => "Séance programmée avec succès !"];
        } catch (Exception $e) {
            return ["success" => false, "error" => "Erreur lors de l'ajout : " . $e->getMessage()];
        }
    }

    public function listScreenings()
    {
        return $this->screeningRepo->getAll();
    }

    public function deleteScreening($id)
    {
        if (!$this->screeningRepo->findById((int) $id)) {
            return ["success" => false, "error" => "La séance n'existe pas"];
        }

        try {
            $this->screeningRepo->delete($id);
            return ["success" => true, "message" => "Séance supprimée avec succès !"];
        } catch (Exception $e) {
            return ["success" => false, "error" => "Erreur lors de la suppression : " . $e->getMessage()];
        }
    }

    public function updateScreening($id, $movie_id, $room_id, $start_time)
    {
        if (!$this->screeningRepo->findById((int) $id)) {
            return ["success" => false, "error" => "La séance n'existe pas"];
        }

        //  Vérification film
        if (!$this->movieRepo->findById((int) $movie_id)) {
            return ["success" => false, "error" => "Le film sélectionné n'existe pas"];
        }

        //  Vérification salle existe
        if (!$this->roomRepo->findById((int) $room_id)) {
            return ["success" => false, "error" => "La salle sélectionnée n'existe pas"];
        }

        //  Vérification que la salle est active
        if (!$this->roomRepo->isActive((int) $room_id)) {
            return [
                "success" => false,
                "error" => "La salle sélectionnée est actuellement inactive. Impossible de programmer une séance."
            ];
        }

        //  Vérification format date
        try {
            new DateTime($start_time);
        } catch (Exception $e) {
            return ["success" => false, "error" => "Format de date invalide"];
        }

        //  Vérification conflits (en excluant la séance en cours de modification)
        if ($this->screeningRepo->checkConflicts($movie_id, $room_id, $start_time, $id)) {
            return [
                "success" => false,
                "error" => "Conflit avec une autre séance dans cette salle. Choisissez un autre horaire."
            ];
        }

        try {
            $this->screeningRepo->update($id, $movie_id, $room_id, $start_time);
            return ["success" => true, "message" => "Séance mise à jour avec succès !"];
        } catch (Exception $e) {
            return ["success" => false, "error" => "Erreur lors de la mise à jour : " . $e->getMessage()];
        }
    }


/**
 * Récupérer le planning par salle pour une date donnée
 */
public function getPlanningByRoom($date) {
    // Valider la date
    if (!strtotime($date)) {
        throw new Exception("Format de date invalide");
    }

    $screenings = $this->screeningRepo->getByDate($date);
    
    // Grouper par salle
    $planning = [];
    
    foreach ($screenings as $screening) {
        $roomId = $screening['room_id'];
        
        if (!isset($planning[$roomId])) {
            $planning[$roomId] = [
                'room_id' => $roomId,
                'room_name' => $screening['room_name'],
                'room_type' => $screening['room_type'],
                'capacity' => $screening['capacity'],
                'screenings' => []
            ];
        }
        
        $planning[$roomId]['screenings'][] = [
            'id' => $screening['id'],
            'movie_id' => $screening['movie_id'],
            'movie_title' => $screening['movie_title'],
            'duration' => $screening['duration'],
            'start_time' => $screening['start_time'],
            'end_time' => date('Y-m-d H:i:s', strtotime($screening['start_time']) + ($screening['duration'] * 60))
        ];
    }
    
    // Trier les séances par heure pour chaque salle
    foreach ($planning as &$room) {
        usort($room['screenings'], function($a, $b) {
            return strtotime($a['start_time']) - strtotime($b['start_time']);
        });
    }
    
    return array_values($planning);
}
}