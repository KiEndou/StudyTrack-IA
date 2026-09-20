# Contém endpoints relacionados ao usuário atualmente autenticado.
from fastapi import APIRouter

# O schema define o contrato que o frontend receberá.
from app.schemas.user import UserResponse

# Roteador local das operações de usuário.
router = APIRouter()


# Retorna um contrato provisório enquanto a autenticação ainda está sendo integrada.
@router.get("/me", response_model=UserResponse)
def get_current_user() -> UserResponse:
    # O identificador indica que a autenticação real ainda será conectada.
    return UserResponse(id="pending-auth", email=None, full_name=None)
