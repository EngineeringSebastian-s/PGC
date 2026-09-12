# Puntos 1 y 2 en Java — JUnit 5 + Mockito

> **Consigna (puntos 1 y 2):** realizar los ejercicios tal cual están propuestos en
> [la guía de usuario de JUnit 5](https://junit.org/junit5/docs/current/user-guide/#running-tests) y en
> [el artículo de testing unitario de Softtek](https://blog.softtek.com/es/testing-unitario), en Java y Kotlin.
>
> Esta carpeta es la parte en **Java**. El equivalente en Kotlin está en [`../p1-kotlin`](../p1-kotlin).

## Requisitos

- JDK 17 o superior (el build usa toolchain 21; probado con OpenJDK 21.0.8)
- No hace falta instalar Gradle: el wrapper (`gradlew.bat`) lo descarga solo la primera vez (~130 MB)

Si `java` no está en el `PATH` pero el JDK está instalado, alcanza con apuntar `JAVA_HOME` antes de correr:

```powershell
$env:JAVA_HOME = "C:\Program Files\Java\Java21"
```

## Cómo probar

```powershell
.\gradlew.bat test
```

En Linux/macOS: `./gradlew test`.

Con el detalle de cada test:

```powershell
.\gradlew.bat test --info
```

El reporte HTML queda en `build/reports/tests/test/index.html`.

> ⚠️ **Si falla con `Unable to establish loopback connection`** no es un problema del proyecto:
> es la JVM de esa máquina, que no puede abrir un `Selector` de NIO. Ver
> [la guía de exposición](../GUIA-EXPOSICION.md#problema-conocido-gradle-no-arranca-en-esta-máquina).

---

## Punto 1 — JUnit 5 User Guide

Fuente: <https://junit.org/junit5/docs/current/user-guide/#running-tests>

Archivos: `src/main/java/practica/tdd/Calculator.java` y `src/test/java/practica/tdd/CalculatorTest.java`.

La clase bajo prueba es mínima a propósito (`add` y `divide`): el objetivo del punto no es el
algoritmo sino **el andamiaje de JUnit 5**. Cada test del archivo demuestra una pieza distinta:

| Test | Qué demuestra | Anotación / API |
|------|---------------|-----------------|
| `addition` | El test más simple posible: una aserción de igualdad | `@Test`, `assertEquals` |
| `divideThrowsWhenDivisorIsZero` | Que un caso de error *también* es un caso de prueba | `assertThrows` |
| `addSeveralPairs` | Un mismo test corrido con varios juegos de datos | `@ParameterizedTest`, `@CsvSource` |
| (todos) | Estado fresco antes de cada test | `@BeforeEach` |

### Los cuatro conceptos, para explicarlos

**`@Test`** marca un método como caso de prueba. JUnit lo descubre por la anotación, sin que haya que
registrarlo en ningún lado. Es el punto de entrada de todo.

**`assertEquals(esperado, real)`** — el orden importa para el mensaje de error, no para el resultado:
si falla, JUnit reporta *expected: <2> but was: <3>*. Invertir los argumentos da un mensaje al revés
y confunde a quien lee la falla.

**`assertThrows`** invierte la lógica: el test pasa **si** el código lanza la excepción esperada, y
falla si no lanza nada. Devuelve la excepción capturada, lo que permite además verificar el mensaje:

```java
ArithmeticException exception = assertThrows(ArithmeticException.class, () -> calculator.divide(1, 0));
assertEquals("/ by zero", exception.getMessage());
```

**`@BeforeEach`** corre antes de *cada* test. JUnit crea una instancia nueva de la clase de test por
cada método justamente para que los tests no compartan estado: el orden en que corren no debe cambiar
el resultado. Acá `setUp()` reconstruye la `Calculator` cada vez.

**`@ParameterizedTest` + `@CsvSource`** convierten un test en cuatro. Cada fila del CSV es una
ejecución independiente con su propio nombre (`{0} + {1} = {2}` produce "1 + 1 = 2", "2 + 3 = 5", ...).
Si una fila falla, las otras igual se reportan: se ve exactamente *qué* caso se rompió.

---

## Punto 2 — Testing unitario (Softtek)

Fuente: <https://blog.softtek.com/es/testing-unitario>

Archivos en `src/main/java/practica/tdd/ecuacion/` y `src/test/java/practica/tdd/ecuacion/`.

El ejercicio resuelve una **ecuación de primer grado** del tipo `ax + b = c`, despejando `x = (c - b) / a`.
El código está partido en dos clases a propósito:

- **`Parseador`** — trabajo sucio de texto: separa `"2x - 1 = 0"` en `a = 2`, `b = -1`, `c = 0`.
- **`EcuacionPrimerGrado`** — la fórmula. Depende del `Parseador`, y rechaza `a = 0` (no sería de primer grado).

Esa separación es lo que hace posible el punto central del artículo: **mostrar la diferencia entre un
test unitario y uno de integración**. Por eso hay tres archivos de test, no uno.

### Los tres archivos de test

| Archivo | Tipo | Qué prueba | Dependencias reales |
|---------|------|------------|---------------------|
| `ParseadorTest` | Unitario | El parseo, caso por caso (7 tests) | Ninguna: `Parseador` no depende de nada |
| `EcuacionPrimerGradoMockitoTest` | Unitario **aislado** | Solo la fórmula (2 tests) | Ninguna: el `Parseador` está *mockeado* |
| `EcuacionPrimerGradoIntegrationTest` | Integración | Las dos clases juntas (4 tests) | El `Parseador` real |

### El punto que hay que saber explicar: el mock

`EcuacionPrimerGrado` depende de `Parseador`. Si se prueba la fórmula usando el parseador real y el
test falla, **no se sabe cuál de las dos clases está rota**. Mockito resuelve eso reemplazando el
parseador por un doble de prueba programado:

```java
@InjectMocks private EcuacionPrimerGrado ecuacionPrimerGrado;
@Mock private Parseador parseador;

when(parseador.obtenerParte1(ecuacion)).thenReturn(2);
when(parseador.obtenerParte2(ecuacion)).thenReturn(-1);
when(parseador.obtenerParte3(ecuacion)).thenReturn(0);

assertEquals(0.5, ecuacionPrimerGrado.obtenerResultado(ecuacion));
```

Ese test **no parsea nada**. Le dice al doble "cuando te pregunten por la parte 1, devolvé 2" y
verifica una sola cosa: que con `a = 2, b = -1, c = 0` la fórmula dé `0.5`. Si el `Parseador` real se
rompe mañana, este test sigue pasando —y el que falla es `ParseadorTest`, que es precisamente donde
está el bug—. Eso es lo que significa "aislar la unidad".

`@InjectMocks` le pide a Mockito que construya `EcuacionPrimerGrado` inyectándole el mock en el campo
`parseador`. `@ExtendWith(MockitoExtension.class)` es lo que conecta Mockito con el ciclo de vida de JUnit 5.

### Y entonces, ¿para qué el test de integración?

Porque el mock tiene un punto ciego: asume que el `Parseador` devuelve lo que el test dice que
devuelve. `EcuacionPrimerGradoIntegrationTest` corre la cadena completa con el parseador real, y es el
único que probaría que las dos clases **encajan**. Los dos tipos de test son necesarios; ninguno
reemplaza al otro.

## Resumen de tests

| Clase | Tests |
|-------|-------|
| `CalculatorTest` | 3 métodos, 6 ejecuciones (el parametrizado cuenta como 4) |
| `ParseadorTest` | 7 |
| `EcuacionPrimerGradoMockitoTest` | 2 |
| `EcuacionPrimerGradoIntegrationTest` | 4 |

## Extra: `LiveBridge`

`src/test/java/practica/tdd/LiveBridge.java` no es un test: es un puente que la
[guía web](../guia-web) usa para ejecutar **un test puntual** desde el navegador y mostrar su salida
real. Se invoca con la tarea Gradle `live`:

```powershell
.\gradlew.bat live -PliveStep=assert-throws
```

Usa el `Launcher` de la JUnit Platform para correr un único método y emite líneas `::live::{...}` que
la guía interpreta. No afecta a `gradlew test`.
