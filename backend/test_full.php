<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🔍 Diagnostic de connexion MySQL</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            padding: 30px;
        }

        h2 {
            color: #333;
            margin-bottom: 20px;
            border-bottom: 3px solid #667eea;
            padding-bottom: 10px;
        }

        h3 {
            color: #555;
            margin: 25px 0 15px 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }

        th,
        td {
            padding: 12px;
            text-align: left;
            border: 1px solid #ddd;
        }

        th {
            background: #667eea;
            color: white;
            font-weight: 600;
        }

        tr:nth-child(even) {
            background: #f8f9fa;
        }

        .success {
            background: #d4edda;
            padding: 20px;
            border-radius: 5px;
            color: #155724;
            margin: 15px 0;
            border-left: 5px solid #28a745;
        }

        .error {
            background: #f8d7da;
            padding: 20px;
            border-radius: 5px;
            color: #721c24;
            margin: 15px 0;
            border-left: 5px solid #dc3545;
        }

        .warning {
            background: #fff3cd;
            padding: 15px;
            border-radius: 5px;
            color: #856404;
            margin: 15px 0;
            border-left: 5px solid #ffc107;
        }

        .info {
            background: #e7f3ff;
            padding: 15px;
            border-radius: 5px;
            color: #004085;
            margin: 15px 0;
            border-left: 5px solid #0056b3;
        }

        code {
            background: #f4f4f4;
            padding: 3px 8px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
        }

        ul {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            list-style-type: none;
        }

        li {
            margin-bottom: 10px;
            padding: 10px;
            background: white;
            border-left: 4px solid #28a745;
            border-radius: 3px;
        }

        hr {
            border: none;
            border-top: 2px solid #eee;
            margin: 30px 0;
        }

        .badge {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 12px;
            font-size: 0.85em;
            font-weight: 600;
        }

        .badge-success {
            background: #28a745;
            color: white;
        }

        .badge-danger {
            background: #dc3545;
            color: white;
        }
    </style>
</head>

<body>
    <div class="container">
        <h2>🔍 Diagnostic COMPLET de connexion MySQL</h2>

        <?php
        // ========================================
// 1️⃣ CHARGEMENT DU .ENV
// ========================================
        $envFile = __DIR__ . '/../.env';

        if (!file_exists($envFile)) {
            echo '<div class="error"><strong>❌ Erreur :</strong> Fichier .env introuvable</div>';
            echo '</div></body></html>';
            exit;
        }

        echo '<p>✅ Fichier .env trouvé : <code>' . htmlspecialchars($envFile) . '</code></p>';

        // Parsing manuel
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

                    // Retirer les guillemets
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

        $env = loadEnvFile($envFile);

        // ========================================
// 2️⃣ AFFICHAGE DES VARIABLES
// ========================================
        echo '<h3>📋 Variables du .env :</h3>';
        echo '<table>';
        echo '<tr><th>Variable</th><th>Valeur</th><th>Longueur</th></tr>';
        echo '<tr><td>DB_HOST</td><td>' . htmlspecialchars($env['DB_HOST'] ?? 'NON DÉFINI') . '</td><td>' . strlen($env['DB_HOST'] ?? '') . '</td></tr>';
        echo '<tr><td>DB_NAME</td><td>' . htmlspecialchars($env['DB_NAME'] ?? 'NON DÉFINI') . '</td><td>' . strlen($env['DB_NAME'] ?? '') . '</td></tr>';
        echo '<tr><td>DB_USER</td><td><strong style="color: #0056b3;">' . htmlspecialchars($env['DB_USER'] ?? 'NON DÉFINI') . '</strong></td><td>' . strlen($env['DB_USER'] ?? '') . '</td></tr>';
        echo '<tr><td>DB_PASS</td><td>' . str_repeat('*', strlen($env['DB_PASS'] ?? '')) . '</td><td><strong>' . strlen($env['DB_PASS'] ?? '') . ' caractères</strong></td></tr>';
        echo '<tr><td>DB_CHARSET</td><td>' . htmlspecialchars($env['DB_CHARSET'] ?? 'NON DÉFINI') . '</td><td>' . strlen($env['DB_CHARSET'] ?? '') . '</td></tr>';
        echo '<tr><td>DB_PORT</td><td>' . htmlspecialchars($env['DB_PORT'] ?? 'NON DÉFINI') . '</td><td>' . strlen($env['DB_PORT'] ?? '') . '</td></tr>';
        echo '</table>';

        echo '<hr>';

        // ========================================
// 3️⃣ CONSTRUCTION DU DSN
// ========================================
        $dsn = sprintf(
            "mysql:host=%s;port=%s;dbname=%s;charset=%s",
            $env['DB_HOST'] ?? 'localhost',
            $env['DB_PORT'] ?? '3306',
            $env['DB_NAME'] ?? 'my-cinema',
            $env['DB_CHARSET'] ?? 'utf8mb4'
        );

        echo '<h3>🔧 Configuration PDO :</h3>';
        echo '<p><strong>DSN :</strong> <code>' . htmlspecialchars($dsn) . '</code></p>';
        echo '<p><strong>Utilisateur :</strong> <code>' . htmlspecialchars($env['DB_USER'] ?? 'root') . '</code></p>';
        echo '<p><strong>Mot de passe :</strong> ' . strlen($env['DB_PASS'] ?? '') . ' caractères</p>';

        echo '<hr>';

        // ========================================
