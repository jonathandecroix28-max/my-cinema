# 🎬 My-Cinema - Back-Office

Application de gestion de cinéma développée avec PHP natif, MySQL et une architecture MVC.

## 📋 Table des matières

- [Prérequis](#prérequis)
- [Installation de l'environnement](#installation-de-lenvironnement)
  - [Installation sur Linux (Ubuntu/Debian)](#installation-sur-linux-ubuntudebian)
- [Configuration du projet](#configuration-du-projet)
- [Structure du projet](#structure-du-projet)
- [Description des fichiers Backend](#description-des-fichiers-backend)
- [Description des fichiers Frontend](#description-des-fichiers-frontend)
- [API Endpoints](#api-endpoints)
- [Tests](#tests)

---

## 🔧 Prérequis

- **PHP** >= 7.4
- **MySQL** >= 5.7
- **Apache2** avec mod_rewrite activé
- **phpMyAdmin** (recommandé pour la gestion de la base de données)

---

## 📦 Installation de l'environnement

### Installation sur Linux (Ubuntu/Debian)

#### 1. Mettre à jour le système
```bash
sudo apt update && sudo apt upgrade -y
```

#### 2. Installer Apache2
```bash
sudo apt install apache2 -y
sudo systemctl start apache2
sudo systemctl enable apache2
```

Vérifier l'installation :
```bash
apache2 -v
```

#### 3. Installer PHP et les extensions nécessaires
```bash
sudo apt install php libapache2-mod-php php-mysql php-cli php-curl php-json php-mbstring -y
```

Vérifier l'installation :
```bash
php -v
```

#### 4. Installer MySQL
```bash
sudo apt install mysql-server -y
sudo systemctl start mysql
sudo systemctl enable mysql
```

Sécuriser MySQL :
```bash
sudo mysql_secure_installation
```

#### 5. Installer phpMyAdmin
```bash
sudo apt install phpmyadmin -y
```

Lors de l'installation, sélectionnez **Apache2** et configurez le mot de passe.

Créer un lien symbolique :
```bash
sudo ln -s /usr/share/phpmyadmin /var/www/html/phpmyadmin
```

Accéder à phpMyAdmin : `http://localhost/phpmyadmin`

#### 6. Configurer Apache pour le projet
```bash
sudo nano /etc/apache2/sites-available/my-cinema.conf
```

Ajouter la configuration suivante :
```apache
<VirtualHost *:80>
    ServerName localhost
    DocumentRoot /var/www/html/my-cinema

    <Directory /var/www/html/my-cinema>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/my-cinema-error.log
    CustomLog ${APACHE_LOG_DIR}/my-cinema-access.log combined
</VirtualHost>
```

Activer le site et redémarrer Apache :
```bash
sudo a2ensite my-cinema.conf
sudo a2enmod rewrite
sudo systemctl restart apache2
```


## ⚙️ Configuration du projet

### 1. Cloner le repository
```bash
git clone https://github.com/EpitechWebAcademiePromo2027/W-WEB-102-LIL-1-1-my_cinema-13.git
cd W-WEB-102-LIL-1-1-my_cinema-13/my-cinema
```

### 2. Configurer les variables d'environnement
Copier le fichier `.env.example` vers `.env` :
```bash
cp .env.example .env
```

Éditer le fichier `.env` :
```env
DB_HOST=localhost
DB_NAME=my-cinema
DB_USER=root
DB_PASS=votre_mot_de_passe
DB_CHARSET=utf8mb4
DB_PORT=3306

APP_ENV=development
APP_DEBUG=true

CORS_ORIGIN=http://localhost
```

### 3. Créer la base de données
Accéder à phpMyAdmin (`http://localhost/phpmyadmin`) ou via MySQL CLI :
```bash
mysql -u root -p
```

Importer le script SQL :
```sql
source /chemin/vers/my-cinema/backend/script.sql;
```

Ou via phpMyAdmin :
- Créer une base de données nommée `my-cinema`
- Importer le fichier `backend/script.sql`

---

## 📁 Structure du projet

```
my-cinema/
├── backend/                    # API Backend PHP
│   ├── config/                 # Configuration
│   │   └── database.php        # Connexion à la base de données
│   ├── controllers/            # Contrôleurs (logique HTTP)
│   │   ├── MovieController.php
│   │   ├── RoomController.php
│   │   └── ScreeningController.php
│   ├── models/                 # Modèles (entités)
│   │   ├── Movies.php
│   │   ├── Rooms.php
│   │   └── Screening.php
│   ├── repositories/           # Repositories (accès base de données)
│   │   ├── MovieRepository.php
│   │   ├── RoomRepository.php
│   │   └── ScreeningRepository.php
│   ├── services/               # Services (logique métier)
│   │   ├── MovieService.php
│   │   ├── RoomService.php
│   │   └── ScreeningService.php
│   ├── middlewares/            # Middlewares (authentification, etc.)
│   │   └── AuthMiddleware.php
│   ├── autoload.php            # Autoloader personnalisé
│   ├── index.php               # Point d'entrée de l'API
│   └── script.sql              # Script de création de la base de données
├── frontend/                   # Interface utilisateur
│   ├── html/                   # Pages HTML
│   │   ├── index.html          # Page d'accueil
│   │   ├── movies.html         # Gestion des films
│   │   ├── rooms.html          # Gestion des salles
│   │   ├── screen.html         # Gestion des séances
│   │   └── room-trash.html     # Corbeille des salles
│   ├── assets/
│   │   ├── css/
│   │   │   └── index.css       # Styles personnalisés
│   │   └── js/                 # Scripts JavaScript (ES6 Modules)
│   │       ├── config.js       # Configuration API + Authentification
│   │       ├── auth-ui.js      # Gestion UI authentification
│   │       ├── movie.js        # CRUD Films
│   │       ├── room.js         # CRUD Salles
│   │       ├── screen.js       # CRUD Séances
│   │       ├── room-trash.js   # Gestion corbeille
│   │       ├── pagination.js   # Système de pagination
│   │       └── dom-elements.js # Sélecteurs DOM
├── .env.example                # Exemple de configuration
├── .gitignore                  # Fichiers ignorés par Git
├── login.html                  # Page de connexion

```

---

## 📝 Description des fichiers Backend

### 🔹 **`backend/index.php`** - Point d'entrée de l'API
- Gère le routage des requêtes via le paramètre `?action=`
- Configure les headers CORS (Cross-Origin Resource Sharing)
- Applique les headers de sécurité (X-Frame-Options, X-XSS-Protection, etc.)
- Vérifie l'authentification via `AuthMiddleware`
- Route les actions vers les contrôleurs appropriés

**Exemples d'actions :**
- `?action=list_movies` → Liste tous les films
- `?action=add_room` → Ajouter une salle
- `?action=list_screenings` → Liste toutes les séances

### 🔹 **`backend/autoload.php`** - Autoloader PSR-4 personnalisé
- Charge automatiquement les classes PHP depuis les dossiers :
  - `models/`, `repositories/`, `controllers/`, `services/`, `middlewares/`

### 🔹 **`backend/config/database.php`** - Connexion PDO à MySQL
- Parse le fichier `.env` manuellement
- Établit une connexion PDO sécurisée avec :
  - Mode d'erreur : `PDO::ERRMODE_EXCEPTION`
  - Fetch mode : `PDO::FETCH_ASSOC`
  - Prepared statements : `PDO::ATTR_EMULATE_PREPARES = false`
- Gère les erreurs de connexion avec des messages génériques

### 🔹 **Architecture MVC**

#### **Models (`backend/models/`)**
Classes représentant les entités de la base de données.

**`Rooms.php`** - Entité Salle
```php
class Rooms {
    public $id;
    public $name;
    public $capacity;      // Capacité entre 1 et 1000
    public $type;          // 2D, 3D, IMAX
    public $active;        // Salle active (1) ou inactive (0)
    public $created_at;
    public $updated_at;
    public $deleted_at;    // Soft delete
}
```

#### **Repositories (`backend/repositories/`)**
Couche d'accès aux données (Data Access Layer).

**`RoomRepository.php`** - Gestion des salles
- `add($room)` : Ajouter une salle
- `getAll()` : Récupérer toutes les salles (non supprimées)
- `findById($id)` : Récupérer une salle par ID
- `update($id, $name, $capacity, $type, $active)` : Modifier une salle
- `delete($id)` : Supprimer une salle
- `existsByName($name)` : Vérifier si un nom de salle existe

#### **Services (`backend/services/`)**
Logique métier et validation des données.

**`RoomService.php`** - Gestion des règles métier pour les salles
- Valide que la capacité est entre 1 et 1000
- Valide que le type est dans : `2D`, `3D`, `IMAX`
- Vérifie l'unicité du nom de salle
- Gère les erreurs et retourne des messages explicites

#### **Controllers (`backend/controllers/`)**
Gèrent les requêtes HTTP et appellent les services.

**`RoomController.php`** - Endpoints pour les salles
- `list()` : Liste toutes les salles
- `get()` : Récupère une salle par ID
- `add()` : Ajoute une nouvelle salle
- `update()` : Met à jour une salle
- `remove()` : Supprime une salle

#### **Middlewares (`backend/middlewares/`)**
**`AuthMiddleware.php`** - Authentification par API Key
- Vérifie le header `X-API-Key`
- Clés API valides (à remplacer en production) :
  - `cinema_admin_2026_secret_key_xyz`
  - `cinema_dev_test_key_123`
- Actions publiques (sans auth) :
  - `list_movies`, `get_movie`, `list_rooms`, `get_room`, `list_screenings`
- Actions protégées (nécessitent une API Key) :
  - `add_movie`, `delete_room`, `update_movie`, etc.

---

## 🎨 Description des fichiers Frontend

### 🔹 **Structure Frontend**

Le frontend est une **SPA (Single Page Application)** avec :
- **HTML5** pour la structure
- **Bootstrap 5** pour le design responsive
- **JavaScript ES6 Modules** pour la logique
- **Fetch API** pour la communication avec le backend

---

### 📄 **Pages HTML** (`frontend/html/`)

#### **`index.html`** - Page d'accueil
- Design moderne avec gradient purple/violet
- 3 cartes principales :
  - 🎬 Gestion des films
  - 🚪 Gestion des salles
  - 📅 Gestion des séances
- Navigation vers les différentes sections
- Badge utilisateur (Visiteur ou Admin)

#### **`login.html`** - Page de connexion
- Formulaire de connexion admin/utilisateur
- Design avec gradient animé
- Switch entre mode "Visiteur" et "Admin"
- Authentification via mot de passe : `admin123`
- Stockage du rôle dans `localStorage`

#### **`movies.html`** - Gestion des films
- **Liste des films** avec pagination (5 films par page)
- **Filtres dynamiques** :
  - Par genre (Action, Comédie, Drame, etc.)
  - Par année de sortie
  - Recherche par titre
- **Formulaire d'ajout** (admin uniquement) :
  - Titre, réalisateur, genre, durée, année, description
- **Actions admin** :
  - Supprimer un film
  - Modifier un film

#### **`rooms.html`** - Gestion des salles
- **Liste des salles** avec pagination
- **Informations affichées** :
  - ID, Nom, Capacité, Type (2D/3D/IMAX), Active (Oui/Non)
- **Formulaire d'ajout** (admin uniquement) :
  - Nom, capacité (1-1000), type, statut actif
- **Actions admin** :
  - Modifier une salle
  - Supprimer une salle (soft delete)
  - Activer/Désactiver une salle
- **Corbeille** : Lien vers `room-trash.html`

#### **`screen.html`** - Gestion des séances
- **Liste des séances** avec pagination
- **Informations affichées** :
  - Film, Salle, Horaire de début
- **Formulaire d'ajout** (admin uniquement) :
  - Sélection du film (menu déroulant)
  - Sélection de la salle active (menu déroulant)
  - Date et heure de début
- **Validation** :
  - Vérifie que la salle est active
  - Détecte les conflits d'horaires
- **Actions admin** :
  - Supprimer une séance
  - Modifier une séance

#### **`room-trash.html`** - Corbeille des salles (Admin uniquement)
- **Liste des salles supprimées**
- **Informations** : Date de suppression
- **Actions** :
  - Restaurer une salle
  - Supprimer définitivement

---

### 🎨 **Fichier CSS** (`frontend/assets/css/index.css`)

#### **Caractéristiques :**
- **Design moderne** avec dégradés (purple/violet)
- **Animations CSS** :
  - `fadeIn` : Apparition en fondu
  - `slideIn` : Glissement horizontal
  - `float` : Animation flottante pour les images
  - `pulse` : Pulsation pour le mode édition
- **Responsive Design** :
  - Mobile-first
  - Grid system Bootstrap
  - Media queries pour tablettes et desktop
- **Composants personnalisés** :
  - Navbar avec transition smooth
  - Feature cards avec effet hover 3D
  - Boutons avec transformation au survol

**Extrait clé :**
```css
.hero-section {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
}

.feature-card:hover {
    transform: translateY(-15px) scale(1.02);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2) !important;
}

@keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
}
```

---

### ⚙️ **Fichiers JavaScript** (`frontend/assets/js/`)

Le frontend utilise **ES6 Modules** pour une meilleure organisation du code.

#### **`config.js`** - Configuration API et Authentification
**Rôle principal :**
- Définit l'URL de l'API : `../../backend/index.php`
- Gère l'authentification utilisateur (visiteur/admin)
- Stocke la clé API : `cinema_admin_2026_secret_key_xyz`
- Fournit des fonctions utilitaires

**Fonctions clés :**
```javascript
// Authentification
export const loginAsAdmin = (password) => {...}
export const logout = () => {...}
export const isAdmin = () => {...}
export const initSession = () => {...}

// Appels API
export const apiFetch = async (action, options = {}) => {...}
export const apiPost = async (action, data) => {...}
export const apiDelete = async (type, id) => {...}

// Utilitaires
export const formatDate = (dateString) => {...}
export const truncateText = (text, limit = 80) => {...}
```

**Gestion automatique de l'authentification :**
- Les actions publiques (`list_movies`, `list_rooms`) ne nécessitent pas de clé API
- Les actions protégées (`add_movie`, `delete_room`) incluent automatiquement le header `X-API-Key`

---

#### **`auth-ui.js`** - Gestion de l'interface d'authentification
**Rôle :**
- Met à jour le badge utilisateur (👤 Visiteur ou 👑 Admin)
- Affiche/masque les éléments réservés aux admins (`.admin-only`)
- Gère la déconnexion

**Fonctions clés :**
```javascript
export function initAuth() {
    initSession();
    updateAuthUI();
}

export function requireAdmin() {
    if (!isAdmin()) {
        alert('⛔ Action réservée aux administrateurs');
        return false;
    }
    return true;
}
```

**Exemple d'usage :**
```html
<!-- Bouton visible uniquement pour les admins -->
<button class="btn btn-danger admin-only" onclick="deleteMovie(1)">
    Supprimer
</button>
```

---

#### **`movie.js`** - CRUD des films
**Fonctionnalités :**
- ✅ Charger la liste des films depuis l'API
- ✅ Pagination (5 films par page)
- ✅ Filtres dynamiques (genre, année, recherche)
- ✅ Ajouter un film (admin uniquement)
- ✅ Supprimer un film (admin uniquement)
- ✅ Affichage dynamique avec création de tableau HTML

**Flux de données :**
```
API Backend → apiFetch('list_movies') → movies array → renderMovies() → <table>
```

---

#### **`room.js`** - CRUD des salles
**Fonctionnalités :**
- ✅ Liste des salles avec badges colorés (type, statut)
- ✅ Pagination des résultats
- ✅ Ajouter une salle (validation capacité 1-1000)
- ✅ Modifier une salle (édition inline)
- ✅ Supprimer une salle (soft delete)
- ✅ Activer/Désactiver une salle

**Validation côté client :**
```javascript
if (capacity < 1 || capacity > 1000) {
    alert('La capacité doit être entre 1 et 1000');
    return;
}

const validTypes = ['2D', '3D', 'IMAX'];
if (!validTypes.includes(type)) {
    alert('Type invalide');
    return;
}
```

---

#### **`screen.js`** - CRUD des séances
**Fonctionnalités :**
- ✅ Liste des séances avec infos film + salle
- ✅ Remplissage automatique des selects (films et salles actives)
- ✅ Ajout de séance avec validation horaire
- ✅ Détection des conflits (même salle, même horaire)
- ✅ Suppression de séance

**Validation spécifique :**
- Vérifie que la salle sélectionnée est active
- Empêche la réservation dans une salle inactive

---

#### **`room-trash.js`** - Gestion de la corbeille
**Fonctionnalités :**
- ✅ Affiche les salles supprimées (soft delete)
- ✅ Restaurer une salle
- ✅ Supprimer définitivement (hard delete)
- ✅ Protection admin (redirection si non authentifié)

**Protection de page :**
```javascript
if (!requireAdmin()) {
    alert('⛔ Accès refusé : Cette page est réservée aux administrateurs.');
    window.location.href = 'rooms.html';
}
```

---

#### **`pagination.js`** - Système de pagination réutilisable
**Fonctions utilitaires :**
```javascript
export const ITEMS_PER_PAGE = 5;

// Navigation
export function nextPage(currentPage) {...}
export function prevPage(currentPage) {...}

// Calculs
export const getPaginatedItems = (items, currentPage, itemsPerPage) => {...}
export const getPageInfo = (currentPage, totalItems, itemsPerPage) => {...}

// Vérifications
export const isFirstPage = (currentPage) => {...}
export const isLastPage = (currentPage, totalItems, itemsPerPage) => {...}

// UI
export const disableButton = (button) => {...}
export const enableButton = (button) => {...}
```

**Utilisation :**
```javascript
import { getPaginatedItems, ITEMS_PER_PAGE } from './pagination.js';

const paginatedMovies = getPaginatedItems(movies, state.currentPage, ITEMS_PER_PAGE);
```

---

#### **`dom-elements.js`** - Sélecteurs DOM centralisés
**Rôle :**
- Évite la duplication de `document.getElementById()`
- Centralise tous les sélecteurs DOM

**Export :**
```javascript
export const els = {
    movieSelect: document.getElementById('movieSelect'),
    roomSelect: document.getElementById('roomSelect'),
    formMovie: document.getElementById('addMovieForm'),
    formRoom: document.getElementById('addRoomForm'),
    listScreenings: document.getElementById('screeningsList')
};
```

**Usage :**
```javascript
import { els } from './dom-elements.js';
const { movieSelect, roomSelect } = els;
```

---

### 🔐 **Système d'authentification Frontend**

#### **Flux d'authentification :**
1. Utilisateur accède à `login.html`
2. Sélectionne "Visiteur" ou "Admin"
3. Si Admin → Saisit le mot de passe : `admin123`
4. `loginAsAdmin(password)` vérifie et stocke dans `localStorage`
5. Redirection vers `index.html`
6. `initSession()` restaure le rôle depuis `localStorage`
7. `updateAuthUI()` affiche/masque les éléments `.admin-only`

#### **Persistance de session :**
```javascript
// Connexion
localStorage.setItem('userRole', 'admin');

// Vérification au chargement
export const initSession = () => {
    const savedRole = localStorage.getItem('userRole');
    if (savedRole === 'admin') {
        currentUser = { role: 'admin', isAdmin: true, apiKey: API_KEY };
    }
};

// Déconnexion
localStorage.removeItem('userRole');
```

---

### 🎯 **Communication Frontend ↔ Backend**

#### **Architecture RESTful :**
```
Frontend (JavaScript)
    ↓ fetch()
Backend API (index.php?action=...)
    ↓ AuthMiddleware
Controllers
    ↓
Services
    ↓
Repositories
    ↓
MySQL Database
```

#### **Exemple concret : Ajouter un film**
```javascript
// Frontend (movie.js)
const newMovie = {
    title: 'Inception',
    director: 'Christopher Nolan',
    duration: 148,
    release_year: 2010,
    genre: 'Science-Fiction'
};

const result = await apiPost('add_movie', newMovie);

// Requête HTTP générée
fetch('../../backend/index.php?action=add_movie', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'cinema_admin_2026_secret_key_xyz'
    },
    body: JSON.stringify(newMovie)
});

// Backend reçoit et traite
MovieController->add() → MovieService->addMovie() → MovieRepository->add()
```

---

## 🌐 API Endpoints

### Actions publiques (sans authentification)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `?action=list_movies` | Liste tous les films |
| GET | `?action=get_movie&id=1` | Récupère un film par ID |
| GET | `?action=list_rooms` | Liste toutes les salles |
| GET | `?action=get_room&id=1` | Récupère une salle par ID |
| GET | `?action=list_screenings` | Liste toutes les séances |

### Actions protégées (authentification requise)

| Method | Endpoint | Description | Données requises |
|--------|----------|-------------|------------------|
| POST | `?action=add_movie` | Ajouter un film | `title`, `duration`, `release_year` |
| POST | `?action=add_room` | Ajouter une salle | `name`, `capacity`, `type`, `active` |
| POST | `?action=add_screening` | Programmer une séance | `movie_id`, `room_id`, `start_time` |
| PUT | `?action=update_room` | Modifier une salle | `id`, `name`, `capacity`, `type`, `active` |
| DELETE | `?action=delete_movie&id=1` | Supprimer un film | `id` |
| DELETE | `?action=delete_room&id=1` | Supprimer une salle | `id` |

---

## 🔒 Sécurité

### Headers de sécurité implémentés
- **X-Frame-Options: DENY** - Protection contre le clickjacking
- **X-Content-Type-Options: nosniff** - Empêche le MIME sniffing
- **X-XSS-Protection: 1; mode=block** - Protection XSS
- **Referrer-Policy: strict-origin-when-cross-origin** - Contrôle des referrers
- **Permissions-Policy** - Désactive géolocalisation, micro, caméra

### Protections implémentées
✅ **Prepared Statements** - Protection contre les injections SQL  
✅ **API Key Authentication** - Authentification pour actions sensibles  
✅ **CORS whitelist** - Liste blanche des origines autorisées  
✅ **Input Validation** - Validation stricte des données  
✅ **Error Handling** - Messages d'erreur génériques en production  
✅ **Soft Delete** - Suppression logique des salles

---

## 🧪 Tests

### ✅ Tester la connexion à la base de données

**Option 1 : Via PHP CLI**
```bash
php backend/config/database.php
```
Si la connexion réussit, aucune erreur ne s'affichera.

**Option 2 : Créer un script de test**
Créez `backend/test-db.php` :
```php
<?php
require_once 'config/database.php';

try {
    $stmt = $pdo->query("SELECT 'Connexion réussie!' as message");
    $result = $stmt->fetch();
    echo $result['message'] . "\n";
} catch (PDOException $e) {
    echo "Erreur : " . $e->getMessage() . "\n";
}
```

Exécutez :
```bash
php backend/test-db.php
```

**Option 3 : Via le navigateur**
```
http://localhost/my-cinema/backend/index.php
```
Vous devriez voir :
```json
{"message":"Bienvenue dans l'API de My-Cinema"}
```

### ✅ Tester l'API

**Test endpoint public :**
```bash
curl http://localhost/my-cinema/backend/index.php?action=list_movies
```

**Test endpoint protégé (avec authentification) :**
```bash
curl -X POST http://localhost/my-cinema/backend/index.php?action=add_room \
  -H "X-API-Key: cinema_admin_2026_secret_key_xyz" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Salle IMAX",
    "capacity": 300,
    "type": "IMAX",
    "active": 1
  }'
```


### Tester le Frontend

1. **Ouvrir la page d'accueil** : `http://localhost/my-cinema/frontend/html/index.html`
2. **Se connecter en tant qu'admin** : Aller sur `login.html`, mot de passe : `admin123`
3. **Vérifier les éléments admin** : Boutons "Ajouter", "Supprimer" doivent être visibles
4. **Tester les fonctionnalités** :
   - Ajouter un film
   - Créer une salle
   - Programmer une séance
   - Vérifier la pagination

---

## 📚 Ressources

- [Documentation PHP](https://www.php.net/docs.php)
- [Documentation MySQL](https://dev.mysql.com/doc/)
- [Documentation Apache](https://httpd.apache.org/docs/)
- [Bootstrap 5](https://getbootstrap.com/docs/5.3/)
- [JavaScript Modules (MDN)](https://developer.mozilla.org/fr/docs/Web/JavaScript/Guide/Modules)

---


