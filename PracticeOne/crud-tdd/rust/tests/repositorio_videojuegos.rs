//! Tests del repositorio: el CRUD completo contra la API publica.

use crud_videojuegos::{ErrorCatalogo, RepositorioVideojuegos};

fn repositorio_vacio() -> RepositorioVideojuegos {
    RepositorioVideojuegos::nuevo()
}

#[test]
fn deberia_crear_videojuego_y_asignarle_id_autoincremental() {
    let mut repositorio = repositorio_vacio();

    let videojuego = repositorio
        .crear("Hollow Knight", "Team Cherry", 2017)
        .unwrap();

    assert_eq!(videojuego.id, 1);
}

#[test]
fn deberia_incrementar_id_al_crear_varios_videojuegos() {
    let mut repositorio = repositorio_vacio();

    let primero = repositorio
        .crear("Hollow Knight", "Team Cherry", 2017)
        .unwrap();
    let segundo = repositorio.crear("Celeste", "Maddy Makes Games", 2018).unwrap();

    assert!(segundo.id > primero.id);
}

#[test]
fn deberia_retornar_error_al_crear_videojuego_con_titulo_vacio() {
    let mut repositorio = repositorio_vacio();

    let resultado = repositorio.crear("", "Team Cherry", 2017);

    assert!(matches!(resultado, Err(ErrorCatalogo::DatosInvalidos(_))));
    assert!(repositorio.obtener_todos().is_empty());
}

#[test]
fn deberia_obtener_videojuego_por_id_existente() {
    let mut repositorio = repositorio_vacio();
    let creado = repositorio
        .crear("Hollow Knight", "Team Cherry", 2017)
        .unwrap();

    let obtenido = repositorio.obtener_por_id(creado.id).unwrap();

    assert_eq!(*obtenido, creado);
}

#[test]
fn deberia_retornar_error_al_buscar_id_inexistente() {
    let repositorio = repositorio_vacio();

    let resultado = repositorio.obtener_por_id(999);

    assert_eq!(resultado, Err(ErrorCatalogo::VideojuegoNoEncontrado(999)));
}

#[test]
fn deberia_retornar_lista_vacia_si_no_hay_videojuegos() {
    let repositorio = repositorio_vacio();

    assert!(repositorio.obtener_todos().is_empty());
}

#[test]
fn deberia_retornar_todos_los_videojuegos_registrados() {
    let mut repositorio = repositorio_vacio();
    repositorio.crear("Hollow Knight", "Team Cherry", 2017).unwrap();
    repositorio.crear("Celeste", "Maddy Makes Games", 2018).unwrap();

    assert_eq!(repositorio.obtener_todos().len(), 2);
}

#[test]
fn deberia_actualizar_videojuego_existente_con_datos_parciales() {
    let mut repositorio = repositorio_vacio();
    let creado = repositorio
        .crear("Hollow Knight", "Team Cherry", 2017)
        .unwrap();

    let actualizado = repositorio
        .actualizar(creado.id, None, None, None, Some(42))
        .unwrap();

    assert_eq!(actualizado.horas_jugadas, 42);
    assert_eq!(actualizado.titulo, "Hollow Knight");
    assert_eq!(actualizado.estudio, "Team Cherry");
    assert_eq!(actualizado.anio, 2017);
}

#[test]
fn deberia_retornar_error_al_actualizar_id_inexistente() {
    let mut repositorio = repositorio_vacio();

    let resultado = repositorio.actualizar(999, Some("Silksong"), None, None, None);

    assert_eq!(resultado, Err(ErrorCatalogo::VideojuegoNoEncontrado(999)));
}

#[test]
fn deberia_retornar_error_al_actualizar_con_titulo_vacio() {
    let mut repositorio = repositorio_vacio();
    let creado = repositorio
        .crear("Hollow Knight", "Team Cherry", 2017)
        .unwrap();

    let resultado = repositorio.actualizar(creado.id, Some(""), None, None, None);

    assert!(matches!(resultado, Err(ErrorCatalogo::DatosInvalidos(_))));
    assert_eq!(repositorio.obtener_por_id(creado.id).unwrap().titulo, "Hollow Knight");
}

#[test]
fn deberia_eliminar_videojuego_existente() {
    let mut repositorio = repositorio_vacio();
    let creado = repositorio
        .crear("Hollow Knight", "Team Cherry", 2017)
        .unwrap();

    repositorio.eliminar(creado.id).unwrap();

    assert_eq!(
        repositorio.obtener_por_id(creado.id),
        Err(ErrorCatalogo::VideojuegoNoEncontrado(creado.id))
    );
}

#[test]
fn deberia_retornar_error_al_eliminar_id_inexistente() {
    let mut repositorio = repositorio_vacio();

    let resultado = repositorio.eliminar(999);

    assert_eq!(resultado, Err(ErrorCatalogo::VideojuegoNoEncontrado(999)));
}

#[test]
fn deberia_no_afectar_otros_videojuegos_al_eliminar_uno() {
    let mut repositorio = repositorio_vacio();
    let primero = repositorio
        .crear("Hollow Knight", "Team Cherry", 2017)
        .unwrap();
    let segundo = repositorio.crear("Celeste", "Maddy Makes Games", 2018).unwrap();

    repositorio.eliminar(primero.id).unwrap();

    let restantes = repositorio.obtener_todos();
    assert_eq!(restantes.len(), 1);
    assert_eq!(restantes[0].id, segundo.id);
}
