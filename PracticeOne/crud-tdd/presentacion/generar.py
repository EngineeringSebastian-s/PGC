"""Genera index.html a partir del codigo real y de las salidas reales capturadas.

El objetivo es que la presentacion nunca quede desincronizada del repo: los
fragmentos de codigo se extraen de los archivos fuente de verdad, y las salidas
salen de `salidas/*.txt`, que produce `capturar.ps1` corriendo las suites.

    python generar.py
"""

from __future__ import annotations

import json
import re
from pathlib import Path

AQUI = Path(__file__).resolve().parent
CRUDS = AQUI.parent
PRACTICA = CRUDS.parent
SALIDAS = AQUI / "salidas"


def extraer(relativo: str, inicio: str, fin: str = r"^\}\s*$", base: Path = CRUDS,
            previas: int = 0) -> str:
    """Devuelve el bloque que va desde la primera linea que matchea `inicio`
    hasta la primera que matchea `fin` (inclusive), sin la indentacion comun.

    `previas` incluye esa cantidad de lineas anteriores al inicio, para que un
    fragmento arranque en su anotacion (@Test, #[test]) y no en la firma."""
    archivo = base / relativo
    lineas = archivo.read_text(encoding="utf-8").splitlines()

    rx_inicio, rx_fin = re.compile(inicio), re.compile(fin)
    desde = next((i for i, l in enumerate(lineas) if rx_inicio.search(l)), None)
    if desde is None:
        raise SystemExit(f"{relativo}: no se encontro el inicio /{inicio}/")

    hasta = next((i for i in range(desde + 1, len(lineas)) if rx_fin.search(lineas[i])), None)
    if hasta is None:
        raise SystemExit(f"{relativo}: no se encontro el fin /{fin}/ despues de la linea {desde + 1}")

    bloque = lineas[max(0, desde - previas):hasta + 1]
    sangria = min((len(l) - len(l.lstrip()) for l in bloque if l.strip()), default=0)
    return "\n".join(l[sangria:] if l.strip() else "" for l in bloque)


def practica(relativo: str, inicio: str, fin: str = r"^\}\s*$", previas: int = 0) -> str:
    return extraer(relativo, inicio, fin, base=PRACTICA, previas=previas)


def salida(nombre: str) -> str:
    archivo = SALIDAS / f"{nombre}.txt"
    if not archivo.exists():
        raise SystemExit(f"falta {archivo}. Corre primero: .\\capturar.ps1")
    return archivo.read_text(encoding="utf-8").replace("\r\n", "\n").strip("\n")


# ==========================================================================
# Punto 1 — JUnit 5, en Java y Kotlin
# ==========================================================================

PUNTO_UNO = {
    "conceptos": [
        {
            "api": "@Test",
            "que": "Marca un método como caso de prueba. JUnit lo descubre por la anotación, "
                   "sin que haya que registrarlo en ningún lado.",
        },
        {
            "api": "assertEquals(esperado, real)",
            "que": "Compara un valor con el esperado. El orden de los argumentos no cambia el "
                   "resultado, pero sí el mensaje de error: <i>expected 2 but was 3</i>.",
        },
        {
            "api": "assertThrows",
            "que": "El test pasa <b>si</b> el código lanza la excepción indicada, y falla si no "
                   "lanza nada. Devuelve la excepción, así que también se puede verificar el mensaje.",
        },
        {
            "api": "@BeforeEach",
            "que": "Corre antes de cada test. Junto con que JUnit crea una instancia nueva de la "
                   "clase por cada método, garantiza que el orden de ejecución no altere el resultado.",
        },
        {
            "api": "@ParameterizedTest + @CsvSource",
            "que": "Convierte un método en varias ejecuciones independientes, una por fila del CSV. "
                   "Si falla una fila, las demás se reportan igual.",
        },
    ],
    "codigo_java": practica("p1-java/src/test/java/practica/tdd/CalculatorTest.java",
                            r"void divideThrowsWhenDivisorIsZero", r"^    \}\s*$", previas=1),
    "codigo_parametrizado": practica("p1-java/src/test/java/practica/tdd/CalculatorTest.java",
                                     r"@ParameterizedTest", r"^    \}\s*$"),
    "codigo_kotlin": practica("p1-kotlin/src/test/kotlin/practica/tdd/CalculatorTest.kt",
                              r"fun `divide lanza cuando el divisor es cero`", r"^    \}\s*$", previas=1),
    "diferencias_kotlin": [
        {
            "titulo": "Nombres de test entre backticks",
            "texto": "Kotlin permite que el nombre de una función sea una frase, así que el nombre "
                     "del método <i>es</i> la descripción y aparece tal cual en el reporte. En Java "
                     "hay que elegir entre un nombre legible y uno válido.",
        },
        {
            "titulo": "@TestInstance(PER_CLASS)",
            "texto": "Kotlin no tiene <code>static</code>, que es lo que JUnit pide para "
                     "<code>@BeforeAll</code>. Se resuelve pidiendo una sola instancia para toda la "
                     "clase. El costo es que el estado se comparte entre tests, y por eso "
                     "<code>@BeforeEach</code> sigue reconstruyendo la calculadora.",
        },
        {
            "titulo": "Lo que no cambia",
            "texto": "Las anotaciones y las aserciones son las mismas clases de JUnit 5, importadas "
                     "de <code>org.junit.jupiter.api</code>. Kotlin compila a la JVM: cambia la "
                     "sintaxis del test, no el motor que lo ejecuta.",
        },
    ],
    "salida_java": salida("java"),
    "salida_kotlin": salida("kotlin"),
}


