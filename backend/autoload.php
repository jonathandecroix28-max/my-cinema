<?php


spl_autoload_register(function ($className) {
    $folders = ['models', 'repositories', 'controllers', 'services'];

    foreach ($folders as $folder) {
        $filePath = __DIR__ . "/{$folder}/{$className}.php";
        if (file_exists($filePath)) {
            require_once $filePath;
            return;
        }
    };
});

