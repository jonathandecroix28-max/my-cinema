<?php
// Contrôleur pour gérer les opérations liées aux séances de cinéma
class ScreeningController
{
    private $service;

    public function __construct()
    {
        $this->service = new ScreeningService();
    }

    public function list()
    {
        echo json_encode($this->service->listScreenings());
    }

    public function add()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['movie_id'], $data['room_id'], $data['start_time'])) {
            echo json_encode(["success" => false, "error" => "Données manquantes"]);
            return;
        }

        // Validation AVANT appel au service
        try {
            $inputDate = new DateTime($data['start_time']);
            $now = new DateTime();

            if ($inputDate < $now) {
                echo json_encode(["success" => false, "error" => "Impossible de programmer une séance dans le passé !"]);
                return;  //  RETURN au lieu de EXIT
            }
        } catch (Exception $e) {
            echo json_encode(["success" => false, "error" => "Format de date invalide"]);
            return;
        }

        //  Appel au service APRÈS validation
        $result = $this->service->addScreening(
            $data['movie_id'],
            $data['room_id'],
            $data['start_time']
        );

        echo json_encode($result);
    }

    public function remove()
    {
        $id = $_GET['id'] ?? null;

        if (!$id) {
            echo json_encode(["success" => false, "error" => "ID manquant"]);
            return;
        }

        $result = $this->service->deleteScreening($id);
        echo json_encode($result);
    }

    public function update()
    {
        $id = $_GET['id'] ?? null;

        if (!$id) {
            echo json_encode(["success" => false, "error" => "ID manquant"]);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['movie_id'], $data['room_id'], $data['start_time'])) {
            echo json_encode(["success" => false, "error" => "Données manquantes"]);
            return;
        }

        //  CORRECTION 3 : Validation de la date pour l'update aussi
        try {
            $inputDate = new DateTime($data['start_time']);
            $now = new DateTime();

            if ($inputDate < $now) {
                echo json_encode([
                    "success" => false,
                    "error" => "Impossible de programmer une séance dans le passé !"
                ]);
                return;
            }
        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "error" => "Format de date invalide"
            ]);
            return;
        }

        $result = $this->service->updateScreening(
            $id,
            $data['movie_id'],
            $data['room_id'],
            $data['start_time']
        );

        echo json_encode($result);
    }

    public function getPlanningByRoom()
    {
        $date = $_GET['date'] ?? date('Y-m-d');

        try {
            $planning = $this->service->getPlanningByRoom($date);
            echo json_encode([
                'success' => true,
                'date' => $date,
                'planning' => $planning
            ]);
        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }
}
