# Arquivo principal responsável por criar e configurar a API do StudyTrack IA.
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importa as rotas agrupadas e as configurações carregadas do ambiente.
from app.api.router import api_router
from app.core.config import settings

# Cria a aplicação FastAPI com o nome definido nas configurações do projeto.
app = FastAPI(title=settings.app_name, version="0.1.0")

# Permite que o frontend Vite se comunique com esta API durante o desenvolvimento.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Publica as rotas da aplicação sob o prefixo comum /api.
app.include_router(api_router, prefix="/api")


# Rota raiz usada para confirmar que a aplicação foi carregada.
@app.get("/", tags=["root"])
def root() -> dict[str, str]:
    # Retorna uma mensagem simples para identificar a API.
    return {"message": "StudyTrack IA API"}
