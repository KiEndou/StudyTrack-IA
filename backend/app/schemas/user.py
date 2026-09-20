# Schemas Pydantic usados para validar e documentar dados de usuário.
from pydantic import BaseModel, ConfigDict, EmailStr


# Campos compartilhados entre criação e resposta de usuário.
class UserBase(BaseModel):
    email: EmailStr | None = None
    full_name: str | None = None


# Estrutura reservada para receber novos usuários em uma futura rota de cadastro.
class UserCreate(UserBase):
    pass


# Contrato devolvido pela API ao consultar um usuário.
class UserResponse(UserBase):
    id: str
    # Permite converter objetos SQLAlchemy diretamente para este schema.
    model_config = ConfigDict(from_attributes=True)
