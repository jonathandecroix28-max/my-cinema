<?php
echo "Répertoire courant (__DIR__) : " . __DIR__ . "<br>";
echo "Chemin visé : " . __DIR__ . "/config/database.php<br>";
echo "Le fichier existe-t-il ? " . (file_exists(__DIR__ . "/config/database.php") ? "OUI ✅" : "NON ❌");
?>