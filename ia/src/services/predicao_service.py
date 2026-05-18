from sqlalchemy.orm import Session
from ..db.models import PredicaoIA
from ..schemas.predicao import PredicaoCreate

def create_predicao(db: Session, data: PredicaoCreate) -> PredicaoIA:
    obj = PredicaoIA(
        TipoModelo=data.tipo_modelo,
        Entidade=data.entidade,
        EntidadeId=data.entidade_id,
        InputJson=data.input_json,
        OutputJson=data.output_json,
        Score=data.score,
        ModeloVersao=data.modelo_versao,
        Sucesso=data.sucesso,
        ErroMensagem=data.erro_mensagem,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj