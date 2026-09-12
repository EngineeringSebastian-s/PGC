# Guía — Práctica 1 (TDD)

Guia de la práctica. Incluye el orden sugerido, qué mostrar en cada momento, los
comandos exactos, qué decir en cada concepto, las preguntas probables y el plan B si algo falla en vivo.

---

## Antes de empezar (10 minutos antes)

```powershell
.\scripts\verificar-entorno.ps1
```

Tiene que dar todo `[ok]`. Si algo falta, el propio script dice el comando para resolverlo.

> **Si vas a exponer desde otra máquina**, la vía corta es Docker: `.\scripts\docker-correr-todo.ps1`
> corre las ocho suítes sin instalar ningún SDK. Bajá las imágenes **el día anterior**, no en el
> momento. Ver [DOCKER.md](../DOCKER.md).

Si es la primera vez en esa máquina:

```powershell
.\scripts\preparar-entorno.ps1
```

Y el ensayo general, que además deja todo compilado y en caché (importante: la primera corrida de
cada suite es lenta, las siguientes son instantáneas):

```powershell
.\scripts\correr-todos-los-tests.ps1
```

Salida esperada: **`Todo verde: 6 suítes, 111 tests.`**

**Dejá abierto de antemano:**

1. Una terminal en la raíz del repo.
2. `npm run dev` corriendo en `PracticeOne/guia-web` → <http://localhost:43141>.
3. La presentación del punto 3 servida, para el bloque 4:
   `cd PracticeOne\crud-tdd\presentacion && node servidor.mjs` → <http://localhost:43142>
4. El editor con estos archivos ya abiertos en pestañas:
    - `p1-java/src/test/java/practica/tdd/CalculatorTest.java`
    - `p1-java/src/test/java/practica/tdd/ecuacion/EcuacionPrimerGradoMockitoTest.java`
    - `crud-tdd/rust/tests/repositorio_videojuegos.rs`
    - `crud-tdd/python/tests/test_repositorio_vinilos.py`

---

## Estructura sugerida (20–25 min)

| # | Bloque            | Tiempo | Qué se muestra                                 |
|---|-------------------|--------|------------------------------------------------|
| 0 | Qué es TDD        | 2 min  | Diapositiva / pizarra: el ciclo                |
| 1 | Punto 1 — JUnit 5 | 5 min  | Guía web + `CalculatorTest`                    |
| 2 | Punto 1 — Kotlin  | 2 min  | `CalculatorTest.kt`, las diferencias           |
| 3 | Punto 2 — Softtek | 6 min  | La ecuación, el mock, unitario vs. integración |
| 4 | Punto 3 — CRUD ×6 | 8 min  | `correr-todos-los-tests.ps1` + comparación     |
| 5 | Cierre            | 2 min  | Qué se aprendió repitiendo el ejercicio        |

---

## Bloque 0 — Qué es TDD (2 min)

> "TDD no es escribir tests. Es **escribir el test antes que el código**, y dejar que el test dicte el
> diseño."

El ciclo, tres pasos:

1. **RED** — escribo un test que falla. Falla porque el código todavía no existe. Esto es
   importante: un test que *nunca* falló no prueba nada, porque no sé si realmente está verificando algo.
2. **GREEN** — escribo el **mínimo** código que lo hace pasar. No el código elegante: el mínimo.
3. **REFACTOR** — ahora que tengo la red de seguridad del test en verde, mejoro el código.
   Si rompo algo, el test me avisa en el acto.

> "Los 111 tests del punto 3 se escribieron así, uno por uno. En los README de cada proyecto está la
> lista numerada en el orden exacto en que se fueron agregando."

**Por qué importa en esta materia:** TDD es la contracara de "primero programo, después pruebo si me
da el tiempo". El test deja de ser una tarea posterior y pasa a ser la especificación ejecutable del
requerimiento.

---

## Bloque 1 — Punto 1: JUnit 5 (5 min)

**Consigna:** los ejercicios de <https://junit.org/junit5/docs/current/user-guide/#running-tests>, en Java y Kotlin.

### Qué mostrar

Abrí la guía web en <http://localhost:43141>, grupo **Writing Tests**, y recorré los cinco pasos.
Cada uno muestra el código del test, su salida y una visualización de lo que pasa por dentro.

En paralelo, el archivo real: `p1-java/src/test/java/practica/tdd/CalculatorTest.java`.

### Qué decir en cada concepto

**`@Test`** — "JUnit descubre los tests por la anotación. No hay que registrarlos en ningún lado."

