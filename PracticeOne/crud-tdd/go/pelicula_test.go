package catalogo_test

import (
	"errors"
	"testing"

	catalogo "pgc/crud-peliculas"
)

func TestDeberiaCrearPeliculaConDatosValidos(t *testing.T) {
	pelicula, err := catalogo.NuevaPelicula(1, "Solaris", "Andrei Tarkovski", 1972, 167)

	if err != nil {
		t.Fatalf("no se esperaba un error, se obtuvo: %v", err)
	}

	if pelicula.Titulo != "Solaris" {
		t.Errorf("Titulo = %q, se esperaba %q", pelicula.Titulo, "Solaris")
	}
	if pelicula.Director != "Andrei Tarkovski" {
		t.Errorf("Director = %q, se esperaba %q", pelicula.Director, "Andrei Tarkovski")
	}
	if pelicula.Anio != 1972 {
		t.Errorf("Anio = %d, se esperaba %d", pelicula.Anio, 1972)
	}
	if pelicula.Minutos != 167 {
		t.Errorf("Minutos = %d, se esperaba %d", pelicula.Minutos, 167)
	}
}

// Un unico test para las cinco reglas de validacion. Es el idioma canonico de
// Go: una tabla de casos y un t.Run por cada fila, de modo que cada caso se
// reporta con su propio nombre y una falla no tapa a las demas.
func TestDeberiaRechazarDatosInvalidos(t *testing.T) {
	casos := []struct {
		nombre   string
		titulo   string
		director string
		anio     int
		minutos  int
	}{
		{"titulo vacio", "   ", "Andrei Tarkovski", 1972, 167},
		{"director vacio", "Solaris", "", 1972, 167},
		{"anio anterior a 1888", "Solaris", "Andrei Tarkovski", 1887, 167},
		{"anio posterior a 2100", "Solaris", "Andrei Tarkovski", 2101, 167},
		{"duracion cero o negativa", "Solaris", "Andrei Tarkovski", 1972, 0},
	}

	for _, caso := range casos {
		t.Run(caso.nombre, func(t *testing.T) {
			_, err := catalogo.NuevaPelicula(1, caso.titulo, caso.director, caso.anio, caso.minutos)

			if !errors.Is(err, catalogo.ErrDatosInvalidos) {
				t.Errorf("se esperaba ErrDatosInvalidos, se obtuvo: %v", err)
			}
		})
	}
}

func TestDeberiaRecortarEspaciosEnTituloYDirector(t *testing.T) {
	pelicula, err := catalogo.NuevaPelicula(1, "  Solaris  ", "  Andrei Tarkovski  ", 1972, 167)

	if err != nil {
		t.Fatalf("no se esperaba un error, se obtuvo: %v", err)
	}

	if pelicula.Titulo != "Solaris" {
		t.Errorf("Titulo = %q, se esperaba %q", pelicula.Titulo, "Solaris")
	}
	if pelicula.Director != "Andrei Tarkovski" {
		t.Errorf("Director = %q, se esperaba %q", pelicula.Director, "Andrei Tarkovski")
	}
}
