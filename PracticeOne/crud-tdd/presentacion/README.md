# Presentación de la práctica

Una página que recorre la Práctica 1 punto por punto —qué pedía la consigna, qué es TDD, qué se hizo
en cada punto y qué resultado dio—, con el código real, los tests y sus corridas. Pensada para
proyectar durante la exposición.

## Cómo usarla

**Modo simple.** Abrí [`index.html`](index.html) en cualquier navegador, con doble clic. Funciona sin
servidor, sin internet y sin ningún SDK instalado: el código y las salidas están embebidos en el archivo.

**Modo con ejecución en vivo.** Para que el botón *Correr esta suite* ejecute los tests de verdad:

```bash
node servidor.mjs
```

Y abrí <http://localhost:43142>. El botón corre la suite del lenguaje que estés mostrando y transmite
la salida línea por línea. Se puede elegir entre dos motores:

- **Local** — el comando nativo (`go test`, `cargo test`, `pytest`…). Necesita el SDK instalado.
- **Docker** — `docker compose run --rm <suite>`, en la imagen oficial del lenguaje. No necesita
  ningún SDK, solo Docker. Ver [`../../../DOCKER.md`](../../../DOCKER.md).

Si el servidor no está levantado, la página lo detecta sola, deshabilita el botón y muestra las
corridas registradas. **Nunca queda vacía**: en el peor caso, es la versión estática.

## Qué contiene

| Sección | Contenido |
|---------|-----------|
| **La consigna** | Los tres puntos del enunciado y dónde se resolvió cada uno. |
| **Qué es TDD** | El ciclo RED → GREEN → REFACTOR, y el ciclo aplicado con dos corridas reales de `go test`: el test fallando porque falta la validación, y pasando después de agregarla. |
| **Punto 1** | Los ejercicios de JUnit 5: qué resuelve cada API, el código de los tests en Java y en Kotlin, las tres diferencias entre ambos, y las dos corridas. |
| **Punto 2** | La ecuación de primer grado: por qué está partida en dos clases, los tres archivos de test, el test con mock frente al de integración, y la comparación entre ambos tipos. |
| **Punto 3** | El modelo funcional común y, por cada uno de los seis lenguajes, una ficha con qué gestiona el CRUD, la entidad y sus campos, las reglas de validación, las operaciones y los errores del dominio; más el código, el test y la corrida. Cierra con las tres formas de probar un error. |
| **Resultados** | Los 137 casos de prueba, por proyecto. |
| **Conclusiones** | Las tres conclusiones de la práctica. |

En el punto 3, <kbd>←</kbd> <kbd>→</kbd> cambian de lenguaje y <kbd>R</kbd> corre la suite.

## Cómo se mantiene

El archivo `index.html` es **generado**, no se edita a mano. El código que muestra se extrae de los
archivos fuente de verdad, así que la presentación no puede quedar desincronizada del repo.

```powershell
.\capturar.ps1      # corre las suites y guarda su salida en salidas/
python generar.py   # arma index.html con el código real + esas salidas
```

| Archivo | Qué es |
|---------|--------|
| `index.html` | **El entregable.** Generado; autocontenido. |
| `plantilla.html` | La fuente: HTML, estilos y lógica. Acá se edita el diseño y los textos. |
| `generar.py` | Extrae los fragmentos del código real, arma los datos e inyecta todo en la plantilla. |
| `capturar.ps1` | Corre las suites y guarda la salida real en `salidas/`. |
| `salidas/*.txt` | Las corridas registradas, versionadas para que el modo sin servidor funcione. |
| `servidor.mjs` | Servidor local para la ejecución en vivo. Node sin dependencias. |

Un par de detalles del pipeline:

- **La fase RED se reconstruye sola.** `capturar.ps1` copia el proyecto Go a una carpeta temporal, le
  quita la validación del título y corre los tests ahí. El repositorio no se toca en ningún momento.
- **Java y Kotlin se capturan desde Docker**, porque en Windows Gradle no arranca por el problema de
  loopback de la JVM. Ver [`../../GUIDE.md`](../../GUIDE.md).
- **Si un fragmento no se encuentra**, `generar.py` falla en vez de emitir una página con código viejo.

## Detalles de implementación

- **Sin dependencias ni CDN.** Estilos, resaltado de sintaxis y lógica están inline. Por eso anda
  desde `file://` y sin internet, que es lo que se necesita en un aula.
- **El servidor no acepta comandos arbitrarios.** `servidor.mjs` tiene una lista blanca de seis
  suites y escucha solo en `127.0.0.1`. Lo que llega del navegador es un id de esa lista, nunca un comando.
- **Tema claro y oscuro**, según el sistema. Para proyectar suele convenir el claro; las terminales
  quedan oscuras en ambos.
