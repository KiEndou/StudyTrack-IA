# Define a classe base compartilhada pelos modelos persistidos no banco.
from sqlalchemy.orm import DeclarativeBase


# Os modelos do StudyTrack herdarão desta classe para usar o mapeamento ORM.
class Base(DeclarativeBase):
    pass
