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
SALIDAS = AQUI / "salidas"


def extraer(relativo: str, inicio: str, fin: str = r"^\}\s*$") -> str:
    """Devuelve el bloque que va desde la primera linea que matchea `inicio`
    hasta la primera que matchea `fin` (inclusive), sin la indentacion comun."""
    archivo = CRUDS / relativo
    lineas = archivo.read_text(encoding="utf-8").splitlines()

    rx_inicio, rx_fin = re.compile(inicio), re.compile(fin)
    desde = next((i for i, l in enumerate(lineas) if rx_inicio.search(l)), None)
    if desde is None:
        raise SystemExit(f"{relativo}: no se encontro el inicio /{inicio}/")

    hasta = next((i for i in range(desde + 1, len(lineas)) if rx_fin.search(lineas[i])), None)
    if hasta is None:
        raise SystemExit(f"{relativo}: no se encontro el fin /{fin}/ despues de la linea {desde + 1}")

    bloque = lineas[desde:hasta + 1]
    sangria = min((len(l) - len(l.lstrip()) for l in bloque if l.strip()), default=0)
    return "\n".join(l[sangria:] if l.strip() else "" for l in bloque)


def salida(nombre: str) -> str:
    archivo = SALIDAS / f"{nombre}.txt"
    if not archivo.exists():
        raise SystemExit(f"falta {archivo}. Corre primero: .\\capturar.ps1")
    return archivo.read_text(encoding="utf-8").replace("\r\n", "\n").strip("\n")


# --------------------------------------------------------------------------
# Los seis lenguajes. `dominio` y `prueba` se leen del codigo real.
# --------------------------------------------------------------------------

