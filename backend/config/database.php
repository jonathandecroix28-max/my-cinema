<?php
// 1. Configuration de la connexion à la base de données
$dsn = "mysql:host=localhost;dbname=my-cinema;charset=utf8mb4";
$user = "jojo";        // Assure-toi que 'jojo' a bien les droits sur 'my_cinema' !
$pass = "incroyable";



// 3. Initialisation de la connexion
$pdo = new PDO($dsn, $user, $pass, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]); ?>