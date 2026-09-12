use crate::error::ErrorCatalogo;
use crate::videojuego::Videojuego;

/// Repositorio en memoria: guarda los videojuegos en un `Vec` y lleva el
/// contador de ids autoincrementales.
#[derive(Debug)]
pub struct RepositorioVideojuegos {
    videojuegos: Vec<Videojuego>,
    siguiente_id: u32,
}

impl Default for RepositorioVideojuegos {
    fn default() -> Self {
        RepositorioVideojuegos::nuevo()
    }
}

impl RepositorioVideojuegos {
    pub fn nuevo() -> Self {
        RepositorioVideojuegos {
            videojuegos: Vec::new(),
            siguiente_id: 1,
        }
    }

    pub fn crear(
        &mut self,
        titulo: &str,
        estudio: &str,
        anio: u16,
    ) -> Result<Videojuego, ErrorCatalogo> {
        let videojuego = Videojuego::nuevo(self.siguiente_id, titulo, estudio, anio, 0)?;

        self.siguiente_id += 1;
        self.videojuegos.push(videojuego.clone());
        Ok(videojuego)
    }

    pub fn obtener_por_id(&self, id: u32) -> Result<&Videojuego, ErrorCatalogo> {
        self.videojuegos
            .iter()
            .find(|videojuego| videojuego.id == id)
            .ok_or(ErrorCatalogo::VideojuegoNoEncontrado(id))
    }

    pub fn obtener_todos(&self) -> &[Videojuego] {
        &self.videojuegos
    }

    /// Actualiza solo los campos recibidos: un `None` deja el valor anterior.
    pub fn actualizar(
        &mut self,
        id: u32,
        titulo: Option<&str>,
        estudio: Option<&str>,
        anio: Option<u16>,
        horas_jugadas: Option<u32>,
    ) -> Result<Videojuego, ErrorCatalogo> {
        let posicion = self.posicion_de(id)?;
        let actual = &self.videojuegos[posicion];

        let actualizado = Videojuego::nuevo(
            actual.id,
            titulo.unwrap_or(&actual.titulo),
            estudio.unwrap_or(&actual.estudio),
            anio.unwrap_or(actual.anio),
            horas_jugadas.unwrap_or(actual.horas_jugadas),
        )?;

        self.videojuegos[posicion] = actualizado.clone();
        Ok(actualizado)
    }

    pub fn eliminar(&mut self, id: u32) -> Result<(), ErrorCatalogo> {
        let posicion = self.posicion_de(id)?;
        self.videojuegos.remove(posicion);
        Ok(())
    }

    fn posicion_de(&self, id: u32) -> Result<usize, ErrorCatalogo> {
        self.videojuegos
            .iter()
            .position(|videojuego| videojuego.id == id)
            .ok_or(ErrorCatalogo::VideojuegoNoEncontrado(id))
    }
}