**`assertEquals(esperado, real)`** — "El orden de los argumentos no cambia el resultado, pero sí el
mensaje de error: *expected 2 but was 3*. Al revés, el mensaje miente."

**`assertThrows`** — "Acá el test pasa **porque** el código explota. Un caso de error también es un
caso de prueba, y de hecho suele ser el que más bugs encuentra."

```java
ArithmeticException exception = assertThrows(ArithmeticException.class, () -> calculator.divide(1, 0));

assertEquals("/ by zero",exception.getMessage());
```

**`@BeforeEach`** — "Corre antes de cada test. JUnit además crea una instancia nueva de la clase por
cada método. Las dos cosas apuntan a lo mismo: **que el orden en que corren los tests no cambie el
resultado**. Si el test A deja basura que rompe al test B, el suite se vuelve inútil."

**`@ParameterizedTest` + `@CsvSource`** — "Un método, cuatro ejecuciones independientes. Si falla una
fila, las otras igual se reportan: se ve exactamente *qué* dato rompió."

### Comando

```powershell
cd PracticeOne\p1-java
.\gradlew.bat test
```

---

## Bloque 2 — Punto 1 en Kotlin (2 min)

> "La consigna pedía el mismo ejercicio en Kotlin. Lo interesante es qué **no** cambia."

Abrí `p1-kotlin/src/test/kotlin/practica/tdd/CalculatorTest.kt` y señalá tres cosas:

**1. Nombres entre backticks:**

```kotlin
@Test
fun `divide lanza cuando el divisor es cero`() {
    ...
}
```

> "En Java tengo que elegir entre un nombre legible y un nombre válido. En Kotlin el nombre del test
> es una frase, y sale así tal cual en el reporte."

**2. `@TestInstance(PER_CLASS)`:**

> "Kotlin no tiene `static`, así que `@BeforeAll` necesitaría un `companion object` con `@JvmStatic`.
> La alternativa es pedirle a JUnit una sola instancia para toda la clase. **Pero ojo**: con eso el
> estado se comparte entre tests, y por eso `@BeforeEach` sigue reconstruyendo la calculadora."

**3. Lo que no cambia:**

> "Las anotaciones y las aserciones son **las mismas clases de JUnit 5**, importadas de
> `org.junit.jupiter.api`. Kotlin compila a la JVM: el runner no distingue uno de otro. Cambia la
> sintaxis del test, no el motor que lo corre."

---

## Bloque 3 — Punto 2: testing unitario (Softtek) (6 min)

**Consigna:** <https://blog.softtek.com/es/testing-unitario>

Este es el bloque con más contenido conceptual. **Si hay poco tiempo, recortá los otros, no este.**

### El problema

> "Resolver una ecuación de primer grado: `ax + b = c`, despejar `x = (c - b) / a`."

Mostrá que el código está partido en **dos clases** (guía web, grupo **Softtek**):

- `Parseador` — separa el texto `"2x - 1 = 0"` en `a = 2`, `b = -1`, `c = 0`.
- `EcuacionPrimerGrado` — aplica la fórmula. **Depende del `Parseador`.**

> "Esa división no es decorativa: es lo que hace posible mostrar la diferencia entre un test unitario
> y uno de integración."

### Los tres archivos de test

| Archivo                              | Tipo                 | Qué prueba                          |
|--------------------------------------|----------------------|-------------------------------------|
| `ParseadorTest`                      | Unitario             | El parseo, caso por caso (7 tests)  |
| `EcuacionPrimerGradoMockitoTest`     | Unitario **aislado** | Solo la fórmula, con mock (2 tests) |
| `EcuacionPrimerGradoIntegrationTest` | Integración          | Las dos clases juntas (4 tests)     |

### El momento clave: por qué el mock

Abrí `EcuacionPrimerGradoMockitoTest.java`.

> "`EcuacionPrimerGrado` depende de `Parseador`. Si pruebo la fórmula con el parseador real y el test
> falla… **¿cuál de las dos clases está rota?** No lo sé. Tengo que ir a investigar."

```java

@InjectMocks
private EcuacionPrimerGrado ecuacionPrimerGrado;
@Mock
private Parseador parseador;

when(parseador.obtenerParte1(ecuacion)).

thenReturn(2);

when(parseador.obtenerParte2(ecuacion)).

thenReturn(-1);

when(parseador.obtenerParte3(ecuacion)).

thenReturn(0);

assertEquals(0.5,ecuacionPrimerGrado.obtenerResultado(ecuacion));
```

