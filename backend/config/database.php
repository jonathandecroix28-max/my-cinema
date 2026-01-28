<?php

function getPdoConnection()
{
    $dsn = "mysql:host=localhost;dbname=my_cinema;charset=utf8mb4";
    $user = "jojo";
    $pass = "incroyable";
    try {
        return new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,

            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    } catch (PDOException $e) {
        die("Database connection failed: " . $e->getMessage());
    }
}

$pdo = getPdoConnection();

?>