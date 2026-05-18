from pydantic import BaseModel
from typing import Optional


class TriageInput(BaseModel):
    idade: int
    sexo: str                      # 'M' ou 'F'
    temperatura: float
    freq_card: int
    freq_resp: int
    spo2: float
    sistolica: int
    diastolica: int
    nivel_dor: int
    queixa_principal: str          # dor_toracica, dispneia, ...
    via_aerea: str                 # permeavel, comprometida, ...
    respiracao_circulacao: str     # normal, dispneia_ligeira, ...
    hemorragia: str                # nenhuma, ligeira, ...
    consciencia: str               # alerta, confuso, ...
    estado_pele: Optional[str] = None
    mobilidade: Optional[str] = None
    tipo_dor: Optional[str] = None


class TriagePrediction(BaseModel):
    cor_triagem: str               # vermelho, laranja, amarelo, ...
    score: float
    explicacao: Optional[str] = None
    modelo_versao: str