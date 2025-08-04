drop function if exists "algo"."calculate_debts_per_expenses"(group_id_input bigint);

drop function if exists "algo"."calculate_group_member_balances"(group_id_input bigint);

drop function if exists "algo"."calculate_group_member_debts"(group_id_input bigint);

drop function if exists "algo"."calculate_group_profile_balance"(group_id_input bigint);

drop function if exists "algo"."calculate_new_debts_simple"(group_id_input bigint);

drop function if exists "algo"."post_expense"(group_id_input bigint);

drop function if exists "algo"."reconcile_debts"(group_id_input bigint);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION algo.calculate_debts_per_expenses(group_id_input bigint, expense_id_input bigint DEFAULT NULL::bigint)
 RETURNS SETOF integer
 LANGUAGE plpgsql
AS $function$
DECLARE
    rec RECORD;
    old_rec RECORD;
    expense_filter TEXT := '';
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
        expense_filter := ' AND e.id = ' || expense_id_input;
    ELSE
        DELETE FROM debts_per_expense WHERE group_id = group_id_input;
    END IF;

    -- Build the query dynamically for the loop (targeted or full)
    FOR rec IN EXECUTE '
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
        WHERE epr.member != epy.member AND e.settled != true AND epr.group_id = ' || group_id_input || expense_filter
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
END;$function$
;

CREATE OR REPLACE FUNCTION algo.calculate_group_member_balances(group_id_input bigint, affected_members integer[] DEFAULT NULL::integer[])
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
    _amount FLOAT;
    lender_balance FLOAT;
    borrower_balance FLOAT;
    member RECORD;
BEGIN
    -- Loop over relevant members (all or affected)
    FOR member IN
        SELECT id
        FROM members
        WHERE group_id = group_id_input
          AND (id = ANY(affected_members) OR affected_members IS NULL)
    LOOP
        -- Coalesce borrowed amount
        SELECT COALESCE(SUM(amount), 0) INTO borrower_balance
        FROM debts
        WHERE group_id = group_id_input
          AND borrower = member.id;

        -- Coalesce lent amount
        SELECT COALESCE(SUM(amount), 0) INTO lender_balance
        FROM debts
        WHERE group_id = group_id_input
          AND lender = member.id;

        _amount := lender_balance - borrower_balance;

        -- Update the balance in members table
        UPDATE members
        SET total_balance = _amount
        WHERE id = member.id;
    END LOOP;
END;$function$
;

CREATE OR REPLACE FUNCTION algo.calculate_group_member_debts(group_id_input bigint, affected_members integer[] DEFAULT NULL::integer[])
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- delete old debts for affected pairs
    DELETE FROM debts
    WHERE group_id = group_id_input
      AND (lender = ANY(affected_members) OR borrower = ANY(affected_members) OR affected_members IS NULL);

    -- insert new debts for affected pairs
    INSERT INTO debts (group_id, lender, borrower, amount)
    SELECT group_id,
           lender,
           borrower,
           SUM(amount) AS amount
    FROM debts_per_expense
    WHERE group_id = group_id_input
      AND (lender = ANY(affected_members) OR borrower = ANY(affected_members) OR affected_members IS NULL)
    GROUP BY lender,
             borrower,
             group_id;
END;$function$
;

CREATE OR REPLACE FUNCTION algo.calculate_group_profile_balance(group_id_input bigint, affected_members integer[] DEFAULT NULL::integer[])
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Update the total_balance column and calculate total_receivable and total_payable
    UPDATE profiles
    SET 
        total_balance = subquery.p_total_balance,
        total_receivable = subquery.p_total_receivable,
        total_payable = subquery.p_total_payable
    FROM (
        SELECT
            p.id,
            COALESCE(SUM(CASE WHEN m.total_balance > 0 THEN m.total_balance ELSE 0 END), 0) AS p_total_receivable,
            COALESCE(SUM(CASE WHEN m.total_balance < 0 THEN m.total_balance ELSE 0 END), 0) AS p_total_payable,
            COALESCE(SUM(m.total_balance), 0) AS p_total_balance
        FROM
            profiles p
        LEFT JOIN members m ON p.id = m.profile
        WHERE
            p.id IN (
                SELECT DISTINCT profile
                FROM members
                WHERE group_id = group_id_input
                  AND (id = ANY(affected_members) OR affected_members IS NULL)
            )
        GROUP BY
            p.id
    ) AS subquery
    WHERE
        profiles.id = subquery.id;
END;$function$
;

CREATE OR REPLACE FUNCTION algo.post_expense(group_id_input bigint, expense_id_input bigint DEFAULT NULL::bigint)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
    affected_members integer[];
BEGIN
    -- Capture affected members from calculate_debts_per_expenses
    SELECT array_agg(*) INTO affected_members
    FROM algo.calculate_debts_per_expenses(group_id_input, expense_id_input);

    PERFORM algo.calculate_group_member_debts(group_id_input, affected_members);
    PERFORM algo.reconcile_debts(group_id_input, affected_members);
    PERFORM algo.calculate_group_member_balances(group_id_input, affected_members);
    PERFORM algo.calculate_group_total_expense(group_id_input);
    PERFORM algo.calculate_group_profile_balance(group_id_input, affected_members);
    PERFORM algo.update_group_settled_status(group_id_input);
END;$function$
;

CREATE OR REPLACE FUNCTION algo.reconcile_debts(group_id_input bigint, affected_members integer[] DEFAULT NULL::integer[])
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
    rec RECORD;
    reciprocal_debt RECORD;
BEGIN
    -- Create a temporary table to hold the relevant debts for reconciliation
    CREATE TEMP TABLE temp_debts AS
    SELECT *
    FROM debts
    WHERE group_id = group_id_input
      AND (lender = ANY(affected_members) OR borrower = ANY(affected_members) OR affected_members IS NULL);

    -- Reconcile debts within the filtered set
    FOR rec IN
        SELECT * FROM temp_debts
    LOOP
        -- Find the reciprocal debt within the filtered set
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
            ELSIF rec.amount < reciprocal_debt.amount THEN
                UPDATE debts SET amount = reciprocal_debt.amount - rec.amount WHERE id = reciprocal_debt.id;
                DELETE FROM debts WHERE id = rec.id;
            END IF;
        END IF;
    END LOOP;

    -- Drop the temporary table
    DROP TABLE temp_debts;
END;$function$
;


alter table "public"."profiles" drop constraint "profiles_currency_check";

drop function if exists "public"."create_expense"(group_id_input integer, title_input text, payers_input integer[], participants_input integer[], description_input text, amount_input real, currency_input text, date_input timestamp without time zone, proof_input text, category_input text);

drop function if exists "public"."update_expense"(expense_id integer, title_input text, description_input text, amount_input real, date_input timestamp without time zone, currency_input text, proof_input text, payers_input integer[], participants_input integer[], category_input text);

alter table "public"."debts" drop column "currency";

alter table "public"."debts_per_expense" drop column "currency";

alter table "public"."expenses" drop column "currency";

alter table "public"."groups" add column "currency" text default 'EUR'::text;

alter table "public"."profiles" drop column "currency";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_expense(group_id_input bigint, title_input text, payers_input integer[], participants_input integer[], description_input text DEFAULT ''::text, amount_input real DEFAULT 0.0, date_input timestamp without time zone DEFAULT now(), proof_input text DEFAULT ''::text, category_input text DEFAULT 'SHOPPING'::text)
 RETURNS bigint
 LANGUAGE plpgsql
AS $function$
DECLARE
    expense_id BIGINT;
    payers_length INT;
    participants_length INT;
