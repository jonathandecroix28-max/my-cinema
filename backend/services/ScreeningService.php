<?php
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
        // Vérification film
        if (!$this->movieRepo->findById((int) $movie_id)) {
            return ["success" => false, "error" => "Le film n'existe pas"];
        }

        // Fais la même chose pour la salle si ton RoomRepository a aussi un findById
        if (!$this->roomRepo->findById((int) $room_id)) {
            return ["success" => false, "error" => "La salle n'existe pas"];
        }

        // Conflits
        if ($this->screeningRepo->checkConflicts($movie_id, $room_id, $start_time)) {
            return ["success" => false, "error" => "Conflit avec une séance existante"];
        }

        // Création de l’objet Screening
        $screening = new Screening();
        $screening->movie_id = $movie_id;
        $screening->room_id = $room_id;
        $screening->start_time = $start_time;
        $screening->created_at = date('Y-m-d H:i:s');

        try {
            $this->screeningRepo->add($screening);
            return ["success" => true, "message" => "Séance ajoutée !"];
        } catch (Exception $e) {
            return ["success" => false, "error" => $e->getMessage()];
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
            return ["success" => true, "message" => "Séance supprimée !"];
        } catch (Exception $e) {
            return ["success" => false, "error" => $e->getMessage()];
        }
    }

    public function updateScreening($id, $movie_id, $room_id, $start_time)
    {
        if (!$this->screeningRepo->findById((int) $id)) {
            return ["success" => false, "error" => "La séance n'existe pas"];
        }

        // Vérification film
        if (!$this->movieRepo->findById((int) $movie_id)) {
            return ["success" => false, "error" => "Le film n'existe pas"];
        }

        // Fais la même chose pour la salle si ton RoomRepository a aussi un findById
        if (!$this->roomRepo->findById((int) $room_id)) {
            return ["success" => false, "error" => "La salle n'existe pas"];
        }

        // Conflits
        if ($this->screeningRepo->checkConflicts($movie_id, $room_id, $start_time)) {
            return ["success" => false, "error" => "Conflit avec une séance existante"];
        }

        try {
            $this->screeningRepo->update($id, $movie_id, $room_id, $start_time);
            return ["success" => true, "message" => "Séance mise à jour !"];
        } catch (Exception $e) {
            return ["success" => false, "error" => $e->getMessage()];
        }
    }
}
?>