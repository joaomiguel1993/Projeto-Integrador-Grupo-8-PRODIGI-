from datetime import timedelta

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from backend.db import run_query, get_connection
from backend.auth.security import verify_password, hash_password, create_access_token

router = APIRouter(
    prefix="/auth",
    tags=["Autenticação"]
)


class RegisterRequest(BaseModel):
    username: str
    password: str
    role: str
    numfunc: int | None = None


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/register")
def register(data: RegisterRequest):
    verificar_query = """
        SELECT username
        FROM utilizador
        WHERE username = %s;
    """
    existe = run_query(verificar_query, (data.username,))

    if isinstance(existe, dict) and "erro" in existe:
        raise HTTPException(status_code=400, detail=existe["erro"])

    if existe:
        raise HTTPException(
            status_code=400,
            detail="Já existe um utilizador com esse username"
        )

    password_hash = hash_password(data.password)

    con = None
    cur = None
    try:
        con = get_connection()
        cur = con.cursor()

        insert_query = """
            INSERT INTO utilizador (username, passwordhash, role, numfunc)
            VALUES (%s, %s, %s, %s);
        """
        cur.execute(insert_query, (
            data.username,
            password_hash,
            data.role,
            data.numfunc
        ))
        con.commit()

        return {"msg": "Utilizador criado com sucesso"}

    except Exception as e:
        if con:
            con.rollback()
        raise HTTPException(status_code=400, detail=str(e))

    finally:
        if cur:
            cur.close()
        if con:
            con.close()


@router.post("/login")
def login(data: LoginRequest):
    query = """
        SELECT username, passwordhash, role
        FROM utilizador
        WHERE username = %s;
    """
    resultado = run_query(query, (data.username,))

    if isinstance(resultado, dict) and "erro" in resultado:
        raise HTTPException(status_code=400, detail=resultado["erro"])

    if not resultado:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Utilizador ou password inválidos"
        )

    utilizador = resultado[0]

    if not verify_password(data.password, utilizador["passwordhash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Utilizador ou password inválidos"
        )

    access_token = create_access_token(
        data={
            "sub": utilizador["username"],
            "role": utilizador["role"]
        },
        expires_delta=timedelta(minutes=30)
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": utilizador["role"]
    }