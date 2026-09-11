namespace PlaylistManager;

public interface ICancionRepository
{
    Cancion Crear(Cancion cancion);
    Cancion ObtenerPorId(int id);
    IEnumerable<Cancion> ObtenerTodas();
    Cancion Actualizar(int id, Cancion cancionActualizada);
    void Eliminar(int id);
}
