<?php

declare(strict_types=1);

namespace Biblioteca\Tests;

use Biblioteca\LibroNoEncontradoException;
use Biblioteca\RepositorioLibros;
use InvalidArgumentException;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

final class RepositorioLibrosTest extends TestCase
{
    private RepositorioLibros $repositorio;

    protected function setUp(): void
    {
        $this->repositorio = new RepositorioLibros();
    }

    #[Test]
    public function deberia_crear_libro_y_asignarle_id_autoincremental(): void
    {
        $libro = $this->repositorio->crear('Rayuela', 'Julio Cortazar', 1963, 'Novela');

        self::assertSame(1, $libro->id);
    }

    #[Test]
    public function deberia_incrementar_id_al_crear_varios_libros(): void
    {
        $primero = $this->repositorio->crear('Rayuela', 'Julio Cortazar', 1963, 'Novela');
        $segundo = $this->repositorio->crear('Ficciones', 'Jorge Luis Borges', 1944, 'Cuento');

        self::assertGreaterThan($primero->id, $segundo->id);
    }

    #[Test]
    public function deberia_propagar_error_de_validacion_al_crear_con_titulo_vacio(): void
    {
        $this->expectException(InvalidArgumentException::class);

        $this->repositorio->crear('', 'Julio Cortazar', 1963, 'Novela');
    }

    #[Test]
    public function deberia_obtener_libro_por_id_existente(): void
    {
        $creado = $this->repositorio->crear('Rayuela', 'Julio Cortazar', 1963, 'Novela');

        $obtenido = $this->repositorio->obtenerPorId($creado->id);

        self::assertEquals($creado, $obtenido);
    }

    #[Test]
    public function deberia_lanzar_libro_no_encontrado_al_buscar_id_inexistente(): void
    {
        $this->expectException(LibroNoEncontradoException::class);

        $this->repositorio->obtenerPorId(999);
    }

    #[Test]
    public function deberia_retornar_lista_vacia_si_no_hay_libros(): void
    {
        self::assertSame([], $this->repositorio->obtenerTodos());
    }

    #[Test]
    public function deberia_retornar_todos_los_libros_registrados(): void
    {
        $this->repositorio->crear('Rayuela', 'Julio Cortazar', 1963, 'Novela');
        $this->repositorio->crear('Ficciones', 'Jorge Luis Borges', 1944, 'Cuento');

        self::assertCount(2, $this->repositorio->obtenerTodos());
    }

    #[Test]
    public function deberia_actualizar_libro_existente_con_datos_parciales(): void
    {
        $creado = $this->repositorio->crear('Rayuela', 'Julio Cortazar', 1963, 'Novela');

        $actualizado = $this->repositorio->actualizar($creado->id, genero: 'Novela experimental');

        self::assertSame('Novela experimental', $actualizado->genero);
        self::assertSame('Rayuela', $actualizado->titulo);
        self::assertSame('Julio Cortazar', $actualizado->autor);
        self::assertSame(1963, $actualizado->anio);
    }

    #[Test]
    public function deberia_lanzar_libro_no_encontrado_al_actualizar_id_inexistente(): void
    {
        $this->expectException(LibroNoEncontradoException::class);

        $this->repositorio->actualizar(999, titulo: 'Rayuela');
    }

    #[Test]
    public function deberia_lanzar_invalid_argument_al_actualizar_con_titulo_vacio(): void
    {
        $creado = $this->repositorio->crear('Rayuela', 'Julio Cortazar', 1963, 'Novela');

        $this->expectException(InvalidArgumentException::class);

        $this->repositorio->actualizar($creado->id, titulo: '');
    }

    #[Test]
    public function deberia_eliminar_libro_existente(): void
    {
        $creado = $this->repositorio->crear('Rayuela', 'Julio Cortazar', 1963, 'Novela');

        $this->repositorio->eliminar($creado->id);

        $this->expectException(LibroNoEncontradoException::class);
        $this->repositorio->obtenerPorId($creado->id);
    }

    #[Test]
    public function deberia_lanzar_libro_no_encontrado_al_eliminar_id_inexistente(): void
    {
        $this->expectException(LibroNoEncontradoException::class);

        $this->repositorio->eliminar(999);
    }

    #[Test]
    public function deberia_no_afectar_otros_libros_al_eliminar_uno(): void
    {
        $primero = $this->repositorio->crear('Rayuela', 'Julio Cortazar', 1963, 'Novela');
        $segundo = $this->repositorio->crear('Ficciones', 'Jorge Luis Borges', 1944, 'Cuento');

        $this->repositorio->eliminar($primero->id);

        $restantes = $this->repositorio->obtenerTodos();
        self::assertCount(1, $restantes);
        self::assertSame($segundo->id, $restantes[0]->id);
    }
}
