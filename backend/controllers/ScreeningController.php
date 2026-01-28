<?php

class ScreeningController
{
    private $repository;

    public function __construct($pdo)
    {
        $this->repository = new ScreeningRepository($pdo);
    }

    public function list()
    {
        echo json_encode($this->repository->getAll());
    }

    // Autres méthodes correspondant aux autres routes API.
}
?>