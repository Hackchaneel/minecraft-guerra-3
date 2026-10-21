create table if not exists public.mg3_secrets_state (
  id boolean primary key default true check (id),
  items jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.mg3_secrets_state enable row level security;
revoke all on public.mg3_secrets_state from anon, authenticated;
grant select on public.mg3_secrets_state to anon, authenticated;
drop policy if exists "Public can view MG3 secrets" on public.mg3_secrets_state;
create policy "Public can view MG3 secrets"
  on public.mg3_secrets_state for select to anon, authenticated using (true);

insert into public.mg3_secrets_state (id, items)
values (true, '[
  {"id":"secret-1","title":"SEGREDO 01","text":"Uma revelação ainda está por vir.","image":null,"imagePath":null},
  {"id":"secret-2","title":"SEGREDO 02","text":"Uma revelação ainda está por vir.","image":null,"imagePath":null},
  {"id":"secret-3","title":"SEGREDO 03","text":"Uma revelação ainda está por vir.","image":null,"imagePath":null},
  {"id":"secret-4","title":"SEGREDO 04","text":"Uma revelação ainda está por vir.","image":null,"imagePath":null},
  {"id":"secret-5","title":"SEGREDO 05","text":"Uma revelação ainda está por vir.","image":null,"imagePath":null}
]'::jsonb)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('mg3-secret-images', 'mg3-secret-images', true, 3145728, array['image/webp'])
on conflict (id) do update set public = true, file_size_limit = 3145728, allowed_mime_types = array['image/webp'];

drop policy if exists "Public can view MG3 secret images" on storage.objects;
create policy "Public can view MG3 secret images"
  on storage.objects for select to anon, authenticated using (bucket_id = 'mg3-secret-images');

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'mg3_secrets_state'
  ) then
    alter publication supabase_realtime add table public.mg3_secrets_state;
  end if;
end $$;
