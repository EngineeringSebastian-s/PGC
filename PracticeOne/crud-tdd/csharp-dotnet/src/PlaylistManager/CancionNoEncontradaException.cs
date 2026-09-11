namespace PlaylistManager;

public class CancionNoEncontradaException : Exception
{
    public CancionNoEncontradaException(int id) : base($"No se encontro la cancion con id {id}")
    {
    }
}
