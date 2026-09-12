<?php

declare(strict_types=1);

namespace Biblioteca;

use RuntimeException;

/**
 * Se lanza cuando se pide un libro que no esta en el repositorio.
 * Es una excepcion propia para poder distinguirla en los tests de una
 * InvalidArgumentException de validacion.
 */
final class LibroNoEncontradoException extends RuntimeException
{
    public function __construct(public readonly int $id)
    {
        parent::__construct(sprintf('No se encontro el libro con id %d', $id));
    }
}
