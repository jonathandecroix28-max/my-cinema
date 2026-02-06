<?php
/**
 * Configuration de la base de données
 * Utilise les variables d'environnement depuis .env
 */

// Charger le fichier .env (à la racine du projet)
$envFile = __DIR__ . '/../../.env';

if (!file_exists($envFile)) {
    http_response_code(500);
    exit(json_encode([
        'error' => 'Fichier .env introuvable. Copiez .env.example vers .env et configurez-le.'
    ]));
}

$env = parse_ini_file($envFile);

// Configuration PDO
$dsn = sprintf(
    "mysql:host=%s;port=%s;dbname=%s;charset=%s",
    $env['DB_HOST'] ?? 'localhost',
    $env['DB_PORT'] ?? '3306',
    $env['DB_NAME'] ?? 'my-cinema',
    $env['DB_CHARSET'] ?? 'utf8mb4'
);

$user = $env['DB_USER'] ?? 'root';
$pass = $env['DB_PASS'] ?? '';

try {
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (PDOException $e) {
    // Logger l'erreur (ne pas exposer les détails en production)
    error_log("Database connection error: " . $e->getMessage());

    http_response_code(500);
    exit(json_encode([
        'error' => 'Erreur de connexion à la base de données'
    ]));
}