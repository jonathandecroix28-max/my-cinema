# 📦 Installation d'Apache2 et phpMyAdmin

Ce guide vous explique comment installer et configurer **Apache2**, **PHP**, **MySQL** et **phpMyAdmin** sur différents systèmes d'exploitation.

---

## 📋 Table des matières

- [Installation sur Ubuntu/Debian](#-installation-sur-ubuntudebian)
- [Installation sur Windows avec XAMPP](#-installation-sur-windows-avec-xampp)
- [Installation sur macOS](#-installation-sur-macos)
- [Configuration de la base de données](#-configuration-de-la-base-de-données)
- [Vérification de l'installation](#-vérification-de-linstallation)
- [Problèmes courants](#-problèmes-courants)

---

## 🐧 Installation sur Ubuntu/Debian

### 1️⃣ Mettre à jour le système

```bash
sudo apt update
sudo apt upgrade -y
```

### 2️⃣ Installer Apache2

```bash
sudo apt install apache2 -y
```

**Vérifier qu'Apache est actif :**

```bash
sudo systemctl status apache2
```

**Démarrer Apache (si nécessaire) :**

```bash
sudo systemctl start apache2
sudo systemctl enable apache2
```

**Tester Apache :**  
Ouvrez votre navigateur et allez sur `http://localhost`. Vous devriez voir la page par défaut d'Apache.

---

### 3️⃣ Installer PHP

```bash
sudo apt install php libapache2-mod-php php-mysql -y
```

**Vérifier la version de PHP :**

```bash
php -v
```

**Redémarrer Apache pour activer PHP :**

```bash
sudo systemctl restart apache2
```

---

### 4️⃣ Installer MySQL

```bash
sudo apt install mysql-server -y
```

**Sécuriser l'installation de MySQL :**

```bash
sudo mysql_secure_installation
```

Répondez aux questions :
- **Définir un mot de passe root** : Oui
- **Supprimer les utilisateurs anonymes** : Oui
- **Interdire la connexion root à distance** : Oui
- **Supprimer la base de données de test** : Oui
- **Recharger les privilèges** : Oui

**Se connecter à MySQL :**

```bash
sudo mysql -u root -p
```

---

### 5️⃣ Installer phpMyAdmin

```bash
sudo apt install phpmyadmin -y
```

**Pendant l'installation :**
- Sélectionnez **apache2** (appuyez sur Espace pour sélectionner, puis Entrée)
- Choisissez **Oui** pour configurer la base de données avec dbconfig-common
- Entrez un mot de passe pour phpMyAdmin

**Activer l'extension PHP mbstring :**

```bash
sudo phpenmod mbstring
```

**Redémarrer Apache :**

```bash
sudo systemctl restart apache2
```

**Créer un lien symbolique (si nécessaire) :**

```bash
sudo ln -s /usr/share/phpmyadmin /var/www/html/phpmyadmin
```

**Accéder à phpMyAdmin :**  
Ouvrez `http://localhost/phpmyadmin`

---

### 6️⃣ Créer un utilisateur MySQL pour phpMyAdmin

Si vous ne pouvez pas vous connecter avec `root`, créez un nouvel utilisateur :

```bash
sudo mysql -u root -p
```

Dans MySQL :

```sql
CREATE USER 'admin'@'localhost' IDENTIFIED BY 'VotreMotDePasse';
GRANT ALL PRIVILEGES ON *.* TO 'admin'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;
EXIT;
```

Maintenant, connectez-vous à phpMyAdmin avec :
- **Utilisateur** : `admin`
- **Mot de passe** : `VotreMotDePasse`

---

## 🪟 Installation sur Windows avec XAMPP

### 1️⃣ Télécharger XAMPP

Téléchargez XAMPP depuis [https://www.apachefriends.org](https://www.apachefriends.org)

### 2️⃣ Installer XAMPP

- Lancez l'installateur
- Sélectionnez les composants : **Apache**, **MySQL**, **PHP**, **phpMyAdmin**
- Choisissez le répertoire d'installation (par défaut : `C:\xampp`)
- Terminez l'installation

### 3️⃣ Démarrer Apache et MySQL

- Ouvrez le **XAMPP Control Panel**
- Cliquez sur **Start** pour Apache
- Cliquez sur **Start** pour MySQL

### 4️⃣ Accéder à phpMyAdmin

Ouvrez votre navigateur et allez sur `http://localhost/phpmyadmin`

### 5️⃣ Placer vos fichiers

Placez vos fichiers PHP dans le dossier :

```
C:\xampp\htdocs\
```

Exemple : `C:\xampp\htdocs\my-cinema\`

Accédez à votre projet via `http://localhost/my-cinema`

---

## 🍎 Installation sur macOS

### 1️⃣ Installer Homebrew (si ce n'est pas déjà fait)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2️⃣ Installer Apache

```bash
brew install httpd
```

**Démarrer Apache :**

```bash
brew services start httpd
```

**Tester Apache :**  
Ouvrez `http://localhost:8080`

### 3️⃣ Installer PHP

```bash
brew install php
```

**Vérifier PHP :**

```bash
php -v
```

### 4️⃣ Installer MySQL

```bash
brew install mysql
```

**Démarrer MySQL :**

```bash
brew services start mysql
```

**Sécuriser MySQL :**

```bash
mysql_secure_installation
```

### 5️⃣ Installer phpMyAdmin

```bash
brew install phpmyadmin
```

**Configurer Apache pour phpMyAdmin :**

Éditez le fichier de configuration d'Apache :

```bash
nano /opt/homebrew/etc/httpd/httpd.conf
```

Ajoutez à la fin :

```apache
Alias /phpmyadmin /opt/homebrew/share/phpmyadmin
<Directory /opt/homebrew/share/phpmyadmin>
    Options Indexes FollowSymLinks
    AllowOverride All
    Require all granted
</Directory>
```

**Redémarrer Apache :**

```bash
brew services restart httpd
```

**Accéder à phpMyAdmin :**  
Ouvrez `http://localhost:8080/phpmyadmin`

---

## 🗄️ Configuration de la base de données

### Créer la base de données pour My-Cinema

1. Accédez à phpMyAdmin : `http://localhost/phpmyadmin`
2. Connectez-vous (utilisateur par défaut : `root`, mot de passe : celui que vous avez défini)
3. Cliquez sur **Nouvelle base de données**
4. Nom : `my_cinema`
5. Interclassement : `utf8mb4_general_ci`
6. Cliquez sur **Créer**

### Importer le schéma SQL

Si vous avez un fichier SQL (`database.sql`), importez-le :

1. Sélectionnez la base de données `my_cinema`
2. Cliquez sur l'onglet **Importer**
3. Choisissez votre fichier SQL
4. Cliquez sur **Exécuter**

---

## ✅ Vérification de l'installation

### Tester PHP

Créez un fichier `info.php` dans `/var/www/html/` (Linux) ou `C:\xampp\htdocs\` (Windows) :

```php
<?php
phpinfo();
?>
```

Accédez à `http://localhost/info.php`. Vous devriez voir les informations PHP.

### Tester la connexion MySQL

Créez un fichier `test_db.php` :

```php
<?php
$host = 'localhost';
$user = 'root';
$password = 'VotreMotDePasse';
$database = 'my_cinema';

$conn = new mysqli($host, $user, $password, $database);

if ($conn->connect_error) {
    die("Erreur de connexion : " . $conn->connect_error);
}

echo "✅ Connexion réussie à la base de données !";
$conn->close();
?>
```

Accédez à `http://localhost/test_db.php`.

---

## ❗ Problèmes courants

### Apache ne démarre pas

**Port 80 déjà utilisé :**

```bash
sudo lsof -i :80
```

Arrêtez le processus qui utilise le port 80, ou changez le port d'Apache.

**Redémarrer Apache :**

```bash
sudo systemctl restart apache2
```

### phpMyAdmin : Erreur "Access denied"

**Solution 1 : Utiliser un autre utilisateur MySQL**

Créez un nouvel utilisateur comme expliqué ci-dessus.

**Solution 2 : Modifier l'authentification root**

```bash
sudo mysql -u root -p
```

```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'VotreMotDePasse';
FLUSH PRIVILEGES;
EXIT;
```

### MySQL ne démarre pas

**Vérifier les logs :**

```bash
sudo journalctl -u mysql.service
```

**Réinitialiser MySQL :**

```bash
sudo systemctl stop mysql
sudo systemctl start mysql
```

### Permissions sur /var/www/html

**Donner les bonnes permissions :**

```bash
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html
```

---

## 🚀 Lancer le projet My-Cinema

### 1. Cloner ou copier le projet

```bash
cd /var/www/html
sudo git clone https://github.com/jonathandecroix28-max/my-cinema.git
```

Ou copiez manuellement les fichiers dans `/var/www/html/my-cinema/`.

### 2. Configurer la base de données

Modifiez `backend/config/database.php` avec vos identifiants MySQL.

### 3. Accéder au projet

Ouvrez votre navigateur et allez sur :

```
http://localhost/my-cinema/frontend/html/index.html
```

---

## 📚 Ressources utiles

- [Documentation Apache](https://httpd.apache.org/docs/)
- [Documentation PHP](https://www.php.net/manual/fr/)
- [Documentation MySQL](https://dev.mysql.com/doc/)
- [Documentation phpMyAdmin](https://docs.phpmyadmin.net/)

---

## 📝 Notes

- **Sécurité** : N'utilisez jamais `root` sans mot de passe en production
- **Firewall** : Assurez-vous que les ports 80 (Apache) et 3306 (MySQL) sont ouverts
- **Sauvegarde** : Sauvegardez régulièrement votre base de données

---

🎉 **Installation terminée !** Vous pouvez maintenant utiliser Apache, PHP, MySQL et phpMyAdmin.