from typing import Any, Optional, cast
from backend.dao.atos_dao import (
    select_all_atos,
    select_ato_by_id,
    select_atos_by_ep_urgencia,
    insert_ato,
    update_ato,
    select_funcionarios_by_ato,
    select_prescricoes_by_ato
)

def listar_atos():
    # O teu db.py devolve uma lista de dicionários ou None
    res = select_all_atos()
    return res if isinstance(res, list) else []

def obter_ato(id_ato: int) -> Optional[dict[str, Any]]:
    res = select_ato_by_id(id_ato)
    # Se res for uma lista com elementos, devolve o primeiro, senão None
    if isinstance(res, list) and len(res) > 0:
        return res[0]
    return None

def listar_atos_por_episodio(cod_ep: int):
    res = select_atos_by_ep_urgencia(cod_ep)
    return res if isinstance(res, list) else []

def listar_funcionarios_do_ato(id_ato: int):
    res = select_funcionarios_by_ato(id_ato)
    return res if isinstance(res, list) else []

def listar_prescricoes_do_ato(id_ato: int):
    res = select_prescricoes_by_ato(id_ato)
    return res if isinstance(res, list) else []

def criar_ato(cod, tipo, desc, data):
    res = insert_ato(cod, tipo, desc, data)
    # Como o insert retorna o row inserido diretamente (não via run_query),
    # ele retorna um tuplo (baseado no código que tínhamos feito antes).
    if res:
        return dict(zip(["idato", "codepurgenc", "tipo", "descricao", "datahorainicio", "datahorafim"], res))
    return None

def atualizar_ato(id_ato, tipo, desc, data_fim):
    res = update_ato(id_ato, tipo, desc, data_fim)
    if res:
        return dict(zip(["idato", "codepurgenc", "tipo", "descricao", "datahorainicio", "datahorafim"], res))
    return None