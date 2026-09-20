# Reúne as configurações do backend e lê valores fornecidos por variáveis de ambiente.
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


# Representa as configurações usadas pela API, banco e integração com Supabase.
class Settings(BaseSettings):
    app_name: str = "StudyTrack IA API"
    database_url: str = ""
    supabase_url: str = ""
    supabase_service_role_key: str = ""
    cors_origins: list[str] = ["http://localhost:5173"]

    # Procura o arquivo .env na raiz quando a API é executada dentro de backend.
    model_config = SettingsConfigDict(env_file="../.env", extra="ignore")


# Mantém uma única instância das configurações durante a execução do processo.
@lru_cache
def get_settings() -> Settings:
    # Valida e converte os valores do ambiente usando o Pydantic Settings.
    return Settings()


# Disponibiliza as configurações para os demais módulos do backend.
settings = get_settings()
