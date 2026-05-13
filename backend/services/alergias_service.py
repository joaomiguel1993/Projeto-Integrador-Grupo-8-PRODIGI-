from backend.repositories import alergias_repository
from fastapi import HTTPException

def listar_por_utente(num_utent: int):
    return alergias_repository.get_todas_utente(num_utent)

def obter_alergia(cod_alergia: int):
    alergia = alergias_repository.get_por_id(cod_alergia)
    if not alergia:
        raise HTTPException(status_code=404, detail="Alergia não encontrada.")
    return alergia

def obter_dados_treino_ia():
    """Retorna dados agregados de alergias para treino ou inferência de IA"""
    return alergias_repository.get_estatisticas_ia()

def criar_alergia(data: dict):
    try:
        return alergias_repository.create(data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro de integridade (Ex: Utente/Classe Terapêutica já existe). Detalhe: {str(e)}")

def atualizar_alergia(cod_alergia: int, data: dict):
    result = alergias_repository.update(cod_alergia, data)
    if not result:
        raise HTTPException(status_code=404, detail="Alergia não encontrada para atualização.")
    return result

def remover_alergia(cod_alergia: int):
    result = alergias_repository.delete(cod_alergia)
    if not result:
        raise HTTPException(status_code=404, detail="Alergia não encontrada para remoção.")
    return {"detail": "Alergia removida com sucesso."}