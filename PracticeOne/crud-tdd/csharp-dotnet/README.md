# Playlist Manager — C# / .NET + xUnit

CRUD en memoria para gestionar canciones de una playlist (título, artista, duración, género), desarrollado con TDD.

## Qué incluye

- `src/PlaylistManager/Cancion.cs`: entidad `Cancion`.
- `src/PlaylistManager/CancionRepository.cs`: CRUD en memoria (crear, obtener por id, listar, actualizar, eliminar).
- `src/PlaylistManager.Cli/`: consola interactiva para probar el CRUD a mano.
- `tests/PlaylistManager.Tests/`: 17 tests con xUnit.

## Requisitos

- .NET SDK 10.0 (probado con 10.0.300)

## Cómo ejecutar

```powershell
dotnet restore
```

## Cómo probar

Automatizado (17 tests):

```powershell
dotnet test
```

con detalle:

```powershell
dotnet test --logger "console;verbosity=detailed"
```

Manual, con menú interactivo por consola (crear, listar, obtener, actualizar, eliminar):

```powershell
dotnet run --project src/PlaylistManager.Cli
```

## Proceso TDD

Casos implementados en este orden (RED → GREEN → REFACTOR por cada uno):

1. `Deberia_CrearCancion_CuandoDatosSonValidos`
2. `Deberia_AsignarIdAutogenerado_AlCrearCancion`
3. `Deberia_IncrementarId_AlCrearVariasCanciones`
4. `Deberia_LanzarArgumentException_SiTituloEsVacio`
5. `Deberia_LanzarArgumentException_SiTituloEsNulo`
6. `Deberia_LanzarArgumentException_SiArtistaEsVacioONulo`
7. `Deberia_LanzarArgumentException_SiDuracionSegundosEsCeroOMenor`
8. `Deberia_ObtenerCancionPorId_CuandoExiste`
9. `Deberia_LanzarCancionNoEncontradaException_AlObtenerPorId_SiNoExiste`
10. `Deberia_RetornarListaVacia_SiNoHayCancionesRegistradas`
11. `Deberia_RetornarTodasLasCanciones_CuandoHayVariasRegistradas`
12. `Deberia_ActualizarCancion_CuandoExiste_YRetornarLaCancionActualizada`
13. `Deberia_LanzarCancionNoEncontradaException_AlActualizar_SiNoExiste`
14. `Deberia_LanzarArgumentException_AlActualizar_SiTituloNuevoEsVacio`
15. `Deberia_EliminarCancion_CuandoExiste`
16. `Deberia_LanzarCancionNoEncontradaException_AlEliminar_SiNoExiste`
17. `Deberia_NoAfectarOtrasCanciones_AlEliminarUna`


