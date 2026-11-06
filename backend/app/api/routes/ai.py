from fastapi import APIRouter

from app.schemas.ai import ChatRequest, ChatResponse
from app.services.ai import chat_with_tutor

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest) -> ChatResponse:
    """Recebe uma mensagem e envia ao tutor de IA."""
    return chat_with_tutor(payload)
