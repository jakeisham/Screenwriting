-- Writers' Room sync schema. Paste this into Supabase → SQL Editor → New query → Run.
-- One table holds every synced record (projects, daily activity, settings) as JSON.
-- Row Level Security means each signed-in user can only ever see their own rows.

create table if not exists public.items (
  user_id    uuid    not null default auth.uid() references auth.users on delete cascade,
  id         text    not null,
  type       text    not null,
  data       jsonb   not null,
  updated_at bigint  not null,           -- client edit time (ms); newest edit wins
  deleted    boolean not null default false,
  server_ts  timestamptz not null default now(),  -- used to pull changes since last sync
  primary key (user_id, id)
);

create index if not exists items_user_server_ts on public.items (user_id, server_ts);

alter table public.items enable row level security;

drop policy if exists "Own items" on public.items;
create policy "Own items" on public.items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Upsert a batch, keeping whichever version was edited most recently.
create or replace function public.push_items(payload jsonb)
returns void
language sql
security invoker
as $$
  insert into public.items (user_id, id, type, data, updated_at, deleted, server_ts)
  select auth.uid(), x.id, x.type, x.data, x.updated_at, coalesce(x.deleted, false), now()
  from jsonb_to_recordset(payload) as x(id text, type text, data jsonb, updated_at bigint, deleted boolean)
  on conflict (user_id, id) do update
    set type = excluded.type,
        data = excluded.data,
        updated_at = excluded.updated_at,
        deleted = excluded.deleted,
        server_ts = now()
    where public.items.updated_at < excluded.updated_at;
$$;

grant execute on function public.push_items(jsonb) to authenticated;
