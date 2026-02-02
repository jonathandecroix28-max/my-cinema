<?php
$repo = new MovieRepository();
$movieId = isset($_GET['id']) ? intval($_GET['id']) : 0;

$movie = $repo->find($movieId);

if (!$movie) {
    echo json_encode(["error" => "Film non trouvé"]);
    exit;
}
?>
<div id="movie" data-id="<?= $movieId ?>">
    <h2><?= htmlspecialchars($movie->title) ?></h2>
    <p><?= htmlspecialchars($movie->description) ?></p>
</div>
<script src="../../frontend/detail.js"></script>