# ==========================================================================
# Punto 2 — Testing unitario (Softtek)
# ==========================================================================

PUNTO_DOS = {
    "codigo_formula": practica("p1-java/src/main/java/practica/tdd/ecuacion/EcuacionPrimerGrado.java",
                               r"public double obtenerResultado", r"^    \}\s*$"),
    "codigo_mock": practica("p1-java/src/test/java/practica/tdd/ecuacion/EcuacionPrimerGradoMockitoTest.java",
                            r"void solucionaEcuacionConMenos", r"^    \}\s*$", previas=1),
    "codigo_integracion": practica("p1-java/src/test/java/practica/tdd/ecuacion/EcuacionPrimerGradoIntegrationTest.java",
                                   r"void solucionaEcuacionConMenos", r"^    \}\s*$", previas=1),
    "archivos": [
        {
            "archivo": "ParseadorTest",
            "tipo": "Unitario",
            "prueba": "El parseo del texto, caso por caso",
            "tests": 7,
            "dependencias": "Ninguna: <code>Parseador</code> no depende de nadie",
        },
        {
            "archivo": "EcuacionPrimerGradoMockitoTest",
            "tipo": "Unitario aislado",
            "prueba": "Solo la fórmula del despeje",
            "tests": 2,
            "dependencias": "Ninguna: el <code>Parseador</code> está reemplazado por un mock",
        },
        {
            "archivo": "EcuacionPrimerGradoIntegrationTest",
            "tipo": "Integración",
            "prueba": "Las dos clases trabajando juntas",
            "tests": 4,
            "dependencias": "El <code>Parseador</code> real",
        },
    ],
}


# ==========================================================================
# Punto 3 — CRUD en seis lenguajes
# ==========================================================================

OPERACIONES = ["Crear", "Obtener por id", "Listar", "Actualizar (parcial)", "Eliminar"]

