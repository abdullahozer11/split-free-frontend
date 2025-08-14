drop policy "user can create group for himself" on "public"."groups";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_group(title_input text, member_names_input text[], currency_input text)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$ 
DECLARE 
    group_id BIGINT; 
BEGIN 
    -- Insert row into groups table
    INSERT INTO groups(title, owner, currency) 
    VALUES (title_input, auth.uid(), currency_input) 
    RETURNING id INTO group_id;

    -- Insert members one by one and link to the group created
    FOR i IN 1..array_length(member_names_input, 1) LOOP 
        IF i = 1 THEN 
            -- first item is the owner different logic applies here
            INSERT INTO members (name, group_id, profile, role) 
            VALUES (member_names_input[i], group_id, auth.uid(), 'owner');
        ELSE 
            -- For other list items, insert them into the members table
            INSERT INTO members (name, group_id) 
            VALUES (member_names_input[i], group_id);
        END IF; 
    END LOOP;

    -- Finally, return the newly created group row id
    RETURN group_id; 
END; 
$function$
;

CREATE OR REPLACE FUNCTION public.exit_group(_profile_id uuid, _group_id bigint)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
    DELETE FROM members
    WHERE profile = _profile_id
        AND group_id = _group_id;
    
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_group(group_id_input integer, title_input text, description_input text, member_names_input text[], currency_input text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$ 
BEGIN 
    -- Update groups row, including currency 
    UPDATE groups 
        SET title = title_input, 
            description = description_input, 
            currency = currency_input 
        WHERE id = group_id_input; 

    -- Remove members who are not in the list 
    DELETE FROM members 
    WHERE group_id = group_id_input 
    AND name NOT IN (SELECT unnest(member_names_input)); 

    -- Add members 
    FOR i IN 1..array_length(member_names_input, 1) LOOP 
        IF NOT EXISTS (SELECT 1 FROM members WHERE members.name = member_names_input[i]) THEN 
            INSERT INTO members (name, group_id)  
            VALUES (member_names_input[i], group_id_input); 
        END IF; 
    END LOOP; 
END; 
$function$
;

create policy "user can create group for himself"
on "public"."groups"
as permissive
for insert
to authenticated, anon
with check (true);



