using PlaylistManager;

var repositorio = new CancionRepository();

MostrarMenu();

while (true)
{
    Console.Write("\nElegi una opcion: ");
    var opcion = Console.ReadLine()?.Trim();

    if (opcion == "0")
    {
        Console.WriteLine("Chau!");
        break;
    }

    switch (opcion)
    {
        case "1":
            Crear(repositorio);
            break;
        case "2":
            Listar(repositorio);
            break;
        case "3":
            Obtener(repositorio);
            break;
        case "4":
            Actualizar(repositorio);
            break;
        case "5":
            Eliminar(repositorio);
            break;
        default:
            Console.WriteLine("Opcion invalida.");
            break;
    }

    MostrarMenu();
}

static void MostrarMenu()
{
    Console.WriteLine("""

        --- Playlist Manager ---
        1. Crear cancion
        2. Listar canciones
        3. Obtener cancion por id
        4. Actualizar cancion
        5. Eliminar cancion
        0. Salir
        """);
}

static void MostrarCancion(Cancion cancion)
{
    Console.WriteLine($"  [{cancion.Id}] {cancion.Titulo} - {cancion.Artista} ({cancion.DuracionSegundos}s) [{cancion.Genero}]");
}

static int PedirEntero(string mensaje)
{
    while (true)
    {
        Console.Write(mensaje);
        if (int.TryParse(Console.ReadLine(), out var valor))
        {
            return valor;
        }

        Console.WriteLine("Ingresa un numero valido.");
    }
}

static void Crear(ICancionRepository repositorio)
{
    Console.Write("Titulo: ");
    var titulo = Console.ReadLine() ?? string.Empty;
    Console.Write("Artista: ");
    var artista = Console.ReadLine() ?? string.Empty;
    var duracion = PedirEntero("Duracion (segundos): ");
    Console.Write("Genero: ");
    var genero = Console.ReadLine() ?? string.Empty;

    try
    {
        var cancion = repositorio.Crear(new Cancion { Titulo = titulo, Artista = artista, DuracionSegundos = duracion, Genero = genero });
        Console.WriteLine("Cancion creada:");
        MostrarCancion(cancion);
    }
    catch (ArgumentException error)
    {
        Console.WriteLine($"Error: {error.Message}");
    }
}

static void Listar(ICancionRepository repositorio)
{
    var canciones = repositorio.ObtenerTodas().ToList();
    if (canciones.Count == 0)
    {
        Console.WriteLine("No hay canciones registradas.");
        return;
    }

    foreach (var cancion in canciones)
    {
        MostrarCancion(cancion);
    }
}

static void Obtener(ICancionRepository repositorio)
{
    var id = PedirEntero("Id: ");
    try
    {
        MostrarCancion(repositorio.ObtenerPorId(id));
    }
    catch (CancionNoEncontradaException error)
    {
        Console.WriteLine($"Error: {error.Message}");
    }
}

static void Actualizar(ICancionRepository repositorio)
{
    var id = PedirEntero("Id a actualizar: ");

    try
    {
        var actual = repositorio.ObtenerPorId(id);

        Console.WriteLine("Dejar vacio para no modificar el campo.");
        Console.Write($"Titulo ({actual.Titulo}): ");
        var titulo = Console.ReadLine();
        Console.Write($"Artista ({actual.Artista}): ");
        var artista = Console.ReadLine();
        Console.Write($"Duracion en segundos ({actual.DuracionSegundos}): ");
        var duracionTexto = Console.ReadLine();
        Console.Write($"Genero ({actual.Genero}): ");
        var genero = Console.ReadLine();

        var actualizada = new Cancion
        {
            Titulo = string.IsNullOrWhiteSpace(titulo) ? actual.Titulo : titulo,
            Artista = string.IsNullOrWhiteSpace(artista) ? actual.Artista : artista,
            DuracionSegundos = string.IsNullOrWhiteSpace(duracionTexto) ? actual.DuracionSegundos : int.Parse(duracionTexto),
            Genero = string.IsNullOrWhiteSpace(genero) ? actual.Genero : genero,
        };

        var resultado = repositorio.Actualizar(id, actualizada);
        Console.WriteLine("Cancion actualizada:");
        MostrarCancion(resultado);
    }
    catch (Exception error) when (error is CancionNoEncontradaException or ArgumentException)
    {
        Console.WriteLine($"Error: {error.Message}");
    }
}

static void Eliminar(ICancionRepository repositorio)
{
    var id = PedirEntero("Id a eliminar: ");
    try
    {
        repositorio.Eliminar(id);
        Console.WriteLine("Cancion eliminada.");
    }
    catch (CancionNoEncontradaException error)
    {
        Console.WriteLine($"Error: {error.Message}");
    }
}
