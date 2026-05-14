import os
from datetime import datetime

import httpx
from fastapi import HTTPException

from backend.db import run_query

IA_URL = os.getenv("IA_URL", "http://prodigi_ia:8001")

_COR_TO_URGENCY = {
    "vermelho": "Critical",
    "laranja":  "High",
    "amarelo":  "Medium",
    "verde":    "Low",
    "azul":     "Very Low",
}


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
    Consulta o estado real do hospital via v_estatisticas_ia,
    chama o serviço IA via HTTP para cada cor de triagem,
    e devolve os tempos de espera previstos.
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
    enf = max(int(estat["contagem_enfermeiros"] or 1), 1)
    med = max(int(estat["contagem_medicos"] or 1), 1)

    estado_hospital = {
        "nurse_ratio":        round(enf / pac, 4),
        "specialist_avail":   med,
        "facility_size_beds": int(estat["facility_size_beds"] or 100),
        "day_of_week":        now.strftime("%A"),
        "time_of_day":        _hour_to_time_of_day(now.hour),
        "season":             _month_to_season(now.month),
    }

    # Chamar o serviço IA para cada cor de triagem
    tempos = {}
    cores = ["vermelho", "laranja", "amarelo", "verde", "azul"]

    try:
        for cor in cores:
            body = {
                "Urgency_Level":          _COR_TO_URGENCY[cor],
                "Nurse_to_Patient_Ratio": estado_hospital["nurse_ratio"],
                "Specialist_Availability": estado_hospital["specialist_avail"],
                "Facility_Size_Beds":     estado_hospital["facility_size_beds"],
                "Day_of_Week":            estado_hospital["day_of_week"],
                "Time_of_Day":            estado_hospital["time_of_day"],
                "Season":                 estado_hospital["season"],
            }
            resp = httpx.post(f"{IA_URL}/predict/wait-time", json=body, timeout=5.0)
            resp.raise_for_status()
            data = resp.json()
            urgency_key = _COR_TO_URGENCY[cor]
            tempos[cor] = round(float(data.get(urgency_key, 0)), 1)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Serviço IA indisponível: {e}")

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