from fastapi import APIRouter, HTTPException, Request, Response
from typing import Dict
from pydantic import BaseModel, Field
from backend.auth.security import hash_password, verify_password
from backend.db import get_connection
from backend.dao.logs_dao import insert_log
from backend.auth.jwt_utils import create_access_token, create_refresh_token, decode_token


router = APIRouter(prefix="/v1/auth", tags=["Auth"])


def get_client_ip(request: Request) -> str:
    if hasattr(request, "client") and request.client is not None:
        return request.client.host
    return "127.0.0.1"  # fallback


class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)
    password: str = Field(..., min_length=4, max_length=255)
    role: str = Field(..., min_length=1, max_length=20)
    idfunc: int


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)
    password: str = Field(..., min_length=1, max_length=255)


@router.post("/register")
def register(data: RegisterRequest, request: Request):
    allowed_roles = {"medico", "enfermeiro", "admin", "rececionista"}

    if data.role not in allowed_roles:
        raise HTTPException(status_code=400, detail="Role inválido.")

    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT username FROM utilizador WHERE username = %s;", (data.username,))
        if cur.fetchone():
            raise HTTPException(status_code=409, detail="Username já existe.")

        cur.execute("SELECT idfunc, tipofunc FROM funcionario WHERE idfunc = %s;", (data.idfunc,))
        funcionario = cur.fetchone()

        if not funcionario:
            raise HTTPException(status_code=400, detail="Funcionário não existe.")

        _, tipo_func = funcionario

        if tipo_func != data.role:
            raise HTTPException(status_code=400, detail="A role indicada não corresponde ao tipo do funcionário.")

        password_hash = hash_password(data.password)

        cur.execute("""
            INSERT INTO utilizador (idfunc, username, password)
            VALUES (%s, %s, %s);
        """, (data.idfunc, data.username, password_hash))

        conn.commit()

        insert_log(
            username=data.username,
            acao="REGISTER",
            detalhe=f"Utilizador {data.username} registado com role {data.role}.",
            ip=get_client_ip(request),
        )

        return {
            "message": "Utilizador registado com sucesso.",
            "username": data.username,
            "role": data.role,
            "idfunc": data.idfunc,
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
def login(data: LoginRequest, request: Request, response: Response):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            SELECT username, password, idfunc, bloqueado
            FROM utilizador
            WHERE username = %s;
        """, (data.username,))
        user = cur.fetchone()

        if not user:
            raise HTTPException(status_code=401, detail="Credenciais inválidas.")

        username, password_hash, idfunc, bloqueado = user

        if bloqueado:
            raise HTTPException(status_code=403, detail="Utilizador bloqueado. Contacte o administrador.")

        if not verify_password(data.password, password_hash):
            raise HTTPException(status_code=401, detail="Credenciais inválidas.")

        cur.execute("SELECT f.nome, f.tipofunc FROM funcionario f WHERE f.idfunc = %s;", (idfunc,))
        funcionario = cur.fetchone()

        if not funcionario:
            raise HTTPException(status_code=404, detail="Funcionário não encontrado.")

        nome, role = funcionario
        nome = nome.strip() if nome else "Sem nome"

        hospitais = []

        if role in {"medico", "enfermeiro", "rececionista"}:
            cur.execute("""
                SELECT h.idhosp, h.nome, h.localizacao
                FROM trabalha t
                JOIN hospital h ON h.idhosp = t.idhosp
                WHERE t.idfunc = %s
                ORDER BY h.nome;
            """, (idfunc,))
            rows = cur.fetchall()
            for row in rows:
                hospitais.append({
                    "idhosp": row[0],
                    "nome": row[1],
                    "localizacao": row[2],
                })

        access_token  = create_access_token({"sub": username, "role": role, "idfunc": idfunc})
        refresh_token = create_refresh_token({"sub": username})

        insert_log(
            username=username,
            acao="LOGIN",
            detalhe="Login efetuado com sucesso.",
            ip=get_client_ip(request),
        )

        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            samesite="strict",
            max_age=60 * 60 * 24 * 7,  # 7 dias
            secure=False,  # True em produção com HTTPS
        )

        return {
            "message":      "Login efetuado com sucesso.",
            "access_token": access_token,
            "token_type":   "bearer",
            "username":     username,
            "nome":         nome,
            "role":         role,
            "idfunc":       idfunc,
            "hospitais":    hospitais,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro no login: {str(e)}")
    finally:
        cur.close()
        conn.close()

@router.post("/refresh")
def refresh(request: Request, response: Response):
    refresh_token = request.cookies.get("refresh_token")

    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token não encontrado.")

    payload = decode_token(refresh_token)

    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Token inválido.")

    username = payload.get("sub")
    if not username:
        raise HTTPException(status_code=401, detail="Token inválido.")

    access_token = create_access_token({"sub": username})

    return {
        "access_token": access_token,
        "token_type":   "bearer",
    }


@router.post("/logout")
def logout(response: Response, request: Request):
    username = request.headers.get("X-Username", "sistema")

    insert_log(
        username=username,
        acao="LOGOUT",
        detalhe="Sessão terminada pelo utilizador.",
        ip=get_client_ip(request),
    )

    response.delete_cookie("refresh_token")
    return {"message": "Sessão terminada com sucesso."}