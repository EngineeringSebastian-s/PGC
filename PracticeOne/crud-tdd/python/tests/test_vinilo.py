import pytest

from src.vinilo import Vinilo


def test_deberia_crear_vinilo_con_datos_validos():
    vinilo = Vinilo(id=1, album="Abbey Road", artista="The Beatles", anio=1969, genero="Rock")

    assert vinilo.album == "Abbey Road"
    assert vinilo.artista == "The Beatles"
    assert vinilo.anio == 1969
    assert vinilo.genero == "Rock"


def test_deberia_lanzar_value_error_si_album_es_vacio():
    with pytest.raises(ValueError):
        Vinilo(id=1, album="", artista="The Beatles", anio=1969, genero="Rock")


def test_deberia_lanzar_value_error_si_artista_es_vacio():
    with pytest.raises(ValueError):
        Vinilo(id=1, album="Abbey Road", artista="", anio=1969, genero="Rock")


def test_deberia_lanzar_value_error_si_anio_es_menor_a_1900():
    with pytest.raises(ValueError):
        Vinilo(id=1, album="Abbey Road", artista="The Beatles", anio=1899, genero="Rock")


def test_deberia_lanzar_value_error_si_anio_es_mayor_al_actual():
    from datetime import date

    with pytest.raises(ValueError):
        Vinilo(id=1, album="Abbey Road", artista="The Beatles", anio=date.today().year + 1, genero="Rock")
