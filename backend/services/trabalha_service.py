from fastapi import HTTPException
from backend.repositories import trabalha_repository


def listar_trabalhos():
    return trabalha_repository.listar_trabalhos()


def obter_trabalho(id_func: int, id_hosp: int):
    trabalho = trabalha_repository.obter_trabalho(id_func, id_hosp)
    if trabalho is None:
        raise HTTPException(status_code=404, detail="Ligação profissional-hospital não encontrada.")
    return trabalho


def listar_trabalhos_por_funcionario(id_func: int):
    return trabalha_repository.listar_trabalhos_por_funcionario(id_func)


def listar_trabalhos_por_hospital(id_hosp: int):
    return trabalha_repository.listar_trabalhos_por_hospital(id_hosp)


def criar_trabalho(data: dict):
    try:
        resultado = trabalha_repository.criar_trabalho(data)
        if resultado is None:
            raise HTTPException(status_code=400, detail="Não foi possível criar a ligação profissional-hospital.")
        return resultado
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar ligação profissional-hospital: {str(e)}")


def atualizar_trabalho(id_func: int, id_hosp: int, data: dict):
    try:
        resultado = trabalha_repository.atualizar_trabalho(id_func, id_hosp, data)
        if resultado is None:
            raise HTTPException(status_code=404, detail="Ligação profissional-hospital não encontrada.")
        return resultado
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao atualizar ligação profissional-hospital: {str(e)}")


def remover_trabalho(id_func: int, id_hosp: int):
    try:
        resultado = trabalha_repository.remover_trabalho(id_func, id_hosp)
        if resultado is None:
            raise HTTPException(status_code=404, detail="Ligação profissional-hospital não encontrada.")
        return {"detail": "Ligação profissional-hospital removida com sucesso."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao remover ligação profissional-hospital: {str(e)}")