> "Este test **no parsea nada**. Reemplazo el parseador por un doble programado: 'cuando te pregunten
> la parte 1, devolvé 2'. Y verifico una sola cosa: que con `a=2, b=-1, c=0` la fórmula dé `0.5`.
>
> Si mañana alguien rompe el `Parseador`, **este test sigue pasando** — y el que falla es
> `ParseadorTest`, que es exactamente donde está el bug. Eso es aislar la unidad: que la falla te
> apunte al culpable."

Si la guía web está en modo JVM, el paso `mock-formula` muestra esto corriendo de verdad.

### Y entonces, ¿para qué el de integración?

> "Porque el mock tiene un punto ciego: **asume** que el parseador devuelve lo que yo dije. Si el
> parseador real devuelve otra cosa, mi mock nunca se entera.
>
> El test de integración corre la cadena completa con el parseador real. Es el único que prueba que
> las dos clases **encajan**. Los dos tipos son necesarios: ninguno reemplaza al otro."

Cerrá con la tabla:

|             | Test unitario (con mock) | Test de integración       |
|-------------|--------------------------|---------------------------|
| Qué prueba  | Una clase sola           | Varias clases juntas      |
| Si falla    | Sé exactamente quién     | Sé que algo no encaja     |
| Velocidad   | Instantáneo              | Más lento                 |
| Punto ciego | Asume el contrato        | Ninguno, pero no localiza |

---

## Bloque 4 — Punto 3: CRUD con TDD en seis lenguajes (8 min)

**Consigna:** CRUD con TDD en tres lenguajes distintos, ni Java ni Kotlin, uno con framework de front.

> "La consigna pedía tres: hicimos **seis**. Los tres obligatorios son C#, Python y React —React cubre
> lo del framework de front—. PHP, Rust y Go se sumaron como extensión."

### Lo que se proyecta

Abrí <http://localhost:43142> (la presentación del punto 3). Tiene el recorrido armado: la
consigna, el ciclo RED → GREEN con corridas reales de `go test`, y un explorador con las seis
pestañas. En cada una está el código, el test y su salida.

Con <kbd>←</kbd> <kbd>→</kbd> cambiás de lenguaje y con <kbd>R</kbd> corrés la suite en vivo
delante de la clase. El selector **Local / Docker** de arriba elige el motor.

> Si el servidor no está levantado, la página igual funciona y muestra las salidas capturadas:
> el botón *Correr* se deshabilita solo. No hay forma de que quede en blanco.

### El momento fuerte: correr las seis suítes

```powershell
.\scripts\correr-todos-los-tests.ps1
```

Termina con:

```
Suite                  Estado Tests
-----                  ------ -----
CRUD C# (xUnit)        OK        17
CRUD Python (pytest)   OK        16
CRUD React (Vitest)    OK        21
CRUD PHP (PHPUnit)     OK        18
CRUD Rust (cargo test) OK        18
CRUD Go (go test)      OK        21

Todo verde: 6 suítes, 111 tests.
```

> "Seis lenguajes, seis frameworks de testing distintos, 111 tests, un solo comando."

### El ejercicio es el mismo en los seis

> "Una entidad con validaciones, un repositorio en memoria con las cinco operaciones del CRUD, ids
> autoincrementales, y dos clases de error bien separadas: *datos inválidos* y *no encontrado*.
>
> Los nombres de los tests siguen el mismo patrón a propósito —`deberia_<qué>_<cuándo>`— para poder
> abrir dos lenguajes al lado y comparar caso por caso."

### Lo interesante: lo que no se pudo repetir igual

Esta es la parte que da nota. Abrí tres archivos al lado:
**`crud-tdd/python/tests/test_repositorio_vinilos.py`**,
**`crud-tdd/rust/tests/repositorio_videojuegos.rs`** y
**`crud-tdd/go/repositorio_test.go`**.

Mismo caso de prueba —*pedir un id que no existe*— y tres posturas distintas.

