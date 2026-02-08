<?php

class AuthMiddleware
{
    // ✅ Clés API valides
    private static $validApiKeys = [
        'cinema_admin_2026_secret_key_xyz',
        'cinema_dev_test_key_123'
    ];

    /**
     * Vérifier l'authentification via API Key
     */
    public static function checkAuth()
    {
        $headers = getallheaders();
        $apiKey = $headers['X-API-Key'] ?? $headers['x-api-key'] ?? null;

        // Debug (à retirer en production)
        error_log("AuthMiddleware: API Key reçue = " . ($apiKey ? $apiKey : 'AUCUNE'));

        if (!$apiKey) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'error' => 'Authentification requise. Veuillez fournir un header X-API-Key.'
            ]);
            exit;
        }

        if (!in_array($apiKey, self::$validApiKeys)) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'error' => 'Clé API invalide ou expirée.'
            ]);
            exit;
        }

        // Debug (à retirer en production)
        error_log("AuthMiddleware: Authentification réussie");
        return true;
    }

    /**
     * Actions publiques (accessibles sans authentification)
     */
    public static function isPublicAction($action)
    {
        $publicActions = [
            '',
            'list_movies',
            'get_movie',
            'list_rooms',
            'get_room',
            'list_screenings'
        ];

        return in_array($action, $publicActions);
    }

    /**
     * Vérifier si authentification nécessaire
     */
    public static function requiresAuth($action)
    {
        $needsAuth = !self::isPublicAction($action);

        // Debug (à retirer en production)
        error_log("AuthMiddleware: Action '$action' nécessite auth = " . ($needsAuth ? 'OUI' : 'NON'));

        return $needsAuth;
    }
}