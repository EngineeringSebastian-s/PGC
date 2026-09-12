# Imagen para el CRUD de PHP.
#
# La imagen oficial php:8.4-cli ya trae mbstring (que PHPUnit necesita), pero
# no trae Composer ni unzip. Se copia Composer desde su imagen oficial en vez
# de bajarlo con un script: queda fijado por digest de la imagen y no depende
# de que getcomposer.org esté disponible al construir.

FROM php:8.4-cli

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# unzip y git los usa Composer para instalar paquetes; libzip + ext-zip evitan
# que caiga al modo lento de descompresión.
RUN apt-get update \
    && apt-get install -y --no-install-recommends unzip git libzip-dev \
    && docker-php-ext-install zip \
    && apt-get purge -y --auto-remove libzip-dev \
    && rm -rf /var/lib/apt/lists/*

ENV COMPOSER_ALLOW_SUPERUSER=1

WORKDIR /app
