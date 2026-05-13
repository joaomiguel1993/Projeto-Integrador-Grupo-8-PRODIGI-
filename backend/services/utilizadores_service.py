from fastapi import HTTPException
from backend.repositories import utilizadores_repository
from backend.dao.logs_dao import insert_log

def listar_utilizadores():
    return utilizadores_repository.listar_utilizadores()


def obter_utilizador(id_func: int):
    utilizador = utilizadores_repository.obter_utilizador_por_id_func(id_func)
    if utilizador is None:
        raise HTTPException(status_code=404, detail="Utilizador não encontrado.")
    return utilizador


def obter_utilizador_por_username(username: str):
    utilizador = utilizadores_repository.obter_utilizador_por_username(username)
    if utilizador is None:
        raise HTTPException(status_code=404, detail="Utilizador não encontrado.")
    return utilizador


def criar_utilizador(data: dict, current_username: str, ip: str):
    try:
        resultado = utilizadores_repository.criar_utilizador(data)
        if resultado is None:
            raise HTTPException(status_code=400, detail="Não foi possível criar o utilizador.")

        insert_log(
            username=current_username,
            acao="CRIAR_UTILIZADOR",
            detalhe=f"Utilizador {data.get('username')} criado.",
            ip=ip,
        )

        return resultado
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar utilizador: {str(e)}")  


def atualizar_utilizador(id_func: int, data: dict, current_username: str, ip: str):
    try:
        resultado = utilizadores_repository.atualizar_utilizador(id_func, data)
        if resultado is None:
            raise HTTPException(status_code=404, detail="Utilizador não encontrado.")

        # ✅ EDITAR LOG
        insert_log(
            username=current_username,
            acao="EDITAR_UTILIZADOR",
            detalhe=f"Utilizador ID {id_func} atualizado.",
            ip=ip,
        )

        return resultado
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao atualizar utilizador: {str(e)}")

def remover_utilizador(id_func: int, current_username: str, ip: str):
    try:
        resultado = utilizadores_repository.remover_utilizador(id_func)
        if resultado is None:
            raise HTTPException(status_code=404, detail="Utilizador não encontrado.")

        insert_log(
            username=current_username,
            acao="REMOVER_UTILIZADOR",
            detalhe=f"Utilizador ID {id_func} removido.",
            ip=ip,
        )

        return {"detail": "Utilizador removido com sucesso."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail="Erro ao remover utilizador: " + str(e))