from sqlalchemy import (
    Column,
    BigInteger,
    Integer,
    String,
    Boolean,
    Numeric,
    JSON,
    TIMESTAMP,
)
from sqlalchemy.sql import func
from .session import Base


class PredicaoIA(Base):
    __tablename__ = "predicaoia"  # ajusta ao nome real na BD se for diferente

    IdPredicao = Column(BigInteger, primary_key=True, index=True)
    TipoModelo = Column(String(50), nullable=False)
    Entidade = Column(String(50), nullable=False)
    EntidadeId = Column(Integer, nullable=False)
    InputJson = Column(JSON, nullable=False)
    OutputJson = Column(JSON, nullable=False)
    Score = Column(Numeric(10, 6))
    ModeloVersao = Column(String(100), nullable=False)
    Sucesso = Column(Boolean, nullable=False, default=True)
    ErroMensagem = Column(String, nullable=True)
    CriadoEm = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=func.now(),
    )