import os
from datetime import datetime

import httpx
from fastapi import HTTPException

from backend.db import run_query
from backend.services import predicao_ia_service

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


def prever_tempo_espera(cod_ep_urgenc: int) -> None:
    """
    Chamado pelo triagens_service após gravar a triagem.
    1. Consulta a BD (episódio + v_estatisticas_ia)
    2. Prepara as 7 features
    3. Chama o serviço IA via HTTP (POST /predict/v1/wait-time)
    4. Atualiza Triagem.TempoEsperaPrevisto
    5. Grava auditoria em PredicaoIA
    """
    # 1. Buscar episódio + cor de triagem
    ep = run_query("""
        SELECT e.idhosp, e.datahoraentr, t.cortriagem
        FROM epurgencia e
        LEFT JOIN triagem t ON t.codepurgenc = e.codepurgenc
        WHERE e.codepurgenc = %s
    """, (cod_ep_urgenc,))
    if not ep:
        raise HTTPException(status_code=404, detail="Episódio não encontrado.")
    ep = ep[0]

    # 2. Buscar estatísticas do hospital
    estat = run_query("""
        SELECT facility_size_beds, contagem_enfermeiros,
               contagem_medicos, pacientes_ativos
        FROM v_estatisticas_ia
        WHERE idhosp = %s
    """, (ep["idhosp"],))
    if not estat:
        raise HTTPException(status_code=404, detail="Estatísticas do hospital não encontradas.")
    estat = estat[0]

    # 3. Preparar as 7 features
    dt  = ep["datahoraentr"] if isinstance(ep["datahoraentr"], datetime) else datetime.now()
    pac = max(int(estat["pacientes_ativos"] or 1), 1)
    enf = max(int(estat["contagem_enfermeiros"] or 1), 1)
    med = max(int(estat["contagem_medicos"] or 1), 1)

    features = {
        "urgency_level":      _COR_TO_URGENCY.get(ep["cortriagem"] or "verde", "Medium"),
        "nurse_ratio":        round(enf / pac, 4),
        "specialist_avail":   med,
        "facility_size_beds": int(estat["facility_size_beds"] or 100),
        "day_of_week":        dt.strftime("%A"),
        "time_of_day":        _hour_to_time_of_day(dt.hour),
        "season":             _month_to_season(dt.month),
    }

    # 4. Chamar o serviço IA via HTTP
    body = {
        "Urgency_Level":          features["urgency_level"],
        "Nurse_to_Patient_Ratio": features["nurse_ratio"],
        "Specialist_Availability": features["specialist_avail"],
        "Facility_Size_Beds":     features["facility_size_beds"],
        "Day_of_Week":            features["day_of_week"],
        "Time_of_Day":            features["time_of_day"],
        "Season":                 features["season"],
    }

    try:
        resp = httpx.post(f"{IA_URL}/predict/v1/wait-time", json=body, timeout=5.0)
        resp.raise_for_status()
        data = resp.json()
        urgency_key = features["urgency_level"]
        tempo_previsto = float(data.get(urgency_key, 0))
    except Exception as e:
        raise Exception(f"Serviço IA indisponível: {e}")

    # 5. Atualizar Triagem.TempoEsperaPrevisto na BD
    run_query("""
        UPDATE triagem SET tempoesperaprevisto = %s
        WHERE codepurgenc = %s
    """, (round(tempo_previsto), cod_ep_urgenc))

    # 6. Gravar auditoria em PredicaoIA
    predicao_ia_service.criar_predicao({
        "tipo_modelo":   "tempo_espera",
        "entidade":      "triagem",
        "entidade_id":   cod_ep_urgenc,
        "input_json":    features,
        "output_json":   {"tempo_espera_previsto_min": tempo_previsto},
        "score":         None,
        "modelo_versao": "xgboost_wait_time_v1",
        "sucesso":       True,
        "erro_mensagem": None,
    })