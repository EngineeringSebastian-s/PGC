<?php

declare(strict_types=1);

/**
 * CLI interactiva para probar manualmente el CRUD de libros.
 * Se ejecuta con: php cli.php
 */

require __DIR__ . '/bootstrap.php';

use Biblioteca\Libro;
use Biblioteca\LibroNoEncontradoException;
use Biblioteca\RepositorioLibros;

const MENU = <<<TEXTO

--- Biblioteca ---
1. Crear libro
2. Listar libros
3. Obtener libro por id
4. Actualizar libro
5. Eliminar libro
0. Salir

TEXTO;

function leer(string $mensaje): string
{
    echo $mensaje;

    return trim((string) fgets(STDIN));
}

function leerId(string $mensaje): ?int
{
    $valor = leer($mensaje);
    if (!ctype_digit($valor)) {
        echo "Error: ingresa un numero valido.\n";

        return null;
    }

    return (int) $valor;
}

function mostrar(Libro $libro): void
{
    printf("  [%d] %s - %s (%d) [%s]\n", $libro->id, $libro->titulo, $libro->autor, $libro->anio, $libro->genero);
}

function crear(RepositorioLibros $repositorio): void
{
    $titulo = leer('Titulo: ');
    $autor = leer('Autor: ');
    $anio = leer('Anio: ');
    $genero = leer('Genero: ');

    try {
        $libro = $repositorio->crear($titulo, $autor, (int) $anio, $genero);
        echo "Libro creado:\n";
        mostrar($libro);
    } catch (InvalidArgumentException $error) {
        echo 'Error: ' . $error->getMessage() . "\n";
    }
}

function listar(RepositorioLibros $repositorio): void
{
    $libros = $repositorio->obtenerTodos();
    if ($libros === []) {
        echo "No hay libros registrados.\n";

        return;
    }

    foreach ($libros as $libro) {
        mostrar($libro);
    }
}

function obtener(RepositorioLibros $repositorio): void
{
    $id = leerId('Id: ');
    if ($id === null) {
        return;
    }

    try {
        mostrar($repositorio->obtenerPorId($id));
    } catch (LibroNoEncontradoException $error) {
        echo 'Error: ' . $error->getMessage() . "\n";
    }
}

function actualizar(RepositorioLibros $repositorio): void
{
    $id = leerId('Id a actualizar: ');
    if ($id === null) {
        return;
    }

    echo "Dejar vacio para no modificar el campo.\n";
    $titulo = leer('Nuevo titulo: ') ?: null;
    $autor = leer('Nuevo autor: ') ?: null;
    $anioTexto = leer('Nuevo anio: ');
    $anio = $anioTexto === '' ? null : (int) $anioTexto;
    $genero = leer('Nuevo genero: ') ?: null;

    try {
        $libro = $repositorio->actualizar($id, $titulo, $autor, $anio, $genero);
        echo "Libro actualizado:\n";
        mostrar($libro);
    } catch (LibroNoEncontradoException | InvalidArgumentException $error) {
        echo 'Error: ' . $error->getMessage() . "\n";
    }
}

function eliminar(RepositorioLibros $repositorio): void
{
    $id = leerId('Id a eliminar: ');
    if ($id === null) {
        return;
    }

    try {
        $repositorio->eliminar($id);
        echo "Libro eliminado.\n";
    } catch (LibroNoEncontradoException $error) {
        echo 'Error: ' . $error->getMessage() . "\n";
    }
}

$repositorio = new RepositorioLibros();
$acciones = [
    '1' => crear(...),
    '2' => listar(...),
    '3' => obtener(...),
    '4' => actualizar(...),
    '5' => eliminar(...),
];

while (true) {
    echo MENU;
    $opcion = leer('Elegi una opcion: ');

    if ($opcion === '0') {
        echo "Chau!\n";
        break;
    }

    $accion = $acciones[$opcion] ?? null;
    if ($accion === null) {
        echo "Opcion invalida.\n";
        continue;
    }

    $accion($repositorio);
}
