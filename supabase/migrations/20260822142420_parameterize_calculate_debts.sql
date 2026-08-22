-- Bind group_id and optional expense_id instead of concatenating them into
-- EXECUTE (issue #97). A later text filter should be another bound argument
-- or a static format() fragment, not string concat of values.

CREATE OR REPLACE FUNCTION algo.calculate_debts_per_expenses(group_id_input bigint, expense_id_input bigint DEFAULT NULL::bigint)
 RETURNS SETOF integer
 LANGUAGE plpgsql
AS $function$
DECLARE
    rec RECORD;
    old_rec RECORD;
    affected_members integer[] := '{}';
BEGIN
    -- Collect old affected members and targeted delete in incremental mode
    IF expense_id_input IS NOT NULL THEN
        -- Collect unique old lenders/borrowers before delete
        FOR old_rec IN
            SELECT DISTINCT lender AS member FROM debts_per_expense WHERE group_id = group_id_input AND expense = expense_id_input
            UNION
            SELECT DISTINCT borrower AS member FROM debts_per_expense WHERE group_id = group_id_input AND expense = expense_id_input
        LOOP
            IF NOT old_rec.member = ANY(affected_members) THEN
                affected_members := affected_members || old_rec.member;
            END IF;
        END LOOP;

        DELETE FROM debts_per_expense WHERE group_id = group_id_input AND expense = expense_id_input;
    ELSE
        DELETE FROM debts_per_expense WHERE group_id = group_id_input;
    END IF;

    -- Bind ids with USING. Optional incremental filter stays a bound bigint
    -- so a later text filter can be another $n instead of concat.
    FOR rec IN EXECUTE
        $sql$
        SELECT
            e.id AS expense_id,
            epr.member AS participant,
            epy.member AS payer,
            (e.amount / (SELECT COUNT(*)
                        FROM expense_participants ep
                        WHERE ep.expense = e.id) / (SELECT COUNT(*) FROM expense_payers epy2 WHERE epy2.expense = e.id))::NUMERIC(10,2) AS debt_per_expense_amount
        FROM expense_participants epr
        JOIN expenses AS e ON e.id = epr.expense
        JOIN expense_payers AS epy ON epy.expense = epr.expense
        WHERE epr.member != epy.member
          AND e.settled != true
          AND epr.group_id = $1
          AND ($2::bigint IS NULL OR e.id = $2)
        $sql$
        USING group_id_input, expense_id_input
    LOOP
        INSERT INTO debts_per_expense (group_id, lender, borrower, expense, amount)
        VALUES (group_id_input, rec.payer, rec.participant, rec.expense_id, rec.debt_per_expense_amount);

        -- Collect unique new payers/participants
        IF NOT rec.payer = ANY(affected_members) THEN
            affected_members := affected_members || rec.payer;
        END IF;
        IF NOT rec.participant = ANY(affected_members) THEN
            affected_members := affected_members || rec.participant;
        END IF;
    END LOOP;

    -- Return the unique set of affected members
    RETURN QUERY SELECT DISTINCT unnest(affected_members);
END;$function$;
