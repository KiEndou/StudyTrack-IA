# StudyTrack IA

Base de uma agenda de estudos com assistente de IA para ajudar estudantes a organizar disciplinas, atividades e prazos.

## Tecnologias

- Frontend: React, TypeScript, Vite e React Router
- Backend: Python, FastAPI, Pydantic e SQLAlchemy
- Banco e autenticação: Supabase/PostgreSQL e Supabase Auth

## Estrutura do projeto

```text
frontend/
	src/
		components/  Componentes reutilizáveis
		pages/       Telas principais
		services/    Comunicação com APIs e Supabase
		hooks/       Hooks personalizados
		types/       Tipos TypeScript
backend/
	app/
		api/         Rotas FastAPI
		models/      Modelos do banco
		schemas/     Schemas de entrada e saída
		services/    Regras de negócio futuras
		core/        Configurações centrais
```

## Configuração

Copie `.env.example` para `.env` na raiz e preencha as credenciais do Supabase. Para o frontend, copie também as variáveis `VITE_*` para `frontend/.env.local` quando necessário.

O arquivo `.env` real é ignorado pelo Git. Nunca coloque senhas, tokens ou chaves diretamente no código.

## Instalação e execução

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

O endpoint inicial fica em `GET http://localhost:8000/api/health`. A documentação interativa está em `http://localhost:8000/docs`.

## Rotas iniciais

- `GET /api/health`: verifica se a API esta funcionando.
- `GET /api/users/me`: contrato inicial do usuário autenticado.
