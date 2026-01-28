<?php

class RoomController
{
    private $repository;

    public function __construct($pdo)
    {
        $this->repository = new RoomRepository($pdo); // repository créé par la suite
    }

    public function list()
    { // Méthode appelée par le fichier index . php
        echo json_encode($this->repository->getAll());
    }

    // Autres méthodes correspondant aux autres routes API .
}
?>