<?php
/**
 * Configuration de la base de données
 * Utilise les variables d'environnement depuis .env
 */

date_default_timezone_set('Europe/Paris');
$envFile = __DIR__ . '/../../.env';

if (!file_exists($envFile)) {
    http_response_code(500);
    exit(json_encode([
        'error' => 'Fichier .env introuvable.'
    ]));
}

// PARSING MANUEL DU .ENV
function loadEnvFile($filePath)
{
    $variables = [];
    $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || strpos($line, '#') === 0) {
            continue;
        }

        if (strpos($line, '=') !== false) {
            [$key, $value] = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);

            if (
                (substr($value, 0, 1) === '"' && substr($value, -1) === '"') ||
                (substr($value, 0, 1) === "'" && substr($value, -1) === "'")
            ) {
                $value = substr($value, 1, -1);
            }

            $variables[$key] = $value;
        }
    }

    return $variables;
}

// Charger les variables
$env = loadEnvFile($envFile);

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

    $pdo->exec("SET time_zone = '+01:00'");
} catch (PDOException $e) {
    error_log("Database connection error: " . $e->getMessage());

    // ✅ AFFICHER L'ERREUR DÉTAILLÉE (temporaire pour debug)
    http_response_code(500);
    exit(`<div style='background: #f8d7da; padding: 20px; color: #721c24; font-family: monospace;'>` .
        "<h3>❌ Erreur de connexion à la base de données</h3>" .
        "<strong>Message :</strong> " . htmlspecialchars($e->getMessage()) . "<br>" .
        "<strong>Code :</strong> " . htmlspecialchars($e->getCode()) . "<br>" .
        "<strong>DSN :</strong> " . htmlspecialchars($dsn) . "<br>" .
        "<strong>User :</strong> " . htmlspecialchars($user) . "<br>" .
        "<strong>Pass length :</strong> " . strlen($pass) . " caractères<br>" .
        "</div>");
}