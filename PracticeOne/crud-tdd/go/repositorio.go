package catalogo

import "fmt"

// Cambios describe una actualizacion parcial. Go no tiene parametros
// opcionales ni argumentos con nombre, asi que la forma de expresar "este
// campo no se toca" es un puntero nil.
type Cambios struct {
	Titulo   *string
	Director *string
	Anio     *int
	Minutos  *int
}

// Texto y Numero son ayudantes para armar Cambios en una sola linea:
// no se puede tomar la direccion de un literal (&"Solaris" no compila).
func Texto(valor string) *string { return &valor }

// Numero devuelve un puntero al entero recibido.
func Numero(valor int) *int { return &valor }

// RepositorioPeliculas es un repositorio en memoria: guarda las peliculas en
// un slice y lleva el contador de ids autoincrementales.
type RepositorioPeliculas struct {
	peliculas   []Pelicula
	siguienteID int
}

// NuevoRepositorio devuelve un repositorio vacio con los ids arrancando en 1.
func NuevoRepositorio() *RepositorioPeliculas {
	return &RepositorioPeliculas{siguienteID: 1}
}

// Crear valida los datos, asigna el id y guarda la pelicula.
func (r *RepositorioPeliculas) Crear(titulo, director string, anio, minutos int) (Pelicula, error) {
	pelicula, err := NuevaPelicula(r.siguienteID, titulo, director, anio, minutos)
	if err != nil {
		return Pelicula{}, err
	}

	r.siguienteID++
	r.peliculas = append(r.peliculas, pelicula)

	return pelicula, nil
}

// ObtenerPorID devuelve la pelicula con ese id, o un error que envuelve a
// ErrNoEncontrada.
func (r *RepositorioPeliculas) ObtenerPorID(id int) (Pelicula, error) {
	posicion, err := r.posicionDe(id)
	if err != nil {
		return Pelicula{}, err
	}

	return r.peliculas[posicion], nil
}

// ObtenerTodas devuelve una copia del catalogo, para que quien la reciba no
// pueda modificar el estado interno del repositorio.
func (r *RepositorioPeliculas) ObtenerTodas() []Pelicula {
	copia := make([]Pelicula, len(r.peliculas))
	copy(copia, r.peliculas)

	return copia
}

// Actualizar aplica solo los campos no nil de cambios y revalida el resultado.
func (r *RepositorioPeliculas) Actualizar(id int, cambios Cambios) (Pelicula, error) {
	posicion, err := r.posicionDe(id)
	if err != nil {
		return Pelicula{}, err
	}

	actual := r.peliculas[posicion]

	titulo := actual.Titulo
	if cambios.Titulo != nil {
		titulo = *cambios.Titulo
	}

	director := actual.Director
	if cambios.Director != nil {
		director = *cambios.Director
	}

	anio := actual.Anio
	if cambios.Anio != nil {
		anio = *cambios.Anio
	}

	minutos := actual.Minutos
	if cambios.Minutos != nil {
		minutos = *cambios.Minutos
	}

	// Si la validacion falla, se devuelve el error sin haber tocado el slice:
	// la pelicula original queda intacta.
	actualizada, err := NuevaPelicula(actual.ID, titulo, director, anio, minutos)
	if err != nil {
		return Pelicula{}, err
	}

	r.peliculas[posicion] = actualizada

	return actualizada, nil
}

// Eliminar saca la pelicula del catalogo.
func (r *RepositorioPeliculas) Eliminar(id int) error {
	posicion, err := r.posicionDe(id)
	if err != nil {
		return err
	}

	r.peliculas = append(r.peliculas[:posicion], r.peliculas[posicion+1:]...)

	return nil
}

func (r *RepositorioPeliculas) posicionDe(id int) (int, error) {
	for i, pelicula := range r.peliculas {
		if pelicula.ID == id {
			return i, nil
		}
	}

	return 0, fmt.Errorf("%w: id %d", ErrNoEncontrada, id)
}
