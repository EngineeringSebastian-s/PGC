namespace PlaylistManager;

public class Cancion
{
    public int Id { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Artista { get; set; } = string.Empty;
    public int DuracionSegundos { get; set; }
    public string Genero { get; set; } = string.Empty;
}
