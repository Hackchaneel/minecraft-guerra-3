create table if not exists public.mg3_announcements_state (
  id boolean primary key default true check (id),
  items jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.mg3_announcements_state enable row level security;
revoke all on public.mg3_announcements_state from anon, authenticated;
grant select on public.mg3_announcements_state to anon, authenticated;
drop policy if exists "Public can view MG3 announcements" on public.mg3_announcements_state;
create policy "Public can view MG3 announcements"
  on public.mg3_announcements_state for select to anon, authenticated using (true);

insert into public.mg3_announcements_state (id, items)
values (true, '[{"id":"story-chapters","text":"Capítulos novos da História Disponíveis!!","href":"/historia","icon":"📕","cta":"LER AGORA →"}]'::jsonb)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'mg3_announcements_state'
  ) then
    alter publication supabase_realtime add table public.mg3_announcements_state;
  end if;
end $$;
