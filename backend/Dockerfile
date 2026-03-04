FROM php:8.2-apache

# Installer les dépendances système
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    && docker-php-ext-install pdo pdo_mysql pdo_pgsql mysqli \
    && a2enmod rewrite \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Installer Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Définir le répertoire de travail
WORKDIR /var/www/html



# Copier composer.json et composer.lock (si existe)
COPY composer.json composer.lock* ./

# Installer les dépendances avec verbose pour debug
RUN composer install --no-dev --optimize-autoloader --no-scripts --prefer-dist -vvv || \
    composer install --no-dev --no-scripts --prefer-dist

# Copier le reste des fichiers
COPY . /var/www/html/

COPY init-db.sh /usr/local/bin/

RUN chmod +x /usr/local/bin/init-db.sh

# Configurer Apache pour pointer sur /public
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Exposer le port
EXPOSE 80

# Démarrer Apache
CMD ["apache2-foreground"]