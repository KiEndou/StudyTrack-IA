# Define a rota usada pelo frontend para verificar a disponibilidade da API.
from datetime import UTC, datetime

from fastapi import APIRouter

# O schema garante um formato consistente para a resposta de saúde.
from app.schemas.health import HealthResponse

# Roteador local dos endpoints de monitoramento básico.
router = APIRouter()


# Retorna o estado atual e o horário da verificação do backend.
@router.get("/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    # Usa UTC para que o horário seja comparável em qualquer ambiente.
    return HealthResponse(status="ok", service="studytrack-api", timestamp=datetime.now(UTC))
