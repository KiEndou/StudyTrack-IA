# Reúne as configurações do backend e lê valores fornecidos por variáveis de ambiente.
from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

ENV_FILE = Path(__file__).resolve().parents[3] / ".env"


# Representa as configurações usadas pela API, banco e integrações externas.
class Settings(BaseSettings):
    app_name: str = "StudyTrack IA API"
    database_url: str = ""
    supabase_url: str = ""
    supabase_service_role_key: str = ""
    supabase_anon_key: str = ""
    groq_api_key: str = ""
    groq_model: str = "openai/gpt-oss-120b"
    cors_origins: list[str] = ["http://localhost:5173"]

    # Resolve o .env a partir deste arquivo, independentemente da pasta de execução.
    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE),
        env_file_encoding="utf-8",
        extra="ignore",
    )


# Mantém uma única instância das configurações durante a execução do processo.
@lru_cache
def get_settings() -> Settings:
    return Settings()


# Disponibiliza as configurações para os demais módulos do backend.
settings = get_settings()
