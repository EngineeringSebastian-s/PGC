# Práctica 1 — TDD

Publicado: 29 ago

## Consigna

Realizar los ejercicios que están en las siguientes páginas tal cual están ahí propuestos.

1. <https://junit.org/junit5/docs/current/user-guide/#running-tests> — **con Java y Kotlin**
2. <https://blog.softtek.com/es/testing-unitario>
3. Realizar un **CRUD en tres lenguajes diferentes** y aplicarle TDD. **No puede ser Java ni Kotlin**,
   y **uno de los tres debe usar un framework de front**.

## Qué hay en cada carpeta

| Carpeta | Punto | Contenido |
|---------|-------|-----------|
| [`p1-java/`](p1-java) | 1 y 2 | JUnit 5 (`Calculator`) + ecuación de primer grado con Mockito |
| [`p1-kotlin/`](p1-kotlin) | 1 | El mismo ejercicio de JUnit 5, en Kotlin |
| [`crud-tdd/`](crud-tdd) | 3 | Cinco CRUD con TDD: C#, Python, React, PHP y Rust |
| [`guia-web/`](guia-web) | 1 y 2 | Guía interactiva para proyectar durante la exposición |

Cada carpeta tiene su propio README con los requisitos, el detalle de los tests y las notas técnicas.

## Cómo correr todo

| Qué | Dónde | Comando |
|-----|-------|---------|
| Punto 1 — Java | `p1-java` | `.\gradlew.bat test` |
| Punto 1 — Kotlin | `p1-kotlin` | `.\gradlew.bat test` |
| Punto 2 — Softtek | `p1-java` | `.\gradlew.bat test` (mismo build) |
| Punto 3 — C# | `crud-tdd/csharp-dotnet` | `dotnet test` |
| Punto 3 — Python | `crud-tdd/python` | `pytest -v` |
| Punto 3 — React | `crud-tdd/javascript-react` | `npm test` |
| Punto 3 — PHP | `crud-tdd/php` | `composer test` |
| Punto 3 — Rust | `crud-tdd/rust` | `cargo test` |
| Guía web | `guia-web` | `npm run dev` → <http://localhost:43141> |

Los scripts de [`../scripts/`](../scripts) hacen esto solo: `verificar-entorno.ps1` dice qué falta,
`preparar-entorno.ps1` instala las dependencias y `correr-todos-los-tests.ps1` corre las cinco suítes
de una.

## Para exponer

👉 **[GUIA-EXPOSICION.md](GUIDE.md)** — el guion completo: orden, qué mostrar en cada
momento, qué comandos correr, qué decir en cada concepto y qué hacer si algo falla en vivo.

## Resumen de tests

| Proyecto | Framework | Tests |
|----------|-----------|-------|
| `p1-java` — Calculator | JUnit 5 | 3 métodos / 6 ejecuciones |
| `p1-java` — Parseador | JUnit 5 | 7 |
| `p1-java` — Ecuación (mocks) | JUnit 5 + Mockito | 2 |
| `p1-java` — Ecuación (integración) | JUnit 5 | 4 |
| `p1-kotlin` — Calculator | JUnit 5 | 4 métodos / 7 ejecuciones |
| `crud-tdd/csharp-dotnet` | xUnit + FluentAssertions | 17 |
| `crud-tdd/python` | pytest | 16 |
| `crud-tdd/javascript-react` | Vitest + Testing Library | 21 |
| `crud-tdd/php` | PHPUnit | 18 |
| `crud-tdd/rust` | `cargo test` | 18 |
