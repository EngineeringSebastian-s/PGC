package catalogo_test

import (
	"errors"
	"testing"

	catalogo "pgc/crud-peliculas"
)

// crearSolaris es un ayudante: deja el repositorio con una pelicula conocida.
// t.Helper() hace que, si falla, el reporte apunte a la linea del test que lo
// llamo y no a la de adentro de esta funcion.
func crearSolaris(t *testing.T, repositorio *catalogo.RepositorioPeliculas) catalogo.Pelicula {
	t.Helper()

	pelicula, err := repositorio.Crear("Solaris", "Andrei Tarkovski", 1972, 167)
	if err != nil {
		t.Fatalf("no se pudo preparar el caso: %v", err)
	}

	return pelicula
}

func TestDeberiaCrearPeliculaYAsignarleIDAutoincremental(t *testing.T) {
	repositorio := catalogo.NuevoRepositorio()

	pelicula := crearSolaris(t, repositorio)

	if pelicula.ID != 1 {
		t.Errorf("ID = %d, se esperaba 1", pelicula.ID)
	}
}

func TestDeberiaIncrementarIDAlCrearVariasPeliculas(t *testing.T) {
	repositorio := catalogo.NuevoRepositorio()

	primera := crearSolaris(t, repositorio)
	segunda, err := repositorio.Crear("Stalker", "Andrei Tarkovski", 1979, 162)
	if err != nil {
		t.Fatalf("no se esperaba un error, se obtuvo: %v", err)
	}

	if segunda.ID <= primera.ID {
		t.Errorf("el segundo id (%d) deberia ser mayor al primero (%d)", segunda.ID, primera.ID)
	}
}

func TestDeberiaRetornarErrorAlCrearPeliculaConTituloVacio(t *testing.T) {
	repositorio := catalogo.NuevoRepositorio()

	_, err := repositorio.Crear("", "Andrei Tarkovski", 1972, 167)

	if !errors.Is(err, catalogo.ErrDatosInvalidos) {
		t.Errorf("se esperaba ErrDatosInvalidos, se obtuvo: %v", err)
	}
	if cantidad := len(repositorio.ObtenerTodas()); cantidad != 0 {
		t.Errorf("el repositorio deberia quedar vacio, tiene %d peliculas", cantidad)
	}
}

func TestDeberiaObtenerPeliculaPorIDExistente(t *testing.T) {
	repositorio := catalogo.NuevoRepositorio()
	creada := crearSolaris(t, repositorio)

	obtenida, err := repositorio.ObtenerPorID(creada.ID)

	if err != nil {
		t.Fatalf("no se esperaba un error, se obtuvo: %v", err)
	}
	if obtenida != creada {
		t.Errorf("se obtuvo %v, se esperaba %v", obtenida, creada)
	}
}

func TestDeberiaRetornarErrorAlBuscarIDInexistente(t *testing.T) {
	repositorio := catalogo.NuevoRepositorio()

	_, err := repositorio.ObtenerPorID(999)

	if !errors.Is(err, catalogo.ErrNoEncontrada) {
		t.Errorf("se esperaba ErrNoEncontrada, se obtuvo: %v", err)
	}
}

func TestDeberiaRetornarListaVaciaSiNoHayPeliculas(t *testing.T) {
	repositorio := catalogo.NuevoRepositorio()

	if cantidad := len(repositorio.ObtenerTodas()); cantidad != 0 {
		t.Errorf("se esperaba una lista vacia, tiene %d peliculas", cantidad)
	}
}

func TestDeberiaRetornarTodasLasPeliculasRegistradas(t *testing.T) {
	repositorio := catalogo.NuevoRepositorio()
	crearSolaris(t, repositorio)
	if _, err := repositorio.Crear("Stalker", "Andrei Tarkovski", 1979, 162); err != nil {
		t.Fatalf("no se pudo preparar el caso: %v", err)
	}

	if cantidad := len(repositorio.ObtenerTodas()); cantidad != 2 {
		t.Errorf("se esperaban 2 peliculas, hay %d", cantidad)
	}
}

