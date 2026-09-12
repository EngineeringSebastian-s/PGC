//! CRUD en memoria de un catalogo de videojuegos.
//!
//! El dominio se divide en tres modulos para que cada test apunte a una sola
//! responsabilidad: la entidad valida sus datos, el error describe el fallo y
//! el repositorio resuelve el almacenamiento.

pub mod error;
pub mod repositorio;
pub mod videojuego;

pub use error::ErrorCatalogo;
pub use repositorio::RepositorioVideojuegos;
pub use videojuego::Videojuego;