LENGUAJES = [
    {
        "id": "csharp",
        "nombre": "C#",
        "stack": ".NET 10 · xUnit + FluentAssertions",
        "tema": "Playlist de canciones",
        "tests": 17,
        "postura": "excepciones",
        "resumen": (
            "Es el único que prueba contra una <b>interfaz</b> (<code>ICancionRepository</code>) en vez de "
            "contra la clase concreta. Al actualizar, muta la entidad existente."
        ),
        "lenguaje_codigo": "csharp",
        "dominio_archivo": "csharp-dotnet/src/PlaylistManager/CancionRepository.cs",
        "dominio": extraer(
            "csharp-dotnet/src/PlaylistManager/CancionRepository.cs",
            r"private static void ValidarDatos", r"^    \}\s*$"),
        "prueba_archivo": "csharp-dotnet/tests/PlaylistManager.Tests/CancionRepositoryTests.cs",
        "prueba": extraer(
            "csharp-dotnet/tests/PlaylistManager.Tests/CancionRepositoryTests.cs",
            r"Deberia_LanzarCancionNoEncontradaException_AlObtenerPorId_SiNoExiste", r"^    \}\s*$"),
        "nota": (
            "FluentAssertions convierte la aserción en una frase: <code>accion.Should().Throw&lt;T&gt;()</code>. "
            "La acción se envuelve en un delegado porque la excepción tiene que saltar <i>adentro</i> de la aserción."
        ),
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
        "resumen": (
            "Usa <code>@dataclass</code> y valida en <code>__post_init__</code>: la validación corre sola "
            "al construir el objeto, sin escribir un constructor a mano."
        ),
        "lenguaje_codigo": "python",
        "dominio_archivo": "python/src/vinilo.py",
        "dominio": extraer("python/src/vinilo.py", r"^@dataclass", r"El anio debe estar entre"),
        "prueba_archivo": "python/tests/test_repositorio_vinilos.py",
        "prueba": extraer(
            "python/tests/test_repositorio_vinilos.py",
            r"def test_deberia_lanzar_vinilo_no_encontrado_error_al_buscar_id_inexistente",
            r"repositorio\.obtener_por_id\(999\)"),
        "nota": (
            "<code>pytest.raises</code> es un context manager: el bloque <code>with</code> pasa si adentro "
            "se lanza esa excepción, y falla si no se lanza nada."
        ),
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
        "resumen": (
            "El único con <b>tests de interfaz</b>: además del dominio, renderiza componentes y simula al "
            "usuario. El repositorio vive dentro de un hook con estado de React."
        ),
        "lenguaje_codigo": "typescript",
        "dominio_archivo": "javascript-react/src/domain/plantaUtils.ts",
        "dominio": extraer("javascript-react/src/domain/plantaUtils.ts",
                           r"export function necesitaAgua", r"^\}\s*$"),
        "prueba_archivo": "javascript-react/src/components/ListaPlantas.test.tsx",
        "prueba": extraer("javascript-react/src/components/ListaPlantas.test.tsx",
                          r"^describe\('ListaPlantas'", r"^\}\)\s*$"),
        "nota": (
            "Testing Library no inspecciona el estado interno del componente: busca lo que el usuario "
            "vería en pantalla. Por eso el test cuenta tarjetas renderizadas, no elementos de un array."
        ),
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
        "resumen": (
            "La entidad es <b>inmutable</b> (<code>readonly</code>). Actualizar construye un objeto nuevo, "
            "así que si la actualización es inválida el original queda intacto."
        ),
        "lenguaje_codigo": "php",
        "dominio_archivo": "php/src/Libro.php",
        "dominio": extraer("php/src/Libro.php", r"public function __construct", r"^    \}\s*$"),
        "prueba_archivo": "php/tests/RepositorioLibrosTest.php",
        "prueba": extraer(
            "php/tests/RepositorioLibrosTest.php",
            r"deberia_lanzar_invalid_argument_al_actualizar_con_titulo_vacio", r"^    \}\s*$"),
        "nota": (
            "<code>expectException</code> se declara <i>antes</i> de la acción. Este test además verifica "
            "el efecto colateral: que el libro original no se haya modificado."
        ),
        "comando": "composer test",
        "salida": salida("php"),
    },
    {
        "id": "rust",
        "nombre": "Rust",
        "stack": "Rust 1.98 · cargo test (built-in)",
        "tema": "Catálogo de videojuegos",
        "tests": 18,
        "postura": "compilador",
        "resumen": (
            "No tiene excepciones: el error viaja dentro de un <code>Result</code>, y el <b>compilador "
            "obliga</b> a quien llama a hacer algo con él."
        ),
        "lenguaje_codigo": "rust",
        "dominio_archivo": "rust/src/videojuego.rs",
        "dominio": extraer("rust/src/videojuego.rs", r"pub fn nuevo\(", r"^    \}\s*$"),
        "prueba_archivo": "rust/tests/repositorio_videojuegos.rs",
        "prueba": extraer("rust/tests/repositorio_videojuegos.rs",
                          r"fn deberia_retornar_error_al_buscar_id_inexistente", r"^\}\s*$"),
        "nota": (
            "No hay <code>assertThrows</code> ni nada parecido: el error se compara con "
            "<code>assert_eq!</code>, la misma aserción que usa el caso feliz."
        ),
        "comando": "cargo test",
        "salida": salida("rust"),
    },
    {
        "id": "go",
        "nombre": "Go",
        "stack": "Go 1.27 · go test (built-in)",
        "tema": "Catálogo de películas",
        "tests": 21,
        "postura": "convencion",
        "resumen": (
            "Tampoco tiene excepciones, pero <b>nadie obliga</b> a mirar el error. Y es el único donde "
            "los casos de validación se escriben como una <b>tabla</b>."
        ),
        "lenguaje_codigo": "go",
        "dominio_archivo": "go/pelicula.go",
        "dominio": extraer("go/pelicula.go", r"^func NuevaPelicula"),
        "prueba_archivo": "go/pelicula_test.go",
        "prueba": extraer("go/pelicula_test.go", r"^func TestDeberiaRechazarDatosInvalidos"),
        "nota": (
            "Table-driven test: una fila por caso y un <code>t.Run</code> por fila. Cada una se reporta "
            "con su propio nombre, así que agregar un caso de prueba es agregar una línea a la tabla."
        ),
        "comando": "go test ./...",
        "salida": salida("go"),
    },
]

CICLO = {
    "rojo_codigo": extraer("go/pelicula_test.go", r"^func TestDeberiaRechazarDatosInvalidos"),
    "rojo_salida": salida("go-red"),
    "verde_codigo": extraer("go/pelicula.go", r"^func NuevaPelicula"),
    "verde_salida": salida("go"),
}

DATOS = {"lenguajes": LENGUAJES, "ciclo": CICLO}

plantilla = (AQUI / "plantilla.html").read_text(encoding="utf-8")
if "/*__DATOS__*/" not in plantilla:
    raise SystemExit("plantilla.html: falta el marcador /*__DATOS__*/")

html = plantilla.replace("/*__DATOS__*/", json.dumps(DATOS, ensure_ascii=False))
destino = AQUI / "index.html"
destino.write_text(html, encoding="utf-8")

total = sum(l["tests"] for l in LENGUAJES)
print(f"index.html generado: {len(LENGUAJES)} lenguajes, {total} tests, {destino.stat().st_size // 1024} KB")
