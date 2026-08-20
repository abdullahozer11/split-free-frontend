-- Align public.update_group with the hosted signature (PGRST202).
-- Hosted PostgREST expects currency_input, description_input, group_id_input,
-- member_names_input, title_input. Local still had the four-argument overload.
-- Safe to re-run: drops every public.update_group overload, then recreates one.

do $$
declare
  r record;
begin
  for r in
    select p.oid::regprocedure as fn
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'update_group'
  loop
    execute 'drop function if exists ' || r.fn;
  end loop;
end $$;

create or replace function public.update_group(
  group_id_input integer,
  title_input text,
  description_input text,
  member_names_input text[],
  currency_input text
)
returns void
language plpgsql
as $function$
begin
  update public.groups
  set title = title_input,
      description = description_input,
      currency = currency_input
  where id = group_id_input;

  delete from public.members
  where group_id = group_id_input
    and name not in (select unnest(member_names_input));

  for i in 1..coalesce(array_length(member_names_input, 1), 0) loop
    if not exists (
      select 1
      from public.members
      where members.name = member_names_input[i]
        and members.group_id = group_id_input
    ) then
      insert into public.members (name, group_id)
      values (member_names_input[i], group_id_input);
    end if;
  end loop;
end;
$function$;

grant all on function public.update_group(
  integer,
  text,
  text,
  text[],
  text
) to anon, authenticated, service_role;

notify pgrst, 'reload schema';
