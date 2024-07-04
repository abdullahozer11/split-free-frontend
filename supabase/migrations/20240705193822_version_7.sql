set check_function_bodies = off;

CREATE OR REPLACE FUNCTION algo.reconcile_debts(group_id_input bigint)
 RETURNS void
 LANGUAGE plpgsql
AS $function$DECLARE
    rec RECORD;
    reciprocal_debt RECORD;
BEGIN
    -- Create a temporary table to hold the debts for reconciliation
    CREATE TEMP TABLE temp_debts AS
    SELECT * FROM debts WHERE group_id = group_id_input;

    -- Reconcile debts
    FOR rec IN
        SELECT * FROM temp_debts
    LOOP
        -- Find the reciprocal debt
        SELECT id, amount INTO reciprocal_debt
        FROM temp_debts
        WHERE group_id = group_id_input
          AND lender = rec.borrower
          AND borrower = rec.lender;

        IF FOUND THEN
            IF rec.amount = reciprocal_debt.amount THEN
                DELETE FROM debts WHERE id = rec.id;
                DELETE FROM debts WHERE id = reciprocal_debt.id;
            ELSIF rec.amount > reciprocal_debt.amount THEN
                UPDATE debts SET amount = rec.amount - reciprocal_debt.amount WHERE id = rec.id;
                DELETE FROM debts WHERE id = reciprocal_debt.id;
            END IF;
        END IF;
    END LOOP;

    -- Drop the temporary table
    DROP TABLE temp_debts;
END;$function$
;

CREATE OR REPLACE FUNCTION algo.calculate_debts_per_expenses(group_id_input bigint)
 RETURNS void
 LANGUAGE plpgsql
AS $function$DECLARE
  rec RECORD;
BEGIN
  -- clean up old debts_per_expense
  DELETE FROM debts_per_expense WHERE group_id = group_id_input;

  FOR rec IN (
    SELECT 
      e.id AS expense_id, 
      epr.member AS participant, 
      epy.member AS payer, 
      (e.amount::DECIMAL / (SELECT COUNT(*) 
                  FROM expense_participants ep 
                  WHERE ep.expense = e.id))::DECIMAL AS debt_per_expense_amount
    FROM expense_participants epr
    JOIN expenses AS e ON e.id = epr.expense
    LEFT JOIN expense_payers AS epy ON epy.expense = epr.expense
    WHERE epr.member != epy.member AND e.settled != true and epr.group_id = group_id_input
  ) LOOP
    INSERT INTO debts_per_expense (group_id, lender, borrower, expense, amount)
    VALUES (group_id_input, rec.payer, rec.participant, rec.expense_id, rec.debt_per_expense_amount);
  END LOOP;

END;$function$
;

CREATE OR REPLACE FUNCTION algo.calculate_group_member_balances(group_id_input bigint)
 RETURNS void
 LANGUAGE plpgsql
AS $function$DECLARE
  _amount FLOAT;
  lender_balance FLOAT;
  borrower_balance FLOAT;
  member RECORD;
BEGIN
  -- Step 1: Aggregate lent and borrowed amounts by each member
  FOR member IN
    SELECT id
    FROM members
    WHERE group_id = group_id_input
  LOOP
    -- Step 2: Coalesce borrowed amount
    SELECT COALESCE(SUM(amount), 0) INTO borrower_balance
    FROM debts
    WHERE group_id = group_id_input
      AND borrower = member.id;

    -- Step 3: Coalesce lent amount
    SELECT COALESCE(SUM(amount), 0) INTO lender_balance
    FROM debts
    WHERE group_id = group_id_input
      AND lender = member.id;

    _amount := lender_balance - borrower_balance;

    -- Step 4: Insert the balance into total_balance column in members table
    update members 
    set total_balance = _amount 
    where id = member.id;

  END LOOP;
END;$function$
;

CREATE OR REPLACE FUNCTION algo.calculate_group_member_debts(group_id_input bigint)
 RETURNS void
 LANGUAGE plpgsql
AS $function$begin
    -- delete old debts
    DELETE from debts
    WHERE group_id = group_id_input;

    -- insert new debts
    INSERT INTO debts (group_id, lender, borrower, currency, amount)
    SELECT group_id,
           lender,
           borrower,
           currency,
           SUM(amount) AS amount
    FROM debts_per_expense
    WHERE group_id = group_id_input
    GROUP BY lender,
             borrower,
             currency,
             group_id;
             
end;$function$
;

CREATE OR REPLACE FUNCTION algo.calculate_group_total_expense(group_id_input bigint)
 RETURNS void
 LANGUAGE plpgsql
