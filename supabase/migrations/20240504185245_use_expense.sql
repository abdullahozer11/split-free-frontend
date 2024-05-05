CREATE OR REPLACE FUNCTION use_expense(expense_id_input bigint)
    RETURNS TABLE
            (
                amount          float4,
                id              bigint,
                title           TEXT,
                currency        TEXT,
                description     TEXT,
                date            timestamp,
                last_modified   timestamptz,
                group_id        bigint,
                payers          JSONB,
                participants    JSONB,
                payer_ids       JSONB,
                participant_ids JSONB
            )
AS
$$
BEGIN
    RETURN QUERY
        SELECT expenses.amount,
               expenses.id,
               expenses.title,
               expenses.currency,
               expenses.description,
               expenses.date,
               expenses.last_modified,
               expenses.group_id,
               jsonb_agg(DISTINCT jsonb_build_object('id', payer_members.id, 'name', payer_members.name, 'avatar_url',
                                                     payer_profiles.avatar_url))                     AS payers,
               jsonb_agg(DISTINCT jsonb_build_object('id', participant_members.id, 'name', participant_members.name,
                                                     'avatar_url', participant_profiles.avatar_url)) AS participants,
               jsonb_agg(DISTINCT expense_payers.member)                                             AS payer_ids,
               jsonb_agg(DISTINCT expense_participants.member)                                       AS participant_ids
        FROM expenses
                 JOIN
             expense_payers ON expenses.id = expense_payers.expense
                 JOIN
             expense_participants ON expenses.id = expense_participants.expense
                 JOIN
             members AS payer_members ON expense_payers.member = payer_members.id
                 JOIN
             members AS participant_members ON expense_participants.member = participant_members.id
                 left JOIN
             profiles as payer_profiles ON payer_members.profile = payer_profiles.id
                 left JOIN
             profiles as participant_profiles ON participant_members.profile = participant_profiles.id
        WHERE expenses.id = expense_id_input
        GROUP BY expenses.amount,
                 expenses.id,
                 expenses.title,
                 expenses.description,
                 expenses.date,
                 expenses.last_modified,
                 expenses.group_id;

END;
$$ LANGUAGE plpgsql;
