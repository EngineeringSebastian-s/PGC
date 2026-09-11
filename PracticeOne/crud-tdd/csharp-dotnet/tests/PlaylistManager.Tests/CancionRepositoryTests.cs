using FluentAssertions;

namespace PlaylistManager.Tests;

public class CancionRepositoryTests
{
    [Fact]
    public void Deberia_CrearCancion_CuandoDatosSonValidos()
    {
        var repositorio = new CancionRepository();
        var cancion = new Cancion { Titulo = "Bohemian Rhapsody", Artista = "Queen", DuracionSegundos = 355, Genero = "Rock" };

        var resultado = repositorio.Crear(cancion);

        resultado.Titulo.Should().Be("Bohemian Rhapsody");
        resultado.Artista.Should().Be("Queen");
        resultado.DuracionSegundos.Should().Be(355);
        resultado.Genero.Should().Be("Rock");
    }

    [Fact]
    public void Deberia_AsignarIdAutogenerado_AlCrearCancion()
    {
        var repositorio = new CancionRepository();
        var cancion = new Cancion { Titulo = "Yesterday", Artista = "The Beatles", DuracionSegundos = 125, Genero = "Pop" };

        var resultado = repositorio.Crear(cancion);

        resultado.Id.Should().BeGreaterThan(0);
    }

    [Fact]
    public void Deberia_IncrementarId_AlCrearVariasCanciones()
    {
        var repositorio = new CancionRepository();
        var primera = new Cancion { Titulo = "Imagine", Artista = "John Lennon", DuracionSegundos = 183, Genero = "Rock" };
        var segunda = new Cancion { Titulo = "Hey Jude", Artista = "The Beatles", DuracionSegundos = 431, Genero = "Rock" };

        var resultadoPrimera = repositorio.Crear(primera);
        var resultadoSegunda = repositorio.Crear(segunda);

        resultadoSegunda.Id.Should().BeGreaterThan(resultadoPrimera.Id);
    }

