from backend.repositories.utilizadores_repository import (
    listar_utilizadores,
    obter_utilizador
)
 
def get_utilizadores_service():
    return listar_utilizadores()
 
def get_utilizador_service(idfunc: int):
    return obter_utilizador(idfunc)
 