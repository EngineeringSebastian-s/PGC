// Command cli es un menu interactivo para probar manualmente el CRUD de peliculas.
package main

import (
	"bufio"
	"fmt"
	"os"
	"strconv"
	"strings"

	catalogo "pgc/crud-peliculas"
)

const menu = `
--- Catalogo de Peliculas ---
1. Crear pelicula
2. Listar peliculas
3. Obtener pelicula por id
4. Actualizar pelicula
5. Eliminar pelicula
0. Salir
`

var entrada = bufio.NewScanner(os.Stdin)

func main() {
	repositorio := catalogo.NuevoRepositorio()

	for {
		fmt.Print(menu)

		switch leer("Elegi una opcion: ") {
		case "1":
			crear(repositorio)
		case "2":
			listar(repositorio)
		case "3":
			obtener(repositorio)
		case "4":
			actualizar(repositorio)
		case "5":
			eliminar(repositorio)
		case "0":
			fmt.Println("Chau!")
			return
		default:
			fmt.Println("Opcion invalida.")
		}
	}
}

func crear(repositorio *catalogo.RepositorioPeliculas) {
	titulo := leer("Titulo: ")
	director := leer("Director: ")

	anio, ok := leerNumero("Anio: ")
	if !ok {
		return
	}

	minutos, ok := leerNumero("Duracion en minutos: ")
	if !ok {
		return
	}

	pelicula, err := repositorio.Crear(titulo, director, anio, minutos)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	fmt.Println("Pelicula creada:")
	fmt.Println(" ", pelicula)
}

func listar(repositorio *catalogo.RepositorioPeliculas) {
	peliculas := repositorio.ObtenerTodas()
	if len(peliculas) == 0 {
		fmt.Println("No hay peliculas registradas.")
		return
	}

	for _, pelicula := range peliculas {
		fmt.Println(" ", pelicula)
	}
}

func obtener(repositorio *catalogo.RepositorioPeliculas) {
	id, ok := leerNumero("Id: ")
	if !ok {
		return
	}

	pelicula, err := repositorio.ObtenerPorID(id)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	fmt.Println(" ", pelicula)
}

func actualizar(repositorio *catalogo.RepositorioPeliculas) {
	id, ok := leerNumero("Id a actualizar: ")
	if !ok {
		return
	}

	fmt.Println("Dejar vacio para no modificar el campo.")

	var cambios catalogo.Cambios

	if titulo := leer("Nuevo titulo: "); titulo != "" {
		cambios.Titulo = catalogo.Texto(titulo)
	}
	if director := leer("Nuevo director: "); director != "" {
		cambios.Director = catalogo.Texto(director)
	}
	if anio, indicado := leerNumeroOpcional("Nuevo anio: "); indicado {
		cambios.Anio = catalogo.Numero(anio)
	}
	if minutos, indicado := leerNumeroOpcional("Nueva duracion en minutos: "); indicado {
		cambios.Minutos = catalogo.Numero(minutos)
	}

	pelicula, err := repositorio.Actualizar(id, cambios)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	fmt.Println("Pelicula actualizada:")
	fmt.Println(" ", pelicula)
}

func eliminar(repositorio *catalogo.RepositorioPeliculas) {
	id, ok := leerNumero("Id a eliminar: ")
	if !ok {
		return
	}

	if err := repositorio.Eliminar(id); err != nil {
		fmt.Println("Error:", err)
		return
	}

	fmt.Println("Pelicula eliminada.")
}

func leer(mensaje string) string {
	fmt.Print(mensaje)
	if !entrada.Scan() {
		return "0"
	}

	return strings.TrimSpace(entrada.Text())
}

func leerNumero(mensaje string) (int, bool) {
	valor, err := strconv.Atoi(leer(mensaje))
	if err != nil {
		fmt.Println("Error: ingresa un numero valido.")
		return 0, false
	}

	return valor, true
}

func leerNumeroOpcional(mensaje string) (int, bool) {
	texto := leer(mensaje)
	if texto == "" {
		return 0, false
	}

	valor, err := strconv.Atoi(texto)
	if err != nil {
		fmt.Println("Error: se ignora el valor, no es un numero.")
		return 0, false
	}

	return valor, true
}
