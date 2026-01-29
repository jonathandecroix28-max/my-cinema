<?php


spl_autoload_register(function ($className) {
    $folders = ['models', 'repositories', 'controllers', 'services', 'middlewares'];

    foreach ($folders as $folder) {
        $filePath = __DIR__ . DIRECTORY_SEPARATOR . $folder . DIRECTORY_SEPARATOR . $className . '.php';
        if (file_exists($filePath)) {
            require_once $filePath;
            return;
        }
    };
});

