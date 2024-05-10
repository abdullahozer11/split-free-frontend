CREATE OR REPLACE FUNCTION is_group_owner(_person_id UUID, _group_id BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM groups gr
        WHERE gr.id = _group_id
        AND gr.owner = _person_id
    );
END;
$$ LANGUAGE plpgsql;
