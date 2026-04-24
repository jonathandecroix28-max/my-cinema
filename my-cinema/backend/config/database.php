<?php
/**
 * Configuration de la base de données
 * Utilise les variables d'environnement depuis .env
 */

date_default_timezone_set('Europe/Paris');
$envFile = __DIR__ . '/../../.env';

// PARSING MANUEL DU .ENV
function loadEnvFile($filePath)
{
    $variables = [];
    $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    // Ignorer les lignes vides et les commentaires
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || strpos($line, '#') === 0) {
            continue;
        }
        // Extraire la clé et la valeur
        if (strpos($line, '=') !== false) {
            [$key, $value] = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            // Supprimer les guillemets entourant la valeur, s'ils existent
            if (
                (substr($value, 0, 1) === '"' && substr($value, -1) === '"') ||
                (substr($value, 0, 1) === "'" && substr($value, -1) === "'")
            ) {
                $value = substr($value, 1, -1);
            }
            // Gérer les variables d'environnement déjà définies (ex: via le serveur)
            $variables[$key] = $value;
        }
    }
    // retourner les variables chargées
    return $variables;
}

function getRuntimeEnvValue($key)
{
    $value = getenv($key);
    if ($value !== false && $value !== '') {
        return $value;
    }

    if (isset($_ENV[$key]) && $_ENV[$key] !== '') {
        return $_ENV[$key];
    }

    if (isset($_SERVER[$key]) && $_SERVER[$key] !== '') {
        return $_SERVER[$key];
    }

    return null;
}

// Charger les variables depuis le fichier .env si présent, puis laisser la priorité aux variables d'environnement du serveur
$fileEnv = file_exists($envFile) ? loadEnvFile($envFile) : [];
$runtimeEnv = [];

foreach (['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASS', 'DB_CHARSET', 'DB_PORT'] as $key) {
    $value = getRuntimeEnvValue($key);
    if ($value !== null) {
        $runtimeEnv[$key] = $value;
    }
}

$env = array_merge($fileEnv, $runtimeEnv);

// Configuration PDO
$dsn = sprintf(
    "mysql:host=%s;port=%s;dbname=%s;charset=%s",
    $env['DB_HOST'] ?? 'localhost',
    $env['DB_PORT'] ?? '3306',
    $env['DB_NAME'] ?? 'my-cinema',
    $env['DB_CHARSET'] ?? 'utf8mb4'
);
// Utiliser les variables d'environnement pour la connexion à la base de données
$user = $env['DB_USER'] ?? 'root';
$pass = $env['DB_PASS'] ?? '';

// Connexion à la base de données avec gestion des erreurs
try {
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    $pdo->exec("SET time_zone = '+01:00'");
} catch (PDOException $e) {
    // Log l'erreur complète dans les logs (invisible pour l'utilisateur)
    error_log("Database connection error: " . $e->getMessage());
    error_log("DSN: " . $dsn);
    error_log("User: " . $user);

    // Retourner un message générique à l'utilisateur
    http_response_code(500);
    header('Content-Type: application/json');
    exit(json_encode([
        'error' => 'Service temporairement indisponible. Veuillez réessayer ultérieurement.'
    ]));
}