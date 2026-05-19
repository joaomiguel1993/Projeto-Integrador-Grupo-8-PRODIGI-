from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext

from backend.db import run_query


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = "troca-isto-por-uma-chave-longa-e-segura"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 8

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def hash_password(password: str) -> str:
    if not isinstance(password, str) or not password.strip():
        raise ValueError("Password inválida.")
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not plain_password or not hashed_password:
        return False
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return False


def create_access_token(data: dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict[str, Any]:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError as e:
        raise ValueError("Token inválido.") from e


def get_user_by_username(username: str):
    return run_query("""
        SELECT u.idfunc, u.username, u.password, u.bloqueado, u.role,
               f.nome, f.tipofunc, f.email, f.telefone, f.foto_url
        FROM utilizador u
        JOIN funcionario f ON f.idfunc = u.idfunc
        WHERE u.username = %s
        LIMIT 1
    """, (username,))


def get_user_by_id(id_func: int):
    return run_query("""
        SELECT u.idfunc, u.username, u.bloqueado, u.role,
               f.nome, f.tipofunc, f.email, f.telefone, f.foto_url
        FROM utilizador u
        JOIN funcionario f ON f.idfunc = u.idfunc
        WHERE u.idfunc = %s
        LIMIT 1
    """, (id_func,))


def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = decode_token(token)
        sub = payload.get("sub")
        if sub is None:
            raise ValueError("Token sem subject.")
        id_func = int(sub)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Não autenticado.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = get_user_by_id(id_func)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Utilizador não encontrado.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user[0]