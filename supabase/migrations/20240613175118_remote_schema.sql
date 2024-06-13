drop policy "users can see their own groups activity log" on "public"."activity_logs";

drop policy "users can create balances for their group" on "public"."balances";

drop policy "users can access debts of their groups" on "public"."debts";

drop policy "users can update debts for their groups" on "public"."debts";

drop policy "auth and anon users can fetch expense categories" on "public"."expense_categories";

drop policy "users can add expenses in their groups" on "public"."expenses";

drop policy "users can update expenses in their group" on "public"."expenses";

drop policy "auth_anon_can_insert_friend_req" on "public"."friend_requests";

drop policy "friend_request_side_can_delete" on "public"."friend_requests";

drop policy "only_update_status" on "public"."friend_requests";

drop policy "user can create friend for himself" on "public"."friends";

drop policy "sender can insert" on "public"."group_invitations";

drop policy "sender or receiver can access" on "public"."group_invitations";

drop policy "sender or receiver can delete" on "public"."group_invitations";

drop policy "group owner can delete group" on "public"."groups";

drop policy "select_groups_policy" on "public"."groups";

drop policy "user can update members for his group" on "public"."members";

drop policy "Users can insert their own profile." on "public"."profiles";

drop policy "Users can update own profile." on "public"."profiles";

drop policy "users can view all profiles" on "public"."profiles";

drop policy "users can interact with transfers in their group" on "public"."transfers";

drop function if exists "public"."accept_group_invite"(_profile_id uuid, _group_id bigint);

drop function if exists "public"."assign_new_member"(_profile_id uuid, _member_id bigint);

alter table "public"."members" drop column "visible";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.deleteuser()
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
   delete from auth.users where id = auth.uid();
$function$
;

CREATE OR REPLACE FUNCTION public.self_assign_to(_member_id bigint, _group_id bigint)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE members
  SET profile = auth.uid()
  WHERE id = _member_id;

  DELETE FROM group_invitations
  WHERE receiver = auth.uid() AND group_id = _group_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_groups_summary()
 RETURNS TABLE(id bigint, settled boolean, title text, expense_count bigint, member_count bigint)
 LANGUAGE plpgsql
AS $function$BEGIN
    RETURN QUERY
    SELECT
        g.id,
        g.settled,
        g.title,
        COUNT(DISTINCT e.id) AS expense_count,
        COUNT(DISTINCT m.id) AS member_count
    FROM
        groups g
    LEFT JOIN
        members m ON g.id = m.group_id
    LEFT JOIN
        expenses e ON g.id = e.group_id
    GROUP BY
        g.id, g.settled, g.title;
END;$function$
;

create policy "a user can delete his own profile"
on "public"."profiles"
as permissive
for delete
to anon, authenticated
using ((id = auth.uid()));


create policy "users can see their own groups activity log"
on "public"."activity_logs"
as permissive
for select
to anon, authenticated
using (utils.is_member_of(auth.uid(), group_id));


create policy "users can create balances for their group"
on "public"."balances"
as permissive
for insert
to anon, authenticated
with check (utils.is_member_of(auth.uid(), group_id));


create policy "users can access debts of their groups"
on "public"."debts"
as permissive
for all
to anon, authenticated
using (utils.is_member_of(auth.uid(), group_id));


create policy "users can update debts for their groups"
on "public"."debts"
as permissive
for update
to anon, authenticated
using (true)
with check (utils.is_member_of(auth.uid(), group_id));


create policy "auth and anon users can fetch expense categories"
on "public"."expense_categories"
as permissive
for select
to anon, authenticated
using (true);


create policy "users can add expenses in their groups"
on "public"."expenses"
as permissive
for insert
to anon, authenticated
with check (utils.is_member_of(auth.uid(), group_id));


create policy "users can update expenses in their group"
on "public"."expenses"
as permissive
for update
to anon, authenticated
using (true)
with check (utils.is_member_of(auth.uid(), group_id));


create policy "auth_anon_can_insert_friend_req"
on "public"."friend_requests"
as permissive
for insert
to anon, authenticated
with check ((sender = auth.uid()));


create policy "friend_request_side_can_delete"
on "public"."friend_requests"
as permissive
for delete
to anon, authenticated
using (((sender = auth.uid()) OR (receiver = auth.uid())));


create policy "only_update_status"
on "public"."friend_requests"
as permissive
for update
to anon, authenticated
using ((receiver = auth.uid()));


create policy "user can create friend for himself"
on "public"."friends"
as permissive
for insert
to anon, authenticated
with check (((profile = auth.uid()) OR (friend = auth.uid())));


create policy "sender can insert"
on "public"."group_invitations"
as permissive
for insert
to anon, authenticated
with check ((sender = auth.uid()));


create policy "sender or receiver can access"
on "public"."group_invitations"
as permissive
for select
to anon, authenticated
using (((sender = auth.uid()) OR (receiver = auth.uid())));


create policy "sender or receiver can delete"
on "public"."group_invitations"
as permissive
for delete
to anon, authenticated
using (((sender = auth.uid()) OR (receiver = auth.uid())));


create policy "group owner can delete group"
on "public"."groups"
as permissive
for delete
to anon, authenticated
using ((owner = auth.uid()));


create policy "select_groups_policy"
on "public"."groups"
as permissive
for select
to anon, authenticated
using (((id IN ( SELECT members.group_id
   FROM members
  WHERE (members.profile = auth.uid()))) OR (owner = auth.uid()) OR (EXISTS ( SELECT 1
   FROM group_invitations gi
  WHERE ((gi.receiver = auth.uid()) AND (gi.group_id = groups.id))))));


create policy "user can update members for his group"
on "public"."members"
as permissive
for update
to anon, authenticated
using (true)
with check (utils.is_member_of(auth.uid(), group_id));


create policy "Users can insert their own profile."
on "public"."profiles"
as permissive
for insert
to anon, authenticated
with check ((auth.uid() = id));


create policy "Users can update own profile."
on "public"."profiles"
as permissive
for update
to anon, authenticated
using ((auth.uid() = id));


create policy "users can view all profiles"
on "public"."profiles"
as permissive
for select
to anon, authenticated
using (true);


create policy "users can interact with transfers in their group"
on "public"."transfers"
as permissive
for all
to anon, authenticated
using (utils.is_member_of(auth.uid(), group_id));



