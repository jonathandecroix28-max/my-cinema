<?php
$dsn = "mysql:host=localhost;dbname=my-cinema;charset=utf8mb4";
$user = "jojo";
$pass = "incroyable";

try {
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    exit('Erreur connexion base de données');
}
