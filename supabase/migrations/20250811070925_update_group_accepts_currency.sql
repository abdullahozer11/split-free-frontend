drop function if exists "public"."update_group"(group_id_input integer, title_input text, description_input text, member_names_input text[]);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.update_group(group_id_input integer, title_input text, description_input text, member_names_input text[], currency_input text)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Update groups row, including currency
    UPDATE groups
        SET title = title_input,
            description = description_input,
            currency = currency_input  -- New field for currency
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


