set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.exit_group(_profile_id uuid, _group_id bigint)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
    UPDATE members
    SET profile = NULL
    WHERE profile = _profile_id
        AND group_id = _group_id;
    
END;
$function$
;


