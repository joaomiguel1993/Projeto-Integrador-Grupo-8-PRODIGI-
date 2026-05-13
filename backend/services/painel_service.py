from datetime import datetime
from fastapi import HTTPException

from backend.db import run_query
from ia.src.painel_wait_time import prever_painel


def _hour_to_time_of_day(h: int) -> str:
    if 5  <= h < 9:  return "Morning"
    if 9  <= h < 12: return "Late Morning"
    if 12 <= h < 18: return "Afternoon"
    if 18 <= h < 22: return "Evening"
    return "Night"

def _month_to_season(m: int) -> str:
    if m in (12, 1, 2): return "Winter"
    if m in (3, 4, 5):  return "Spring"
    if m in (6, 7, 8):  return "Summer"
    return "Autumn"


def obter_tempos_espera(id_hosp: int) -> dict:
    """
    Consulta o estado real do hospital via v_estatisticas_ia
    e devolve os tempos de espera previstos para cada cor de triagem.
    """
    estat = run_query("""
        SELECT
            hospitalnome,
            facility_size_beds,
            contagem_enfermeiros,
            contagem_medicos,
            pacientes_ativos
        FROM v_estatisticas_ia
        WHERE idhosp = %s
    """, (id_hosp,))

    if not estat:
        raise HTTPException(status_code=404, detail="Hospital não encontrado.")
    estat = estat[0]

    now = datetime.now()
    pac = max(int(estat["pacientes_ativos"] or 1), 1)

    estado_hospital = {
        "nurse_ratio":        round(int(estat["contagem_enfermeiros"] or 0) / pac, 4),
        "specialist_avail":   int(estat["contagem_medicos"] or 0),
        "facility_size_beds": int(estat["facility_size_beds"] or 0),
        "day_of_week":        now.strftime("%A"),
        "time_of_day":        _hour_to_time_of_day(now.hour),
        "season":             _month_to_season(now.month),
    }

    tempos = prever_painel(estado_hospital)

    return {
        "id_hosp":         id_hosp,
        "hospital_nome":   estat["hospitalnome"],
        "atualizado_em":   now.isoformat(),
        "estado_hospital": estado_hospital,
        "tempos_espera": {
            "vermelho": {"minutos": tempos["vermelho"], "label": "Emergência (Crítico)"},
            "laranja":  {"minutos": tempos["laranja"],  "label": "Muito Urgente"},
            "amarelo":  {"minutos": tempos["amarelo"],  "label": "Urgente"},
            "verde":    {"minutos": tempos["verde"],    "label": "Pouco Urgente"},
            "azul":     {"minutos": tempos["azul"],     "label": "Não Urgente"},
        },
    }
