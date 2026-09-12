# Catálogo de Videojuegos — Rust + cargo test

CRUD en memoria para gestionar un catálogo de videojuegos (título, estudio, año, horas jugadas),
desarrollado con TDD.

## Qué incluye

- `src/videojuego.rs`: entidad `Videojuego` con las validaciones en el constructor
  (título y estudio no vacíos, año entre 1958 y 2100).
- `src/error.rs`: enum `ErrorCatalogo` con los dos modos de falla del dominio.
- `src/repositorio.rs`: CRUD en memoria (crear, obtener por id, listar, actualizar, eliminar).
- `src/main.rs`: CLI interactiva para probar el CRUD a mano.
- `tests/`: 18 tests de integración con el runner que trae `cargo`.

## Requisitos

- Rust estable 1.75 o superior (probado con 1.98.1)

Se instala en Windows con:

```bash
winget install Rustlang.Rustup
```

> **Sin dependencias externas.** El `Cargo.toml` no tiene ni una sola dependencia: el runner de tests
> viene incluido en `cargo`. Es el único de los cinco proyectos que corre sin bajar nada de internet
> más allá del propio toolchain.

## Cómo ejecutar

No hace falta paso de instalación. Compilar:

```bash
cargo build
```

## Cómo probar

Automatizado (18 tests):

```bash
cargo test
```

Manual, con menú interactivo por consola (crear, listar, obtener, actualizar, eliminar):

```bash
cargo run
```

Salida esperada de la suite:

```
     Running tests\repositorio_videojuegos.rs
running 13 tests
...
test result: ok. 13 passed; 0 failed; 0 ignored

     Running tests\videojuego.rs
running 5 tests
...
test result: ok. 5 passed; 0 failed; 0 ignored
```

## Proceso TDD

Casos implementados en este orden (RED → GREEN → REFACTOR por cada uno):

1. `deberia_crear_videojuego_con_datos_validos`
2. `deberia_retornar_error_si_titulo_es_vacio`
3. `deberia_retornar_error_si_estudio_es_vacio`
4. `deberia_retornar_error_si_anio_es_menor_a_1958`
5. `deberia_retornar_error_si_anio_es_mayor_a_2100`
6. `deberia_crear_videojuego_y_asignarle_id_autoincremental`
7. `deberia_incrementar_id_al_crear_varios_videojuegos`
8. `deberia_retornar_error_al_crear_videojuego_con_titulo_vacio`
9. `deberia_obtener_videojuego_por_id_existente`
10. `deberia_retornar_error_al_buscar_id_inexistente`
11. `deberia_retornar_lista_vacia_si_no_hay_videojuegos`
12. `deberia_retornar_todos_los_videojuegos_registrados`
13. `deberia_actualizar_videojuego_existente_con_datos_parciales`
14. `deberia_retornar_error_al_actualizar_id_inexistente`
15. `deberia_retornar_error_al_actualizar_con_titulo_vacio`
16. `deberia_eliminar_videojuego_existente`
17. `deberia_retornar_error_al_eliminar_id_inexistente`
18. `deberia_no_afectar_otros_videojuegos_al_eliminar_uno`

## Detalle técnico

**Rust no tiene excepciones, y eso cambia cómo se escribe el test.** En los otros cuatro proyectos el
caso de error se prueba con `expectException` / `assertThrows` / `pytest.raises`: hay un mecanismo
aparte del valor de retorno. Acá el error *es* el valor de retorno, dentro de un `Result<T, E>`:

```rust
let resultado = repositorio.obtener_por_id(999);
assert_eq!(resultado, Err(ErrorCatalogo::VideojuegoNoEncontrado(999)));
```

El test compara valores con `assert_eq!`, igual que el caso feliz. Además, el compilador obliga a que
quien llama haga algo con el `Result`: no se puede ignorar un error "sin querer".

**El error es un enum, no un string.** `ErrorCatalogo` tiene dos variantes, `DatosInvalidos` y
`VideojuegoNoEncontrado`. Los tests pueden afirmar *cuál* variante esperan con `matches!` sin depender
del texto del mensaje, que es exactamente lo que se busca: un test que no se rompa porque alguien
corrigió una tilde en el mensaje de error.

**`tests/` en vez de `#[cfg(test)] mod tests`.** Rust permite tests unitarios adentro del mismo archivo,
con acceso a lo privado. Acá se eligió la carpeta `tests/`, que compila cada archivo como un crate
aparte y solo ve la **API pública**. Es la decisión correcta para TDD de un repositorio: obliga a que
el diseño se pruebe desde afuera, como lo usaría un consumidor real.

**`Default` implementado a mano.** `#[derive(Default)]` habría inicializado `siguiente_id` en 0, así que
un repositorio creado con `default()` daría ids desde 0 y uno creado con `nuevo()` desde 1: dos
comportamientos distintos para la misma estructura, y un test que pasa o falla según cuál constructor
se usó. Por eso `Default` delega en `nuevo()`.
