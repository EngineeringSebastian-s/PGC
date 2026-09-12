# Presentación del punto 3

Una página que explica de qué trata el ejercicio, muestra el código real, el test y la corrida,
para proyectar durante la exposición.

## Cómo usarla

**Modo simple.** Abrí [`index.html`](index.html) en cualquier navegador, con doble clic. Funciona sin
servidor, sin internet y sin ningún SDK instalado: el código y las salidas están embebidos en el archivo.

**Modo con corridas reales.** Para que el botón *Correr esta suite* ejecute los tests de verdad:

```bash
node servidor.mjs
```

Y abrí <http://localhost:43142>. El botón corre la suite del lenguaje que estés mostrando y transmite
la salida línea por línea, en vivo. Se puede elegir entre dos motores:

- **Local** — el comando nativo (`go test`, `cargo test`, `pytest`…). Necesita el SDK instalado.
- **Docker** — `docker compose run --rm <suite>`, en la imagen oficial del lenguaje. No necesita
  ningún SDK, solo Docker. Ver [`../../../DOCKER.md`](../../../DOCKER.md).

Si el servidor no está levantado, la página lo detecta sola, deshabilita el botón y muestra las
salidas capturadas. **Nunca se rompe**: en el peor caso, es la versión estática.

## Qué muestra

1. **De qué trata el ejercicio** — la consigna y las cuatro reglas que comparten las seis implementaciones.
2. **El ciclo RED → GREEN** — dos terminales con corridas reales de `go test`: primero fallando porque
   la validación no existe, después pasando. En el RED se ve que **solo falla la fila `titulo_vacio`**
   de la tabla y las otras cuatro pasan, que es justo lo que aportan los subtests.
3. **Explorador por lenguaje** — seis pestañas; por cada una, el código de dominio, el test y la
   corrida. Con <kbd>←</kbd> <kbd>→</kbd> se cambia de lenguaje y con <kbd>R</kbd> se corre la suite.
4. **Las tres formas de probar un error** — excepciones, `Result` verificado por el compilador, y
   valor de error verificado por convención. Es la conclusión de la práctica.

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
| `plantilla.html` | La fuente: HTML, estilos y lógica. Acá se edita el diseño. |
| `generar.py` | Extrae los fragmentos del código real e inyecta todo en la plantilla. |
| `capturar.ps1` | Corre las suites y guarda la salida real en `salidas/`. |
| `salidas/*.txt` | Las corridas capturadas, versionadas para que el modo offline funcione. |
| `servidor.mjs` | Servidor local para las corridas en vivo. Node sin dependencias. |

`capturar.ps1` también regenera la fase RED: copia el proyecto Go a una carpeta temporal, le saca la
validación del título y corre los tests ahí. **El repositorio no se toca** en ningún momento.

## Detalles

- **Sin dependencias ni CDN.** Estilos, resaltado de sintaxis y lógica están inline. Por eso anda
  desde `file://` y sin internet, que es lo que se necesita en un aula.
- **El servidor no acepta comandos arbitrarios.** `servidor.mjs` tiene una lista blanca de seis
  suites y escucha solo en `127.0.0.1`. Lo que llega del navegador es un id de esa lista, nunca un comando.
- **Tema claro y oscuro**, según el sistema. Para proyectar suele convenir el claro; las terminales
  quedan oscuras en ambos.
