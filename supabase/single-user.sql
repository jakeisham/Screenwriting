-- Writers' Room: single-owner mode (no sign-in). Run once in Supabase → SQL Editor, after schema.sql.
-- Every device syncs as the same owner. There is no login, so anyone who has the site's
-- address could read or change this data. To go back to accounts, run schema.sql again.

-- All rows belong to one fixed owner id instead of a signed-in user.
alter table public.items drop constraint if exists items_user_id_fkey;
alter table public.items alter column user_id set default '00000000-0000-0000-0000-0000000a11e0';

drop policy if exists "Own items" on public.items;
drop policy if exists "Owner items" on public.items;
create policy "Owner items" on public.items
  for all to anon, authenticated
  using (user_id = '00000000-0000-0000-0000-0000000a11e0')
  with check (user_id = '00000000-0000-0000-0000-0000000a11e0');

create or replace function public.push_items(payload jsonb)
returns void
language sql
security invoker
as $$
  insert into public.items (user_id, id, type, data, updated_at, deleted, server_ts)
  select '00000000-0000-0000-0000-0000000a11e0', x.id, x.type, x.data, x.updated_at, coalesce(x.deleted, false), now()
  from jsonb_to_recordset(payload) as x(id text, type text, data jsonb, updated_at bigint, deleted boolean)
  on conflict (user_id, id) do update
    set type = excluded.type,
        data = excluded.data,
        updated_at = excluded.updated_at,
        deleted = excluded.deleted,
        server_ts = now()
    where public.items.updated_at < excluded.updated_at;
$$;

grant execute on function public.push_items(jsonb) to anon, authenticated;
grant select, insert, update on public.items to anon;
