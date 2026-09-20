# Centraliza os grupos de rotas expostos pelo backend.
from fastapi import APIRouter

# Importa os endpoints de saúde e do usuário autenticado.
from app.api.routes.health import router as health_router
from app.api.routes.users import router as users_router

# Cria o roteador que será incluído pela aplicação principal.
api_router = APIRouter()
# Mantém os endpoints organizados por responsabilidade e tag na documentação.
api_router.include_router(health_router, tags=["health"])
api_router.include_router(users_router, prefix="/users", tags=["users"])
