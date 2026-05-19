from fastapi import HTTPException
from backend.repositories import utilizadores_repository
from backend.auth.security import hash_password


def listar_utilizadores():
    return utilizadores_repository.get_all()


def obter_utilizador(id_func: int):
    utilizador = utilizadores_repository.get_by_id(id_func)
    if not utilizador:
        raise HTTPException(status_code=404, detail="Utilizador não encontrado.")
    return utilizador


def obter_por_username(username: str):
    utilizador = utilizadores_repository.get_by_username(username)
    if not utilizador:
        raise HTTPException(status_code=404, detail="Utilizador não encontrado.")
    return utilizador


def criar_utilizador(data: dict):
    try:
        if utilizadores_repository.get_by_username(data["username"]):
            raise HTTPException(status_code=409, detail="Username já existe.")

        if "password" in data and data["password"]:
            data["password"] = hash_password(data["password"])

        return utilizadores_repository.create(data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar utilizador: {str(e)}")


def atualizar_utilizador(id_func: int, data: dict):
    if not utilizadores_repository.get_by_id(id_func):
        raise HTTPException(status_code=404, detail="Utilizador não encontrado para atualização.")

    if "password" in data and data["password"]:
        data["password"] = hash_password(data["password"])

    result = utilizadores_repository.update(id_func, data)
    return result


def remover_utilizador(id_func: int):
    result = utilizadores_repository.delete(id_func)
    if not result:
        raise HTTPException(status_code=404, detail="Utilizador não encontrado para remoção.")
    return {"detail": "Utilizador removido com sucesso."}