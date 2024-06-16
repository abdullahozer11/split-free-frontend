drop function if exists "public"."create_expense"(group_id_input integer, title_input text, description_input text, category_input text, amount_input real, currency_input text, date_input timestamp without time zone, proof_input text, payers_input integer[], participants_input integer[]);

drop function if exists "public"."update_expense"(expense_id integer, title_input text, description_input text, category_input text, amount_input real, date_input timestamp without time zone, currency_input text, proof_input text, payers_input integer[], participants_input integer[]);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_expense(group_id_input integer, title_input text, description_input text, amount_input real, currency_input text, date_input timestamp without time zone, proof_input text, payers_input integer[], participants_input integer[], category_input text DEFAULT 'shopping'::text)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$DECLARE
    expense_id BIGINT;
    payers_length INT;
    participants_length INT;
    amount_dif_payer DECIMAL;
    amount_dif_participant DECIMAL;
BEGIN
    -- Get the lengths of the input arrays
    payers_length := array_length(payers_input, 1);
    participants_length := array_length(participants_input, 1);

    -- Calculate the difference amount
    amount_dif_payer := (amount_input / payers_length)::DECIMAL;
    amount_dif_participant := (amount_input / participants_length)::DECIMAL;

    -- Insert row into expenses table
    INSERT INTO expenses(group_id, title, description, currency, amount, date, proof, category)
    VALUES (group_id_input, title_input, description_input, currency_input, amount_input, date_input, proof_input, category_input)
    RETURNING id INTO expense_id;

    -- Insert payers one by one and link to the expense created
    FOR i IN 1..payers_length LOOP
        -- Create payers
        INSERT INTO expense_payers (expense, member, group_id)
        VALUES (expense_id, payers_input[i], group_id_input);

        -- Insert new balance for payer
        INSERT INTO balances (amount, owner, group_id, expense)
        VALUES (amount_dif_payer, payers_input[i], group_id_input, expense_id);

    END LOOP;

    -- Insert participants one by one and link to the expense created
    FOR i IN 1..participants_length LOOP
        -- Create participants
        INSERT INTO expense_participants (expense, member, group_id)
        VALUES (expense_id, participants_input[i], group_id_input);

        -- Insert or update balance for participant
        begin
            INSERT INTO balances (amount, owner, group_id, expense)
            VALUES (-amount_dif_participant, participants_input[i], group_id_input, expense_id);
        EXCEPTION WHEN unique_violation THEN
            UPDATE balances SET amount = amount_dif_payer - amount_dif_participant
            WHERE owner = participants_input[i] AND group_id = group_id_input AND expense = expense_id;
        end;

    END LOOP;

    -- post expense actions are grouped up
    PERFORM algo.post_expense(group_id_input);

    -- Finally, return the newly created expense row id
    RETURN expense_id;
END;$function$
;

CREATE OR REPLACE FUNCTION public.update_expense(expense_id integer, title_input text, description_input text, amount_input real, date_input timestamp without time zone, currency_input text, proof_input text, payers_input integer[], participants_input integer[], category_input text DEFAULT 'shopping'::text)
 RETURNS void
 LANGUAGE plpgsql
AS $function$DECLARE
    _group_id BIGINT;
    payers_length INT;
    participants_length INT;
    amount_dif_payer DECIMAL;
    amount_dif_participant DECIMAL;
    old_amount DECIMAL;
    changes_made BOOLEAN := FALSE;
BEGIN
    -- Pre-update cleanup on balances
    DELETE FROM balances
    WHERE expense = expense_id;

    -- Get the lengths of the input arrays
    payers_length := array_length(payers_input, 1);
    participants_length := array_length(participants_input, 1);

    -- Calculate the difference amount
    amount_dif_payer := (amount_input / payers_length)::DECIMAL;
    amount_dif_participant := (amount_input / participants_length)::DECIMAL;

    SELECT group_id, amount INTO _group_id, old_amount
    FROM expenses
    WHERE id = expense_id;

    -- Update row in expenses table
    IF amount_input != old_amount THEN
        changes_made := TRUE;
    END IF;

    UPDATE expenses
    SET title = title_input,
        description = description_input,
        amount = amount_input,
        currency = currency_input,
        category = category_input,
        date = date_input,
        proof = proof_input
    WHERE id = expense_id;

    -- Remove deleted payers
    DELETE FROM expense_payers
    WHERE expense = expense_id
    AND member NOT IN (SELECT unnest(payers_input));
    
    IF FOUND THEN
        changes_made := TRUE;
    END IF;

    -- Remove deleted participants
    DELETE FROM expense_participants
    WHERE expense = expense_id
    AND member NOT IN (SELECT unnest(participants_input));
    
    IF FOUND THEN
        changes_made := TRUE;
    END IF;

    -- Add new payers
    FOR i IN 1..payers_length LOOP
        IF NOT EXISTS (SELECT 1 FROM expense_payers WHERE expense = expense_id AND member = payers_input[i]) THEN
            INSERT INTO expense_payers (expense, member, group_id)
            VALUES (expense_id, payers_input[i], _group_id);
            changes_made := TRUE;
        END IF;
        -- Add a balance for payer
        INSERT INTO balances (amount, owner, group_id, expense)
        VALUES (amount_dif_payer, payers_input[i], _group_id, expense_id);
    END LOOP;

    -- Add new participants
    FOR i IN 1..participants_length LOOP
        IF NOT EXISTS (SELECT 1 FROM expense_participants WHERE expense = expense_id AND member = participants_input[i]) THEN
            INSERT INTO expense_participants (expense, member, group_id)
            VALUES (expense_id, participants_input[i], _group_id);
            changes_made := TRUE;
        END IF;
        -- Insert or update balance for participant
        BEGIN
            INSERT INTO balances (amount, owner, group_id, expense)
            VALUES (-amount_dif_participant, participants_input[i], _group_id, expense_id);
        EXCEPTION WHEN unique_violation THEN
            UPDATE balances 
            SET amount = -amount_dif_participant
            WHERE owner = participants_input[i] AND group_id = _group_id AND expense = expense_id;
        END;
    END LOOP;

    -- Post expense actions if changes were made
    IF changes_made THEN
        PERFORM algo.post_expense(_group_id);
    END IF;
END;$function$
;


