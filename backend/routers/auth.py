from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from backend.auth.security import hash_password, verify_password
from backend.db import get_connection

router = APIRouter(prefix="/api/auth", tags=["Auth"])


class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)
    password: str = Field(..., min_length=4, max_length=255)
    role: str = Field(..., min_length=1, max_length=20)
    idfunc: Optional[int] = None


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)
    password: str = Field(..., min_length=1, max_length=255)


@router.post("/register")
def register(data: RegisterRequest):
    allowed_roles = {"medico", "enfermeiro", "admin"}

    if data.role not in allowed_roles:
        raise HTTPException(status_code=400, detail="Role inválido.")

    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            """
            SELECT username
            FROM utilizador
            WHERE username = %s;
            """,
            (data.username,)
        )
        existing_user = cur.fetchone()

        if existing_user:
            raise HTTPException(status_code=409, detail="Username já existe.")

        password_hash = hash_password(data.password)

        cur.execute(
            """
            INSERT INTO utilizador (username, passwordhash, funcao, idfunc)
            VALUES (%s, %s, %s, %s);
            """,
            (data.username, password_hash, data.role, data.idfunc)
        )

        conn.commit()

        return {
            "message": "Utilizador registado com sucesso.",
            "username": data.username,
            "role": data.role
        }

    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        if "violates foreign key constraint" in str(e):
            raise HTTPException(
                status_code=400,
                detail="Número de funcionário inválido: esse funcionário não existe."
            )
        raise HTTPException(status_code=500, detail=f"Erro no registo: {str(e)}")
    finally:
        cur.close()
        conn.close()


@router.post("/login")
def login(data: LoginRequest):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            """
            SELECT username, passwordhash, funcao
            FROM utilizador
            WHERE username = %s;
            """,
            (data.username,)
        )
        user = cur.fetchone()

        if not user:
            raise HTTPException(status_code=401, detail="Credenciais inválidas.")

        username, password_hash, role = user

        if not verify_password(data.password, password_hash):
            raise HTTPException(status_code=401, detail="Credenciais inválidas.")

        return {
            "message": "Login efetuado com sucesso.",
            "username": username,
            "role": role
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro no login: {str(e)}")
    finally:
        cur.close()
        conn.close()