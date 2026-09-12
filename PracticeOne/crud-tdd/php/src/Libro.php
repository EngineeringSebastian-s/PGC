<?php

declare(strict_types=1);

namespace Biblioteca;

use InvalidArgumentException;

/**
 * Entidad del catalogo. Es inmutable (`readonly`): actualizar un libro
 * construye uno nuevo, asi la validacion siempre corre en el constructor
 * y no hay forma de dejar un objeto en estado invalido.
 */
final class Libro
{
    /** Año de la imprenta de Gutenberg: cota inferior razonable. */
    public const ANIO_MINIMO = 1450;

    public function __construct(
        public readonly int $id,
        public readonly string $titulo,
        public readonly string $autor,
        public readonly int $anio,
        public readonly string $genero,
    ) {
        if (trim($titulo) === '') {
            throw new InvalidArgumentException('El titulo no puede ser vacio');
        }

        if (trim($autor) === '') {
            throw new InvalidArgumentException('El autor no puede ser vacio');
        }

        $anioActual = (int) date('Y');
        if ($anio < self::ANIO_MINIMO || $anio > $anioActual) {
            throw new InvalidArgumentException(
                sprintf('El anio debe estar entre %d y %d', self::ANIO_MINIMO, $anioActual)
            );
        }
    }
}
