from fastapi import HTTPException
from backend.repositories import profissionais_repository
from backend.dao.logs_dao import insert_log


def listar_profissionais():
    return profissionais_repository.listar_profissionais()


def obter_profissional(id_func: int):
    profissional = profissionais_repository.obter_profissional_por_id(id_func)
    if profissional is None:
        raise HTTPException(status_code=404, detail="Profissional não encontrado.")
    return profissional


def listar_profissionais_por_tipo(tipo_func: str):
    return profissionais_repository.listar_profissionais_por_tipo(tipo_func)


def criar_profissional(data: dict, current_username: str, ip: str):
    try:
        resultado = profissionais_repository.criar_profissional(data)
        if resultado is None:
            raise HTTPException(status_code=400, detail="Não foi possível criar o profissional.")

        insert_log(
            username=current_username,
            acao="CRIAR_FUNCIONARIO",
            detalhe=f"Funcionário ID {data.get('idfunc')} criado.",
            ip=ip,
        )

        return resultado
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar profissional: {str(e)}")



def atualizar_profissional(id_func: int, data: dict):
    try:
        resultado = profissionais_repository.atualizar_profissional(id_func, data)
        if resultado is None:
            raise HTTPException(status_code=404, detail="Profissional não encontrado.")
        return resultado
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao atualizar profissional: {str(e)}")


def remover_profissional(id_func: int):
    try:
        resultado = profissionais_repository.remover_profissional(id_func)
        if resultado is None:
            raise HTTPException(status_code=404, detail="Profissional não encontrado.")
        return {"detail": "Profissional removido com sucesso."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao remover profissional: {str(e)}")