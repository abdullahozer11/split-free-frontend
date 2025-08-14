create policy "groups_select"
on "public"."groups"
as permissive
for select
to public
using (utils.is_member_of(auth.uid(), id));



set check_function_bodies = off;

CREATE OR REPLACE FUNCTION utils.is_member_of(_person_id uuid, _group_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$DECLARE
    _is_member BOOLEAN;
BEGIN
    -- Check if the person is a member of the group
    SELECT EXISTS (
        SELECT 1
        FROM members mb
        WHERE mb.group_id = _group_id
          AND mb.profile = _person_id
    ) INTO _is_member;


    RETURN _is_member;
END;$function$
;