AS $function$BEGIN
    -- Calculate the total expense for the group with the specified group_id_input
    UPDATE groups
    SET expense_total = (
        SELECT COALESCE(SUM(amount), 0)
        FROM expenses
        WHERE group_id = groups.id
    )
    WHERE id = group_id_input;

    -- No need to return anything as it's not triggered
END;$function$
;

CREATE OR REPLACE FUNCTION algo.post_expense(group_id_input bigint)
 RETURNS void
 LANGUAGE plpgsql
AS $function$begin
  perform algo.calculate_debts_per_expenses(group_id_input);
  perform algo.calculate_group_member_debts(group_id_input);
  perform algo.reconcile_debts(group_id_input);
  perform algo.calculate_group_member_balances(group_id_input);
  perform algo.calculate_group_total_expense(group_id_input);
  perform algo.calculate_group_profile_balance(group_id_input);
  perform algo.update_group_settled_status(group_id_input);
end;$function$
;


drop function if exists "public"."create_expense"(group_id_input integer, title_input text, description_input text, amount_input real, currency_input text, date_input timestamp without time zone, proof_input text, payers_input integer[], participants_input integer[], category_input text);

alter table "public"."debts_per_expense" alter column "amount" set data type double precision using "amount"::double precision;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_expense(group_id_input integer, title_input text, payers_input integer[], participants_input integer[], description_input text DEFAULT ''::text, amount_input real DEFAULT 0.0, currency_input text DEFAULT 'EUR'::text, date_input timestamp without time zone DEFAULT now(), proof_input text DEFAULT ''::text, category_input text DEFAULT 'SHOPPING'::text)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$DECLARE
    expense_id BIGINT;
    payers_length INT;
    participants_length INT;
    amount_dif_payer DECIMAL;
    amount_dif_participant DECIMAL;
    _amount_input DECIMAL;
BEGIN
    -- Get the lengths of the input arrays
    payers_length := array_length(payers_input, 1);
    participants_length := array_length(participants_input, 1);

    -- Calculate the amount difference
    amount_dif_payer := amount_input / COALESCE(payers_length, 1);
    amount_dif_participant := amount_input / COALESCE(participants_length, 1);

    -- Insert row into expenses table with COALESCE for default values
    INSERT INTO expenses (
        group_id, title, amount, description, currency, date, proof, category
    ) VALUES (
        group_id_input,
        title_input,
        amount_input,
        description_input,
        currency_input,
        date_input,
        proof_input,
        category_input
    )
    RETURNING id INTO expense_id;

    -- Insert payers one by one and link to the expense created
    IF payers_length > 0 THEN
        FOR i IN 1..payers_length LOOP
            INSERT INTO expense_payers (expense, member, group_id)
            VALUES (expense_id, payers_input[i], group_id_input);
        END LOOP;
    END IF;

    -- Insert participants one by one and link to the expense created
    IF participants_length > 0 THEN
        FOR i IN 1..participants_length LOOP
            INSERT INTO expense_participants (expense, member, group_id)
            VALUES (expense_id, participants_input[i], group_id_input);
        END LOOP;
    END IF;

    -- Call the post_expense function
    PERFORM algo.post_expense(group_id_input);

    -- Finally, return the newly created expense row id
    RETURN expense_id;
END;$function$
;

