# Standalone website CMS API (Laravel 12) — domains come from Coolify env only
FROM php:8.2-cli-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    unzip \
    curl \
    libzip-dev \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    libonig-dev \
    libxml2-dev \
  && docker-php-ext-configure gd --with-freetype --with-jpeg \
  && docker-php-ext-install -j$(nproc) \
    pdo_mysql \
    mbstring \
    zip \
    gd \
    bcmath \
    opcache \
  && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Install PHP dependencies first (better layer cache)
COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-scripts \
    --prefer-dist \
    --optimize-autoloader \
    --no-interaction

COPY . .

RUN composer dump-autoload --optimize --no-interaction \
  && mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs storage/app/public bootstrap/cache \
  && ln -sfn /var/www/html/storage/app/public /var/www/html/public/storage \
  && chown -R www-data:www-data storage bootstrap/cache \
  && chmod -R ug+rwx storage bootstrap/cache

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh \
  && sed -i 's/\r$//' /usr/local/bin/entrypoint.sh

# Serve as www-data (uploads land in storage/app/public)
USER www-data

EXPOSE 8000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
