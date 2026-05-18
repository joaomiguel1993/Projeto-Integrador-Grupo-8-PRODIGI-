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


def get_predicao(db: Session, id_predicao: int) -> PredicaoIA | None:
    return db.query(PredicaoIA).filter(PredicaoIA.IdPredicao == id_predicao).first()


def list_predicoes_por_entidade(
    db: Session, entidade: str, entidade_id: int
) -> list[PredicaoIA]:
    return (
        db.query(PredicaoIA)
        .filter(
            PredicaoIA.Entidade == entidade,
            PredicaoIA.EntidadeId == entidade_id,
        )
        .order_by(PredicaoIA.CriadoEm.desc())
        .all()
    )