CREATE OR REPLACE FUNCTION get_friends(profile_id_input UUID)
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    avatar_url TEXT,
    balance float4,
    email TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT pr.id as id, pr.full_name, pr.avatar_url, pr.balance, pr.email
    FROM friends fr
    JOIN profiles pr ON fr.friend = pr.id
    WHERE fr.profile = profile_id_input;
END;
$$ LANGUAGE plpgsql;
