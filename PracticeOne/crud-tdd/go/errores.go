package catalogo

import "errors"

// En Go los errores son valores, no excepciones. La forma idiomatica de
// distinguir "que tipo de error paso" es declarar errores centinela y
// envolverlos con %w; quien recibe el error los reconoce con errors.Is.
var (
	// ErrDatosInvalidos indica que la pelicula no cumple las reglas de negocio.
	ErrDatosInvalidos = errors.New("datos invalidos")

	// ErrNoEncontrada indica que no existe una pelicula con ese id.
	ErrNoEncontrada = errors.New("pelicula no encontrada")
)
