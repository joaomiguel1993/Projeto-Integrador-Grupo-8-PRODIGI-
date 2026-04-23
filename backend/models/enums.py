from enum import Enum

class SexoEnum(str, Enum):
    M = "M"
    F = "F"

class TipoFuncEnum(str, Enum):
    medico = "medico"
    enfermeiro = "enfermeiro"
    admin = "admin"

class EstadoEpEnum(str, Enum):
    aberto = "aberto"
    em_triagem = "em_triagem"
    em_atendimento = "em_atendimento"
    internado = "internado"
    terminado = "terminado"

class CorTriagemEnum(str, Enum):
    vermelho = "vermelho"
    laranja = "laranja"
    amarelo = "amarelo"
    verde = "verde"
    azul = "azul"

class TipoAltaEnum(str, Enum):
    clinica = "clinica"
    voluntaria = "voluntaria"
    transferencia = "transferencia"
    obito = "obito"