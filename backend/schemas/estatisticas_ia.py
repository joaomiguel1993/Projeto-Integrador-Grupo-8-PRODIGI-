from pydantic import BaseModel, ConfigDict


class EstatisticasIAOut(BaseModel):
    id_hosp: int
    hospital_nome: str
    facility_size_beds: int | None = None
    contagem_enfermeiros: int
    contagem_medicos: int
    pacientes_ativos: int

    model_config = ConfigDict(from_attributes=True)