// 4️⃣ TEST DE CONNEXION
// ========================================
        echo '<h3>🔌 Test de connexion MySQL :</h3>';

        try {
            $pdo = new PDO($dsn, $env['DB_USER'] ?? 'root', $env['DB_PASS'] ?? '', [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);

            $stmt = $pdo->query('SELECT USER() as user, DATABASE() as db, VERSION() as version');
            $info = $stmt->fetch();

            echo '<div class="success">';
            echo '<h4 style="margin-bottom: 15px;">✅ CONNEXION RÉUSSIE !</h4>';
            echo '<p>📊 <strong>Base de données :</strong> ' . htmlspecialchars($info['db']) . '</p>';
            echo '<p>👤 <strong>Utilisateur connecté :</strong> ' . htmlspecialchars($info['user']) . '</p>';
            echo '<p>🔧 <strong>Version MySQL :</strong> ' . htmlspecialchars($info['version']) . '</p>';
            echo '</div>';

            // ========================================
            // 5️⃣ AFFICHER LES PRIVILÈGES
            // ========================================
            echo '<h3>🔐 Privilèges de l\'utilisateur :</h3>';

            try {
                $grants = $pdo->query('SHOW GRANTS FOR CURRENT_USER()');
                echo '<ul>';

                while ($grant = $grants->fetch(PDO::FETCH_NUM)) {
                    echo '<li><code>' . htmlspecialchars($grant[0]) . '</code></li>';
                }

                echo '</ul>';
            } catch (PDOException $e) {
                echo '<div class="warning">⚠️ Impossible d\'afficher les privilèges : ' . htmlspecialchars($e->getMessage()) . '</div>';
            }

            // ========================================
            // 6️⃣ TESTER UNE REQUÊTE
            // ========================================
            echo '<hr><h3>🧪 Test d\'une requête (SHOW TABLES) :</h3>';

            try {
                $stmt = $pdo->query("SHOW TABLES");
                $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

                if (count($tables) > 0) {
                    echo '<div class="info">';
                    echo '<p><strong>✅ ' . count($tables) . ' table(s) trouvée(s) :</strong></p>';
                    echo '<ul style="margin-top: 10px;">';
                    foreach ($tables as $table) {
                        echo '<li>' . htmlspecialchars($table) . '</li>';
                    }
                    echo '</ul>';
                    echo '</div>';
                } else {
                    echo '<div class="warning">⚠️ La base de données existe mais ne contient aucune table.</div>';
                }
            } catch (PDOException $e) {
                echo '<div class="error">❌ Erreur lors de la requête : ' . htmlspecialchars($e->getMessage()) . '</div>';
            }

        } catch (PDOException $e) {
            echo '<div class="error">';
            echo '<h4>❌ ERREUR DE CONNEXION</h4>';
            echo '<p><strong>Code d\'erreur :</strong> ' . htmlspecialchars($e->getCode()) . '</p>';
            echo '<p><strong>Message :</strong> ' . htmlspecialchars($e->getMessage()) . '</p>';

            // Suggestions selon le type d'erreur
            if ($e->getCode() == 1045) {
                echo '<div class="warning" style="margin-top: 15px;">';
                echo '<strong>💡 Erreur d\'authentification</strong><br><br>';
                echo 'Le mot de passe dans le .env ne correspond pas au mot de passe MySQL.<br><br>';
                echo '<strong>Solution :</strong><br>';
                echo '1. Testez en ligne de commande : <code>mysql -u root -p</code><br>';
                echo '2. Notez le mot de passe qui fonctionne<br>';
                echo '3. Mettez à jour DB_PASS dans le fichier .env<br>';
                echo '</div>';
            } elseif ($e->getCode() == 1049) {
                echo '<div class="warning" style="margin-top: 15px;">';
                echo '<strong>💡 Base de données inexistante</strong><br><br>';
                echo 'La base de données <code>' . htmlspecialchars($env['DB_NAME']) . '</code> n\'existe pas.<br><br>';
                echo '<strong>Solution :</strong><br>';
                echo '<code>mysql -u root -p</code><br>';
                echo '<code>CREATE DATABASE `' . htmlspecialchars($env['DB_NAME']) . '` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;</code><br>';
                echo '</div>';
            } elseif ($e->getCode() == 2002) {
                echo '<div class="warning" style="margin-top: 15px;">';
                echo '<strong>💡 Serveur MySQL non accessible</strong><br><br>';
                echo 'MySQL ne répond pas ou n\'est pas démarré.<br><br>';
                echo '<strong>Solution :</strong><br>';
                echo '• Vérifiez que MySQL est démarré : <code>sudo systemctl status mysql</code><br>';
                echo '• Démarrez MySQL si nécessaire : <code>sudo systemctl start mysql</code><br>';
                echo '</div>';
            }

            echo '</div>';
        }
        ?>

    </div>
</body>

</html>