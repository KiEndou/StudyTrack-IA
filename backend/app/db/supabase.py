# Centraliza a criação do cliente usado para acessar o Supabase no backend.
from supabase import Client, create_client

from app.core.config import settings


# Cria um cliente autenticado com a chave privada destinada ao servidor.
def get_supabase_client() -> Client:
    # Interrompe a operação com uma mensagem clara quando o ambiente não foi configurado.
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise RuntimeError("Supabase credentials are not configured")
    # Retorna o cliente que poderá ser usado pelos serviços de negócio.
    return create_client(settings.supabase_url, settings.supabase_service_role_key)