CREATE OR REPLACE FUNCTION public.update_expense(expense_id integer, title_input text DEFAULT NULL::text, description_input text DEFAULT NULL::text, amount_input real DEFAULT NULL::real, date_input timestamp without time zone DEFAULT NULL::timestamp without time zone, currency_input text DEFAULT NULL::text, proof_input text DEFAULT NULL::text, payers_input integer[] DEFAULT NULL::integer[], participants_input integer[] DEFAULT NULL::integer[], category_input text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
AS $function$DECLARE
    _group_id BIGINT;
    payers_length INT;
    participants_length INT;
    amount_dif_payer DECIMAL;
    amount_dif_participant DECIMAL;
    old_amount DECIMAL;
BEGIN
    -- Get the lengths of the input arrays
    payers_length := array_length(payers_input, 1);
    participants_length := array_length(participants_input, 1);

    -- Calculate the difference amount
    IF amount_input IS NOT NULL AND payers_length IS NOT NULL THEN
        amount_dif_payer := amount_input / payers_length;
    END IF;

    IF amount_input IS NOT NULL AND participants_length IS NOT NULL THEN
        amount_dif_participant := amount_input / participants_length;
    END IF;

    SELECT group_id, amount INTO _group_id, old_amount
    FROM expenses
    WHERE id = expense_id;

    -- Update only the provided fields
    UPDATE expenses
    SET title = COALESCE(title_input, title),
        description = COALESCE(description_input, description),
        amount = COALESCE(amount_input, amount),
        currency = COALESCE(currency_input, currency),
        category = COALESCE(category_input, category),
        date = COALESCE(date_input, date),
        proof = COALESCE(proof_input, proof)
    WHERE id = expense_id;

    -- Update payers only if provided
    IF payers_input IS NOT NULL THEN
        -- Remove deleted payers
        DELETE FROM expense_payers
        WHERE expense = expense_id
        AND member NOT IN (SELECT unnest(payers_input));
        
        -- Add new payers
        FOR i IN 1..payers_length LOOP
            IF NOT EXISTS (SELECT 1 FROM expense_payers WHERE expense = expense_id AND member = payers_input[i]) THEN
                INSERT INTO expense_payers (expense, member, group_id)
                VALUES (expense_id, payers_input[i], _group_id);            
            END IF;
        END LOOP;
    END IF;

    -- Update participants only if provided
    IF participants_input IS NOT NULL THEN
        -- Remove deleted participants
        DELETE FROM expense_participants
        WHERE expense = expense_id
        AND member NOT IN (SELECT unnest(participants_input));
        
        -- Add new participants
        FOR i IN 1..participants_length LOOP
            IF NOT EXISTS (SELECT 1 FROM expense_participants WHERE expense = expense_id AND member = participants_input[i]) THEN
                INSERT INTO expense_participants (expense, member, group_id)
                VALUES (expense_id, participants_input[i], _group_id);
            END IF;
        END LOOP;
    END IF;

    PERFORM algo.post_expense(_group_id);

END;$function$
;


set check_function_bodies = off;

CREATE OR REPLACE FUNCTION trigger_functions.expense_deleted()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    PERFORM algo.post_expense(OLD.group_id);
    RETURN OLD;
END;
$function$
;

CREATE OR REPLACE FUNCTION trigger_functions.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$DECLARE
  fullName TEXT;
BEGIN
  -- Extracting the full name from email
  fullName := SUBSTRING(NEW.email FROM '^[^@]+');

  -- Inserting into the profiles table
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, fullName, NEW.email);

  return new;
end;$function$
;

CREATE OR REPLACE FUNCTION trigger_functions.log_activity()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$DECLARE
    _group_id BIGINT;
BEGIN
    -- get group_id
    IF TG_TABLE_NAME = 'groups' THEN
      _group_id = COALESCE(NEW.id, OLD.id);
    ELSE
      _group_id = COALESCE(NEW.group_id, OLD.group_id);
    END IF;

    -- create activity log
    IF TG_OP = 'INSERT' THEN
        INSERT INTO activity_logs (table_name, group_id, operation, new_data, changed_by)
        VALUES (TG_TABLE_NAME, _group_id, TG_OP, row_to_json(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO activity_logs (table_name, group_id, operation, old_data, new_data, changed_by)
        VALUES (TG_TABLE_NAME, _group_id, TG_OP, row_to_json(OLD), row_to_json(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO activity_logs (table_name, group_id, operation, old_data, changed_by)
        VALUES (TG_TABLE_NAME, _group_id, TG_OP, row_to_json(OLD), auth.uid());
        RETURN OLD;
    END IF;
    RETURN NULL;
END;$function$
;


set check_function_bodies = off;

CREATE OR REPLACE FUNCTION utils.is_member_of(_person_id uuid, _group_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$DECLARE
    _is_member BOOLEAN;
    _is_invited BOOLEAN;
BEGIN
    -- Check if the person is a member of the group
    SELECT EXISTS (
        SELECT 1
        FROM members mb
        WHERE mb.group_id = _group_id
          AND mb.profile = _person_id
    ) INTO _is_member;

    -- Check if the person is invited to the group
    _is_invited := utils.is_person_invited(_person_id, _group_id);

    -- Return true if the person is either a member or invited
    RETURN _is_member OR _is_invited;
END;$function$
;

CREATE OR REPLACE FUNCTION utils.is_person_invited(_person_id uuid, _group_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$DECLARE 
  _person_invited bool;
BEGIN
  -- Check if person is invited
  SELECT EXISTS (
    SELECT 1
    FROM group_invitations
    WHERE receiver = _person_id AND group_id = _group_id
  ) INTO _person_invited;

  -- Return the boolean
  RETURN _person_invited;
END;$function$
;


