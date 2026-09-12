# Correr todo con Docker

El repo toca ocho stacks distintos: .NET, Python, Node, PHP + Composer, Rust, Go, y Gradle + JDK
para Java y Kotlin. Instalar todo eso en cada máquina es frágil y lento. Con Docker, **el único
requisito es Docker**: cada suite corre en la imagen oficial de su lenguaje.

## Requisitos

- Docker Desktop (probado con 28.5.1) con contenedores **Linux**
- En Windows, Docker Desktop necesita WSL 2

```powershell
winget install Docker.DockerDesktop
```

## Arranque rápido

```powershell
.\scripts\docker-correr-todo.ps1
```

Corre las ocho suítes y cierra con:

```
  Todo verde: 8 suítes, 137 tests. Sin un solo SDK instalado.
```

> **La primera vez baja ~5 GB de imágenes y tarda varios minutos.** Hacelo **antes** de la
> exposición, no durante. Después de la primera corrida las imágenes quedan en caché y arranca en
> segundos.

Para correr solo los seis CRUD del punto 3, sin Java ni Kotlin:

```powershell
.\scripts\docker-correr-todo.ps1 -SoloCrud
```

## Correr un proyecto suelto

| Proyecto | Comando |
|----------|---------|
| CRUD C# | `docker compose run --rm csharp` |
| CRUD Python | `docker compose run --rm python` |
| CRUD React | `docker compose run --rm react` |
| CRUD PHP | `docker compose run --rm php` |
| CRUD Rust | `docker compose run --rm rust` |
| CRUD Go | `docker compose run --rm go` |
| JUnit Java | `docker compose run --rm java` |
| JUnit Kotlin | `docker compose run --rm kotlin` |

Para entrar a un contenedor y trastear a mano (por ejemplo, correr la CLI interactiva de un CRUD):

```powershell
docker compose run --rm go sh
# adentro:  go run ./cmd/cli
```

## Las demos con interfaz

Son servicios de larga duración, así que se levantan con `up` en vez de `run`:

```powershell
docker compose up guia-web     # guía de los puntos 1 y 2 -> http://localhost:43141
docker compose up react-ui     # CRUD de plantas          -> http://localhost:5173
```

`Ctrl+C` para frenarlos, y `docker compose down` para limpiar.

## El beneficio inesperado: Gradle vuelve a funcionar

En esta máquina, `gradlew test` falla con `Unable to establish loopback connection` — un problema del
stack de red de Windows que afecta a cualquier app Java que use NIO
(ver [la guía de exposición](PracticeOne/GUIDE.md#problema-conocido-gradle-no-arranca-en-esta-máquina)).

Adentro de un contenedor Linux ese problema **no existe**. O sea que Docker no es solo comodidad:
es hoy la forma de correr los puntos 1 y 2 en esta máquina sin tocar la configuración de red de Windows.

```powershell
docker compose run --rm java
docker compose run --rm kotlin
```

## Qué resuelve y qué no

**Resuelve:**

- Cero SDKs instalados. Se clona el repo, se corre un script y anda.
- Versiones fijas: `.NET 10`, `Python 3.12`, `Node 22`, `PHP 8.4`, `Rust 1.x`, `Go 1.27`,
  `Gradle 8.14.3 + JDK 21`. No importa qué tenga instalado la máquina de al lado.
- El `php.ini` con `mbstring`/`openssl`/`zip`, que en Windows hay que crear a mano, ya viene en la imagen.
- Gradle, como se explicó arriba.

**No resuelve:**

- Docker pasa a ser la dependencia única, pero sigue siendo una dependencia: si la máquina de la
  exposición no tiene Docker Desktop (o no tiene WSL 2 habilitado), esto no arranca.
- La primera corrida necesita internet y ~5 GB de descarga. Sin eso hecho de antemano, es peor que la
  instalación local.
- Es más lento que correr nativo, sobre todo en Windows: el acceso a archivos montados desde el host
  tiene overhead.

Por eso **conviven los dos caminos** y ninguno reemplaza al otro:

| | Local (`scripts\correr-todos-los-tests.ps1`) | Docker (`scripts\docker-correr-todo.ps1`) |
|---|---|---|
| Requisitos | 7 toolchains | Solo Docker |
| Primera corrida | Instalar cada SDK | Bajar ~5 GB |
| Corridas siguientes | Instantáneo | Rápido, con algo de overhead |
| Java / Kotlin | ✗ bloqueado en esta máquina | ✓ funciona |
| Portabilidad | Depende de la máquina | Igual en cualquier lado |

## Detalles de implementación

**Volúmenes anónimos para las carpetas de build.** En el `docker-compose.yml` hay entradas como
`- /app/node_modules`, `- /app/target` o `- /app/src/PlaylistManager/obj` sin lado izquierdo. Eso crea
un volumen anónimo que **enmascara** esa carpeta del host: sin eso, el contenedor Linux levantaría
los `node_modules` con binarios nativos compilados para Windows —o el `target/` de Rust, o el `obj/`
de .NET— y fallaría al arrancar. Es el detalle que más suele romper este tipo de setup.

**Volúmenes nombrados para las cachés.** `go-modules`, `rust-registry`, `csharp-nuget`,
`php-composer`, `gradle-cache` y los `node_modules` persisten entre corridas. Por eso la primera vez
tarda y las siguientes no. Para empezar de cero:

```powershell
docker compose down --volumes
```

**Una sola imagen propia.** Siete de los ocho servicios usan imágenes oficiales sin modificar. El
único `Dockerfile` es [`docker/php.Dockerfile`](docker/php.Dockerfile), porque la imagen oficial de
PHP no trae Composer. Se copia desde la imagen oficial `composer:2` en lugar de bajarlo con un
script de instalación: queda fijado por la imagen y no depende de que `getcomposer.org` responda.

**Gradle de la imagen, no el wrapper.** Los servicios `java` y `kotlin` corren `gradle test` en vez
de `./gradlew test`. La imagen `gradle:8.14.3-jdk21` ya trae exactamente la versión que declara el
wrapper, así que usarla evita re-descargar 130 MB de distribución en cada máquina. Si preferís usar
el wrapper, el comando adentro del contenedor es el mismo de siempre.
