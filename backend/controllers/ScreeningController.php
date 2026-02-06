<?php
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

        $result = $this->service->addScreening(
            $data['movie_id'],
            $data['room_id'],
            $data['start_time']
        );


        if ($data['start_time']) {
            $inputDate = new DateTime($data['start_time']);
            $now = new DateTime();

            if ($inputDate < $now) {
                echo json_encode(["success" => false, "error" => "Impossible de programmer une séance dans le passé !"]);
                exit;
            }
        }



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
        // ✅ CORRECTION : Récupérer l'ID depuis $_GET comme les autres contrôleurs
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

        $result = $this->service->updateScreening(
            $id,  // ✅ Utilise l'ID de $_GET
            $data['movie_id'],
            $data['room_id'],
            $data['start_time']
        );

        echo json_encode($result);
    }
}
?>