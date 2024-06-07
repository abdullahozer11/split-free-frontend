CREATE OR REPLACE FUNCTION settle_group(_id BIGINT)
RETURNS VOID AS $$
BEGIN
    -- Update the 'settled' field in the 'expenses' table
    UPDATE expenses
    SET settled = TRUE
    WHERE group_id = _id;

    -- Delete related records from the 'balances' table
    DELETE FROM balances
    WHERE group_id = _id;

    -- Set group status to settled
    UPDATE groups
    SET settled = TRUE
    WHERE id = _id;

    -- Perform post expense to recalculate ideal debts
    PERFORM algo.post_expense(_id);
END;
$$ LANGUAGE plpgsql;
