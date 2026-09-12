<?php

declare(strict_types=1);

namespace Biblioteca\Tests;

use Biblioteca\Libro;
use InvalidArgumentException;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

final class LibroTest extends TestCase
{
    #[Test]
    public function deberia_crear_libro_con_datos_validos(): void
    {
        $libro = new Libro(1, 'Rayuela', 'Julio Cortazar', 1963, 'Novela');

        self::assertSame('Rayuela', $libro->titulo);
        self::assertSame('Julio Cortazar', $libro->autor);
        self::assertSame(1963, $libro->anio);
        self::assertSame('Novela', $libro->genero);
    }

    #[Test]
    public function deberia_lanzar_invalid_argument_si_titulo_es_vacio(): void
    {
        $this->expectException(InvalidArgumentException::class);

        new Libro(1, '   ', 'Julio Cortazar', 1963, 'Novela');
    }

    #[Test]
    public function deberia_lanzar_invalid_argument_si_autor_es_vacio(): void
    {
        $this->expectException(InvalidArgumentException::class);

        new Libro(1, 'Rayuela', '', 1963, 'Novela');
    }

    #[Test]
    public function deberia_lanzar_invalid_argument_si_anio_es_menor_a_1450(): void
    {
        $this->expectException(InvalidArgumentException::class);

        new Libro(1, 'Rayuela', 'Julio Cortazar', 1449, 'Novela');
    }

    #[Test]
    public function deberia_lanzar_invalid_argument_si_anio_es_mayor_al_actual(): void
    {
        $this->expectException(InvalidArgumentException::class);

        new Libro(1, 'Rayuela', 'Julio Cortazar', ((int) date('Y')) + 1, 'Novela');
    }
}
