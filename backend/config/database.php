<?php
// Charger les variables d'environnement
$dotenv = parse_ini_file(__DIR__ . '/../../.env');

$dsn = "mysql:host=" . ($dotenv['DB_HOST'] ?? 'localhost') .
    ";dbname=" . ($dotenv['DB_NAME'] ?? 'my-cinema') .
    ";charset=utf8mb4";
$user = $dotenv['DB_USER'] ?? 'root';
$pass = $dotenv['DB_PASS'] ?? '';

try {
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $e) {
    error_log("Database connection error: " . $e->getMessage());
    http_response_code(500);
    exit(json_encode(['error' => 'Erreur de connexion à la base de données']));
}