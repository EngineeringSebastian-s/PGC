"""CLI interactiva para probar manualmente el CRUD de vinilos."""

from src.excepciones import ViniloNoEncontradoError
from src.repositorio_vinilos import RepositorioVinilos

MENU = """
--- Coleccion de Vinilos ---
1. Crear vinilo
2. Listar vinilos
3. Obtener vinilo por id
4. Actualizar vinilo
5. Eliminar vinilo
0. Salir
"""


def pedir_int(mensaje: str) -> int:
    while True:
        valor = input(mensaje)
        try:
            return int(valor)
        except ValueError:
            print("Ingresa un numero valido.")


def mostrar_vinilo(vinilo) -> None:
    print(f"  [{vinilo.id}] {vinilo.album} - {vinilo.artista} ({vinilo.anio}) [{vinilo.genero}]")


def crear(repositorio: RepositorioVinilos) -> None:
    album = input("Album: ")
    artista = input("Artista: ")
    anio = pedir_int("Anio: ")
    genero = input("Genero: ")
    try:
        vinilo = repositorio.crear(album=album, artista=artista, anio=anio, genero=genero)
        print("Vinilo creado:")
        mostrar_vinilo(vinilo)
    except ValueError as error:
        print(f"Error: {error}")


def listar(repositorio: RepositorioVinilos) -> None:
    vinilos = repositorio.obtener_todos()
    if not vinilos:
        print("No hay vinilos registrados.")
        return
    for vinilo in vinilos:
        mostrar_vinilo(vinilo)


def obtener(repositorio: RepositorioVinilos) -> None:
    id_vinilo = pedir_int("Id: ")
    try:
        mostrar_vinilo(repositorio.obtener_por_id(id_vinilo))
    except ViniloNoEncontradoError as error:
        print(f"Error: {error}")


def actualizar(repositorio: RepositorioVinilos) -> None:
    id_vinilo = pedir_int("Id a actualizar: ")
    print("Dejar vacio para no modificar el campo.")
    album = input("Nuevo album: ") or None
    artista = input("Nuevo artista: ") or None
    anio_texto = input("Nuevo anio: ")
    anio = int(anio_texto) if anio_texto else None
    genero = input("Nuevo genero: ") or None
    try:
        vinilo = repositorio.actualizar(id_vinilo, album=album, artista=artista, anio=anio, genero=genero)
        print("Vinilo actualizado:")
        mostrar_vinilo(vinilo)
    except (ViniloNoEncontradoError, ValueError) as error:
        print(f"Error: {error}")


def eliminar(repositorio: RepositorioVinilos) -> None:
    id_vinilo = pedir_int("Id a eliminar: ")
    try:
        repositorio.eliminar(id_vinilo)
        print("Vinilo eliminado.")
    except ViniloNoEncontradoError as error:
        print(f"Error: {error}")


def main() -> None:
    repositorio = RepositorioVinilos()
    acciones = {
        "1": crear,
        "2": listar,
        "3": obtener,
        "4": actualizar,
        "5": eliminar,
    }

    while True:
        print(MENU)
        opcion = input("Elegi una opcion: ").strip()
        if opcion == "0":
            print("Chau!")
            break

        accion = acciones.get(opcion)
        if accion is None:
            print("Opcion invalida.")
            continue

        accion(repositorio)


if __name__ == "__main__":
    main()
