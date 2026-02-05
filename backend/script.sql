-- Création de la base de données
CREATE DATABASE IF NOT EXISTS `my-cinema` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `my-cinema`;


-- Table movies (déjà existante, améliorée)
CREATE TABLE IF NOT EXISTS movies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    duration INT NOT NULL,
    release_year INT NOT NULL,
    genre VARCHAR(50),
    director VARCHAR(100),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table rooms (déjà existante)
CREATE TABLE IF NOT EXISTS rooms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    capacity INT NOT NULL,
    type VARCHAR(50),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table screenings (déjà existante)
CREATE TABLE IF NOT EXISTS screenings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    movie_id INT NOT NULL,
    room_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

/*ALTER TABLE rooms ADD COLUMN deleted_at DATETIME DEFAULT NULL;
ALTER TABLE movies ADD COLUMN deleted_at DATETIME DEFAULT NULL;
ALTER TABLE screenings ADD COLUMN deleted_at DATETIME DEFAULT NULL;*/

-- On s'assure que toutes les lignes existantes ont bien NULL
UPDATE movies SET deleted_at = NULL;

-- On s'assure que la colonne accepte le NULL par défaut
ALTER TABLE movies MODIFY deleted_at DATETIME DEFAULT NULL;
-- On s'assure que toutes les lignes existantes ont bien NULL
UPDATE rooms SET deleted_at = NULL;

-- On s'assure que la colonne accepte le NULL par défaut
ALTER TABLE rooms MODIFY deleted_at DATETIME DEFAULT NULL;


/*
UPDATE screenings 
SET room_id = 1 
WHERE room_id NOT IN (SELECT id FROM rooms);

-- 1. Fix the Parent Tables first
ALTER TABLE movies MODIFY id INT UNSIGNED AUTO_INCREMENT;
ALTER TABLE rooms MODIFY id INT UNSIGNED AUTO_INCREMENT;

-- 2. Ensure the Screening columns match the parent type exactly
ALTER TABLE screenings 
    MODIFY movie_id INT UNSIGNED NOT NULL,
    MODIFY room_id INT UNSIGNED NOT NULL;

-- 3. Now apply the Foreign Key constraints
ALTER TABLE screenings
ADD CONSTRAINT fk_screenings_movie
    FOREIGN KEY (movie_id) REFERENCES movies(id)
    ON DELETE CASCADE,
ADD CONSTRAINT fk_screenings_room
    FOREIGN KEY (room_id) REFERENCES rooms(id)
    ON DELETE CASCADE;*/

