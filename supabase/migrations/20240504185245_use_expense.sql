CREATE OR REPLACE FUNCTION use_expense(expense_id_input bigint)
RETURNS TABLE (
    amount float4,
    id bigint,
    title TEXT,
    settled BOOLEAN,
    currency TEXT,
    description TEXT,
    date timestamp,
    last_modified timestamptz,
    group_id bigint,
    payers JSONB,
    participants JSONB,
    payer_ids JSONB,
    participant_ids JSONB
) AS $$
BEGIN
    RETURN QUERY
        SELECT
        expenses.amount,
        expenses.id,
        expenses.title,
        expenses.settled,
        expenses.currency,
        expenses.description,
        expenses.date,
        expenses.last_modified,
        expenses.group_id,
        COALESCE(jsonb_agg(DISTINCT jsonb_build_object('id', payer_members.id, 'name', payer_members.name, 'avatar_url', payer_profiles.avatar_url)) FILTER (WHERE payer_members.id IS NOT NULL), '[]') AS payers,
        COALESCE(jsonb_agg(DISTINCT jsonb_build_object('id', participant_members.id, 'name', participant_members.name, 'avatar_url', participant_profiles.avatar_url)) FILTER (WHERE participant_members.id IS NOT NULL), '[]') AS participants,
        COALESCE(jsonb_agg(DISTINCT expense_payers.member) FILTER (WHERE expense_payers.member IS NOT NULL), '[]') AS payer_ids,
        COALESCE(jsonb_agg(DISTINCT expense_participants.member) FILTER (WHERE expense_participants.member IS NOT NULL), '[]') AS participant_ids
    FROM
        expenses
    LEFT JOIN
        expense_payers ON expenses.id = expense_payers.expense
    LEFT JOIN
        expense_participants ON expenses.id = expense_participants.expense
    LEFT JOIN
        members AS payer_members ON expense_payers.member = payer_members.id
    LEFT JOIN
        members AS participant_members ON expense_participants.member = participant_members.id
    LEFT JOIN
        profiles AS payer_profiles ON payer_members.profile = payer_profiles.id
    LEFT JOIN
        profiles AS participant_profiles ON participant_members.profile = participant_profiles.id
    WHERE
        expenses.id = expense_id_input
    GROUP BY
        expenses.amount,
        expenses.id,
        expenses.title,
        expenses.settled,
        expenses.description,
        expenses.date,
        expenses.last_modified,
        expenses.group_id;

END;
$$ LANGUAGE plpgsql;
