-- Settle individual expense using debts_per_expense table
CREATE OR REPLACE FUNCTION public.settle_expense(expense_id bigint, _group_id bigint)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
    debt_record RECORD;
BEGIN
    -- Create transfer records from debts_per_expense for this specific expense
    FOR debt_record IN
        SELECT borrower, lender, amount
        FROM debts_per_expense
        WHERE expense = expense_id
    LOOP
        INSERT INTO transfers (created_at, sender, receiver, amount, group_id)
        VALUES (
            NOW(),
            debt_record.borrower,
            debt_record.lender,
            debt_record.amount,
            _group_id
        );
    END LOOP;

    -- Update the 'settled' field in the 'expenses' table
    UPDATE expenses
    SET settled = TRUE
    WHERE id = expense_id;

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
END;$function$;

-- Settle entire group using debts table
CREATE OR REPLACE FUNCTION public.settle_group(_id bigint)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
    debt_record RECORD;
BEGIN
    -- Create transfer records from debts table for this group
    FOR debt_record IN
        SELECT borrower, lender, amount
        FROM debts
        WHERE group_id = _id
    LOOP
        INSERT INTO transfers (created_at, sender, receiver, amount, group_id)
        VALUES (
            NOW(),
            debt_record.borrower,
            debt_record.lender,
            debt_record.amount,
            _id
        );
    END LOOP;

    -- Update the 'settled' field in the 'expenses' table
    UPDATE expenses
    SET settled = TRUE
    WHERE group_id = _id;

    -- Set group status to settled
    UPDATE groups
    SET settled = TRUE
    WHERE id = _id;

    -- Perform post expense to recalculate ideal debts
    PERFORM algo.post_expense(_id);
END;$function$;
