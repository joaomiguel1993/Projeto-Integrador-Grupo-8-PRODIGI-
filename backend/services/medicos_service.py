from fastapi import HTTPException
from backend.repositories import medicos_repository


def listar_medicos():
    return medicos_repository.get_all()


def obter_medico(id_func: int):
    medico = medicos_repository.get_by_id(id_func)
    if not medico:
        raise HTTPException(status_code=404, detail="Médico não encontrado.")
    return medico


def listar_por_especialidade(especialidade: str):
    return medicos_repository.get_by_especialidade(especialidade)


def listar_estagiarios():
    return medicos_repository.get_estagiarios(True)


def criar_medico(data: dict):
    try:
        return medicos_repository.create(data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar médico: {str(e)}")


def atualizar_medico(id_func: int, data: dict):
    result = medicos_repository.update(id_func, data)
    if not result:
        raise HTTPException(status_code=404, detail="Médico não encontrado para atualização.")
    return result


def remover_medico(id_func: int):
    result = medicos_repository.delete(id_func)
    if not result:
        raise HTTPException(status_code=404, detail="Médico não encontrado para remoção.")
    return {"detail": "Médico removido com sucesso."}