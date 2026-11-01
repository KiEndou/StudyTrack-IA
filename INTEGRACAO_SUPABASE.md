# Integração do frontend com o Supabase

O frontend usa as tabelas que já existem no projeto compartilhado:

- `usuarios`: `id`, `nome`, `curso`, `created_at`, `updated_at`.
- `disciplinas`: `id`, `usuario_id`, `nome`, `professor`, `cor`, `created_at`, `updated_at`.
- `atividades`: `id`, `usuario_id`, `disciplina_id`, `titulo`, `descricao`, `tipo`, `data_entrega`, `peso`, `status`, `prioridade`, `created_at`, `updated_at`.

## Mapeamento de atividades

O frontend mantém nomes amigáveis em inglês internamente, mas converte os dados para os nomes e valores aceitos pelo banco:

- `title` -> `titulo`
- `description` -> `descricao`
- `subject_id` -> `disciplina_id`
- `activity_type` -> `tipo` (`assignment`/`exam`/`task` são gravados como `trabalho`/`prova`/`tarefa`)
- `due_date` -> `data_entrega`
- `weight` -> `peso`
- `user_id` -> `usuario_id`
- `pending`/`in_progress`/`completed`/`cancelled` -> `pendente`/`em_andamento`/`concluida`/`cancelada`

A consulta depende das políticas RLS já existentes para limitar cada usuário aos próprios registros. Não é necessário executar outro SQL para esta atualização.

## Limitação da página Desempenho

O schema atual não possui uma tabela de avaliações/notas nem colunas de nota em `disciplinas`. Por isso, a página Desempenho foi adaptada para apresentar progresso de conclusão das atividades. O registro de notas deve ser implementado depois de definir e criar a tabela de avaliações.

## Perfil

Nome e curso são sincronizados com `usuarios` e com os metadados do usuário autenticado. Instituição, período e apresentação pessoal ainda são mantidos localmente, pois não existem colunas correspondentes no schema atual.
