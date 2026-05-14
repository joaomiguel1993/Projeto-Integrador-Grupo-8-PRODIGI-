import os
from datetime import date, datetime

import httpx
from fastapi import HTTPException

from backend.db import run_query
from backend.services import predicao_ia_service

IA_URL = os.getenv("IA_URL", "http://prodigi_ia:8001")

# Mapeamento cor PT → cor EN (output do modelo)
_PULSEIRA_EN_TO_PT = {
    "Red":    "vermelho",
    "Orange": "laranja",
    "Yellow": "amarelo",
    "Green":  "verde",
    "Blue":   "azul",
}


def _calcular_idade(datanasc) -> int:
    hoje = date.today()
    if isinstance(datanasc, str):
        datanasc = date.fromisoformat(datanasc)
    return hoje.year - datanasc.year - (
        (hoje.month, hoje.day) < (datanasc.month, datanasc.day)
    )


def prever_triagem(cod_ep_urgenc: int) -> dict:
    """
    Após criar uma triagem, chama o serviço IA para prever a cor da pulseira
    e compara com a cor atribuída pelo enfermeiro.
    Grava auditoria em PredicaoIA.
    Devolve dict com cor_prevista_ia e concordancia.
    """
    # 1. Buscar triagem + utente
    rows = run_query("""
        SELECT
            t.cortriagem,
            t.temperatura,
            t.freqcard,
            t.spo2,
            t.niveldor,
            t.consciencia,
            u.datanasc
        FROM triagem t
        JOIN epurgencia e ON e.codepurgenc = t.codepurgenc
        JOIN utente u ON u.numutent = e.numutent
        WHERE t.codepurgenc = %s
    """, (cod_ep_urgenc,))

    if not rows:
        raise HTTPException(status_code=404, detail="Triagem não encontrada.")
    row = rows[0]

    idade = _calcular_idade(row["datanasc"])

    features = {
        "Age":            idade,
        "Heart_Rate_BPM": int(row["freqcard"] or 80),
        "SpO2_Percent":   int(row["spo2"] or 98),
        "Temperature_C":  float(row["temperatura"] or 37.0),
        "Pain_Level":     int(row["niveldor"] or 0),
        "Consciousness":  row["consciencia"] or "Acordado",
    }

    # 2. Chamar serviço IA
    try:
        resp = httpx.post(f"{IA_URL}/predict/v1/triage", json=features, timeout=5.0)
        resp.raise_for_status()
        data = resp.json()
        pulseira_en = data.get("pulseira", "Yellow")
    except Exception as e:
        print(f"[IA] Aviso: predição de triagem falhou — {e}")
        return None

    cor_prevista_ia = _PULSEIRA_EN_TO_PT.get(pulseira_en, "amarelo")
    cor_enfermeiro  = row["cortriagem"]
    concordancia    = cor_prevista_ia == cor_enfermeiro

    # 3. Gravar auditoria
    try:
        predicao_ia_service.criar_predicao({
            "tipo_modelo":   "triagem",
            "entidade":      "triagem",
            "entidade_id":   cod_ep_urgenc,
            "input_json":    features,
            "output_json":   {
                "cor_prevista_ia": cor_prevista_ia,
                "cor_enfermeiro":  cor_enfermeiro,
                "concordancia":    concordancia,
            },
            "score":         None,
            "modelo_versao": "xgboost_triagem_v1",
            "sucesso":       True,
            "erro_mensagem": None,
        })
    except Exception as e:
        print(f"[IA] Aviso: auditoria de triagem falhou — {e}")

    return {
        "cor_prevista_ia": cor_prevista_ia,
        "cor_enfermeiro":  cor_enfermeiro,
        "concordancia":    concordancia,
    }