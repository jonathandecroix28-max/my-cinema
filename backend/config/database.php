<?php
date_default_timezone_set('Europe/Paris');

$envFile = __DIR__ . '/../../.env';
$env = [];

// 1. Charger le .env seulement s'il existe (Localhost)
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (empty(trim($line)) || strpos(trim($line), '#') === 0)
            continue;
        [$key, $value] = explode('=', $line, 2);
        $env[trim($key)] = trim($value, " \t\n\r\0\x0B\"'");
    }
}

// 2. Détecter la source de connexion (Priorité à Render)
// Render fournit souvent une variable DATABASE_URL pour PostgreSQL
$renderDbUrl = getenv('DATABASE_URL');

try {
    $renderDbUrl = getenv('DATABASE_URL');

    if ($renderDbUrl) {
        // --- CONFIGURATION RENDER (PostgreSQL) ---
        $dbopts = parse_url($renderDbUrl);

        // On extrait proprement chaque composant
        $host = $dbopts["host"];
        $port = $dbopts["port"] ?? 5432; // Par défaut 5432 pour Postgres
        $user = $dbopts["user"];
        $pass = $dbopts["pass"];
        $dbname = ltrim($dbopts["path"], '/');

        // Construction du DSN SANS espaces inutiles et avec les bons séparateurs
        $dsn = "pgsql:host=$host;port=$port;dbname=$dbname";

    } else {
        // --- CONFIGURATION LOCAL (MySQL) ---
        $dsn = sprintf(
            "mysql:host=%s;port=%s;dbname=%s;charset=%s",
            $env['DB_HOST'] ?? 'localhost',
            $env['DB_PORT'] ?? '3306',
            $env['DB_NAME'] ?? 'my-cinema',
            $env['DB_CHARSET'] ?? 'utf8mb4'
        );
        $user = $env['DB_USER'] ?? 'root';
        $pass = $env['DB_PASS'] ?? '';
    }

    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

} catch (PDOException $e) {
    error_log("Database connection error: " . $e->getMessage());
    http_response_code(500);
    header('Content-Type: application/json');
    exit(json_encode(['error' => 'Connexion à la base de données échouée.']));
}