CREATE OR REPLACE FUNCTION update_expense(
    expense_id integer,
    title_input text,
    description_input text,
    amount_input real,
    date_input timestamp,
    currency_input text,
    proof_input text,
    payers_input integer[],
    participants_input integer[]
)
RETURNS VOID AS $$
DECLARE
    _group_id BIGINT;
    payers_length INT;
    participants_length INT;
    amount_dif_payer DECIMAL;
    amount_dif_participant DECIMAL;
BEGIN
    _group_id := NULL; -- Initialize _group_id

    -- pre-update clean up on balances
    DELETE FROM balances
    WHERE expense = expense_id;

    -- Get the lengths of the input arrays
    payers_length := array_length(payers_input, 1);
    participants_length := array_length(participants_input, 1);

    -- Calculate the difference amount
    amount_dif_payer := (amount_input / payers_length)::DECIMAL;
    amount_dif_participant := (amount_input / participants_length)::DECIMAL;

    SELECT group_id INTO _group_id FROM expenses
    WHERE id = expense_id;

    -- Update row in expenses table
    UPDATE expenses
    SET title = title_input,
        description = description_input,
        amount = amount_input,
        currency = currency_input,
        date = date_input,
        proof = proof_input
    WHERE id = expense_id;

    -- remove deleted payers
    DELETE FROM expense_payers
    WHERE expense = expense_id
    AND member NOT IN (SELECT unnest(payers_input));

    -- remove deleted participants
    DELETE FROM expense_participants
    WHERE expense = expense_id
    AND member NOT IN (SELECT unnest(participants_input));

    -- add new payers
    FOR i IN 1..payers_length LOOP
        IF NOT EXISTS (SELECT 1 FROM expense_payers WHERE member = payers_input[i]) THEN
            INSERT INTO expense_payers (expense, member)
            VALUES (expense_id, payers_input[i]);
        END IF;
        -- add a balance for payer
        INSERT INTO balances (amount, owner, group_id, expense)
        VALUES (amount_dif_payer, payers_input[i], _group_id, expense_id);
    END LOOP;

    -- add new participants
    FOR i IN 1..participants_length LOOP
        IF NOT EXISTS (SELECT 1 FROM expense_participants WHERE member = participants_input[i]) THEN
            INSERT INTO expense_participants (expense, member)
            VALUES (expense_id, participants_input[i]);
        END IF;
        -- Insert or update balance for participant
        BEGIN
            INSERT INTO balances (amount, owner, group_id, expense)
            VALUES (-amount_dif_participant, participants_input[i], _group_id, expense_id);
        EXCEPTION WHEN unique_violation THEN
            UPDATE balances SET amount = amount_dif_payer - amount_dif_participant
            WHERE owner = participants_input[i] AND group_id = _group_id AND expense = expense_id;
        END;
    END LOOP;

    -- post expense actions are grouped up
    PERFORM algo.post_expense(_group_id);
END;
$$
LANGUAGE plpgsql;
