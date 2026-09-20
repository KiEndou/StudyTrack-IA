# Schema da resposta usada pelo endpoint de verificação da API.
from datetime import datetime

from pydantic import BaseModel


# Define os dados necessários para informar o estado do serviço.
class HealthResponse(BaseModel):
    status: str
    service: str
    timestamp: datetime
