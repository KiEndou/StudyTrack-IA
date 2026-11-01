# Configuração da autenticação do StudyTrack IA

## 1. Configurar as variáveis do frontend

Crie `frontend/.env.local` a partir de `frontend/.env.example` e preencha:

- `VITE_SUPABASE_URL`: URL do projeto Supabase compartilhado.
- `VITE_SUPABASE_ANON_KEY`: chave pública/anon do mesmo projeto.

Não coloque a `service_role` no frontend. Ela nunca deve ser exposta no navegador.

## 2. Criar o perfil automaticamente

No SQL Editor do projeto Supabase, execute o conteúdo de `supabase/001_auth_profile_trigger.sql`.

O gatilho cria uma linha em `public.usuarios` após a criação de um usuário em `auth.users`, usando o mesmo UUID e os metadados `nome` e `curso` enviados pelo formulário de cadastro. Os campos de data são preenchidos com `now()`.

O script é idempotente para a função e para o gatilho. Ele não altera as políticas RLS existentes e não faz backfill de contas antigas.

## 3. Confirmar URLs de autenticação

Em Authentication → URL Configuration, confira:

- Site URL: endereço local durante o desenvolvimento (normalmente `http://localhost:5173`).
- Redirect URLs: adicione `http://localhost:5173/**` para testes locais e o domínio publicado quando houver deploy.

Se a confirmação de e-mail estiver habilitada, o cadastro mostrará uma mensagem para verificar a caixa de entrada. O login só funcionará depois da confirmação.

## 4. Executar

Na pasta `frontend`:

```bash
npm install
npm run dev
```

As rotas privadas redirecionam para `/login` quando não há sessão. O frontend usa a chave pública do Supabase e depende das políticas RLS para proteger os dados.
