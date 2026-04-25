from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from backend.auth.security import hash_password, verify_password
from backend.db import get_connection

router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)

class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)
    password: str = Field(..., min_length=4, max_length=255)
    role: str = Field(..., min_length=1, max_length=20)
    idfunc: int

class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)
    password: str = Field(..., min_length=1, max_length=255)

@router.post("/register")
def register(data: RegisterRequest):
    allowed_roles = {"medico", "enfermeiro", "admin", "rececionista"}

    if data.role not in allowed_roles:
        raise HTTPException(status_code=400, detail="Role inválido.")

    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            SELECT username
            FROM utilizador
            WHERE username = %s;
        """, (data.username,))
        existing_user = cur.fetchone()

        if existing_user:
            raise HTTPException(status_code=409, detail="Username já existe.")

        cur.execute("""
            SELECT idfunc, tipofunc
            FROM funcionario
            WHERE idfunc = %s;
        """, (data.idfunc,))
        funcionario = cur.fetchone()

        if not funcionario:
            raise HTTPException(status_code=400, detail="Funcionário não existe.")

        _, tipo_func = funcionario

        if tipo_func != data.role:
            raise HTTPException(
                status_code=400,
                detail="A role indicada não corresponde ao tipo do funcionário."
            )

        password_hash = hash_password(data.password)

        cur.execute("""
            INSERT INTO utilizador (idfunc, username, password)
            VALUES (%s, %s, %s);
        """, (data.idfunc, data.username, password_hash))

        conn.commit()

        return {
            "message": "Utilizador registado com sucesso.",
            "username": data.username,
            "role": data.role,
            "idfunc": data.idfunc
        }

    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Erro no registo: {str(e)}")
    finally:
        cur.close()
        conn.close()

@router.post("/login")
def login(data: LoginRequest):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            SELECT username, password, idfunc
            FROM utilizador
            WHERE username = %s;
        """, (data.username,))
        user = cur.fetchone()

        if not user:
            raise HTTPException(status_code=401, detail="Credenciais inválidas.")

        username, password_hash, idfunc = user

        if not verify_password(data.password, password_hash):
            raise HTTPException(status_code=401, detail="Credenciais inválidas.")

        cur.execute("""
            SELECT tipofunc
            FROM funcionario
            WHERE idfunc = %s;
        """, (idfunc,))
        funcionario = cur.fetchone()

        role = funcionario[0] if funcionario else None

        return {
            "message": "Login efetuado com sucesso.",
            "username": username,
            "role": role,
            "idfunc": idfunc
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro no login: {str(e)}")
    finally:
        cur.close()
        conn.close()
