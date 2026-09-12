use std::fmt;

/// Errores que puede devolver el catalogo.
///
/// En Rust no existen excepciones: los fallos esperables viajan dentro de un
/// `Result`, asi que el test verifica el valor devuelto en vez de capturar algo.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ErrorCatalogo {
    /// Los datos de la entidad no cumplen las reglas de negocio.
    DatosInvalidos(String),
    /// No existe un videojuego con ese id en el catalogo.
    VideojuegoNoEncontrado(u32),
}

impl fmt::Display for ErrorCatalogo {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ErrorCatalogo::DatosInvalidos(detalle) => write!(f, "{detalle}"),
            ErrorCatalogo::VideojuegoNoEncontrado(id) => {
                write!(f, "No se encontro el videojuego con id {id}")
            }
        }
    }
}

impl std::error::Error for ErrorCatalogo {}