LENGUAJES = [
    {
        "id": "csharp",
        "nombre": "C#",
        "stack": ".NET 10 · xUnit + FluentAssertions",
        "tema": "Playlist de canciones",
        "tests": 17,
        "postura": "excepciones",
        "funcional": {
            "que_gestiona": "Una playlist. Cada canción se da de alta con su título, el artista, "
                            "cuánto dura y a qué género pertenece.",
            "entidad": "Cancion",
            "campos": [("Titulo", "texto"), ("Artista", "texto"),
                       ("DuracionSegundos", "entero"), ("Genero", "texto")],
            "reglas": ["El título no puede ser vacío ni nulo",
                       "El artista no puede ser vacío ni nulo",
                       "La duración en segundos tiene que ser mayor a cero"],
            "operaciones": OPERACIONES,
            "errores": [("ArgumentException", "los datos no cumplen las reglas"),
                        ("CancionNoEncontradaException", "no hay una canción con ese id")],
            "demo": "dotnet run --project src/PlaylistManager.Cli",
        },
        "particularidad": "Es el único que prueba contra una <b>interfaz</b> "
                          "(<code>ICancionRepository</code>) en vez de contra la clase concreta. "
                          "Al actualizar, modifica la entidad que ya estaba guardada.",
        "lenguaje_codigo": "csharp",
        "dominio_archivo": "csharp-dotnet/src/PlaylistManager/CancionRepository.cs",
        "dominio": extraer("csharp-dotnet/src/PlaylistManager/CancionRepository.cs",
                           r"private static void ValidarDatos", r"^    \}\s*$"),
        "prueba_archivo": "csharp-dotnet/tests/PlaylistManager.Tests/CancionRepositoryTests.cs",
        "prueba": extraer("csharp-dotnet/tests/PlaylistManager.Tests/CancionRepositoryTests.cs",
                          r"Deberia_LanzarCancionNoEncontradaException_AlObtenerPorId_SiNoExiste",
                          r"^    \}\s*$"),
        "nota": "FluentAssertions convierte la aserción en una frase: "
                "<code>accion.Should().Throw&lt;T&gt;()</code>. La acción se envuelve en un delegado "
                "para que la excepción salte adentro de la aserción y no antes.",
        "comando": "dotnet test",
        "salida": salida("csharp"),
    },
    {
        "id": "python",
        "nombre": "Python",
        "stack": "Python 3.12 · pytest",
        "tema": "Colección de vinilos",
        "tests": 16,
        "postura": "excepciones",
        "funcional": {
            "que_gestiona": "Una colección de vinilos. Cada disco se registra con el álbum, el "
                            "artista, el año de edición y el género.",
            "entidad": "Vinilo",
            "campos": [("album", "texto"), ("artista", "texto"), ("anio", "entero"), ("genero", "texto")],
            "reglas": ["El álbum no puede ser vacío",
                       "El artista no puede ser vacío",
                       "El año tiene que estar entre 1900 y el año actual"],
            "operaciones": OPERACIONES,
            "errores": [("ValueError", "los datos no cumplen las reglas"),
                        ("ViniloNoEncontradoError", "no hay un vinilo con ese id")],
            "demo": "python -m src.main",
        },
        "particularidad": "Usa <code>@dataclass</code> y valida en <code>__post_init__</code>: la "
                          "validación corre sola al construir el objeto, sin escribir un constructor "
                          "a mano. Al actualizar construye un objeto nuevo.",
        "lenguaje_codigo": "python",
        "dominio_archivo": "python/src/vinilo.py",
        "dominio": extraer("python/src/vinilo.py", r"^@dataclass", r"El anio debe estar entre"),
        "prueba_archivo": "python/tests/test_repositorio_vinilos.py",
        "prueba": extraer("python/tests/test_repositorio_vinilos.py",
                          r"def test_deberia_lanzar_vinilo_no_encontrado_error_al_buscar_id_inexistente",
                          r"repositorio\.obtener_por_id\(999\)"),
        "nota": "<code>pytest.raises</code> es un context manager: el bloque <code>with</code> pasa "
                "si adentro se lanza esa excepción, y falla si no se lanza nada.",
        "comando": "pytest -v",
        "salida": salida("python"),
    },
    {
        "id": "react",
        "nombre": "TypeScript / React",
        "stack": "Vite · Vitest + Testing Library",
        "tema": "Plantas de jardín",
        "tests": 21,
        "postura": "excepciones",
        "funcional": {
            "que_gestiona": "Las plantas de un jardín y su riego. Además del alta, lleva la cuenta "
                            "de los días desde el último riego y marca en pantalla las que ya "
                            "necesitan agua (tres días o más).",
            "entidad": "Planta",
            "campos": [("nombre", "texto"), ("tipo", "texto"), ("diasDesdeUltimoRiego", "entero")],
            "reglas": ["El nombre no puede ser vacío",
                       "Los días desde el último riego no pueden ser negativos",
                       "Una planta necesita agua cuando pasaron 3 días o más"],
            "operaciones": OPERACIONES + ["Regar (vuelve los días a cero)"],
            "errores": [("Error", "los datos no cumplen las reglas"),
                        ("Error", "no hay una planta con ese id")],
            "demo": "npm run dev",
        },
        "particularidad": "Es el que cubre el requisito de framework de front, y el único con "
                          "<b>tests de interfaz</b>: además del dominio, renderiza componentes y "
                          "simula al usuario. El repositorio vive dentro de un hook con estado de React.",
        "lenguaje_codigo": "typescript",
        "dominio_archivo": "javascript-react/src/domain/plantaUtils.ts",
        "dominio": extraer("javascript-react/src/domain/plantaUtils.ts",
                           r"export function necesitaAgua", r"^\}\s*$"),
        "prueba_archivo": "javascript-react/src/components/ListaPlantas.test.tsx",
        "prueba": extraer("javascript-react/src/components/ListaPlantas.test.tsx",
                          r"^describe\('ListaPlantas'", r"^\}\)\s*$"),
        "nota": "Testing Library no inspecciona el estado interno del componente: busca lo que el "
                "usuario vería en pantalla. Por eso el test cuenta tarjetas renderizadas y no "
                "elementos de un array.",
        "comando": "npm test",
        "salida": salida("react"),
    },
    {
        "id": "php",
        "nombre": "PHP",
        "stack": "PHP 8.4 · PHPUnit 11",
        "tema": "Biblioteca de libros",
        "tests": 18,
        "postura": "excepciones",
        "funcional": {
            "que_gestiona": "Una biblioteca. Cada libro se registra con su título, el autor, el año "
                            "de publicación y el género.",
            "entidad": "Libro",
            "campos": [("titulo", "texto"), ("autor", "texto"), ("anio", "entero"), ("genero", "texto")],
            "reglas": ["El título no puede ser vacío",
                       "El autor no puede ser vacío",
                       "El año tiene que estar entre 1450 y el año actual"],
            "operaciones": OPERACIONES,
            "errores": [("InvalidArgumentException", "los datos no cumplen las reglas"),
                        ("LibroNoEncontradoException", "no hay un libro con ese id")],
            "demo": "php cli.php",
        },
        "particularidad": "La entidad es <b>inmutable</b> (<code>readonly</code>). Actualizar "
                          "construye un objeto nuevo, así que si la actualización es inválida el "
                          "libro original queda intacto — y hay un test que lo verifica.",
        "lenguaje_codigo": "php",
        "dominio_archivo": "php/src/Libro.php",
        "dominio": extraer("php/src/Libro.php", r"public function __construct", r"^    \}\s*$"),
        "prueba_archivo": "php/tests/RepositorioLibrosTest.php",
        "prueba": extraer("php/tests/RepositorioLibrosTest.php",
                          r"deberia_lanzar_invalid_argument_al_actualizar_con_titulo_vacio",
                          r"^    \}\s*$"),
        "nota": "<code>expectException</code> se declara antes de la acción. Este test además "
                "verifica el efecto colateral: que el libro original no se haya modificado.",
        "comando": "composer test",
        "salida": salida("php"),
    },
    {
        "id": "rust",
        "nombre": "Rust",
        "stack": "Rust 1.98 · cargo test (biblioteca estándar)",
        "tema": "Catálogo de videojuegos",
        "tests": 18,
        "postura": "compilador",
        "funcional": {
            "que_gestiona": "Un catálogo de videojuegos. Cada uno se registra con el título, el "
                            "estudio que lo desarrolló, el año de salida y las horas jugadas, que "
                            "arrancan en cero y se actualizan después.",
            "entidad": "Videojuego",
            "campos": [("titulo", "texto"), ("estudio", "texto"),
                       ("anio", "entero"), ("horas_jugadas", "entero")],
            "reglas": ["El título no puede ser vacío",
                       "El estudio no puede ser vacío",
                       "El año tiene que estar entre 1958 y 2100"],
            "operaciones": OPERACIONES,
            "errores": [("ErrorCatalogo::DatosInvalidos", "los datos no cumplen las reglas"),
                        ("ErrorCatalogo::VideojuegoNoEncontrado", "no hay un videojuego con ese id")],
            "demo": "cargo run",
        },
        "particularidad": "No tiene excepciones: el error viaja dentro de un <code>Result</code> "
                          "y el <b>compilador obliga</b> a quien llama a hacer algo con él. Los dos "
                          "errores son variantes de un mismo enum, así que el test afirma cuál espera.",
        "lenguaje_codigo": "rust",
        "dominio_archivo": "rust/src/videojuego.rs",
        "dominio": extraer("rust/src/videojuego.rs", r"pub fn nuevo\(", r"^    \}\s*$"),
        "prueba_archivo": "rust/tests/repositorio_videojuegos.rs",
        "prueba": extraer("rust/tests/repositorio_videojuegos.rs",
                          r"fn deberia_retornar_error_al_buscar_id_inexistente", r"^\}\s*$"),
        "nota": "No hay <code>assertThrows</code> ni nada parecido: el error se compara con "
                "<code>assert_eq!</code>, la misma aserción que usa el caso feliz.",
        "comando": "cargo test",
        "salida": salida("rust"),
    },
    {
        "id": "go",
        "nombre": "Go",
        "stack": "Go 1.27 · go test (biblioteca estándar)",
        "tema": "Catálogo de películas",
        "tests": 21,
        "postura": "convencion",
        "funcional": {
            "que_gestiona": "Un catálogo de películas. Cada una se registra con el título, el "
                            "director, el año de estreno y la duración en minutos.",
            "entidad": "Pelicula",
            "campos": [("Titulo", "texto"), ("Director", "texto"),
                       ("Anio", "entero"), ("Minutos", "entero")],
            "reglas": ["El título no puede ser vacío",
                       "El director no puede ser vacío",
                       "El año tiene que estar entre 1888 y 2100",
                       "La duración tiene que ser mayor a cero"],
            "operaciones": OPERACIONES,
            "errores": [("ErrDatosInvalidos", "los datos no cumplen las reglas"),
                        ("ErrNoEncontrada", "no hay una película con ese id")],
            "demo": "go run ./cmd/cli",
        },
        "particularidad": "Tampoco tiene excepciones, pero a diferencia de Rust <b>nadie obliga</b> "
                          "a mirar el error. Y es el único donde los casos de validación se escriben "
                          "como una <b>tabla</b> recorrida con <code>t.Run</code>.",
        "lenguaje_codigo": "go",
        "dominio_archivo": "go/pelicula.go",
        "dominio": extraer("go/pelicula.go", r"^func NuevaPelicula"),
        "prueba_archivo": "go/pelicula_test.go",
        "prueba": extraer("go/pelicula_test.go", r"^func TestDeberiaRechazarDatosInvalidos"),
        "nota": "Cada fila de la tabla corre como un subtest con su propio nombre y su propio "
                "resultado, así que agregar un caso de prueba es agregar una línea.",
        "comando": "go test ./...",
        "salida": salida("go"),
    },
]

