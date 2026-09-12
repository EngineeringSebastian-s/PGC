use crate::error::ErrorCatalogo;

/// Primer videojuego de la historia: *Tennis for Two* (1958).
pub const ANIO_MINIMO: u16 = 1958;
/// Cota superior razonable para un catalogo domestico.
pub const ANIO_MAXIMO: u16 = 2100;

/// Entidad del catalogo. Se construye solo a traves de [`Videojuego::nuevo`],
/// que es el unico punto donde viven las reglas de validacion.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Videojuego {
    pub id: u32,
    pub titulo: String,
    pub estudio: String,
    pub anio: u16,
    pub horas_jugadas: u32,
}

impl Videojuego {
    pub fn nuevo(
        id: u32,
        titulo: &str,
        estudio: &str,
        anio: u16,
        horas_jugadas: u32,
    ) -> Result<Self, ErrorCatalogo> {
        if titulo.trim().is_empty() {
            return Err(ErrorCatalogo::DatosInvalidos(
                "El titulo no puede ser vacio".to_string(),
            ));
        }

        if estudio.trim().is_empty() {
            return Err(ErrorCatalogo::DatosInvalidos(
                "El estudio no puede ser vacio".to_string(),
            ));
        }

        if !(ANIO_MINIMO..=ANIO_MAXIMO).contains(&anio) {
            return Err(ErrorCatalogo::DatosInvalidos(format!(
                "El anio debe estar entre {ANIO_MINIMO} y {ANIO_MAXIMO}"
            )));
        }

        Ok(Videojuego {
            id,
            titulo: titulo.trim().to_string(),
            estudio: estudio.trim().to_string(),
            anio,
            horas_jugadas,
        })
    }
}
