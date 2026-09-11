import pytest

from src.excepciones import ViniloNoEncontradoError
from src.repositorio_vinilos import RepositorioVinilos


def test_deberia_crear_vinilo_y_asignarle_id_autoincremental():
    repositorio = RepositorioVinilos()

    vinilo = repositorio.crear(album="Abbey Road", artista="The Beatles", anio=1969, genero="Rock")

    assert vinilo.id == 1


def test_deberia_incrementar_id_al_crear_varios_vinilos():
    repositorio = RepositorioVinilos()

    primero = repositorio.crear(album="Abbey Road", artista="The Beatles", anio=1969, genero="Rock")
    segundo = repositorio.crear(album="The Dark Side of the Moon", artista="Pink Floyd", anio=1973, genero="Rock")

    assert segundo.id > primero.id


def test_deberia_obtener_vinilo_por_id_existente():
    repositorio = RepositorioVinilos()
    creado = repositorio.crear(album="Abbey Road", artista="The Beatles", anio=1969, genero="Rock")

    obtenido = repositorio.obtener_por_id(creado.id)

    assert obtenido == creado


def test_deberia_lanzar_vinilo_no_encontrado_error_al_buscar_id_inexistente():
    repositorio = RepositorioVinilos()

    with pytest.raises(ViniloNoEncontradoError):
        repositorio.obtener_por_id(999)


def test_deberia_retornar_lista_vacia_si_no_hay_vinilos():
    repositorio = RepositorioVinilos()

    vinilos = repositorio.obtener_todos()

    assert vinilos == []


def test_deberia_retornar_todos_los_vinilos_registrados():
    repositorio = RepositorioVinilos()
    repositorio.crear(album="Abbey Road", artista="The Beatles", anio=1969, genero="Rock")
    repositorio.crear(album="The Dark Side of the Moon", artista="Pink Floyd", anio=1973, genero="Rock")

    vinilos = repositorio.obtener_todos()

    assert len(vinilos) == 2


def test_deberia_actualizar_vinilo_existente_con_datos_parciales():
    repositorio = RepositorioVinilos()
    creado = repositorio.crear(album="Abbey Road", artista="The Beatles", anio=1969, genero="Rock")

    actualizado = repositorio.actualizar(creado.id, album="Abbey Road (Remastered)")

    assert actualizado.album == "Abbey Road (Remastered)"
    assert actualizado.artista == "The Beatles"
    assert actualizado.anio == 1969
    assert actualizado.genero == "Rock"


def test_deberia_lanzar_vinilo_no_encontrado_error_al_actualizar_id_inexistente():
    repositorio = RepositorioVinilos()

    with pytest.raises(ViniloNoEncontradoError):
        repositorio.actualizar(999, album="Abbey Road (Remastered)")


def test_deberia_eliminar_vinilo_existente():
    repositorio = RepositorioVinilos()
    creado = repositorio.crear(album="Abbey Road", artista="The Beatles", anio=1969, genero="Rock")

    repositorio.eliminar(creado.id)

    with pytest.raises(ViniloNoEncontradoError):
        repositorio.obtener_por_id(creado.id)


def test_deberia_lanzar_vinilo_no_encontrado_error_al_eliminar_id_inexistente():
    repositorio = RepositorioVinilos()

    with pytest.raises(ViniloNoEncontradoError):
        repositorio.eliminar(999)


def test_deberia_no_afectar_otros_vinilos_al_eliminar_uno():
    repositorio = RepositorioVinilos()
    primero = repositorio.crear(album="Abbey Road", artista="The Beatles", anio=1969, genero="Rock")
    segundo = repositorio.crear(album="The Dark Side of the Moon", artista="Pink Floyd", anio=1973, genero="Rock")

    repositorio.eliminar(primero.id)

    restantes = repositorio.obtener_todos()
    assert len(restantes) == 1
    assert restantes[0].id == segundo.id
