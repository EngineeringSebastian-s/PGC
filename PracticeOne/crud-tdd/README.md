# CRUD con TDD en cinco lenguajes

> **Consigna (punto 3):** realizar un CRUD en tres lenguajes diferentes aplicando TDD.
> No puede ser Java ni Kotlin, y uno de los tres debe usar un framework de front.
>
> Los tres obligatorios son **C#**, **Python** y **TypeScript/React** (este último cubre el
> requisito de framework de front). **PHP** y **Rust** se agregaron como extensión de la práctica.

Cinco implementaciones independientes del mismo ejercicio: un CRUD en memoria sobre una entidad con
validaciones, construido test a test.

## Comparativa

| Lenguaje               | Framework de test        | Tema del CRUD          | Tests | Cómo se prueba el error |
|------------------------|--------------------------|------------------------|-------|-------------------------|
| C# / .NET              | xUnit + FluentAssertions | Playlist de canciones  | 17    | `.Should().Throw<T>()`  |
| Python                 | pytest                   | Colección de vinilos   | 16    | `pytest.raises`         |
| TypeScript / React     | Vitest + Testing Library | Plantas de jardín      | 21    | `expect(...).toThrow`   |
| PHP                    | PHPUnit                  | Biblioteca de libros   | 18    | `expectException`       |
| Rust                   | `cargo test` (built-in)  | Catálogo de videojuegos| 18    | `assert_eq!` sobre `Result` |
|                        |                          | **Total**              | **90**|                         |

## El ejercicio, en una línea

Las cinco implementaciones resuelven lo mismo:

- una **entidad** con validaciones (campos obligatorios, rango de año);
- un **repositorio en memoria** con las cinco operaciones: crear, obtener por id, listar, actualizar
  (parcial) y eliminar;
- **ids autoincrementales** asignados por el repositorio, no por quien llama;
- **dos clases de error** bien separadas: datos inválidos vs. entidad no encontrada;
- una **CLI o UI** para demostrarlo a mano, además de la suite automatizada.

Los nombres de los tests siguen el mismo patrón en los cinco: `deberia_<comportamiento esperado>_<condición>`.
Esa repetición es deliberada: permite abrir dos lenguajes al lado y comparar caso por caso.

## Cómo correr cada uno

| Proyecto | Carpeta | Instalar | Probar | Demo manual |
|----------|---------|----------|--------|-------------|
| C#       | [`csharp-dotnet/`](csharp-dotnet) | `dotnet restore` | `dotnet test` | `dotnet run --project src/PlaylistManager.Cli` |
| Python   | [`python/`](python) | `pip install -r requirements.txt` | `pytest -v` | `python -m src.main` |
| React    | [`javascript-react/`](javascript-react) | `npm install` | `npm test` | `npm run dev` |
| PHP      | [`php/`](php) | `composer install` | `composer test` | `php cli.php` |
| Rust     | [`rust/`](rust) | (nada) | `cargo test` | `cargo run` |

Cada carpeta tiene su propio README con los requisitos, la lista ordenada de casos TDD y las notas
técnicas de esa implementación.

## Qué cambia de un lenguaje a otro

El valor de repetir el ejercicio está en lo que **no** se puede repetir igual:

- **C#** prueba contra una interfaz (`ICancionRepository`) y muta la entidad en el update.
- **Python** usa `@dataclass` y valida en `__post_init__`; el update construye un objeto nuevo.
- **React** es el único con tests de UI: además del dominio (`plantaUtils`, `usePlantas`), hay tests
  que renderizan componentes y simulan al usuario con Testing Library. Es también el único donde el
  "repositorio" vive dentro de un hook con estado de React.
- **PHP** hace la entidad inmutable con `readonly` y usa argumentos con nombre para el update parcial.
- **Rust** no tiene excepciones: el error viaja dentro de un `Result` y el compilador obliga a tratarlo.

Esa última fila de la tabla comparativa —*cómo se prueba el error*— es el mejor resumen de la
diferencia: cuatro lenguajes necesitan un mecanismo especial para capturar una excepción; Rust prueba
el error con la misma aserción de igualdad que usa para el caso feliz.
