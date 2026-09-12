// Package catalogo implementa un CRUD en memoria de un catalogo de peliculas.
//
// El dominio esta en tres archivos para que cada test apunte a una sola
// responsabilidad: la entidad valida sus datos (pelicula.go), los errores
// describen el fallo (errores.go) y el repositorio resuelve el almacenamiento
// (repositorio.go).
package catalogo

import (
	"fmt"
	"strings"
)

const (
	// AnioMinimo es 1888, el ano de Roundhay Garden Scene, la pelicula mas
	// antigua que se conserva.
	AnioMinimo = 1888

	// AnioMaximo es una cota superior razonable para un catalogo domestico.
	AnioMaximo = 2100
)

// Pelicula es la entidad del catalogo.
type Pelicula struct {
	ID       int
	Titulo   string
	Director string
	Anio     int
	Minutos  int
}

// NuevaPelicula construye una Pelicula validada. Es el unico constructor:
// todas las reglas de negocio viven aca.
func NuevaPelicula(id int, titulo, director string, anio, minutos int) (Pelicula, error) {
	titulo = strings.TrimSpace(titulo)
	director = strings.TrimSpace(director)

	if titulo == "" {
		return Pelicula{}, fmt.Errorf("%w: el titulo no puede ser vacio", ErrDatosInvalidos)
	}

	if director == "" {
		return Pelicula{}, fmt.Errorf("%w: el director no puede ser vacio", ErrDatosInvalidos)
	}

	if anio < AnioMinimo || anio > AnioMaximo {
		return Pelicula{}, fmt.Errorf(
			"%w: el anio debe estar entre %d y %d", ErrDatosInvalidos, AnioMinimo, AnioMaximo)
	}

	if minutos <= 0 {
		return Pelicula{}, fmt.Errorf("%w: la duracion debe ser mayor a cero", ErrDatosInvalidos)
	}

	return Pelicula{
		ID:       id,
		Titulo:   titulo,
		Director: director,
		Anio:     anio,
		Minutos:  minutos,
	}, nil
}

// String hace que una Pelicula se imprima siempre igual, en la CLI y en los
// mensajes de fallo de los tests.
func (p Pelicula) String() string {
	return fmt.Sprintf("[%d] %s - %s (%d) [%d min]", p.ID, p.Titulo, p.Director, p.Anio, p.Minutos)
}
