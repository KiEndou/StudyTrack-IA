# StudyTrack IA

Aplicação web para organização da rotina acadêmica. O StudyTrack IA permite que estudantes organizem disciplinas e atividades, acompanhem prazos e visualizem seu progresso em um só lugar.

## Funcionalidades

- Cadastro, confirmação de e-mail, login e recuperação/alteração de senha por meio do Supabase Auth.
- Dashboard com resumo das atividades e da rotina acadêmica.
- Cadastro, edição e exclusão de disciplinas.
- Cadastro, edição e exclusão de atividades, com disciplina relacionada, tipo, prazo, peso, status e prioridade.
- Calendário para visualização dos prazos.
- Perfil do usuário.
- Página de desempenho baseada no acompanhamento da conclusão das atividades.
- Interface do Tutor, cuja integração com o serviço de IA deve ser considerada conforme a implementação final da equipe.

## Tecnologias

- **Frontend:** React, TypeScript, Vite e React Router.
- **Autenticação e banco de dados:** Supabase Auth e Supabase (PostgreSQL).
- **Backend de apoio:** Python e FastAPI (estrutura inicial da API).

> No estado atual do projeto, as principais funcionalidades do frontend consultam e persistem os dados diretamente no Supabase. A API FastAPI é uma estrutura complementar/inicial e não é necessária para iniciar o frontend.

## Estrutura do repositório

```text
StudyTrack-IA/
├── frontend/
│   ├── src/
│   │   ├── components/   # Componentes reutilizáveis
│   │   ├── contexts/     # Contextos, incluindo autenticação
│   │   ├── pages/        # Páginas da aplicação
│   │   ├── services/     # Integrações com Supabase e API
│   │   └── styles.css    # Estilos globais
│   ├── .env.example     # Exemplo das variáveis do frontend
│   └── package.json
├── backend/
│   ├── app/             # Aplicação FastAPI
│   └── requirements.txt
├── supabase/
│   └── 001_auth_profile_trigger.sql
├── .env.example         # Exemplo de configuração do backend
├── .gitignore
├── INTEGRACAO_SUPABASE.md
└── SUPABASE_AUTH_SETUP.md
```

## Pré-requisitos

- Node.js (versão compatível com Vite 7; recomenda-se Node.js 20.19+ ou 22.12+).
- npm.
- Um projeto no Supabase com as tabelas e políticas de acesso utilizadas pela aplicação.

## Configuração do Supabase

1. Crie um projeto no [Supabase](https://supabase.com/) ou utilize o projeto disponibilizado pela equipe.
2. No painel do Supabase, acesse **Project Settings → API** e copie a Project URL e a chave pública (`publishable` ou `anon`, conforme a opção exibida no painel).
3. No menu **Authentication → URL Configuration**, configure a URL local `http://localhost:5173` durante o desenvolvimento. Inclua também `http://localhost:5173/**` em **Redirect URLs**.
4. Confirme que as tabelas `usuarios`, `disciplinas` e `atividades`, suas relações e políticas de Row Level Security (RLS) estão configuradas.
5. Se estiver criando um banco novo, execute no SQL Editor o script `supabase/001_auth_profile_trigger.sql` para criar automaticamente o perfil em `public.usuarios` após o cadastro. Não é necessário executar novamente no banco compartilhado se o gatilho já estiver instalado.

A configuração detalhada da autenticação está em [`SUPABASE_AUTH_SETUP.md`](./SUPABASE_AUTH_SETUP.md), e o mapeamento das tabelas está em [`INTEGRACAO_SUPABASE.md`](./INTEGRACAO_SUPABASE.md).

## Executar o frontend localmente

No terminal, a partir da raiz do repositório:

```bash
cd frontend
```

Crie o arquivo local de variáveis de ambiente copiando o exemplo:

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env.local
```

**Linux/macOS:**

```bash
cp .env.example .env.local
```

Edite `frontend/.env.local` e informe os dados do seu projeto Supabase:

```env
VITE_API_URL=http://localhost:8000/api
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_PUBLICA_DO_SUPABASE
```

Instale as dependências e inicie o servidor:

```bash
npm install
npm run dev
```

A aplicação ficará disponível em `http://localhost:5173`.

Para gerar a versão de produção localmente:

```bash
npm run build
```

Os arquivos gerados ficam em `frontend/dist/`.

## Backend (opcional no fluxo atual do frontend)

A API FastAPI possui uma estrutura inicial e uma rota de verificação de saúde. Para executá-la, configure as variáveis necessárias no arquivo `.env` da raiz, utilizando `.env.example` como referência. Não compartilhe esse arquivo preenchido.

No Windows PowerShell:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

No Linux/macOS:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Quando iniciado, o backend fica disponível em `http://localhost:8000`; a documentação interativa pode ser acessada em `http://localhost:8000/docs` e a rota de saúde em `http://localhost:8000/api/health`.

## Publicação para avaliação

O frontend pode ser publicado em uma plataforma de hospedagem compatível com Vite, como Vercel ou Netlify:

1. Importe o repositório do GitHub na plataforma escolhida.
2. Configure a pasta raiz do projeto como `frontend`.
3. Configure o comando de build como `npm run build` e a pasta de saída como `dist`.
4. Cadastre no painel da hospedagem as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` com os valores do projeto Supabase.
5. Após a publicação, adicione o domínio gerado em **Authentication → URL Configuration → Redirect URLs** no Supabase.
6. Teste cadastro/login e as operações de dados pelo endereço publicado antes de enviar o link ao professor.

Se a aplicação utilizar futuramente endpoints da API FastAPI em produção, o backend também deverá ser publicado e `VITE_API_URL` deverá apontar para o endereço público da API.

## Segurança e variáveis de ambiente

- **Não envie `.env`, `.env.local` ou outros arquivos com credenciais reais para o Git.**
- Os arquivos `.env.example` contêm apenas nomes de variáveis e valores ilustrativos; eles servem como modelo de configuração.
- A chave pública (`publishable`/`anon`) do Supabase é destinada ao uso no cliente, mas os dados devem continuar protegidos por políticas RLS corretas.
- **Nunca coloque `service_role` ou qualquer segredo administrativo no frontend, no repositório ou em variáveis `VITE_*`.**
- O `.gitignore` do projeto já ignora arquivos de ambiente e mantém os arquivos `.env.example` versionáveis.

## Observações sobre o modelo de dados e funcionalidades

- A página **Desempenho** apresenta o progresso de conclusão das atividades. O schema atual não possui uma tabela específica de notas/avaliações; portanto, essa tela não deve ser interpretada como boletim de notas.
- Alguns campos complementares do perfil ainda são mantidos localmente, pois não possuem colunas correspondentes na estrutura atual do banco.
- A disponibilidade do Tutor com respostas geradas por IA depende da integração do serviço/API correspondente.

## Equipe e repositório

Consulte o histórico de commits e os colaboradores cadastrados no repositório GitHub do projeto para identificar a participação da equipe.
