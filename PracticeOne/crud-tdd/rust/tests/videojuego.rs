//! Tests de la entidad: reglas de validacion, sin repositorio de por medio.

use crud_videojuegos::{ErrorCatalogo, Videojuego};

#[test]
fn deberia_crear_videojuego_con_datos_validos() {
    let videojuego = Videojuego::nuevo(1, "Hollow Knight", "Team Cherry", 2017, 0).unwrap();

    assert_eq!(videojuego.titulo, "Hollow Knight");
    assert_eq!(videojuego.estudio, "Team Cherry");
    assert_eq!(videojuego.anio, 2017);
    assert_eq!(videojuego.horas_jugadas, 0);
}

#[test]
fn deberia_retornar_error_si_titulo_es_vacio() {
    let resultado = Videojuego::nuevo(1, "   ", "Team Cherry", 2017, 0);

    assert!(matches!(resultado, Err(ErrorCatalogo::DatosInvalidos(_))));
}

#[test]
fn deberia_retornar_error_si_estudio_es_vacio() {
    let resultado = Videojuego::nuevo(1, "Hollow Knight", "", 2017, 0);

    assert!(matches!(resultado, Err(ErrorCatalogo::DatosInvalidos(_))));
}

#[test]
fn deberia_retornar_error_si_anio_es_menor_a_1958() {
    let resultado = Videojuego::nuevo(1, "Hollow Knight", "Team Cherry", 1957, 0);

    assert!(matches!(resultado, Err(ErrorCatalogo::DatosInvalidos(_))));
}

#[test]
fn deberia_retornar_error_si_anio_es_mayor_a_2100() {
    let resultado = Videojuego::nuevo(1, "Hollow Knight", "Team Cherry", 2101, 0);

    assert!(matches!(resultado, Err(ErrorCatalogo::DatosInvalidos(_))));
}