BEGIN
    -- Get the lengths of the input arrays
    payers_length := array_length(payers_input, 1);
    participants_length := array_length(participants_input, 1);

    -- Insert row into expenses table with COALESCE for default values
    INSERT INTO expenses (
        group_id, title, amount, description, date, proof, category
    ) VALUES (
        group_id_input,
        title_input,
        amount_input::NUMERIC(10,2),
        description_input,
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

    -- Call the post_expense function, passing the new expense_id
    PERFORM algo.post_expense(group_id_input, expense_id);

    -- Finally, return the newly created expense row id
    RETURN expense_id;
END;$function$
;

CREATE OR REPLACE FUNCTION public.update_expense(expense_id bigint, title_input text DEFAULT NULL::text, description_input text DEFAULT NULL::text, amount_input real DEFAULT NULL::real, date_input timestamp without time zone DEFAULT NULL::timestamp without time zone, proof_input text DEFAULT NULL::text, payers_input integer[] DEFAULT NULL::integer[], participants_input integer[] DEFAULT NULL::integer[], category_input text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
AS $function$DECLARE
    old_expense expenses%ROWTYPE;
    old_payers integer[];
    old_participants integer[];
    sorted_new_payers integer[];
    sorted_new_participants integer[];
    _group_id BIGINT;
    payers_length INT;
    participants_length INT;
    need_post BOOLEAN := FALSE;
BEGIN
    -- Fetch the old expense row
    SELECT * INTO old_expense
    FROM expenses
    WHERE id = expense_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Expense not found.';
    END IF;

    _group_id := old_expense.group_id;

    -- Fetch old payers as sorted array
    SELECT COALESCE(array_agg(member ORDER BY member), '{}') INTO old_payers
    FROM expense_payers
    WHERE expense = expense_id;

    -- Fetch old participants as sorted array
    SELECT COALESCE(array_agg(member ORDER BY member), '{}') INTO old_participants
    FROM expense_participants
    WHERE expense = expense_id;

    -- Check for changes that require post_expense
    IF amount_input IS NOT NULL AND amount_input::NUMERIC(10,2) != old_expense.amount THEN
        need_post := TRUE;
    END IF;

    IF payers_input IS NOT NULL THEN
        sorted_new_payers := ARRAY(SELECT unnest(payers_input) ORDER BY 1);
        IF sorted_new_payers != old_payers THEN
            need_post := TRUE;
        END IF;
    END IF;

    IF participants_input IS NOT NULL THEN
        sorted_new_participants := ARRAY(SELECT unnest(participants_input) ORDER BY 1);
        IF sorted_new_participants != old_participants THEN
            need_post := TRUE;
        END IF;
    END IF;

    -- Get the lengths of the input arrays (for loops later)
    payers_length := array_length(payers_input, 1);
    participants_length := array_length(participants_input, 1);

    -- Update only the provided fields in expenses
    UPDATE expenses
    SET title = COALESCE(title_input, title),
        description = COALESCE(description_input, description),
        amount = COALESCE(amount_input::NUMERIC(10,2), amount),
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

    -- Call post_expense only if necessary
    IF need_post THEN
        PERFORM algo.post_expense(_group_id, expense_id);
    END IF;

END;$function$
;

CREATE OR REPLACE FUNCTION public.use_expense(expense_id_input bigint)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$BEGIN
    RETURN (
        SELECT
            jsonb_build_object(
                'amount', expenses.amount,
                'id', expenses.id,
                'title', expenses.title,
                'settled', expenses.settled,
                'description', expenses.description,
                'date', expenses.date,
                'last_modified', expenses.last_modified,
                'group_id', expenses.group_id,
                'category', expenses.category,
                'payers', COALESCE(
                    jsonb_agg(
                        DISTINCT jsonb_build_object(
                            'id', payer_members.id,
                            'name', payer_members.name,
                            'avatar_url', payer_profiles.avatar_url
                        )
                    ) FILTER (WHERE payer_members.id IS NOT NULL), '[]'
                ),
                'participants', COALESCE(
                    jsonb_agg(
                        DISTINCT jsonb_build_object(
                            'id', participant_members.id,
                            'name', participant_members.name,
                            'avatar_url', participant_profiles.avatar_url
                        )
                    ) FILTER (WHERE participant_members.id IS NOT NULL), '[]'
                ),
                'payer_ids', COALESCE(
                    jsonb_agg(
                        DISTINCT expense_payers.member
                    ) FILTER (WHERE expense_payers.member IS NOT NULL), '[]'
                ),
                'participant_ids', COALESCE(
                    jsonb_agg(
                        DISTINCT expense_participants.member
                    ) FILTER (WHERE expense_participants.member IS NOT NULL), '[]'
                )
            )
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
            expenses.group_id,
            expenses.category
    );
END;$function$
;


