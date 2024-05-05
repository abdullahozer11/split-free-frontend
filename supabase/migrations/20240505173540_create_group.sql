CREATE OR REPLACE FUNCTION create_group(
    title_input TEXT,
    member_names_input TEXT[]
)
RETURNS BIGINT
AS
$$
DECLARE
    group_id BIGINT;
BEGIN
    -- Insert row into groups table
    INSERT INTO groups(title, owner)
    VALUES (title_input, profile_id_input)
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
$$
LANGUAGE plpgsql;