    [Fact]
    public void Deberia_LanzarArgumentException_SiTituloEsVacio()
    {
        var repositorio = new CancionRepository();
        var cancion = new Cancion { Titulo = "", Artista = "Queen", DuracionSegundos = 355, Genero = "Rock" };

        var accion = () => repositorio.Crear(cancion);

        accion.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void Deberia_LanzarArgumentException_SiTituloEsNulo()
    {
        var repositorio = new CancionRepository();
        var cancion = new Cancion { Titulo = null!, Artista = "Queen", DuracionSegundos = 355, Genero = "Rock" };

        var accion = () => repositorio.Crear(cancion);

        accion.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void Deberia_LanzarArgumentException_SiArtistaEsVacioONulo()
    {
        var repositorio = new CancionRepository();
        var cancion = new Cancion { Titulo = "Bohemian Rhapsody", Artista = "", DuracionSegundos = 355, Genero = "Rock" };

        var accion = () => repositorio.Crear(cancion);

        accion.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void Deberia_LanzarArgumentException_SiDuracionSegundosEsCeroOMenor()
    {
        var repositorio = new CancionRepository();
        var cancion = new Cancion { Titulo = "Bohemian Rhapsody", Artista = "Queen", DuracionSegundos = 0, Genero = "Rock" };

        var accion = () => repositorio.Crear(cancion);

        accion.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void Deberia_ObtenerCancionPorId_CuandoExiste()
    {
        var repositorio = new CancionRepository();
        var creada = repositorio.Crear(new Cancion { Titulo = "Imagine", Artista = "John Lennon", DuracionSegundos = 183, Genero = "Rock" });

        var resultado = repositorio.ObtenerPorId(creada.Id);

        resultado.Should().BeEquivalentTo(creada);
    }

    [Fact]
    public void Deberia_LanzarCancionNoEncontradaException_AlObtenerPorId_SiNoExiste()
    {
        var repositorio = new CancionRepository();

        var accion = () => repositorio.ObtenerPorId(999);

        accion.Should().Throw<CancionNoEncontradaException>();
    }

    [Fact]
    public void Deberia_RetornarListaVacia_SiNoHayCancionesRegistradas()
    {
        var repositorio = new CancionRepository();

        var resultado = repositorio.ObtenerTodas();

        resultado.Should().BeEmpty();
    }

    [Fact]
    public void Deberia_RetornarTodasLasCanciones_CuandoHayVariasRegistradas()
    {
        var repositorio = new CancionRepository();
        repositorio.Crear(new Cancion { Titulo = "Imagine", Artista = "John Lennon", DuracionSegundos = 183, Genero = "Rock" });
        repositorio.Crear(new Cancion { Titulo = "Hey Jude", Artista = "The Beatles", DuracionSegundos = 431, Genero = "Rock" });

        var resultado = repositorio.ObtenerTodas();

        resultado.Should().HaveCount(2);
    }

    [Fact]
    public void Deberia_ActualizarCancion_CuandoExiste_YRetornarLaCancionActualizada()
    {
        var repositorio = new CancionRepository();
        var creada = repositorio.Crear(new Cancion { Titulo = "Imagine", Artista = "John Lennon", DuracionSegundos = 183, Genero = "Rock" });
        var actualizacion = new Cancion { Titulo = "Imagine (Remastered)", Artista = "John Lennon", DuracionSegundos = 185, Genero = "Rock" };

        var resultado = repositorio.Actualizar(creada.Id, actualizacion);

        resultado.Id.Should().Be(creada.Id);
        resultado.Titulo.Should().Be("Imagine (Remastered)");
        resultado.DuracionSegundos.Should().Be(185);
    }

    [Fact]
    public void Deberia_LanzarCancionNoEncontradaException_AlActualizar_SiNoExiste()
    {
        var repositorio = new CancionRepository();
        var actualizacion = new Cancion { Titulo = "Imagine", Artista = "John Lennon", DuracionSegundos = 183, Genero = "Rock" };

        var accion = () => repositorio.Actualizar(999, actualizacion);

        accion.Should().Throw<CancionNoEncontradaException>();
    }

    [Fact]
    public void Deberia_LanzarArgumentException_AlActualizar_SiTituloNuevoEsVacio()
    {
        var repositorio = new CancionRepository();
        var creada = repositorio.Crear(new Cancion { Titulo = "Imagine", Artista = "John Lennon", DuracionSegundos = 183, Genero = "Rock" });
        var actualizacion = new Cancion { Titulo = "", Artista = "John Lennon", DuracionSegundos = 183, Genero = "Rock" };

        var accion = () => repositorio.Actualizar(creada.Id, actualizacion);

        accion.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void Deberia_EliminarCancion_CuandoExiste()
    {
        var repositorio = new CancionRepository();
        var creada = repositorio.Crear(new Cancion { Titulo = "Imagine", Artista = "John Lennon", DuracionSegundos = 183, Genero = "Rock" });

        repositorio.Eliminar(creada.Id);

        var accion = () => repositorio.ObtenerPorId(creada.Id);
        accion.Should().Throw<CancionNoEncontradaException>();
    }

    [Fact]
    public void Deberia_LanzarCancionNoEncontradaException_AlEliminar_SiNoExiste()
    {
        var repositorio = new CancionRepository();

        var accion = () => repositorio.Eliminar(999);

        accion.Should().Throw<CancionNoEncontradaException>();
    }

    [Fact]
    public void Deberia_NoAfectarOtrasCanciones_AlEliminarUna()
    {
        var repositorio = new CancionRepository();
        var primera = repositorio.Crear(new Cancion { Titulo = "Imagine", Artista = "John Lennon", DuracionSegundos = 183, Genero = "Rock" });
        var segunda = repositorio.Crear(new Cancion { Titulo = "Hey Jude", Artista = "The Beatles", DuracionSegundos = 431, Genero = "Rock" });

        repositorio.Eliminar(primera.Id);

        repositorio.ObtenerTodas().Should().ContainSingle(c => c.Id == segunda.Id);
    }
}
