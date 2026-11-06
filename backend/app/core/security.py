"""Dependências de autenticação compartilhadas pelas rotas protegidas."""

from typing import Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supabase import create_client

from app.core.config import settings

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> Any:
    """Valida o access token no Supabase Auth e retorna o usuário autenticado."""

    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Autenticação necessária. Envie um token Bearer do Supabase.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not settings.supabase_url or not settings.supabase_anon_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="A configuração pública do Supabase não foi encontrada no backend.",
        )

    try:
        supabase = create_client(
            settings.supabase_url,
            settings.supabase_anon_key,
        )

        response = supabase.auth.get_user(credentials.credentials)
        user = response.user

        if user is None:
            raise ValueError("Token sem usuário associado")

        return user

    except Exception as exc:
        print("ERRO:", type(exc).__name__)
        print("MENSAGEM:", str(exc))

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sessão inválida ou expirada. Entre novamente no StudyTrack.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from None
