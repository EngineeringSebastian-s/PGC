//! CLI interactiva para probar manualmente el CRUD de videojuegos.

use std::io::{self, Write};

use crud_videojuegos::{RepositorioVideojuegos, Videojuego};

const MENU: &str = "
--- Catalogo de Videojuegos ---
1. Crear videojuego
2. Listar videojuegos
3. Obtener videojuego por id
4. Actualizar videojuego
5. Eliminar videojuego
0. Salir
";

fn main() {
    let mut repositorio = RepositorioVideojuegos::nuevo();

    loop {
        println!("{MENU}");
        match leer("Elegi una opcion: ").as_str() {
            "1" => crear(&mut repositorio),
            "2" => listar(&repositorio),
            "3" => obtener(&repositorio),
            "4" => actualizar(&mut repositorio),
            "5" => eliminar(&mut repositorio),
            "0" => {
                println!("Chau!");
                return;
            }
            _ => println!("Opcion invalida."),
        }
    }
}

fn crear(repositorio: &mut RepositorioVideojuegos) {
    let titulo = leer("Titulo: ");
    let estudio = leer("Estudio: ");
    let anio = match leer("Anio: ").parse::<u16>() {
        Ok(valor) => valor,
        Err(_) => {
            println!("Error: ingresa un anio valido.");
            return;
        }
    };

    match repositorio.crear(&titulo, &estudio, anio) {
        Ok(videojuego) => {
            println!("Videojuego creado:");
            mostrar(&videojuego);
        }
        Err(error) => println!("Error: {error}"),
    }
}

fn listar(repositorio: &RepositorioVideojuegos) {
    let videojuegos = repositorio.obtener_todos();
    if videojuegos.is_empty() {
        println!("No hay videojuegos registrados.");
        return;
    }

    for videojuego in videojuegos {
        mostrar(videojuego);
    }
}

fn obtener(repositorio: &RepositorioVideojuegos) {
    let Some(id) = leer_id("Id: ") else { return };

    match repositorio.obtener_por_id(id) {
        Ok(videojuego) => mostrar(videojuego),
        Err(error) => println!("Error: {error}"),
    }
}

fn actualizar(repositorio: &mut RepositorioVideojuegos) {
    let Some(id) = leer_id("Id a actualizar: ") else {
        return;
    };

    println!("Dejar vacio para no modificar el campo.");
    let titulo = opcional(leer("Nuevo titulo: "));
    let estudio = opcional(leer("Nuevo estudio: "));
    let anio = opcional(leer("Nuevo anio: ")).and_then(|texto| texto.parse::<u16>().ok());
    let horas = opcional(leer("Horas jugadas: ")).and_then(|texto| texto.parse::<u32>().ok());

    match repositorio.actualizar(id, titulo.as_deref(), estudio.as_deref(), anio, horas) {
        Ok(videojuego) => {
            println!("Videojuego actualizado:");
            mostrar(&videojuego);
        }
        Err(error) => println!("Error: {error}"),
    }
}

fn eliminar(repositorio: &mut RepositorioVideojuegos) {
    let Some(id) = leer_id("Id a eliminar: ") else {
        return;
    };

    match repositorio.eliminar(id) {
        Ok(()) => println!("Videojuego eliminado."),
        Err(error) => println!("Error: {error}"),
    }
}

fn mostrar(videojuego: &Videojuego) {
    println!(
        "  [{}] {} - {} ({}) [{} h jugadas]",
        videojuego.id,
        videojuego.titulo,
        videojuego.estudio,
        videojuego.anio,
        videojuego.horas_jugadas
    );
}

fn leer(mensaje: &str) -> String {
    print!("{mensaje}");
    io::stdout().flush().expect("no se pudo escribir en stdout");

    let mut entrada = String::new();
    io::stdin()
        .read_line(&mut entrada)
        .expect("no se pudo leer de stdin");
    entrada.trim().to_string()
}

fn leer_id(mensaje: &str) -> Option<u32> {
    match leer(mensaje).parse::<u32>() {
        Ok(id) => Some(id),
        Err(_) => {
            println!("Error: ingresa un numero valido.");
            None
        }
    }
}

fn opcional(valor: String) -> Option<String> {
    if valor.is_empty() {
        None
    } else {
        Some(valor)
    }
}
