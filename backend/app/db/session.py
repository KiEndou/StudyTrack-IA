# Prepara a conexão SQLAlchemy com o PostgreSQL configurado no ambiente.
from sqlalchemy import create_engine

from app.core.config import settings

# Evita criar uma conexão até que DATABASE_URL seja configurada.
# Essa preparação permite integrar o banco sem exigir credenciais locais agora.
engine = create_engine(settings.database_url) if settings.database_url else None
