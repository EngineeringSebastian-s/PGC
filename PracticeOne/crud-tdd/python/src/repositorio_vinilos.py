from src.excepciones import ViniloNoEncontradoError
from src.vinilo import Vinilo


class RepositorioVinilos:
    def __init__(self):
        self._vinilos = []
        self._siguiente_id = 1

    def crear(self, album: str, artista: str, anio: int, genero: str) -> Vinilo:
        vinilo = Vinilo(id=self._siguiente_id, album=album, artista=artista, anio=anio, genero=genero)
        self._siguiente_id += 1
        self._vinilos.append(vinilo)
        return vinilo

    def obtener_por_id(self, id: int) -> Vinilo:
        for vinilo in self._vinilos:
            if vinilo.id == id:
                return vinilo

        raise ViniloNoEncontradoError(id)

    def obtener_todos(self) -> list[Vinilo]:
        return list(self._vinilos)

    def actualizar(self, id: int, album: str = None, artista: str = None, anio: int = None, genero: str = None) -> Vinilo:
        vinilo = self.obtener_por_id(id)

        nuevo_album = album if album is not None else vinilo.album
        nuevo_artista = artista if artista is not None else vinilo.artista
        nuevo_anio = anio if anio is not None else vinilo.anio
        nuevo_genero = genero if genero is not None else vinilo.genero

        actualizado = Vinilo(id=vinilo.id, album=nuevo_album, artista=nuevo_artista, anio=nuevo_anio, genero=nuevo_genero)
        self._vinilos[self._vinilos.index(vinilo)] = actualizado
        return actualizado

    def eliminar(self, id: int) -> None:
        vinilo = self.obtener_por_id(id)
        self._vinilos.remove(vinilo)