CICLO = {
    "rojo_codigo": extraer("go/pelicula_test.go", r"^func TestDeberiaRechazarDatosInvalidos"),
    "rojo_salida": salida("go-red"),
    "verde_salida": salida("go"),
}

RESULTADOS = [
    {"proyecto": "p1-java — Calculator", "punto": "1", "framework": "JUnit 5", "tests": "6"},
    {"proyecto": "p1-kotlin — Calculator", "punto": "1", "framework": "JUnit 5", "tests": "7"},
    {"proyecto": "p1-java — Parseador", "punto": "2", "framework": "JUnit 5", "tests": "7"},
    {"proyecto": "p1-java — Ecuación (mock)", "punto": "2", "framework": "JUnit 5 + Mockito", "tests": "2"},
    {"proyecto": "p1-java — Ecuación (integración)", "punto": "2", "framework": "JUnit 5", "tests": "4"},
    {"proyecto": "crud-tdd/csharp-dotnet", "punto": "3", "framework": "xUnit + FluentAssertions", "tests": "17"},
    {"proyecto": "crud-tdd/python", "punto": "3", "framework": "pytest", "tests": "16"},
    {"proyecto": "crud-tdd/javascript-react", "punto": "3", "framework": "Vitest + Testing Library", "tests": "21"},
    {"proyecto": "crud-tdd/php", "punto": "3", "framework": "PHPUnit", "tests": "18"},
    {"proyecto": "crud-tdd/rust", "punto": "3", "framework": "cargo test", "tests": "18"},
    {"proyecto": "crud-tdd/go", "punto": "3", "framework": "go test", "tests": "21"},
]

DATOS = {
    "punto_uno": PUNTO_UNO,
    "punto_dos": PUNTO_DOS,
    "lenguajes": LENGUAJES,
    "ciclo": CICLO,
    "resultados": RESULTADOS,
}

plantilla = (AQUI / "plantilla.html").read_text(encoding="utf-8")
if "/*__DATOS__*/" not in plantilla:
    raise SystemExit("plantilla.html: falta el marcador /*__DATOS__*/")

html = plantilla.replace("/*__DATOS__*/", json.dumps(DATOS, ensure_ascii=False))
destino = AQUI / "index.html"
destino.write_text(html, encoding="utf-8")

total = sum(int(r["tests"]) for r in RESULTADOS)
print(f"index.html generado: {len(LENGUAJES)} lenguajes, {total} tests en total, "
      f"{destino.stat().st_size // 1024} KB")
