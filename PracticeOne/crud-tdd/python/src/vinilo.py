from dataclasses import dataclass
from datetime import date


@dataclass
class Vinilo:
    id: int
    album: str
    artista: str
    anio: int
    genero: str

    def __post_init__(self):
        if not self.album:
            raise ValueError("El album no puede ser vacio")

        if not self.artista:
            raise ValueError("El artista no puede ser vacio")

        if self.anio < 1900 or self.anio > date.today().year:
            raise ValueError(f"El anio debe estar entre 1900 y {date.today().year}")
