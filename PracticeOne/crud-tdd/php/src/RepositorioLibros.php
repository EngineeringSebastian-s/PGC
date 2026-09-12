<?php

declare(strict_types=1);

namespace Biblioteca;

/**
 * Repositorio en memoria: guarda los libros indexados por id y lleva el
 * contador de ids autoincrementales.
 */
final class RepositorioLibros
{
    /** @var array<int, Libro> */
    private array $libros = [];

    private int $siguienteId = 1;

    public function crear(string $titulo, string $autor, int $anio, string $genero): Libro
    {
        $libro = new Libro($this->siguienteId, $titulo, $autor, $anio, $genero);

        $this->siguienteId++;
        $this->libros[$libro->id] = $libro;

        return $libro;
    }

    public function obtenerPorId(int $id): Libro
    {
        return $this->libros[$id] ?? throw new LibroNoEncontradoException($id);
    }

    /** @return list<Libro> */
    public function obtenerTodos(): array
    {
        return array_values($this->libros);
    }

    /**
     * Actualiza solo los campos recibidos: un `null` deja el valor anterior.
     */
    public function actualizar(
        int $id,
        ?string $titulo = null,
        ?string $autor = null,
        ?int $anio = null,
        ?string $genero = null,
    ): Libro {
        $libro = $this->obtenerPorId($id);

        $actualizado = new Libro(
            $libro->id,
            $titulo ?? $libro->titulo,
            $autor ?? $libro->autor,
            $anio ?? $libro->anio,
            $genero ?? $libro->genero,
        );

        $this->libros[$id] = $actualizado;

        return $actualizado;
    }

    public function eliminar(int $id): void
    {
        $this->obtenerPorId($id);
        unset($this->libros[$id]);
    }
}
