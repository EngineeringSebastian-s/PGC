# Punto 1 en Kotlin — JUnit 5

> **Consigna (punto 1):** realizar los ejercicios de
> [la guía de usuario de JUnit 5](https://junit.org/junit5/docs/current/user-guide/#running-tests)
> **en Java y en Kotlin**.
>
> Esta carpeta es la mitad **Kotlin**. La mitad Java, más el punto 2 (Softtek), están en
> [`../p1-java`](../p1-java).

Misma clase bajo prueba (`Calculator` con `add` y `divide`), mismo framework (JUnit 5), otro lenguaje.
La gracia del ejercicio es ver **qué cambia y qué no** al cambiar de lenguaje sobre el mismo runner.

## Requisitos

- JDK 17 o superior (el build usa toolchain 21; probado con OpenJDK 21.0.8)
- Kotlin 2.1.10, lo baja Gradle solo
- No hace falta instalar Gradle: el wrapper (`gradlew.bat`) lo descarga la primera vez

Si `java` no está en el `PATH` pero el JDK está instalado:

```powershell
$env:JAVA_HOME = "C:\Program Files\Java\Java21"
```

## Cómo probar

```powershell
.\gradlew.bat test
```

En Linux/macOS: `./gradlew test`. El reporte HTML queda en `build/reports/tests/test/index.html`.

> ⚠️ **Si falla con `Unable to establish loopback connection`**, ver
> [la guía de exposición](../GUIDE.md#problema-conocido-gradle-no-arranca-en-esta-máquina).

## Qué demuestra cada test

`src/test/kotlin/practica/tdd/CalculatorTest.kt`, 4 métodos / 7 ejecuciones:

| Test | Qué demuestra |
|------|---------------|
| `` `la clase de test se crea una sola vez` `` | `@BeforeAll` con ciclo de vida por clase |
| `` `suma 1 + 1` `` | `@Test` + `assertEquals` |
| `` `divide lanza cuando el divisor es cero` `` | `assertThrows` sobre una lambda |
| `` `suma varios pares` `` | `@ParameterizedTest` + `@CsvSource`, 4 filas |

## Las tres diferencias con Java que conviene señalar

**1. Nombres de test entre backticks.** Kotlin permite que un identificador de función sea una frase:

```kotlin
@Test
fun `divide lanza cuando el divisor es cero`() { ... }
```

En Java hay que elegir entre un nombre legible y un nombre válido —de ahí convenciones como
`divideThrowsWhenDivisorIsZero` o `@DisplayName`—. En Kotlin el nombre del método **es** la
descripción, y aparece tal cual en el reporte de JUnit. Es la diferencia más visible en la salida.

**2. `@TestInstance(PER_CLASS)`.** Por defecto JUnit crea una instancia nueva de la clase de test por
cada método (`PER_METHOD`), y por eso `@BeforeAll` tiene que ser `static`. En Kotlin no hay `static`:
habría que usar un `companion object` con `@JvmStatic`, que es ruidoso. La alternativa idiomática es
pedirle a JUnit una sola instancia para toda la clase:

```kotlin
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class CalculatorTest {
    @BeforeAll fun crearSuite() { suiteInicializada = true }
}
```

El test `` `la clase de test se crea una sola vez` `` existe justamente para hacer visible ese cambio
de ciclo de vida. **Ojo con el precio**: con `PER_CLASS` el estado de la instancia *se comparte entre
tests*. Por eso `@BeforeEach` sigue reconstruyendo la `Calculator` en cada test — sin eso, los tests
dejarían de ser independientes.

**3. `lateinit var` en vez de un campo asignado en el constructor.** `private lateinit var calculator: Calculator`
le dice al compilador "prometo inicializar esto antes de usarlo". Es lo que permite declarar la
propiedad como no-nullable aunque quien la inicialice sea `@BeforeEach` y no el constructor.

## Lo que **no** cambia

Y esto es lo importante del ejercicio: las anotaciones (`@Test`, `@BeforeEach`, `@BeforeAll`,
`@ParameterizedTest`, `@CsvSource`) y las aserciones (`assertEquals`, `assertThrows`) son **las mismas
clases de JUnit 5**, importadas desde `org.junit.jupiter.api`. JUnit 5 corre sobre la JVM, y Kotlin
compila a la JVM: el runner no distingue uno de otro. Lo que cambia es la sintaxis con la que se
escribe el test, no el motor que lo ejecuta.

## Extra: `LiveBridge`

`src/test/kotlin/practica/tdd/LiveBridge.kt` no es un test: es el puente que usa la
[guía web](../guia-web) para ejecutar un test puntual y mostrar su salida real en el navegador.

```powershell
.\gradlew.bat live -PliveStep=kotlin-backticks
```

Pasos disponibles: `kotlin-backticks`, `kotlin-per-class`, `kotlin-before-each`, `kotlin-throws`,
`kotlin-parameterized`.
