drop function if exists "algo"."calculate_new_debts"(group_id_input bigint);

drop function if exists "algo"."get_debts_from"(group_id_input bigint, selection balance_info[]);

drop function if exists "algo"."get_selection_with_sum"(target_sum real, selection_length integer, balances balance_info[]);

drop function if exists "algo"."recalculate_total_balance"(group_id_input bigint);

drop function if exists "algo"."recalculate_total_expense"(group_id_input bigint);

drop function if exists "algo"."remove_selection_from_balances"(_balances balance_info[], _selection balance_info[]);

drop function if exists "algo"."update_profile_balance"(group_id_input bigint);

set check_function_bodies = off;

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
      e.amount / (SELECT COUNT(*) 
                  FROM expense_participants ep 
                  WHERE ep.expense = e.id) AS debt_per_expense_amount
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
AS $function$declare
    rec record;
    reciprocal_debt record;
begin
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

    -- reconcile debts
    for rec in (
        select * from debts where group_id = group_id_input
    ) loop
          select id, amount into reciprocal_debt from debts
          where debts.group_id = group_id_input and debts.lender = rec.borrower and debts.borrower = rec.lender;
          if reciprocal_debt is not null then
            if rec.amount = reciprocal_debt.amount then
                delete from debts where id = rec.id;
            elsif rec.amount > reciprocal_debt.amount then
                update debts set amount = (rec.amount - reciprocal_debt.amount) where id = rec.id;
                delete from debts where id = reciprocal_debt.id;
            end if;
          end if;
    end loop;
end;$function$
;

CREATE OR REPLACE FUNCTION algo.calculate_group_profile_balance(group_id_input bigint)
 RETURNS void
 LANGUAGE plpgsql
AS $function$BEGIN
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
            p.id in (select profile from members where members.group_id = group_id_input)
        GROUP BY
            p.id
    ) AS subquery
    WHERE
        profiles.id = subquery.id;

END;$function$
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
  perform algo.calculate_group_member_balances(group_id_input);
  perform algo.calculate_group_total_expense(group_id_input);
  perform algo.calculate_group_profile_balance(group_id_input);
  perform algo.update_group_settled_status(group_id_input);
end;$function$
;


drop policy "user can update balances for their groups" on "public"."balances";

drop policy "users can access balances of their group" on "public"."balances";

drop policy "users can create balances for their group" on "public"."balances";

drop policy "users can access the debts from their groups" on "public"."debts_for_expense";

revoke delete on table "public"."balances" from "anon";

revoke insert on table "public"."balances" from "anon";

revoke references on table "public"."balances" from "anon";

revoke select on table "public"."balances" from "anon";

revoke trigger on table "public"."balances" from "anon";

revoke truncate on table "public"."balances" from "anon";

revoke update on table "public"."balances" from "anon";

revoke delete on table "public"."balances" from "authenticated";

revoke insert on table "public"."balances" from "authenticated";

revoke references on table "public"."balances" from "authenticated";

revoke select on table "public"."balances" from "authenticated";

revoke trigger on table "public"."balances" from "authenticated";

revoke truncate on table "public"."balances" from "authenticated";

revoke update on table "public"."balances" from "authenticated";

revoke delete on table "public"."balances" from "service_role";

revoke insert on table "public"."balances" from "service_role";

revoke references on table "public"."balances" from "service_role";

revoke select on table "public"."balances" from "service_role";

revoke trigger on table "public"."balances" from "service_role";

revoke truncate on table "public"."balances" from "service_role";

revoke update on table "public"."balances" from "service_role";

revoke delete on table "public"."debts_for_expense" from "anon";

revoke insert on table "public"."debts_for_expense" from "anon";

revoke references on table "public"."debts_for_expense" from "anon";

revoke select on table "public"."debts_for_expense" from "anon";

revoke trigger on table "public"."debts_for_expense" from "anon";

revoke truncate on table "public"."debts_for_expense" from "anon";

revoke update on table "public"."debts_for_expense" from "anon";

revoke delete on table "public"."debts_for_expense" from "authenticated";

revoke insert on table "public"."debts_for_expense" from "authenticated";

revoke references on table "public"."debts_for_expense" from "authenticated";

revoke select on table "public"."debts_for_expense" from "authenticated";

revoke trigger on table "public"."debts_for_expense" from "authenticated";

revoke truncate on table "public"."debts_for_expense" from "authenticated";

revoke update on table "public"."debts_for_expense" from "authenticated";

revoke delete on table "public"."debts_for_expense" from "service_role";

revoke insert on table "public"."debts_for_expense" from "service_role";

revoke references on table "public"."debts_for_expense" from "service_role";

revoke select on table "public"."debts_for_expense" from "service_role";

revoke trigger on table "public"."debts_for_expense" from "service_role";

revoke truncate on table "public"."debts_for_expense" from "service_role";

revoke update on table "public"."debts_for_expense" from "service_role";

