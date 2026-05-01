FROM php:8.4-fpm-alpine
WORKDIR /var/www/html

RUN apk add --no-cache curl zip unzip git \
    && docker-php-ext-install pdo pdo_mysql

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY . .
RUN composer install --no-dev --optimize-autoloader

EXPOSE 3002
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=3002"]