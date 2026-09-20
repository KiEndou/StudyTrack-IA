# Importa a classe base e os modelos para que o SQLAlchemy conheça as tabelas do projeto.
from app.models.base import Base
from app.models.user import User

# Define os objetos que podem ser importados como parte do registro do banco.
__all__ = ["Base", "User"]
