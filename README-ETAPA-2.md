# StudyTrack — Etapa 2: autenticação do Tutor

Esta atualização protege o chat da IA e prepara o frontend para enviar mensagens com a sessão do Supabase.

## Arquivos incluídos

- `backend/app/core/security.py` — valida o access token do Supabase Auth.
- `backend/app/api/routes/ai.py` — exige usuário autenticado para conversar com a IA.
- `backend/app/api/routes/users.py` — implementa `/api/users/me` com o usuário real da sessão.
- `frontend/src/services/api.ts` — mantém o health check e adiciona `sendAiMessage()` com Bearer token.

## Como aplicar

Extraia o ZIP na raiz do projeto `StudyTrack` e substitua os arquivos quando o Windows perguntar. Não substitua seu `.env` e não apague a `.venv`.

## Configuração necessária

No `.env` da raiz, confira se existem estas variáveis com seus valores reais:

```env
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
GROQ_API_KEY=sua-chave-groq
GROQ_MODEL=openai/gpt-oss-120b
```

A `SUPABASE_SERVICE_ROLE_KEY` e a `GROQ_API_KEY` são privadas: ficam somente no `.env` da raiz, nunca no frontend e nunca no Git.

## Como executar

Na raiz do projeto, com a `.venv` ativada:

```powershell
python -m pip install -r backend/requirements.txt
cd backend
python -m uvicorn app.main:app --reload
```

## Como testar a autenticação no Swagger

1. Abra o StudyTrack no navegador e entre com um usuário cadastrado.
2. Pressione `F12` e abra a aba **Application** (ou **Aplicativo**).
3. Em **Local Storage**, selecione a origem do frontend (`http://localhost:5173`).
4. Procure a chave que começa com `sb-` e termina com `-auth-token`.
5. Abra o valor JSON dessa chave e copie o valor de `access_token`. Não copie nem compartilhe o refresh token.
6. Abra `http://127.0.0.1:8000/docs`, clique em **Authorize** e cole somente o access token. O Swagger adiciona o prefixo Bearer automaticamente.
7. Teste primeiro `GET /api/users/me`. Deve retornar o ID e o e-mail do usuário autenticado.
8. Teste `POST /api/ai/chat` com:

```json
{
  "message": "Olá! Você consegue me ajudar a organizar meus estudos?",
  "history": []
}
```

Sem token ou com token inválido, a API deve responder `401 Unauthorized`. Isso é esperado e confirma que o endpoint não está mais público.

## Observações

- O histórico enviado em `history` ainda é temporário e fornecido pelo frontend. Nesta etapa não existe persistência de conversas no banco.
- `sendAiMessage(message, history)` está pronto no serviço do frontend, mas ainda não foi conectado visualmente à página do Tutor.
- O backend valida o token no Supabase Auth a cada requisição protegida. O identificador do usuário não é enviado à Groq.
- Não cole tokens, chaves ou valores do `.env` em mensagens, prints ou commits.