**1. Excepciones** (Python, C#, PHP, React). El error viaja por un canal aparte del valor de retorno,
así que el test necesita un mecanismo especial para capturarlo:

```python
with pytest.raises(ViniloNoEncontradoError):
    repositorio.obtener_por_id(999)
```

**2. Valor de retorno, verificado por el compilador** (Rust):

```rust
let resultado = repositorio.obtener_por_id(999);
assert_eq!(resultado, Err(ErrorCatalogo::VideojuegoNoEncontrado(999)));
```

**3. Valor de retorno, verificado por convención** (Go):

```go
_, err := repositorio.ObtenerPorID(999)

if !errors.Is(err, catalogo.ErrNoEncontrada) {
    t.Errorf("se esperaba ErrNoEncontrada, se obtuvo: %v", err)
}
```

> "Rust y Go parten de la misma idea: el error no es una excepción, es un valor de retorno. Y llegan
> a dos lugares distintos.
>
> En Rust el `Result` **no se puede ignorar**: si no lo tratás, el compilador avisa.
>
> En Go, `repositorio.Eliminar(id)` a secas compila perfecto y tira el error a la basura en silencio.
> Go pone la disciplina en la convención y el linter; Rust la pone en el sistema de tipos.
>
> Y eso cambia el peso del test: **en Go el test es la única red** que verifica que el error se está
> propagando. Es probablemente la conclusión más concreta de haber repetido el ejercicio seis veces."

Otras diferencias, por si preguntan:

- **C#** — prueba contra una interfaz (`ICancionRepository`) y muta la entidad al actualizar.
- **Python** — `@dataclass` con validación en `__post_init__`.
- **React** — el único con **tests de UI**: además del dominio, renderiza componentes y simula al
  usuario con Testing Library. El "repositorio" vive dentro de un hook con estado.
- **PHP** — entidad inmutable con `readonly`; actualizar construye un objeto nuevo, así que si la
  actualización es inválida el objeto original queda intacto (y hay un test que lo verifica).
- **Go** — las cinco reglas de validación no son cinco tests, son **una tabla** recorrida con `t.Run`
  (el idioma canónico de Go, equivalente a `@ParameterizedTest` pero sin anotaciones: un `for` sobre
  un slice). Además no trae aserciones: se compara con un `if` y se reporta con `t.Errorf`.

### Si queda tiempo: la demo manual

Cualquiera de los CRUD tiene menú interactivo. El más rápido de mostrar:

```powershell
cd PracticeOne\crud-tdd\rust
cargo run
```

Crear (1), listar (2), eliminar (5), listar (2). Y para la UI, `npm run dev` en `javascript-react`.

---

## Bloque 5 — Cierre (2 min)

> "Tres conclusiones:
>
> **Una.** El test primero cambia el diseño, no solo la confianza. Los seis repositorios terminaron
> con ids asignados por el repositorio y no por quien llama, porque el primer test que se escribió fue
> `deberia_asignarle_id_autoincremental`. El test forzó esa decisión.
>
> **Dos.** Mockear no es hacer trampa: es decidir qué se está probando. El test con mock y el de
> integración responden preguntas distintas, y hacen falta los dos.
>
> **Tres.** Repetir el mismo ejercicio en seis lenguajes mostró que el *ciclo* RED-GREEN-REFACTOR es
> idéntico en todos, pero lo que el lenguaje te deja expresar en un test cambia mucho. El caso más
> claro es el manejo de errores: con excepciones, con `Result` verificado por el compilador, o con
> valores de error que nadie te obliga a mirar. Cuanto menos te cubre el lenguaje, más trabajo hace
> el test."

---

## Preguntas probables

**¿Por qué el CRUD es en memoria y no contra una base de datos?**
> Porque el objetivo es TDD, no persistencia. Un repositorio en memoria deja los tests rápidos y
> deterministas. Como todo pasa por una interfaz/estructura de repositorio, cambiar a una base sería
> reemplazar la implementación sin tocar un solo test de dominio.

**¿Los tests se escribieron de verdad antes que el código?**
> Sí, y está documentado: cada README tiene la lista numerada de casos en el orden exacto en que se
> fueron agregando, un RED-GREEN-REFACTOR por cada uno.

**¿Cuál es la diferencia entre un mock y un stub?**
> Un stub devuelve respuestas prearmadas. Un mock además permite verificar *cómo* fue llamado
> (`verify(...)`). En este trabajo se usa Mockito en modo stub: solo `when(...).thenReturn(...)`.

**¿Por qué seis lenguajes y no tres?**
> Los tres obligatorios están (C#, Python, React). PHP, Rust y Go se agregaron para poder comparar.
> Rust y Go en particular obligan a repensar cómo se escribe el test del caso de error, y entre ellos
> dos muestran dos soluciones distintas al mismo problema.

**¿Cuánta cobertura tienen?**
> No se midió como métrica de la consigna. Los proyectos tienen la infraestructura lista
> (`coverlet` en C#, `pytest-cov`, `--coverage` en Vitest, `php-code-coverage` en PHPUnit). El foco
> estuvo en cubrir todos los caminos del CRUD, incluidos los de error, no en llegar a un número.

---

## Plan B si algo falla en vivo

| Si falla…                                  | Hacé esto                                                                                                                                                                     |
|--------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Gradle (`p1-java` / `p1-kotlin`)           | Ver la sección de abajo. **La guía web sigue funcionando igual**: cae sola en modo "respaldo".                                                                                |
| La guía web no levanta                     | Mostrá los archivos de test directamente en el editor. El guion funciona igual.                                                                                               |
| El servidor de la presentación no levanta | Abrí `PracticeOne/crud-tdd/presentacion/index.html` con doble clic: funciona offline con las salidas capturadas. |
| `npm test` (React)                         | Corré `npx vitest --run`. Si `npm` da error de firma digital en PowerShell, usá `npm.cmd`.                                                                                    |
| `dotnet test` dice que no encuentra el SDK | Está el runtime pero no el SDK: `winget install Microsoft.DotNet.SDK.10`.                                                                                                     |
| `composer test` falla                      | Revisá `php --ini`. Si dice `(none)`, falta el `php.ini` (ver README de PHP).                                                                                                 |
| No anda internet                           | Todo corre offline **si ya corriste `preparar-entorno.ps1` antes**. Rust, Go y C# no necesitan red (no tienen dependencias externas); npm, pip y Composer sí, la primera vez. |
| Cualquier SDK falta o falla                | `docker compose run --rm <servicio>` corre esa suite igual, sin el SDK instalado. Ver [DOCKER.md](../DOCKER.md).                                                              |
| Se cae todo                                | `scripts\correr-todos-los-tests.ps1` guardado como captura de pantalla, de ensayo previo. **Sacala antes.**                                                                   |

---

## Problema conocido: Gradle no arranca en esta máquina

`gradlew test` falla con:

```
FAILURE: Build failed with an exception.
* What went wrong:
java.io.IOException: Unable to establish loopback connection
```

**No es un problema del proyecto.** Es la JVM de esta máquina: no puede abrir un `Selector` de NIO,
que internamente necesita un par de sockets sobre loopback. Se comprueba con este programa mínimo,
sin Gradle de por medio:

```java
import java.nio.channels.Selector;

public class Check {
    public static void main(String[] args) throws Exception {
        try (Selector s = Selector.open()) {
            System.out.println("OK");
        }
    }
}
```

En esta máquina devuelve `java.net.SocketException: Invalid argument: connect`.
`.\scripts\verificar-entorno.ps1` corre esa misma prueba y lo reporta.

### Qué lo causa y cómo se arregla

Afecta a **cualquier** aplicación Java que use NIO (Gradle, Maven, servidores embebidos), no solo a
este repo. Las causas habituales en Windows, en orden de probabilidad acá:

1. **El "Npcap Loopback Adapter"** (lo instala Wireshark / Nmap). Está presente en esta máquina y es
   la causa más frecuente de este error exacto. Probá deshabilitarlo desde *Conexiones de red* o el
   Administrador de dispositivos, y reintentá.
2. **Catálogo de Winsock dañado.** Como administrador:
   ```powershell
   netsh winsock reset
   ```
   Requiere reiniciar. (El catálogo de esta máquina se revisó y no tiene proveedores de terceros, así
   que esta es la segunda opción, no la primera.)
3. **Antivirus o VPN** interceptando conexiones locales: desactivarlo temporalmente para probar.

### La solución rápida: correrlo en Docker

Adentro de un contenedor Linux el problema no existe. Si Docker está instalado, esto funciona hoy:

```powershell
docker compose run --rm java
docker compose run --rm kotlin
```

Es, por ahora, la única forma de mostrar `gradle test` en vivo en esta máquina sin tocar la
configuración de red de Windows. Ver [DOCKER.md](../DOCKER.md).

### Si no hay Docker

- **La guía web funciona igual.** Intenta correr Gradle y, al fallar, cae sola en la réplica simulada.
  Se nota solo en que la insignia de la terminal dice `respaldo` en vez de `JVM`. El recorrido
  completo de los puntos 1 y 2 se puede exponer sin tocar Gradle.
- Los **seis CRUD del punto 3 no usan Java**: `correr-todos-los-tests.ps1` funciona perfecto.
- El código de `p1-java` y `p1-kotlin` está completo y es revisable en el editor.
