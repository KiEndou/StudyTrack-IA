create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.usuarios (id, nome, curso, created_at, updated_at)
  values (
    new.id,
    nullif(trim(new.raw_user_meta_data ->> 'nome'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'curso'), ''),
    now(),
    now()
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Evita que a função seja chamada diretamente por clientes comuns.
revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon;
revoke all on function public.handle_new_user() from authenticated;

-- Evita duplicar o gatilho caso este script seja executado novamente.
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
