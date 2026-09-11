class ViniloNoEncontradoError(Exception):
    def __init__(self, id: int):
        super().__init__(f"No se encontro el vinilo con id {id}")
