# Imports para fácil uso nos routers
from .utentes_repository import listar_utentes, obter_utente, criar_utente
from .episodios_repository import (
    listar_episodios, listar_episodios_hospital, obter_episodio, criar_episodio
)
from .hospitais_repository import listar_hospitais, obter_hospital, criar_hospital
from .atos_repository import listar_atos, listar_atos_episodio, criar_ato_basico
from .internamentos_repository import (
    listar_internados, listar_internados_hospital, obter_internamento, criar_internamento
)
from .triagens_repository import (
    listar_triagens, listar_triagens_hospital, obter_triagem, 
    criar_triagem_basica, criar_triagem_completa
)
from .profissionais_repository import listar_profissionais, obter_profissional
from .prescricoes_repository import listar_prescricoes, listar_prescricoes_episodio, criar_prescricao

__all__ = [
    "listar_utentes", "obter_utente", "criar_utente",
    "listar_episodios", "listar_episodios_hospital", "obter_episodio", "criar_episodio",
    "listar_hospitais", "obter_hospital", "criar_hospital",
    "listar_atos", "listar_atos_episodio", "criar_ato_basico",
    "listar_internados", "listar_internados_hospital", "obter_internamento", "criar_internamento",
    "listar_triagens", "listar_triagens_hospital", "obter_triagem", 
    "criar_triagem_basica", "criar_triagem_completa",
    "listar_profissionais", "obter_profissional",
    "listar_prescricoes", "listar_prescricoes_episodio", "criar_prescricao"
]