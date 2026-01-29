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
        if (!$this->movieRepo->exists($movie_id)) {
            return ["success" => false, "error" => "Le film n'existe pas"];
        }

        // Vérification salle
        if (!$this->roomRepo->exists($room_id)) {
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
        $screening->updated_at = date('Y-m-d H:i:s');

        try {
            $this->screeningRepo->add($screening);
            return ["success" => true, "message" => "Séance ajoutée !"];
        } catch (Exception $e) {
            return ["success" => false, "error" => "Erreur lors de l'ajout de la séance"];
        }
    }

    public function listScreenings()
    {
        return $this->screeningRepo->getAll();
    }
}
?>