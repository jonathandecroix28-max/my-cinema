<?php session_start();
class AdminAuth
{
    public static function check()
    {
        if ($_SESSION['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Accès refusé']);
            exit;
        }
    }
}

?>