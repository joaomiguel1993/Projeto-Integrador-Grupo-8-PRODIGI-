from fastapi import APIRouter, HTTPException, Depends, status

from backend.auth.security import (
    create_access_token,
    get_current_user,
    get_user_by_username,
    verify_password,
)
from backend.schemas.auth import LoginRequest, TokenOut, UserAuthOut


router = APIRouter(prefix="/api/v1/auth", tags=["Autenticação"])


@router.post("/login", response_model=TokenOut)
def login(data: LoginRequest):
    result = get_user_by_username(data.username)

    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas.",
        )

    user = result[0]

    if user["bloqueado"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Utilizador bloqueado.",
        )

    if not verify_password(data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas.",
        )

    token_data = {
        "sub": str(user["idfunc"]),
        "username": user["username"],
        "role": user["role"],
        "tipofunc": user["tipofunc"],
    }
    access_token = create_access_token(token_data)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id_func": user["idfunc"],
            "username": user["username"],
            "bloqueado": user["bloqueado"],
            "role": user["role"],
            "nome": user["nome"],
            "tipofunc": user["tipofunc"],
            "email": user["email"],
            "telefone": user["telefone"],
            "foto_url": user["foto_url"],
        },
    }


@router.get("/me", response_model=UserAuthOut)
def me(current_user=Depends(get_current_user)):
    return {
        "id_func": current_user["idfunc"],
        "username": current_user["username"],
        "bloqueado": current_user["bloqueado"],
        "role": current_user["role"],
        "nome": current_user["nome"],
        "tipofunc": current_user["tipofunc"],
        "email": current_user["email"],
        "telefone": current_user["telefone"],
        "foto_url": current_user["foto_url"],
    }