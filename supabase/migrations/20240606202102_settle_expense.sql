CREATE OR REPLACE FUNCTION settle_expense(expense_id BIGINT, _group_id BIGINT, _settled BOOLEAN)
RETURNS VOID AS $$
BEGIN
    -- Update the 'settled' field in the 'expenses' table
    UPDATE expenses
    SET settled = _settled
    WHERE id = expense_id;

    -- Delete related records from the 'balances' table
    DELETE FROM balances
    WHERE expense = expense_id;

    -- Perform post expense to recalculate ideal debts
    PERFORM algo.post_expense(_group_id);

    -- Check if all expenses in the group are settled
    IF NOT EXISTS (
        SELECT 1
        FROM expenses
        WHERE group_id = _group_id AND settled = FALSE
    ) THEN
        -- If all expenses are settled, update the group as settled
        UPDATE groups
        SET settled = TRUE
        WHERE id = _group_id;
    END IF;
END;
$$ LANGUAGE plpgsql;
