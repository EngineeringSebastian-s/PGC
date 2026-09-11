namespace PlaylistManager;

public class CancionRepository : ICancionRepository
{
    private readonly List<Cancion> _canciones = new();
    private int _siguienteId = 1;

    public Cancion Crear(Cancion cancion)
    {
        ValidarDatos(cancion);

        cancion.Id = _siguienteId++;
        _canciones.Add(cancion);
        return cancion;
    }

    public Cancion ObtenerPorId(int id)
    {
        var cancion = _canciones.FirstOrDefault(c => c.Id == id);
        if (cancion is null)
        {
            throw new CancionNoEncontradaException(id);
        }

        return cancion;
    }

    public IEnumerable<Cancion> ObtenerTodas()
    {
        return _canciones;
    }

    public Cancion Actualizar(int id, Cancion cancionActualizada)
    {
        var cancion = ObtenerPorId(id);
        ValidarDatos(cancionActualizada);

        cancion.Titulo = cancionActualizada.Titulo;
        cancion.Artista = cancionActualizada.Artista;
        cancion.DuracionSegundos = cancionActualizada.DuracionSegundos;
        cancion.Genero = cancionActualizada.Genero;
        return cancion;
    }

    public void Eliminar(int id)
    {
        var cancion = ObtenerPorId(id);
        _canciones.Remove(cancion);
    }

    private static void ValidarDatos(Cancion cancion)
    {
        if (string.IsNullOrEmpty(cancion.Titulo))
        {
            throw new ArgumentException("El titulo no puede ser vacio o nulo", nameof(cancion));
        }

        if (string.IsNullOrEmpty(cancion.Artista))
        {
            throw new ArgumentException("El artista no puede ser vacio o nulo", nameof(cancion));
        }

        if (cancion.DuracionSegundos <= 0)
        {
            throw new ArgumentException("La duracion en segundos debe ser mayor a cero", nameof(cancion));
        }
    }
}
