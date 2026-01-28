fetch(" index.php ? action = list_movies")
    .then(res => res.json())
    .then(data => console.log(data));