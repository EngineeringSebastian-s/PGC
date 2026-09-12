# PGC — Pruebas y Gestión de la Configuración

Trabajos prácticos de la materia **Pruebas y Gestión de la Configuración** (Ingeniería Informática).
Todo el repositorio gira alrededor de una idea: **escribir el test primero**.

## Práctica 1 — TDD

Tres puntos, ocho proyectos, **111 tests de CRUD** más los de JUnit.

| Punto | Consigna                                                                                                                              | Dónde                                                                                          | Lenguajes                                    |
|-------|---------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------|----------------------------------------------|
| **1** | Ejercicios de la [guía de JUnit 5](https://junit.org/junit5/docs/current/user-guide/#running-tests), en Java y Kotlin                 | [`PracticeOne/p1-java`](PracticeOne/p1-java), [`PracticeOne/p1-kotlin`](PracticeOne/p1-kotlin) | Java, Kotlin                                 |
| **2** | [Testing unitario (Softtek)](https://blog.softtek.com/es/testing-unitario): ecuación de primer grado, unitario vs. integración, mocks | [`PracticeOne/p1-java`](PracticeOne/p1-java)                                                   | Java                                         |
| **3** | CRUD con TDD en tres lenguajes (ni Java ni Kotlin; uno con framework de front)                                                        | [`PracticeOne/crud-tdd`](PracticeOne/crud-tdd)                                                 | C#, Python, React, **PHP**, **Rust**, **Go** |

El punto 3 pedía tres lenguajes: los tres obligatorios son **C#**, **Python** y **TypeScript/React**
(este último cubre el requisito de framework de front). **PHP**, **Rust** y **Go** se sumaron
como extensión.

Además, [`PracticeOne/guia-web`](PracticeOne/guia-web) es una guía interactiva que recorre los tests
de los puntos 1 y 2 paso a paso, pensada para proyectar en la exposición.

## Arranque rápido

Hay dos caminos. **Con Docker** no hace falta instalar ni un SDK:

```powershell
.\scripts\docker-correr-todo.ps1
```

Corre las **ocho** suítes en contenedores, Java y Kotlin incluidos.
Detalle en 👉 **[DOCKER.md](DOCKER.md)**.

**Instalando local**, si preferís correr todo nativo:

```powershell
# 1. Ver qué falta instalar
.\scripts\verificar-entorno.ps1

# 2. Instalar dependencias de los seis proyectos
.\scripts\preparar-entorno.ps1

# 3. Correr las seis suítes de CRUD
.\scripts\correr-todos-los-tests.ps1
```

## Correr un proyecto suelto

| Proyecto     | Carpeta                                 | Probar               | Demo manual                                    |
|--------------|-----------------------------------------|----------------------|------------------------------------------------|
| CRUD C#      | `PracticeOne/crud-tdd/csharp-dotnet`    | `dotnet test`        | `dotnet run --project src/PlaylistManager.Cli` |
| CRUD Python  | `PracticeOne/crud-tdd/python`           | `pytest -v`          | `python -m src.main`                           |
| CRUD React   | `PracticeOne/crud-tdd/javascript-react` | `npm test`           | `npm run dev`                                  |
| CRUD PHP     | `PracticeOne/crud-tdd/php`              | `composer test`      | `php cli.php`                                  |
| CRUD Rust    | `PracticeOne/crud-tdd/rust`             | `cargo test`         | `cargo run`                                    |
| CRUD Go      | `PracticeOne/crud-tdd/go`               | `go test ./...`      | `go run ./cmd/cli`                             |
| JUnit Java   | `PracticeOne/p1-java`                   | `.\gradlew.bat test` | —                                              |
| JUnit Kotlin | `PracticeOne/p1-kotlin`                 | `.\gradlew.bat test` | —                                              |
| Guía web     | `PracticeOne/guia-web`                  | —                    | `npm run dev` → <http://localhost:43141>       |

## Requisitos

> Todo esto se puede saltear usando [Docker](DOCKER.md): ahí el único requisito es Docker Desktop.

| Stack            | Necesita                                                     | Verificado con           |
|------------------|--------------------------------------------------------------|--------------------------|
| C#               | .NET **SDK** 10 (no alcanza con el runtime)                  | 10.0.401                 |
| Python           | Python 3.10+ y `pytest`                                      | 3.11.2 + pytest 9.1.1    |
| React / Guía web | Node.js 18+                                                  | 22.18.0                  |
| PHP              | PHP 8.2+, Composer 2, extensiones `mbstring`/`openssl`/`zip` | 8.4.24 + Composer 2.10.3 |
| Rust             | Rust estable 1.75+                                           | 1.98.1                   |
| Go               | Go 1.22+                                                     | 1.27.0                   |
| Java / Kotlin    | JDK 17+ (el wrapper baja Gradle solo)                        | OpenJDK 21.0.8           |

En Windows, todo se instala con winget salvo Composer:

```powershell
winget install Rustlang.Rustup
winget install GoLang.Go
winget install PHP.PHP.8.4
winget install Microsoft.DotNet.SDK.10
winget install OpenJS.NodeJS.LTS
winget install Microsoft.OpenJDK.21
```

Composer se instala con el instalador oficial (ver [
`PracticeOne/crud-tdd/php/README.md`](PracticeOne/crud-tdd/php/README.md)).

## Para la exposición

👉 **[PracticeOne/GUIDE.md](PracticeOne/GUIDE.md)** — guion paso a paso: qué
mostrar, en qué orden, qué comandos correr, qué decir en cada concepto y qué hacer si algo falla en vivo.

## Estructura

```
PGC/
├── DOCKER.md                       # cómo correr todo en contenedores
├── docker-compose.yml              # un servicio por stack
├── docker/php.Dockerfile           # única imagen propia (PHP + Composer)
├── scripts/                        # verificar / preparar entorno y correr todo
└── PracticeOne/
    ├── GUIDE.md                    # guion de la presentación
    ├── p1-java/                    # puntos 1 y 2 (JUnit 5 + Mockito)
    ├── p1-kotlin/                  # punto 1 en Kotlin
    ├── guia-web/                   # guía interactiva (Next.js)
    └── crud-tdd/                   # punto 3
        ├── csharp-dotnet/          # Playlist de canciones   — xUnit
        ├── python/                 # Colección de vinilos    — pytest
        ├── javascript-react/       # Plantas de jardín       — Vitest + Testing Library
        ├── php/                    # Biblioteca de libros    — PHPUnit
        ├── rust/                   # Catálogo de videojuegos — cargo test
        └── go/                     # Catálogo de películas    — go test
```