alter table "public"."balances" drop constraint "balances_expense_fkey";

alter table "public"."balances" drop constraint "balances_group_id_fkey";

alter table "public"."balances" drop constraint "public_Balance_owner_fkey";

alter table "public"."balances" drop constraint "unique_owner_expense";

alter table "public"."balances" drop constraint "Balance_pkey";

alter table "public"."debts_for_expense" drop constraint "debts_for_expense_pkey";

drop index if exists "public"."Balance_pkey";

drop index if exists "public"."unique_owner_expense";

drop index if exists "public"."debts_for_expense_pkey";

drop table "public"."balances";

drop table "public"."debts_for_expense";

create table "public"."debts_per_expense" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "amount" bigint not null,
    "lender" bigint not null,
    "borrower" bigint not null,
    "currency" text not null default 'EUR'::text,
    "group_id" bigint not null,
    "expense" bigint not null
);


alter table "public"."debts_per_expense" enable row level security;

CREATE UNIQUE INDEX debts_for_expense_pkey ON public.debts_per_expense USING btree (id);

alter table "public"."debts_per_expense" add constraint "debts_for_expense_pkey" PRIMARY KEY using index "debts_for_expense_pkey";

alter table "public"."debts_per_expense" add constraint "debts_for_expense_borrower_fkey" FOREIGN KEY (borrower) REFERENCES members(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."debts_per_expense" validate constraint "debts_for_expense_borrower_fkey";

alter table "public"."debts_per_expense" add constraint "debts_for_expense_group_id_fkey" FOREIGN KEY (group_id) REFERENCES groups(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."debts_per_expense" validate constraint "debts_for_expense_group_id_fkey";

alter table "public"."debts_per_expense" add constraint "debts_for_expense_lender_fkey" FOREIGN KEY (lender) REFERENCES members(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."debts_per_expense" validate constraint "debts_for_expense_lender_fkey";

alter table "public"."debts_per_expense" add constraint "public_debts_for_expense_expense_fkey" FOREIGN KEY (expense) REFERENCES expenses(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."debts_per_expense" validate constraint "public_debts_for_expense_expense_fkey";

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
    END LOOP;

    -- Insert participants one by one and link to the expense created
    FOR i IN 1..participants_length LOOP
        -- Create participants
        INSERT INTO expense_participants (expense, member, group_id)
        VALUES (expense_id, participants_input[i], group_id_input);
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

    -- Delete related records from the 'debts per expense' table
    DELETE FROM debts_per_expense
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

    -- Delete related records from the 'debts per expense' table
    DELETE FROM debts_per_expense
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
     -- Pre-update cleanup on debts_for_expense
    DELETE FROM debts_per_expense
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
    END LOOP;

    -- Add new participants
    FOR i IN 1..participants_length LOOP
        IF NOT EXISTS (SELECT 1 FROM expense_participants WHERE expense = expense_id AND member = participants_input[i]) THEN
            INSERT INTO expense_participants (expense, member, group_id)
            VALUES (expense_id, participants_input[i], _group_id);
            changes_made := TRUE;
        END IF;
    END LOOP;

    -- Post expense actions if changes were made
    IF changes_made THEN
        PERFORM algo.post_expense(_group_id);
    END IF;
END;$function$
;

grant delete on table "public"."debts_per_expense" to "anon";

grant insert on table "public"."debts_per_expense" to "anon";

grant references on table "public"."debts_per_expense" to "anon";

grant select on table "public"."debts_per_expense" to "anon";

grant trigger on table "public"."debts_per_expense" to "anon";

grant truncate on table "public"."debts_per_expense" to "anon";

grant update on table "public"."debts_per_expense" to "anon";

grant delete on table "public"."debts_per_expense" to "authenticated";

grant insert on table "public"."debts_per_expense" to "authenticated";

grant references on table "public"."debts_per_expense" to "authenticated";

grant select on table "public"."debts_per_expense" to "authenticated";

grant trigger on table "public"."debts_per_expense" to "authenticated";

grant truncate on table "public"."debts_per_expense" to "authenticated";

grant update on table "public"."debts_per_expense" to "authenticated";

grant delete on table "public"."debts_per_expense" to "service_role";

grant insert on table "public"."debts_per_expense" to "service_role";

grant references on table "public"."debts_per_expense" to "service_role";

grant select on table "public"."debts_per_expense" to "service_role";

grant trigger on table "public"."debts_per_expense" to "service_role";

grant truncate on table "public"."debts_per_expense" to "service_role";

grant update on table "public"."debts_per_expense" to "service_role";

create policy "users can access the debts from their groups"
on "public"."debts_per_expense"
as permissive
for all
to anon, authenticated
using (utils.is_member_of(auth.uid(), group_id));



set check_function_bodies = off;

CREATE OR REPLACE FUNCTION trigger_functions.expense_deleted()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$BEGIN
    PERFORM algo.post_expense(OLD.group_id);
    RETURN OLD;
END;$function$
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


