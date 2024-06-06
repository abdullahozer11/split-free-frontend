CREATE OR REPLACE FUNCTION get_groups_summary()
RETURNS TABLE (
    id BIGINT,
    settled BOOLEAN,
    title TEXT,
    expense_count BIGINT,
    member_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        g.id,
        g.settled,
        g.title,
        COUNT(DISTINCT e.id) AS expense_count,
        COUNT(DISTINCT m.id) AS member_count
    FROM
        groups g
    LEFT JOIN
        members m ON g.id = m.group_id AND m.visible
    LEFT JOIN
        expenses e ON g.id = e.group_id
    GROUP BY
        g.id, g.settled, g.title;
END;
$$ LANGUAGE plpgsql;