func TestDeberiaActualizarPeliculaExistenteConDatosParciales(t *testing.T) {
	repositorio := catalogo.NuevoRepositorio()
	creada := crearSolaris(t, repositorio)

	actualizada, err := repositorio.Actualizar(creada.ID, catalogo.Cambios{
		Minutos: catalogo.Numero(169),
	})

	if err != nil {
		t.Fatalf("no se esperaba un error, se obtuvo: %v", err)
	}
	if actualizada.Minutos != 169 {
		t.Errorf("Minutos = %d, se esperaba 169", actualizada.Minutos)
	}
	if actualizada.Titulo != "Solaris" {
		t.Errorf("Titulo = %q, no deberia haber cambiado", actualizada.Titulo)
	}
	if actualizada.Director != "Andrei Tarkovski" {
		t.Errorf("Director = %q, no deberia haber cambiado", actualizada.Director)
	}
	if actualizada.Anio != 1972 {
		t.Errorf("Anio = %d, no deberia haber cambiado", actualizada.Anio)
	}
}

func TestDeberiaRetornarErrorAlActualizarIDInexistente(t *testing.T) {
	repositorio := catalogo.NuevoRepositorio()

	_, err := repositorio.Actualizar(999, catalogo.Cambios{Titulo: catalogo.Texto("Stalker")})

	if !errors.Is(err, catalogo.ErrNoEncontrada) {
		t.Errorf("se esperaba ErrNoEncontrada, se obtuvo: %v", err)
	}
}

func TestDeberiaRetornarErrorAlActualizarConTituloVacio(t *testing.T) {
	repositorio := catalogo.NuevoRepositorio()
	creada := crearSolaris(t, repositorio)

	_, err := repositorio.Actualizar(creada.ID, catalogo.Cambios{Titulo: catalogo.Texto("")})

	if !errors.Is(err, catalogo.ErrDatosInvalidos) {
		t.Errorf("se esperaba ErrDatosInvalidos, se obtuvo: %v", err)
	}

	intacta, err := repositorio.ObtenerPorID(creada.ID)
	if err != nil {
		t.Fatalf("no se esperaba un error, se obtuvo: %v", err)
	}
	if intacta.Titulo != "Solaris" {
		t.Errorf("Titulo = %q, la pelicula original deberia quedar intacta", intacta.Titulo)
	}
}

func TestDeberiaEliminarPeliculaExistente(t *testing.T) {
	repositorio := catalogo.NuevoRepositorio()
	creada := crearSolaris(t, repositorio)

	if err := repositorio.Eliminar(creada.ID); err != nil {
		t.Fatalf("no se esperaba un error, se obtuvo: %v", err)
	}

	if _, err := repositorio.ObtenerPorID(creada.ID); !errors.Is(err, catalogo.ErrNoEncontrada) {
		t.Errorf("se esperaba ErrNoEncontrada, se obtuvo: %v", err)
	}
}

func TestDeberiaRetornarErrorAlEliminarIDInexistente(t *testing.T) {
	repositorio := catalogo.NuevoRepositorio()

	err := repositorio.Eliminar(999)

	if !errors.Is(err, catalogo.ErrNoEncontrada) {
		t.Errorf("se esperaba ErrNoEncontrada, se obtuvo: %v", err)
	}
}

func TestDeberiaNoAfectarOtrasPeliculasAlEliminarUna(t *testing.T) {
	repositorio := catalogo.NuevoRepositorio()
	primera := crearSolaris(t, repositorio)
	segunda, err := repositorio.Crear("Stalker", "Andrei Tarkovski", 1979, 162)
	if err != nil {
		t.Fatalf("no se pudo preparar el caso: %v", err)
	}

	if err := repositorio.Eliminar(primera.ID); err != nil {
		t.Fatalf("no se esperaba un error, se obtuvo: %v", err)
	}

	restantes := repositorio.ObtenerTodas()
	if len(restantes) != 1 {
		t.Fatalf("se esperaba 1 pelicula restante, hay %d", len(restantes))
	}
	if restantes[0].ID != segunda.ID {
		t.Errorf("quedo la pelicula %d, se esperaba la %d", restantes[0].ID, segunda.ID)
	}
}

func TestObtenerTodasNoDeberiaExponerElEstadoInterno(t *testing.T) {
	repositorio := catalogo.NuevoRepositorio()
	crearSolaris(t, repositorio)

	copia := repositorio.ObtenerTodas()
	copia[0].Titulo = "modificada desde afuera"

	original, err := repositorio.ObtenerPorID(1)
	if err != nil {
		t.Fatalf("no se esperaba un error, se obtuvo: %v", err)
	}
	if original.Titulo != "Solaris" {
		t.Errorf("Titulo = %q, el repositorio no deberia haberse modificado", original.Titulo)
	}
}
