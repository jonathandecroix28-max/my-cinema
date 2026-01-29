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

        echo json_encode($result);
    }
}
?>