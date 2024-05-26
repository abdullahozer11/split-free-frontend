CREATE OR REPLACE FUNCTION get_member_id(_person_id UUID, _group_id bigINT)
RETURNS INT AS $$
DECLARE
    member_id INT;
BEGIN
    SELECT id INTO member_id
    FROM members
    WHERE profile = _person_id
      AND group_id = _group_id;

    RETURN member_id;
END;
$$ LANGUAGE plpgsql;
