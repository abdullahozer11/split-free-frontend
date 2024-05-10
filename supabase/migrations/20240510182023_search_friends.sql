CREATE OR REPLACE FUNCTION search_friends(keyword_input TEXT, profile_id_input UUID, limit_input INT DEFAULT 10, offset_input INT DEFAULT 0)
RETURNS TABLE (
    id UUID,
    email TEXT,
    avatar_url TEXT,
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
               WHEN fr.sender = profile_id_input THEN 'SENT'
               WHEN fr.receiver = profile_id_input THEN 'RECEIVED'
               ELSE 'AVAILABLE'
           END AS friend_status
    FROM profiles p
    LEFT JOIN friends f ON f.profile = p.id
    LEFT JOIN friend_requests fr ON fr.sender = p.id OR fr.receiver = p.id
    WHERE p.email ILIKE keyword_input || '%'
    LIMIT limit_input
    OFFSET offset_input;
END;
$$
LANGUAGE plpgsql;
