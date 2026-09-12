# Catálogo de Películas — Go + `go test`

CRUD en memoria para gestionar un catálogo de películas (título, director, año, duración),
desarrollado con TDD.

## Qué incluye

- `pelicula.go`: entidad `Pelicula` y su único constructor `NuevaPelicula`, donde viven las
  validaciones (título y director no vacíos, año entre 1888 y 2100, duración mayor a cero).
- `errores.go`: los dos errores centinela del dominio, `ErrDatosInvalidos` y `ErrNoEncontrada`.
- `repositorio.go`: CRUD en memoria (crear, obtener por id, listar, actualizar, eliminar).
- `cmd/cli/main.go`: CLI interactiva para probar el CRUD a mano.
- `*_test.go`: 21 casos de prueba (16 funciones de test + 5 subtests de la tabla) con el
  paquete `testing` de la biblioteca estándar.

## Requisitos

- Go 1.22 o superior

Se instala en Windows con:

```bash
winget install GoLang.Go
```

> **Sin dependencias externas.** El `go.mod` no declara ni una sola dependencia: el framework de
> testing viene en la biblioteca estándar. Junto con Rust, es de los dos proyectos que corren sin
> bajar nada más allá del propio toolchain.

## Cómo ejecutar

No hace falta paso de instalación. Compilar:

```bash
go build ./...
```

## Cómo probar

Automatizado (21 casos):

```bash
go test ./...
```

Con el detalle de cada caso, incluidos los subtests de la tabla:

```bash
go test -v ./...
```

Manual, con menú interactivo por consola (crear, listar, obtener, actualizar, eliminar):

```bash
go run ./cmd/cli
```

Cobertura (opcional, no necesita instalar nada):

```bash
go test -cover ./...
```

Da **95,9 %** sobre el paquete de dominio.

Salida esperada de la suite:

```
ok      pgc/crud-peliculas          0.235s
?       pgc/crud-peliculas/cmd/cli  [no test files]
```

## Proceso TDD

Casos implementados en este orden (RED → GREEN → REFACTOR por cada uno):

1. `TestDeberiaCrearPeliculaConDatosValidos`
2. `TestDeberiaRechazarDatosInvalidos/titulo_vacio`
3. `TestDeberiaRechazarDatosInvalidos/director_vacio`
4. `TestDeberiaRechazarDatosInvalidos/anio_anterior_a_1888`
5. `TestDeberiaRechazarDatosInvalidos/anio_posterior_a_2100`
6. `TestDeberiaRechazarDatosInvalidos/duracion_cero_o_negativa`
7. `TestDeberiaRecortarEspaciosEnTituloYDirector`
8. `TestDeberiaCrearPeliculaYAsignarleIDAutoincremental`
9. `TestDeberiaIncrementarIDAlCrearVariasPeliculas`
10. `TestDeberiaRetornarErrorAlCrearPeliculaConTituloVacio`
11. `TestDeberiaObtenerPeliculaPorIDExistente`
12. `TestDeberiaRetornarErrorAlBuscarIDInexistente`
13. `TestDeberiaRetornarListaVaciaSiNoHayPeliculas`
14. `TestDeberiaRetornarTodasLasPeliculasRegistradas`
15. `TestDeberiaActualizarPeliculaExistenteConDatosParciales`
16. `TestDeberiaRetornarErrorAlActualizarIDInexistente`
17. `TestDeberiaRetornarErrorAlActualizarConTituloVacio`
18. `TestDeberiaEliminarPeliculaExistente`
19. `TestDeberiaRetornarErrorAlEliminarIDInexistente`
20. `TestDeberiaNoAfectarOtrasPeliculasAlEliminarUna`
21. `TestObtenerTodasNoDeberiaExponerElEstadoInterno`

## Detalle técnico

**Table-driven tests: el idioma canónico de Go.** Las cinco reglas de validación no se escriben como
cinco funciones de test, sino como una tabla de casos recorrida con `t.Run`:

```go
casos := []struct {
    nombre   string
    titulo   string
    director string
    anio     int
    minutos  int
}{
    {"titulo vacio", "   ", "Andrei Tarkovski", 1972, 167},
    {"anio anterior a 1888", "Solaris", "Andrei Tarkovski", 1887, 167},
    // ...
}

for _, caso := range casos {
    t.Run(caso.nombre, func(t *testing.T) { ... })
}
```

Cada fila corre como un subtest independiente, con su propio nombre en el reporte
(`TestDeberiaRechazarDatosInvalidos/anio_anterior_a_1888`) y su propio resultado: si una falla, las
otras igual se reportan. Es el equivalente de `@ParameterizedTest` en JUnit o de `@pytest.mark.parametrize`,
pero sin ninguna anotación ni magia — es un `for` sobre un slice de structs. Agregar un caso de prueba
es agregar una línea a la tabla.

**Sin `assert`: Go no trae aserciones.** La biblioteca estándar no tiene `assertEquals`. El test
compara con un `if` y reporta con `t.Errorf`:

```go
if pelicula.Anio != 1972 {
    t.Errorf("Anio = %d, se esperaba %d", pelicula.Anio, 1972)
}
```

Es más verboso, y es deliberado: la convención de Go es que el mensaje de falla diga *qué se obtuvo y
qué se esperaba*, porque no hay una librería que lo genere sola. La diferencia entre `t.Errorf` y
`t.Fatalf` importa: `Errorf` marca la falla y **sigue**, así que un test puede reportar varios campos
mal de una sola vez; `Fatalf` corta ahí, y se usa cuando seguir no tendría sentido (por ejemplo, si el
error impidió construir el objeto que los `if` siguientes van a inspeccionar).

**Errores como valores, pero sin red de seguridad del compilador.** Go, igual que Rust, no tiene
excepciones: el error es un valor de retorno. La diferencia está en quién lo obliga a uno a tratarlo.

```go
if !errors.Is(err, catalogo.ErrNoEncontrada) {
    t.Errorf("se esperaba ErrNoEncontrada, se obtuvo: %v", err)
}
```

El repositorio no devuelve el centinela pelado: lo **envuelve** con `%w` para agregar contexto
(`fmt.Errorf("%w: id %d", ErrNoEncontrada, id)`). `errors.Is` recorre esa cadena y encuentra el
centinela debajo. Así el mensaje puede incluir el id sin que el test dependa del texto.

Lo importante para comparar con Rust: en Rust el `Result` **no se puede ignorar sin que el compilador
avise**. En Go, `repositorio.Eliminar(id)` a secas compila perfecto y descarta el error en silencio.
Go pone la disciplina en la convención y el linter (`go vet`, `errcheck`); Rust la pone en el tipo.

**`ObtenerTodas` devuelve una copia.** Un slice en Go comparte el arreglo subyacente: devolver
`r.peliculas` directamente dejaría que quien lo recibe modifique el estado interno del repositorio.
Por eso se copia, y hay un test (`TestObtenerTodasNoDeberiaExponerElEstadoInterno`) que lo verifica
mutando la copia y comprobando que el original quedó intacto. Es un caso de prueba que en los otros
cinco lenguajes no aparece, porque el problema tampoco aparece de la misma forma.

**Actualización parcial con punteros.** Go no tiene parámetros opcionales ni argumentos con nombre.
La forma idiomática de decir "este campo no se toca" es un puntero en `nil`:

```go
repositorio.Actualizar(id, catalogo.Cambios{Minutos: catalogo.Numero(169)})
```

Los ayudantes `Texto` y `Numero` existen porque en Go no se puede tomar la dirección de un literal:
`&"Solaris"` no compila.
