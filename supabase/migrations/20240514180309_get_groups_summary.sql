CREATE OR REPLACE FUNCTION get_groups_summary()
RETURNS TABLE (
    id BIGINT,
    status TEXT,
    title TEXT,
    expense_count INT,
    member_count INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        g.id,
        g.status,
        g.title,
        COUNT(DISTINCT e.id) AS expense_count,
        COUNT(DISTINCT m.id) AS member_count
    FROM
        groups g
    LEFT JOIN
        members m ON g.id = m.group_id
    LEFT JOIN
        expenses e ON g.id = e.group_id
    GROUP BY
        g.id, g.status, g.title;
END;
$$ LANGUAGE plpgsql;
