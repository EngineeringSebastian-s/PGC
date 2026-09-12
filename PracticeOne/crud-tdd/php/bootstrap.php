<?php

declare(strict_types=1);

/**
 * Bootstrap de PHPUnit.
 *
 * Si el proyecto se instalo con Composer se usa su autoloader; si no
 * (por ejemplo corriendo `phpunit.phar` a secas) se registra un autoloader
 * PSR-4 minimo para que los tests funcionen igual.
 */

$autoloadDeComposer = __DIR__ . '/vendor/autoload.php';
if (is_file($autoloadDeComposer)) {
    require $autoloadDeComposer;

    return;
}

spl_autoload_register(static function (string $clase): void {
    $prefijos = [
        'Biblioteca\\Tests\\' => __DIR__ . '/tests/',
        'Biblioteca\\' => __DIR__ . '/src/',
    ];

    foreach ($prefijos as $prefijo => $carpeta) {
        if (!str_starts_with($clase, $prefijo)) {
            continue;
        }

        $relativo = str_replace('\\', '/', substr($clase, strlen($prefijo)));
        $ruta = $carpeta . $relativo . '.php';
        if (is_file($ruta)) {
            require $ruta;
        }

        return;
    }
});
