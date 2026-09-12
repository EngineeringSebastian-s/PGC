# Biblioteca — PHP + PHPUnit

CRUD en memoria para gestionar una biblioteca de libros (título, autor, año, género), desarrollado con TDD.

## Qué incluye

- `src/Libro.php`: entidad `Libro`, inmutable (`readonly`), con las validaciones en el constructor
  (título y autor no vacíos, año entre 1450 y el actual).
- `src/LibroNoEncontradoException.php`: excepción propia para distinguir "no existe" de "datos inválidos".
- `src/RepositorioLibros.php`: CRUD en memoria (crear, obtener por id, listar, actualizar, eliminar).
- `cli.php`: menú interactivo por consola para probar el CRUD a mano.
- `tests/`: 18 tests con PHPUnit cubriendo entidad y repositorio.
- `bootstrap.php`: autoloader. Usa el de Composer si está, y si no registra uno PSR-4 mínimo,
  así el proyecto corre también con `phpunit.phar` suelto.

## Requisitos

- PHP 8.2 o superior (probado con 8.4.24)
- Composer 2 (probado con 2.10.3)
- Extensiones de PHP: `mbstring`, `openssl`, `zip` (las pide PHPUnit y Composer)

> **PHP instalado con winget:** el paquete `PHP.PHP.8.4` **no crea `php.ini`**, así que no carga
> ninguna extensión y Composer falla. Revisá con `php --ini`; si dice `(none)`, creá un `php.ini`
> en la carpeta de `php.exe` con al menos esto:
>
> ```ini
> extension_dir = "ext"
> extension=mbstring
> extension=openssl
> extension=curl
> extension=zip
> ```

## Cómo ejecutar

Instalación de dependencias (una sola vez):

```bash
composer install
```

## Cómo probar

Automatizado (18 tests):

```bash
composer test
```

o directamente, con el detalle de cada caso en lenguaje natural:

```bash
php vendor/bin/phpunit --testdox
```

Manual, con menú interactivo por consola (crear, listar, obtener, actualizar, eliminar):

```bash
php cli.php
```

Salida esperada de la suite:

```
PHPUnit 11.5.56 by Sebastian Bergmann and contributors.

..................                                                18 / 18 (100%)

OK (18 tests, 25 assertions)
```

## Proceso TDD

Casos implementados en este orden (RED → GREEN → REFACTOR por cada uno):

1. `deberia_crear_libro_con_datos_validos`
2. `deberia_lanzar_invalid_argument_si_titulo_es_vacio`
3. `deberia_lanzar_invalid_argument_si_autor_es_vacio`
4. `deberia_lanzar_invalid_argument_si_anio_es_menor_a_1450`
5. `deberia_lanzar_invalid_argument_si_anio_es_mayor_al_actual`
6. `deberia_crear_libro_y_asignarle_id_autoincremental`
7. `deberia_incrementar_id_al_crear_varios_libros`
8. `deberia_propagar_error_de_validacion_al_crear_con_titulo_vacio`
9. `deberia_obtener_libro_por_id_existente`
10. `deberia_lanzar_libro_no_encontrado_al_buscar_id_inexistente`
11. `deberia_retornar_lista_vacia_si_no_hay_libros`
12. `deberia_retornar_todos_los_libros_registrados`
13. `deberia_actualizar_libro_existente_con_datos_parciales`
14. `deberia_lanzar_libro_no_encontrado_al_actualizar_id_inexistente`
15. `deberia_lanzar_invalid_argument_al_actualizar_con_titulo_vacio`
16. `deberia_eliminar_libro_existente`
17. `deberia_lanzar_libro_no_encontrado_al_eliminar_id_inexistente`
18. `deberia_no_afectar_otros_libros_al_eliminar_uno`

## Detalle técnico

**La entidad es inmutable.** `Libro` usa propiedades `public readonly` promovidas en el constructor.
Como la validación vive ahí y después nadie puede escribir los campos, *no existe forma de tener un
`Libro` en estado inválido*. El costo es que `actualizar()` no muta: construye un `Libro` nuevo. Eso
tiene una consecuencia que se ve en el test 15: si la actualización es inválida, la excepción salta
**antes** de tocar el arreglo, así que el libro original queda intacto. El test lo verifica explícitamente.

**Dos tipos de error, dos excepciones.** `InvalidArgumentException` (de PHP) para datos inválidos y
`LibroNoEncontradoException` (propia) para un id que no existe. Tener dos tipos distintos permite que
los tests afirmen *cuál* de los dos errores esperan, en vez de conformarse con "tiró algo".

**Argumentos con nombre.** Los tests usan la sintaxis `actualizar($id, genero: 'Novela experimental')`,
de PHP 8. Deja explícito qué campo se está actualizando sin tener que pasar `null` en las posiciones
anteriores, y es lo que hace legible el test de actualización parcial.
