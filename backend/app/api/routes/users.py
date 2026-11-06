"""Endpoints relacionados ao usuário atualmente autenticado."""
from typing import Any

from fastapi import APIRouter, Depends

from app.core.security import get_current_user
from app.schemas.user import UserResponse

router = APIRouter()


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(user: Any = Depends(get_current_user)) -> UserResponse:
    """Retorna os dados básicos do usuário validados pelo Supabase Auth."""
    metadata = user.user_metadata or {}
    full_name = (
        metadata.get("nome")
        or metadata.get("full_name")
        or metadata.get("name")
    )
    return UserResponse(
        id=str(user.id),
        email=user.email,
        full_name=full_name,
    )
