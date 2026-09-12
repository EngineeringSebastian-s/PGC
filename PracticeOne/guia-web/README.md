# Guía web — recurso para exponer los puntos 1 y 2

Aplicación Next.js que recorre, paso a paso y con visualizaciones, los tests de
[`p1-java`](../p1-java) y [`p1-kotlin`](../p1-kotlin). Está pensada para **proyectar durante la
exposición**: cada paso muestra el código del test, la salida que produce y un gráfico de lo que
está pasando por dentro.

## Requisitos

- Node.js 18 o superior (probado con 22.18.0)

## Cómo ejecutar

```bash
npm install
npm run dev
```

Abre en <http://localhost:43141>.

> **Nota (Windows/PowerShell):** si `npm` falla con `no está firmado digitalmente` /
> `UnauthorizedAccess`, es la política de ejecución de scripts bloqueando `npm.ps1`. Usá
> `npm.cmd <comando>`, o corré una vez `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.

> **`npm run build` falla hoy**, y no hace falta para exponer. Next.js rechaza el análisis estático de
> `src/app/api/pc-run/route.ts`, que arma rutas al proyecto Gradle en tiempo de ejecución. La guía se
> usa con `npm run dev`, donde funciona sin problema.

## Cómo está organizada

Tres grupos de pasos, definidos en `src/lib/`:

| Grupo             | Archivo            | Pasos                                                                                                 | Cubre                                      |
|-------------------|--------------------|-------------------------------------------------------------------------------------------------------|--------------------------------------------|
| **Writing Tests** | `steps-junit.ts`   | `at-test`, `assert-equals`, `before-each`, `parameterized`, `assert-throws`                           | Punto 1 (JUnit 5 User Guide) en Java       |
| **Kotlin**        | `steps-kotlin.ts`  | `kotlin-backticks`, `kotlin-per-class`, `kotlin-before-each`, `kotlin-throws`, `kotlin-parameterized` | Punto 1 en Kotlin                          |
| **Softtek**       | `steps-softtek.ts` | `parse-parte1` … `parse-invalida`, `eq-menos` … `eq-cero`, `mock-formula`, `first-softtek`            | Punto 2 (ecuación de primer grado y mocks) |

Cada paso (`Step` en `src/lib/walkthrough-types.ts`) declara:

- `code` — el fragmento de test que se muestra;
- `say` / `why` — qué decir y por qué importa (útil como machete al exponer);
- `run()` — la salida **simulada** y el `Visual` que acompaña (suma, aserción, excepción, tabla,
  parseo de la ecuación, fórmula, mock…);
- `captions` — los tres carteles que acompañan la animación.

## Los dos motores: "JVM" y "respaldo"

Al darle play a un paso, la guía **intenta correr el test de verdad** en la máquina: llama a
`/api/pc-run`, que lanza `gradlew live -PliveStep=<id>` sobre `p1-java` o `p1-kotlin` y transmite la
salida por SSE. El `LiveBridge` de cada proyecto usa el `Launcher` de la JUnit Platform para ejecutar
ese único método de test y emitir eventos `::live::{...}`.

Si Gradle no arranca —o no está el JDK, o falla la conexión— la guía **cae sola en la réplica
simulada** del navegador. Se nota en la insignia del panel de terminal:

- **`JVM`** → los números que ves salieron de correr el test de verdad.
- **`respaldo`** → los números son la réplica local; la guía sigue funcionando igual.

Para la exposición eso significa que **la guía no depende de que Gradle funcione**: en el peor caso
muestra "respaldo" y el recorrido sigue completo.

## Estructura

```
src/
  app/
    page.tsx              -> renderiza <Guide/>
    api/pc-run/route.ts   -> lanza gradlew y transmite la salida por SSE
  components/
    guide.tsx             -> armado general
    walkthrough/          -> escenario, panel de código, terminal, navegación, visuales
  lib/
    steps-junit.ts        -> pasos del punto 1 (Java)
    steps-kotlin.ts       -> pasos del punto 1 (Kotlin)
    steps-softtek.ts      -> pasos del punto 2
    walkthrough-types.ts  -> tipos Step / Visual / OutputLine
    pc-run.ts             -> cliente SSE de /api/pc-run
```
