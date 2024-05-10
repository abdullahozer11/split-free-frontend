CREATE OR REPLACE FUNCTION search_friends(keyword_input TEXT, profile_id_input UUID, limit_input INT DEFAULT 10, offset_input INT DEFAULT 0)
RETURNS TABLE (
    id UUID,
    email TEXT,
    friend_status TEXT
) AS
$$
BEGIN
    RETURN QUERY
    SELECT p.id,
           p.email,
           p.avatar_url,
           CASE
               WHEN f.friend = profile_id_input THEN 'FRIEND'
               ELSE 'AVAILABLE'
           END AS friend_status
    FROM profiles p
    LEFT JOIN friends f ON f.profile = p.id
    WHERE p.email ILIKE keyword_input || '%'
    LIMIT limit_input
    OFFSET offset_input;
END;
$$
LANGUAGE plpgsql;
