# Modelo SQLAlchemy que representa o usuário armazenado no PostgreSQL.
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


# Mantém os dados básicos necessários para identificar e exibir um usuário.
class User(Base):
    # Nome da tabela correspondente no banco de dados.
    __tablename__ = "users"

    # Identificador primário do usuário, compatível com UUID em formato textual.
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    # O e-mail pode ser nulo nesta etapa, mas não pode se repetir quando informado.
    email: Mapped[str | None] = mapped_column(String(255), unique=True)
    # Nome usado para personalizar a experiência do estudante.
    full_name: Mapped[str | None] = mapped_column(String(255))
