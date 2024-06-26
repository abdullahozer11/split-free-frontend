set check_function_bodies = off;

CREATE OR REPLACE FUNCTION algo.calculate_new_debts_simple(group_id_input bigint)
 RETURNS void
 LANGUAGE plpgsql
AS $function$BEGIN
  -- delete old debts
  DELETE from debts_simple
  WHERE group_id = group_id_input;

  -- insert new debts
  INSERT INTO debts_simple (group_id, lender, currency, borrower, amount)
  SELECT group_id,
         lender,
         currency,
         borrower,
         SUM(amount) AS amount
  FROM debts_for_expense
  WHERE group_id = group_id_input
  GROUP BY lender,
           currency,
           group_id,
           borrower;
END;$function$
;

CREATE OR REPLACE FUNCTION algo.post_expense(group_id_input bigint)
 RETURNS void
 LANGUAGE plpgsql
AS $function$begin
  perform algo.recalculate_total_balance(group_id_input);
  perform algo.recalculate_total_expense(group_id_input);
  -- perform algo.calculate_new_debts(group_id_input);
  perform algo.calculate_new_debts_simple(group_id_input);
  perform algo.update_profile_balance(group_id_input);
  perform algo.update_group_settled_status(group_id_input);
end;$function$
;


alter table "public"."debts_for_expense" drop constraint "debts_for_expense_expense_id_fkey";

create table "public"."debts_simple" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "amount" real not null default '0'::real,
    "currency" text not null default 'EUR'::text,
    "borrower" bigint not null,
    "lender" bigint not null,
    "group_id" bigint not null
);


alter table "public"."debts_for_expense" drop column "expense_id";

alter table "public"."debts_for_expense" add column "expense" bigint not null;

alter table "public"."debts_for_expense" alter column "currency" set default 'EUR'::text;

CREATE UNIQUE INDEX debts_simple_pkey ON public.debts_simple USING btree (id);

alter table "public"."debts_simple" add constraint "debts_simple_pkey" PRIMARY KEY using index "debts_simple_pkey";

alter table "public"."debts_for_expense" add constraint "public_debts_for_expense_expense_fkey" FOREIGN KEY (expense) REFERENCES expenses(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."debts_for_expense" validate constraint "public_debts_for_expense_expense_fkey";

alter table "public"."debts_simple" add constraint "public_debts_simple_borrower_fkey" FOREIGN KEY (borrower) REFERENCES members(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."debts_simple" validate constraint "public_debts_simple_borrower_fkey";

alter table "public"."debts_simple" add constraint "public_debts_simple_group_id_fkey" FOREIGN KEY (group_id) REFERENCES groups(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."debts_simple" validate constraint "public_debts_simple_group_id_fkey";

alter table "public"."debts_simple" add constraint "public_debts_simple_lender_fkey" FOREIGN KEY (lender) REFERENCES members(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."debts_simple" validate constraint "public_debts_simple_lender_fkey";

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
            INSERT INTO debts_for_expense (amount, borrower, lender, group_id, expense, currency)
            VALUES (amount_dif_participant, participants_input[i], payers_input[1], group_id_input, expense_id, currency_input);
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

CREATE OR REPLACE FUNCTION public.settle_expense(expense_id bigint, _group_id bigint)
 RETURNS void
 LANGUAGE plpgsql
AS $function$BEGIN
    -- Update the 'settled' field in the 'expenses' table
    UPDATE expenses
    SET settled = TRUE
    WHERE id = expense_id;

    -- Delete related records from the 'balances' table
    DELETE FROM balances
    WHERE expense = expense_id;

    -- Delete related records from the 'balances' table
    DELETE FROM debts_for_expense
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
END;$function$
;

CREATE OR REPLACE FUNCTION public.settle_group(_id bigint)
 RETURNS void
 LANGUAGE plpgsql
AS $function$BEGIN
    -- Update the 'settled' field in the 'expenses' table
    UPDATE expenses
    SET settled = TRUE
    WHERE group_id = _id;

    -- Delete related records from the 'balances' table
    DELETE FROM balances
    WHERE group_id = _id;

    -- Delete related records from the 'balances' table
    DELETE FROM debts_for_expense
    WHERE group_id = _id;

    -- Set group status to settled
    UPDATE groups
    SET settled = TRUE
    WHERE id = _id;

    -- Perform post expense to recalculate ideal debts
    PERFORM algo.post_expense(_id);
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

     -- Pre-update cleanup on debts_for_expense
    DELETE FROM debts_for_expense
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
            INSERT INTO debts_for_expense (amount, borrower, lender, group_id, expense, currency)
            VALUES (amount_dif_participant, participants_input[i], payers_input[1], _group_id, expense_id, currency_input);
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

grant delete on table "public"."debts_simple" to "anon";

grant insert on table "public"."debts_simple" to "anon";

grant references on table "public"."debts_simple" to "anon";

grant select on table "public"."debts_simple" to "anon";

grant trigger on table "public"."debts_simple" to "anon";

grant truncate on table "public"."debts_simple" to "anon";

grant update on table "public"."debts_simple" to "anon";

grant delete on table "public"."debts_simple" to "authenticated";

grant insert on table "public"."debts_simple" to "authenticated";

grant references on table "public"."debts_simple" to "authenticated";

grant select on table "public"."debts_simple" to "authenticated";

grant trigger on table "public"."debts_simple" to "authenticated";

grant truncate on table "public"."debts_simple" to "authenticated";

grant update on table "public"."debts_simple" to "authenticated";

grant delete on table "public"."debts_simple" to "service_role";

grant insert on table "public"."debts_simple" to "service_role";

grant references on table "public"."debts_simple" to "service_role";

grant select on table "public"."debts_simple" to "service_role";

grant trigger on table "public"."debts_simple" to "service_role";

grant truncate on table "public"."debts_simple" to "service_role";

grant update on table "public"."debts_simple" to "service_role";

create policy "aaa"
on "public"."balances"
as permissive
for all
to anon, authenticated
using (utils.is_member_of(auth.uid(), group_id));


create policy "users have access to group debts"
on "public"."balances"
as permissive
for all
to anon, authenticated
using (utils.is_member_of(auth.uid(), group_id));



alter table "public"."debts_simple" enable row level security;

create policy "all"
on "public"."debts_simple"
as permissive
for all
to authenticated, anon
using (utils.is_member_of(auth.uid(), group_id));


create policy "insert"
on "public"."debts_simple"
as permissive
for insert
to anon, authenticated
with check (utils.is_member_of(auth.uid(), group_id));


create policy "update"
on "public"."debts_simple"
as permissive
for update
to anon, authenticated
using (true)
with check (utils.is_member_of(auth.uid(), group_id));
