
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE SCHEMA IF NOT EXISTS "algo";

ALTER SCHEMA "algo" OWNER TO "postgres";

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";

COMMENT ON SCHEMA "public" IS 'standard public schema';

CREATE SCHEMA IF NOT EXISTS "trigger_functions";

ALTER SCHEMA "trigger_functions" OWNER TO "postgres";

CREATE SCHEMA IF NOT EXISTS "utils";

ALTER SCHEMA "utils" OWNER TO "postgres";

CREATE EXTENSION IF NOT EXISTS "moddatetime" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "extensions";

CREATE TYPE "public"."balance_info" AS (
	"id" integer,
	"balance" real
);

ALTER TYPE "public"."balance_info" OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "algo"."calculate_new_debts"("group_id_input" bigint) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$DECLARE
    selection_length INT := 1;
    _balances balance_info[];
    selection balance_info[];
BEGIN

    delete from debts
    where group_id = group_id_input;

    -- Selecting balances for each member and ordering them
    SELECT ARRAY(SELECT ROW(id, total_balance)::balance_info
        FROM members
        WHERE group_id = group_id_input
        ORDER BY total_balance)
        INTO _balances;

    -- Starting the first loop
    WHILE array_length(_balances, 1) > 0 LOOP
        IF selection_length > CAST(array_length(_balances, 1) AS DECIMAL) / 2 THEN
            selection_length := array_length(_balances, 1);
        END IF;

        -- Call the function to get the selection
        selection := algo.get_selection_with_sum(0.00, selection_length, _balances);

        IF selection IS NULL THEN
            IF selection_length = array_length(_balances, 1) THEN
                RAISE EXCEPTION 'Ideal debts calculation failed';
            END IF;
            -- RAISE warning 'Could not find a valid selection, incrementing to: %', selection_length + 1;
            selection_length := selection_length + 1;
        ELSE
            -- Removing the selected balances
            _balances := algo.remove_selection_from_balances(_balances, selection);

            -- insert new debts
            perform algo.get_debts_from(group_id_input, selection);

        END IF;
    END LOOP;

END;$$;

ALTER FUNCTION "algo"."calculate_new_debts"("group_id_input" bigint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "algo"."get_debts_from"("group_id_input" bigint, "selection" "public"."balance_info"[]) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$DECLARE
    amount float4;
    borrower_id int;
    lender_id int;
BEGIN

    -- Check if the length of selection is less than 2
    IF array_length(selection, 1) < 2 THEN
        return;
    END IF;

    -- Loop through the selection array
    WHILE array_length(selection, 1) >= 2 LOOP
        -- Calculate the difference between the first and last elements' amounts
        -- Update debt amount and adjust selection accordingly
        raise warning 'selection is, %', selection;
        borrower_id := selection[1].id;
        lender_id := selection[array_length(selection, 1)].id;
        IF selection[1].balance + selection[array_length(selection, 1)].balance < 0 THEN
            amount := selection[array_length(selection, 1)].balance;
            selection[1].balance := selection[1].balance + selection[array_length(selection, 1)].balance;
            selection := selection[1:array_length(selection, 1) - 1];
        ELSIF selection[1].balance + selection[array_length(selection, 1)].balance > 0 THEN
            amount := -selection[1].balance;
            selection[array_length(selection, 1)].balance := selection[1].balance + selection[array_length(selection, 1)].balance;
            selection := selection[2:array_length(selection, 1)];
        ELSE
            amount := selection[array_length(selection, 1)].balance;
            selection := selection[2:array_length(selection, 1) - 1];
        END IF;
        
        INSERT INTO debts (group_id, borrower, lender, amount)
        VALUES (group_id_input, borrower_id, lender_id, amount);
                
    END LOOP;

    -- No need to return anything, as it's a void function
END;$$;

ALTER FUNCTION "algo"."get_debts_from"("group_id_input" bigint, "selection" "public"."balance_info"[]) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "algo"."get_selection_with_sum"("target_sum" real, "selection_length" integer, "balances" "public"."balance_info"[]) RETURNS "public"."balance_info"[]
    LANGUAGE "plpgsql"
    AS $$DECLARE
    result_balance balance_info[];
    balance_row balance_info;
    low_index INT;
    high_index INT;
    first_index INT;
    potential_matching_selection balance_info[];
BEGIN
    IF selection_length = array_length(balances, 1) AND target_sum = 0.00 THEN
        -- raise warning 'selection length = array length: %', selection_length;
        RETURN balances;
    END IF;

    IF selection_length = 1 THEN
        FOR balance_row IN SELECT * FROM UNNEST(balances) AS balance_row LOOP
            IF balance_row.balance = target_sum THEN
                RETURN ARRAY[(balance_row.id, balance_row.balance)::balance_info];
            END IF;
        END LOOP;
        RETURN NULL;
    END IF;

    IF selection_length = 2 THEN
        low_index := 1;
        high_index := array_length(balances, 1);
        WHILE low_index < high_index LOOP
            IF balances[low_index].balance + balances[high_index].balance = target_sum THEN
                RETURN ARRAY[(balances[low_index].id, balances[low_index].balance)::balance_info, (balances[high_index].id, balances[high_index].balance)::balance_info];
            ELSIF balances[low_index].balance + balances[high_index].balance < target_sum THEN
                low_index := low_index + 1;
            ELSE
                high_index := high_index - 1;
            END IF;
        END LOOP;
        RETURN NULL;
    END IF;

    FOR first_index IN 1..(array_length(balances, 1) - (selection_length - 1)) LOOP
        potential_matching_selection := get_selection_with_sum(
            target_sum - balances[first_index].balance,
            selection_length - 1,
            balances[first_index + 1 : array_length(balances, 1)]
        );
        IF potential_matching_selection IS NOT NULL THEN
            result_balance := ARRAY[(balances[first_index].id, balances[first_index].balance)::balance_info] || potential_matching_selection;
            RETURN result_balance;
        END IF;
    END LOOP;

    RETURN NULL;
END;$$;

ALTER FUNCTION "algo"."get_selection_with_sum"("target_sum" real, "selection_length" integer, "balances" "public"."balance_info"[]) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "algo"."post_expense"("group_id_input" bigint) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$begin
  perform algo.recalculate_total_balance(group_id_input);
  perform algo.recalculate_total_expense(group_id_input);
  perform algo.calculate_new_debts(group_id_input);
  perform algo.update_profile_balance(group_id_input);
  perform algo.update_group_settled_status(group_id_input);
end;$$;

ALTER FUNCTION "algo"."post_expense"("group_id_input" bigint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "algo"."recalculate_total_balance"("group_id_input" bigint) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$BEGIN
    -- Calculate the total balance for all the members inside the group with the specified group_id_input
    UPDATE members
    SET total_balance = (
        SELECT COALESCE(SUM(amount), 0)
        FROM balances
        WHERE owner = members.id
    )
    WHERE group_id = group_id_input;
END;$$;

ALTER FUNCTION "algo"."recalculate_total_balance"("group_id_input" bigint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "algo"."recalculate_total_expense"("group_id_input" bigint) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$BEGIN
    -- Calculate the total expense for the group with the specified group_id_input
    UPDATE groups
    SET expense_total = (
        SELECT COALESCE(SUM(amount), 0)
        FROM expenses
        WHERE group_id = groups.id
    )
    WHERE id = group_id_input;

    -- No need to return anything as it's not triggered
END;$$;

ALTER FUNCTION "algo"."recalculate_total_expense"("group_id_input" bigint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "algo"."remove_selection_from_balances"("_balances" "public"."balance_info"[], "_selection" "public"."balance_info"[]) RETURNS "public"."balance_info"[]
    LANGUAGE "plpgsql"
    AS $$DECLARE
    _selected_balance_ids INT[] := ARRAY(SELECT id FROM unnest(_selection) AS s(id)); -- Extracting ids from selection
    _new_balances balance_info[] := '{}'; -- Initializing an empty array for new balances
    _balance balance_info; -- Declaring a variable to hold each balance info
BEGIN
    -- Loop through each balance in balances array
    FOREACH _balance IN ARRAY _balances LOOP
        -- Check if the id of the current balance is not in the selected ids
        IF _balance.id NOT IN (SELECT unnest(_selected_balance_ids)) THEN
            -- Append the balance to new_balances if its id is not in selected ids
            _new_balances := _new_balances || ARRAY[_balance];
        END IF;
    END LOOP;

    -- Return the new_balances array
    RETURN _new_balances;
END;$$;

ALTER FUNCTION "algo"."remove_selection_from_balances"("_balances" "public"."balance_info"[], "_selection" "public"."balance_info"[]) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "algo"."update_group_settled_status"("_group_id_input" bigint) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$BEGIN
  -- Check if there are any debts associated with the provided group ID
  IF EXISTS (SELECT 1 FROM debts WHERE group_id = _group_id_input) THEN
    -- If debts exist, set the group's settled status to FALSE
    UPDATE groups
    SET settled = FALSE
    WHERE id = _group_id_input;
  ELSE
    -- If no debts exist, set the group's settled status to TRUE
    UPDATE groups
    SET settled = TRUE
    WHERE id = _group_id_input;
  END IF;
END;$$;

ALTER FUNCTION "algo"."update_group_settled_status"("_group_id_input" bigint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "algo"."update_profile_balance"("group_id_input" bigint) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$BEGIN
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

END;$$;

ALTER FUNCTION "algo"."update_profile_balance"("group_id_input" bigint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."accept_friend_request"("sender_uid" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- create friendship for both ways
  INSERT INTO friends (profile, friend) VALUES (sender_uid, auth.uid());
  INSERT INTO friends (profile, friend) VALUES (auth.uid(), sender_uid);

  -- remove friend request to finalize
  DELETE FROM friend_requests WHERE sender = sender_uid;
END;
$$;

ALTER FUNCTION "public"."accept_friend_request"("sender_uid" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."accept_group_invite"("_profile_id" "uuid", "_group_id" bigint) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- create an invisible member for that group
  INSERT INTO members (name, profile, group_id, visible) 
  VALUES (_profile_id, _profile_id, _group_id, false);

  -- remove group invite to finalize
  DELETE FROM group_invitations WHERE group_id = _group_id and receiver = _profile_id;
END;
$$;

ALTER FUNCTION "public"."accept_group_invite"("_profile_id" "uuid", "_group_id" bigint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."assign_new_member"("_profile_id" "uuid", "_member_id" bigint) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE members
  SET profile = _profile_id
  WHERE id = _member_id;

  DELETE FROM members
  WHERE profile = _profile_id AND visible = false;
END;
$$;

ALTER FUNCTION "public"."assign_new_member"("_profile_id" "uuid", "_member_id" bigint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."create_expense"("group_id_input" integer, "title_input" "text", "description_input" "text", "amount_input" real, "currency_input" "text", "date_input" timestamp without time zone, "proof_input" "text", "payers_input" integer[], "participants_input" integer[]) RETURNS integer
    LANGUAGE "plpgsql"
    AS $$DECLARE
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
    INSERT INTO expenses(group_id, title, description, currency, amount, date, proof)
    VALUES (group_id_input, title_input, description_input, currency_input, amount_input, date_input, proof_input)
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
END;$$;

ALTER FUNCTION "public"."create_expense"("group_id_input" integer, "title_input" "text", "description_input" "text", "amount_input" real, "currency_input" "text", "date_input" timestamp without time zone, "proof_input" "text", "payers_input" integer[], "participants_input" integer[]) OWNER TO "postgres";

COMMENT ON FUNCTION "public"."create_expense"("group_id_input" integer, "title_input" "text", "description_input" "text", "amount_input" real, "currency_input" "text", "date_input" timestamp without time zone, "proof_input" "text", "payers_input" integer[], "participants_input" integer[]) IS 'database function to create an expense item';

CREATE OR REPLACE FUNCTION "public"."create_group"("title_input" "text", "member_names_input" "text"[]) RETURNS bigint
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    group_id BIGINT;
BEGIN
    -- Insert row into groups table
    INSERT INTO groups(title, owner)
    VALUES (title_input, auth.uid())
    RETURNING id INTO group_id;

    -- Insert members one by one and link to the group created
    FOR i IN 1..array_length(member_names_input, 1) LOOP
        IF i = 1 THEN
            -- first item is the owner different logic applies here
            INSERT INTO members (name, group_id, profile, role)
            VALUES (member_names_input[i], group_id, auth.uid(), 'owner');
        ELSE
            -- For other list items, insert them into the members table
            INSERT INTO members (name, group_id)
            VALUES (member_names_input[i], group_id);
        END IF;
    END LOOP;

    -- Finally, return the newly created group row id
    RETURN group_id;
END;
$$;

ALTER FUNCTION "public"."create_group"("title_input" "text", "member_names_input" "text"[]) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_groups_summary"() RETURNS TABLE("id" bigint, "settled" boolean, "title" "text", "expense_count" bigint, "member_count" bigint)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        g.id,
        g.settled,
        g.title,
        COUNT(DISTINCT e.id) AS expense_count,
        COUNT(DISTINCT m.id) AS member_count
    FROM
        groups g
    LEFT JOIN
        members m ON g.id = m.group_id AND m.visible
    LEFT JOIN
        expenses e ON g.id = e.group_id
    GROUP BY
        g.id, g.settled, g.title;
END;
$$;

ALTER FUNCTION "public"."get_groups_summary"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."search_friends"("keyword_input" "text", "profile_id_input" "uuid", "limit_input" integer DEFAULT 10, "offset_input" integer DEFAULT 0) RETURNS TABLE("id" "uuid", "email" "text", "avatar_url" "text", "friend_status" "text")
    LANGUAGE "plpgsql"
    AS $$BEGIN
    RETURN QUERY
    SELECT p.id,
           p.email,
           p.avatar_url,
           CASE
               WHEN f.friend = profile_id_input THEN 'FRIEND'
               WHEN fr.sender = profile_id_input THEN 'SENT'
               WHEN fr.receiver = profile_id_input THEN 'RECEIVED'
               ELSE 'AVAILABLE'
           END AS friend_status
    FROM profiles p
    LEFT JOIN friends f ON f.profile = p.id
    LEFT JOIN friend_requests fr ON fr.sender = p.id OR fr.receiver = p.id
    WHERE p.email ILIKE keyword_input || '%'
    LIMIT limit_input
    OFFSET offset_input;
END;$$;

ALTER FUNCTION "public"."search_friends"("keyword_input" "text", "profile_id_input" "uuid", "limit_input" integer, "offset_input" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."settle_expense"("expense_id" bigint, "_group_id" bigint) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Update the 'settled' field in the 'expenses' table
    UPDATE expenses
    SET settled = TRUE
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
$$;

ALTER FUNCTION "public"."settle_expense"("expense_id" bigint, "_group_id" bigint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."settle_group"("_id" bigint) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
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
$$;

ALTER FUNCTION "public"."settle_group"("_id" bigint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."update_expense"("expense_id" integer, "title_input" "text", "description_input" "text", "amount_input" real, "date_input" timestamp without time zone, "currency_input" "text", "proof_input" "text", "payers_input" integer[], "participants_input" integer[]) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$DECLARE
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
END;$$;

ALTER FUNCTION "public"."update_expense"("expense_id" integer, "title_input" "text", "description_input" "text", "amount_input" real, "date_input" timestamp without time zone, "currency_input" "text", "proof_input" "text", "payers_input" integer[], "participants_input" integer[]) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."update_group"("group_id_input" integer, "title_input" "text", "description_input" "text", "member_names_input" "text"[]) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Update groups row
    UPDATE groups
        SET title = title_input,
            description = description_input
        WHERE id = group_id_input;

    -- Remove members who are not in the list
    DELETE FROM members
    WHERE group_id = group_id_input
    AND name NOT IN (SELECT unnest(member_names_input));

    -- Add members
    FOR i IN 1..array_length(member_names_input, 1) LOOP
        IF NOT EXISTS (SELECT 1 FROM members WHERE members.name = member_names_input[i]) THEN
            INSERT INTO members (name, group_id) 
            VALUES (member_names_input[i], group_id_input);
        END IF;
    END LOOP;
END;
$$;

ALTER FUNCTION "public"."update_group"("group_id_input" integer, "title_input" "text", "description_input" "text", "member_names_input" "text"[]) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."use_expense"("expense_id_input" bigint) RETURNS TABLE("amount" real, "id" bigint, "title" "text", "settled" boolean, "currency" "text", "description" "text", "date" timestamp without time zone, "last_modified" timestamp with time zone, "group_id" bigint, "payers" "jsonb", "participants" "jsonb", "payer_ids" "jsonb", "participant_ids" "jsonb")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
        SELECT
        expenses.amount,
        expenses.id,
        expenses.title,
        expenses.settled,
        expenses.currency,
        expenses.description,
        expenses.date,
        expenses.last_modified,
        expenses.group_id,
        COALESCE(jsonb_agg(DISTINCT jsonb_build_object('id', payer_members.id, 'name', payer_members.name, 'avatar_url', payer_profiles.avatar_url)) FILTER (WHERE payer_members.id IS NOT NULL), '[]') AS payers,
        COALESCE(jsonb_agg(DISTINCT jsonb_build_object('id', participant_members.id, 'name', participant_members.name, 'avatar_url', participant_profiles.avatar_url)) FILTER (WHERE participant_members.id IS NOT NULL), '[]') AS participants,
        COALESCE(jsonb_agg(DISTINCT expense_payers.member) FILTER (WHERE expense_payers.member IS NOT NULL), '[]') AS payer_ids,
        COALESCE(jsonb_agg(DISTINCT expense_participants.member) FILTER (WHERE expense_participants.member IS NOT NULL), '[]') AS participant_ids
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
        expenses.group_id;

END;
$$;

ALTER FUNCTION "public"."use_expense"("expense_id_input" bigint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "trigger_functions"."expense_deleted"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$BEGIN
    PERFORM algo.post_expense(OLD.group_id);
    RETURN OLD;
END;$$;

ALTER FUNCTION "trigger_functions"."expense_deleted"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "trigger_functions"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$DECLARE
  fullName TEXT;
BEGIN
  -- Extracting the full name from email
  fullName := SUBSTRING(NEW.email FROM '^[^@]+');

  -- Inserting into the profiles table
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, fullName, NEW.email);

  return new;
end;$$;

ALTER FUNCTION "trigger_functions"."handle_new_user"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "trigger_functions"."log_activity"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$DECLARE
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
END;$$;

ALTER FUNCTION "trigger_functions"."log_activity"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "utils"."get_member_id"("_person_id" "uuid", "_group_id" bigint) RETURNS integer
    LANGUAGE "plpgsql"
    AS $$DECLARE
    member_id INT;
BEGIN
    SELECT id INTO member_id
    FROM members
    WHERE profile = _person_id
      AND group_id = _group_id;

    RETURN member_id;
END;$$;

ALTER FUNCTION "utils"."get_member_id"("_person_id" "uuid", "_group_id" bigint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "utils"."is_group_owner"("_person_id" "uuid", "_group_id" bigint) RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM groups gr
        WHERE gr.id = _group_id
        AND gr.owner = _person_id
    );
END;$$;

ALTER FUNCTION "utils"."is_group_owner"("_person_id" "uuid", "_group_id" bigint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "utils"."is_member_of"("_person_id" "uuid", "_group_id" bigint) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$DECLARE
    _is_member BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM members mb
        WHERE mb.group_id = _group_id
          AND mb.profile = _person_id
    ) INTO _is_member;

    RETURN _is_member;
END;$$;

ALTER FUNCTION "utils"."is_member_of"("_person_id" "uuid", "_group_id" bigint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "utils"."is_person_invited"("_person_id" "uuid", "_group_id" bigint) RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$DECLARE 
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
END;$$;

ALTER FUNCTION "utils"."is_person_invited"("_person_id" "uuid", "_group_id" bigint) OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."balances" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "currency" "text" DEFAULT 'EUR'::"text" NOT NULL,
    "amount" real DEFAULT '0'::real NOT NULL,
    "owner" bigint NOT NULL,
    "group_id" bigint NOT NULL,
    "expense" bigint NOT NULL
);

ALTER TABLE "public"."balances" OWNER TO "postgres";

ALTER TABLE "public"."balances" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."Balance_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."debts" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "amount" real DEFAULT '0'::real NOT NULL,
    "currency" "text" DEFAULT 'EUR'::"text" NOT NULL,
    "borrower" bigint NOT NULL,
    "lender" bigint NOT NULL,
    "group_id" bigint NOT NULL
);

ALTER TABLE "public"."debts" OWNER TO "postgres";

ALTER TABLE "public"."debts" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."Debt_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."expenses" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "amount" real DEFAULT '0'::real NOT NULL,
    "title" "text" NOT NULL,
    "currency" "text" DEFAULT 'EUR'::"text" NOT NULL,
    "description" "text",
    "date" timestamp without time zone DEFAULT "now"() NOT NULL,
    "group_id" bigint NOT NULL,
    "proof" "text",
    "last_modified" timestamp with time zone DEFAULT "now"(),
    "settled" boolean DEFAULT false,
    "category" "text" DEFAULT 'shopping'::"text" NOT NULL
);

ALTER TABLE "public"."expenses" OWNER TO "postgres";

COMMENT ON COLUMN "public"."expenses"."category" IS 'Expense category';

ALTER TABLE "public"."expenses" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."Expense_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."groups" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "owner" "uuid" NOT NULL,
    "expense_total" real DEFAULT '0'::real NOT NULL,
    "settled" boolean DEFAULT true NOT NULL
);

ALTER TABLE "public"."groups" OWNER TO "postgres";

COMMENT ON TABLE "public"."groups" IS 'Expense group';

COMMENT ON COLUMN "public"."groups"."expense_total" IS 'total of all expenses sum';

ALTER TABLE "public"."groups" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."Group_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."members" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "group_id" bigint NOT NULL,
    "profile" "uuid",
    "role" "text" DEFAULT 'member'::"text" NOT NULL,
    "total_balance" real DEFAULT '0'::real NOT NULL,
    "visible" boolean DEFAULT true NOT NULL
);

ALTER TABLE "public"."members" OWNER TO "postgres";

COMMENT ON COLUMN "public"."members"."total_balance" IS 'balance cumulative of member inside a group';

ALTER TABLE "public"."members" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."Member_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."activity_logs" (
    "id" integer NOT NULL,
    "table_name" "text",
    "operation" "text",
    "group_id" bigint,
    "old_data" "jsonb",
    "new_data" "jsonb",
    "changed_by" "text",
    "changed_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "public"."activity_logs" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "public"."activity_logs_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "public"."activity_logs_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "public"."activity_logs_id_seq" OWNED BY "public"."activity_logs"."id";

CREATE TABLE IF NOT EXISTS "public"."expense_categories" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "embedding" "extensions"."vector"(3)
);

ALTER TABLE "public"."expense_categories" OWNER TO "postgres";

COMMENT ON TABLE "public"."expense_categories" IS 'expense categories to find the right logo';

ALTER TABLE "public"."expense_categories" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."expense_categories_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."expense_participants" (
    "id" bigint NOT NULL,
    "expense" bigint NOT NULL,
    "member" bigint NOT NULL,
    "group_id" bigint NOT NULL
);

ALTER TABLE "public"."expense_participants" OWNER TO "postgres";

COMMENT ON TABLE "public"."expense_participants" IS 'expense participants join table';

ALTER TABLE "public"."expense_participants" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."expense_participants_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."expense_payers" (
    "id" bigint NOT NULL,
    "expense" bigint NOT NULL,
    "member" bigint NOT NULL,
    "group_id" bigint NOT NULL
);

ALTER TABLE "public"."expense_payers" OWNER TO "postgres";

COMMENT ON TABLE "public"."expense_payers" IS 'expense payers join table';

ALTER TABLE "public"."expense_payers" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."expense_payer_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."friend_requests" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "sender" "uuid" NOT NULL,
    "receiver" "uuid" NOT NULL
);

ALTER TABLE "public"."friend_requests" OWNER TO "postgres";

COMMENT ON TABLE "public"."friend_requests" IS 'friend requests between different profiles';

ALTER TABLE "public"."friend_requests" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."friend_requests_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."friends" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "profile" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "friend" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);

ALTER TABLE "public"."friends" OWNER TO "postgres";

COMMENT ON TABLE "public"."friends" IS 'Join table for friendship between profiles';

ALTER TABLE "public"."friends" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."friends_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."group_invitations" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "sender" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "receiver" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "group_id" bigint NOT NULL,
    "group_name" "text"
);

ALTER TABLE "public"."group_invitations" OWNER TO "postgres";

COMMENT ON TABLE "public"."group_invitations" IS 'invite people to access groups';

ALTER TABLE "public"."group_invitations" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."group_invitations_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "updated_at" timestamp with time zone,
    "full_name" "text",
    "avatar_url" "text",
    "website" "text",
    "total_receivable" real DEFAULT '0'::real NOT NULL,
    "phone_number" "text",
    "email" "text",
    "total_payable" real DEFAULT '0'::real NOT NULL,
    "total_balance" real DEFAULT '0'::real NOT NULL,
    "receive_emails" boolean DEFAULT true,
    "receive_popups" boolean DEFAULT true,
    "language" "text" DEFAULT 'en'::"text"
);

ALTER TABLE "public"."profiles" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."transfers" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "sender" bigint NOT NULL,
    "receiver" bigint NOT NULL,
    "amount" real NOT NULL,
    "group_id" bigint NOT NULL,
    "description" "text"
);

ALTER TABLE "public"."transfers" OWNER TO "postgres";

COMMENT ON TABLE "public"."transfers" IS 'money transfers';

COMMENT ON COLUMN "public"."transfers"."description" IS 'optional description column';

ALTER TABLE "public"."transfers" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."transfers_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

ALTER TABLE ONLY "public"."activity_logs" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."activity_logs_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."balances"
    ADD CONSTRAINT "Balance_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."debts"
    ADD CONSTRAINT "Debt_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "Expense_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."groups"
    ADD CONSTRAINT "Group_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."members"
    ADD CONSTRAINT "Member_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."activity_logs"
    ADD CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."expense_categories"
    ADD CONSTRAINT "expense_categories_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."expense_participants"
    ADD CONSTRAINT "expense_participants_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."expense_payers"
    ADD CONSTRAINT "expense_payer_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."friend_requests"
    ADD CONSTRAINT "friend_requests_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."friends"
    ADD CONSTRAINT "friends_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."group_invitations"
    ADD CONSTRAINT "group_invitations_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."transfers"
    ADD CONSTRAINT "transfers_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."friends"
    ADD CONSTRAINT "unique_friendship_request" UNIQUE ("profile", "friend");

ALTER TABLE ONLY "public"."balances"
    ADD CONSTRAINT "unique_owner_expense" UNIQUE ("owner", "expense");

CREATE OR REPLACE TRIGGER "before_insert_update_delete_on_expenses" BEFORE INSERT OR DELETE OR UPDATE ON "public"."expenses" FOR EACH ROW EXECUTE FUNCTION "trigger_functions"."log_activity"();

CREATE OR REPLACE TRIGGER "before_insert_update_delete_on_groups" BEFORE INSERT OR DELETE OR UPDATE ON "public"."groups" FOR EACH ROW EXECUTE FUNCTION "trigger_functions"."log_activity"();

CREATE OR REPLACE TRIGGER "before_insert_update_delete_on_members" BEFORE INSERT OR DELETE OR UPDATE ON "public"."members" FOR EACH ROW EXECUTE FUNCTION "trigger_functions"."log_activity"();

CREATE OR REPLACE TRIGGER "before_insert_update_delete_on_transfers" BEFORE INSERT OR DELETE OR UPDATE ON "public"."transfers" FOR EACH ROW EXECUTE FUNCTION "trigger_functions"."log_activity"();

CREATE OR REPLACE TRIGGER "expense_deleted" AFTER DELETE ON "public"."expenses" FOR EACH ROW EXECUTE FUNCTION "trigger_functions"."expense_deleted"();

ALTER TABLE ONLY "public"."balances"
    ADD CONSTRAINT "balances_expense_fkey" FOREIGN KEY ("expense") REFERENCES "public"."expenses"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."balances"
    ADD CONSTRAINT "balances_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."debts"
    ADD CONSTRAINT "debts_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."expense_participants"
    ADD CONSTRAINT "expense_participants_expense_fkey" FOREIGN KEY ("expense") REFERENCES "public"."expenses"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."expense_participants"
    ADD CONSTRAINT "expense_participants_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."expense_participants"
    ADD CONSTRAINT "expense_participants_member_fkey" FOREIGN KEY ("member") REFERENCES "public"."members"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."expense_payers"
    ADD CONSTRAINT "expense_payers_expense_fkey" FOREIGN KEY ("expense") REFERENCES "public"."expenses"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."expense_payers"
    ADD CONSTRAINT "expense_payers_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."expense_payers"
    ADD CONSTRAINT "expense_payers_member_fkey" FOREIGN KEY ("member") REFERENCES "public"."members"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."friend_requests"
    ADD CONSTRAINT "friend_requests_receiver_fkey" FOREIGN KEY ("receiver") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."friend_requests"
    ADD CONSTRAINT "friend_requests_sender_fkey" FOREIGN KEY ("sender") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."friends"
    ADD CONSTRAINT "friends_friend_fkey" FOREIGN KEY ("friend") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."friends"
    ADD CONSTRAINT "friends_profile_fkey" FOREIGN KEY ("profile") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."group_invitations"
    ADD CONSTRAINT "group_invitations_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."group_invitations"
    ADD CONSTRAINT "group_invitations_receiver_fkey" FOREIGN KEY ("receiver") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."group_invitations"
    ADD CONSTRAINT "group_invitations_sender_fkey" FOREIGN KEY ("sender") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."members"
    ADD CONSTRAINT "members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."balances"
    ADD CONSTRAINT "public_Balance_owner_fkey" FOREIGN KEY ("owner") REFERENCES "public"."members"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."debts"
    ADD CONSTRAINT "public_Debt_borrower_fkey" FOREIGN KEY ("borrower") REFERENCES "public"."members"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."debts"
    ADD CONSTRAINT "public_Debt_lender_fkey" FOREIGN KEY ("lender") REFERENCES "public"."members"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."members"
    ADD CONSTRAINT "public_Member_profile_fkey" FOREIGN KEY ("profile") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."groups"
    ADD CONSTRAINT "public_groups_owner_fkey" FOREIGN KEY ("owner") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."transfers"
    ADD CONSTRAINT "transfers_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."transfers"
    ADD CONSTRAINT "transfers_receiver_fkey" FOREIGN KEY ("receiver") REFERENCES "public"."members"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."transfers"
    ADD CONSTRAINT "transfers_sender_fkey" FOREIGN KEY ("sender") REFERENCES "public"."members"("id") ON UPDATE CASCADE ON DELETE CASCADE;

CREATE POLICY "Users can insert their own profile." ON "public"."profiles" FOR INSERT TO "authenticated", "anon" WITH CHECK (("auth"."uid"() = "id"));

CREATE POLICY "Users can update own profile." ON "public"."profiles" FOR UPDATE TO "authenticated", "anon" USING (("auth"."uid"() = "id"));

CREATE POLICY "access if included in request" ON "public"."friend_requests" FOR SELECT TO "authenticated", "anon" USING ((("sender" = "auth"."uid"()) OR ("receiver" = "auth"."uid"())));

ALTER TABLE "public"."activity_logs" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth and anon users can fetch expense categories" ON "public"."expense_categories" FOR SELECT TO "authenticated", "anon" USING (true);

CREATE POLICY "auth_anon_can_insert_friend_req" ON "public"."friend_requests" FOR INSERT TO "authenticated", "anon" WITH CHECK (("sender" = "auth"."uid"()));

ALTER TABLE "public"."balances" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."debts" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."expense_categories" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."expense_participants" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."expense_payers" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."expenses" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "friend_request_side_can_delete" ON "public"."friend_requests" FOR DELETE TO "authenticated", "anon" USING ((("sender" = "auth"."uid"()) OR ("receiver" = "auth"."uid"())));

ALTER TABLE "public"."friend_requests" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."friends" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "group owner can delete group" ON "public"."groups" FOR DELETE TO "authenticated", "anon" USING (("owner" = "auth"."uid"()));

ALTER TABLE "public"."group_invitations" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."groups" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."members" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "only_update_status" ON "public"."friend_requests" FOR UPDATE TO "authenticated", "anon" USING (("receiver" = "auth"."uid"()));

ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_groups_policy" ON "public"."groups" FOR SELECT TO "authenticated", "anon" USING ((("id" IN ( SELECT "members"."group_id"
   FROM "public"."members"
  WHERE ("members"."profile" = "auth"."uid"()))) OR ("owner" = "auth"."uid"())));

CREATE POLICY "sender can insert" ON "public"."group_invitations" FOR INSERT TO "authenticated", "anon" WITH CHECK (("sender" = "auth"."uid"()));

CREATE POLICY "sender or receiver can access" ON "public"."group_invitations" FOR SELECT TO "authenticated", "anon" USING ((("sender" = "auth"."uid"()) OR ("receiver" = "auth"."uid"())));

CREATE POLICY "sender or receiver can delete" ON "public"."group_invitations" FOR DELETE TO "authenticated", "anon" USING ((("sender" = "auth"."uid"()) OR ("receiver" = "auth"."uid"())));

ALTER TABLE "public"."transfers" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user can create a member for his groups" ON "public"."members" FOR INSERT TO "authenticated", "anon" WITH CHECK (("utils"."is_member_of"("auth"."uid"(), "group_id") OR "utils"."is_person_invited"("auth"."uid"(), "group_id")));

CREATE POLICY "user can create friend for himself" ON "public"."friends" FOR INSERT TO "authenticated", "anon" WITH CHECK ((("profile" = "auth"."uid"()) OR ("friend" = "auth"."uid"())));

CREATE POLICY "user can create group for himself" ON "public"."groups" FOR INSERT TO "authenticated", "anon" WITH CHECK (("owner" = "auth"."uid"()));

CREATE POLICY "user can update balances for their groups" ON "public"."balances" FOR UPDATE TO "authenticated", "anon" USING (true) WITH CHECK ("utils"."is_member_of"("auth"."uid"(), "group_id"));

CREATE POLICY "user can update friends for himself" ON "public"."friends" FOR UPDATE TO "authenticated", "anon" USING (true) WITH CHECK ((("profile" = "auth"."uid"()) OR ("friend" = "auth"."uid"())));

CREATE POLICY "user can update group of his own" ON "public"."groups" FOR UPDATE TO "authenticated", "anon" USING (true) WITH CHECK ((("owner" = "auth"."uid"()) OR "utils"."is_member_of"("auth"."uid"(), "id")));

CREATE POLICY "user can update members for his group" ON "public"."members" FOR UPDATE TO "authenticated", "anon" USING (true) WITH CHECK ("utils"."is_member_of"("auth"."uid"(), "group_id"));

CREATE POLICY "users ca create debts for their group" ON "public"."debts" FOR INSERT TO "authenticated", "anon" WITH CHECK ("utils"."is_member_of"("auth"."uid"(), "group_id"));

CREATE POLICY "users can access balances of their group" ON "public"."balances" TO "authenticated", "anon" USING ("utils"."is_member_of"("auth"."uid"(), "group_id"));

CREATE POLICY "users can access debts of their groups" ON "public"."debts" TO "authenticated", "anon" USING ("utils"."is_member_of"("auth"."uid"(), "group_id"));

CREATE POLICY "users can access exp participants of their group" ON "public"."expense_participants" TO "authenticated", "anon" USING ("utils"."is_member_of"("auth"."uid"(), "group_id"));

CREATE POLICY "users can access exp payers of their gr" ON "public"."expense_payers" TO "authenticated", "anon" USING ("utils"."is_member_of"("auth"."uid"(), "group_id"));

CREATE POLICY "users can access expenses in their groups" ON "public"."expenses" TO "authenticated", "anon" USING ("utils"."is_member_of"("auth"."uid"(), "group_id"));

CREATE POLICY "users can access members from his group" ON "public"."members" TO "authenticated", "anon" USING (("utils"."is_member_of"("auth"."uid"(), "group_id") OR "utils"."is_group_owner"("auth"."uid"(), "group_id")));

CREATE POLICY "users can add expenses in their groups" ON "public"."expenses" FOR INSERT TO "authenticated", "anon" WITH CHECK ("utils"."is_member_of"("auth"."uid"(), "group_id"));

CREATE POLICY "users can create balances for their group" ON "public"."balances" FOR INSERT TO "authenticated", "anon" WITH CHECK ("utils"."is_member_of"("auth"."uid"(), "group_id"));

CREATE POLICY "users can interact with transfers in their group" ON "public"."transfers" TO "authenticated", "anon" USING ("utils"."is_member_of"("auth"."uid"(), "group_id"));

CREATE POLICY "users can see their own friendships" ON "public"."friends" TO "authenticated", "anon" USING ((("profile" = "auth"."uid"()) OR ("friend" = "auth"."uid"())));

CREATE POLICY "users can see their own groups activity log" ON "public"."activity_logs" FOR SELECT TO "authenticated", "anon" USING ("utils"."is_member_of"("auth"."uid"(), "group_id"));

CREATE POLICY "users can update debts for their groups" ON "public"."debts" FOR UPDATE TO "authenticated", "anon" USING (true) WITH CHECK ("utils"."is_member_of"("auth"."uid"(), "group_id"));

CREATE POLICY "users can update expenses in their group" ON "public"."expenses" FOR UPDATE TO "authenticated", "anon" USING (true) WITH CHECK ("utils"."is_member_of"("auth"."uid"(), "group_id"));

CREATE POLICY "users can view all profiles" ON "public"."profiles" FOR SELECT TO "authenticated", "anon" USING (true);

ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";

ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."expenses";

ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."friend_requests";

ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."members";

GRANT USAGE ON SCHEMA "algo" TO "anon";
GRANT USAGE ON SCHEMA "algo" TO "authenticated";
GRANT USAGE ON SCHEMA "algo" TO "service_role";

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON FUNCTION "algo"."calculate_new_debts"("group_id_input" bigint) TO "anon";
GRANT ALL ON FUNCTION "algo"."calculate_new_debts"("group_id_input" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "algo"."calculate_new_debts"("group_id_input" bigint) TO "service_role";

GRANT ALL ON FUNCTION "algo"."get_debts_from"("group_id_input" bigint, "selection" "public"."balance_info"[]) TO "anon";
GRANT ALL ON FUNCTION "algo"."get_debts_from"("group_id_input" bigint, "selection" "public"."balance_info"[]) TO "authenticated";
GRANT ALL ON FUNCTION "algo"."get_debts_from"("group_id_input" bigint, "selection" "public"."balance_info"[]) TO "service_role";

GRANT ALL ON FUNCTION "algo"."get_selection_with_sum"("target_sum" real, "selection_length" integer, "balances" "public"."balance_info"[]) TO "anon";
GRANT ALL ON FUNCTION "algo"."get_selection_with_sum"("target_sum" real, "selection_length" integer, "balances" "public"."balance_info"[]) TO "authenticated";
GRANT ALL ON FUNCTION "algo"."get_selection_with_sum"("target_sum" real, "selection_length" integer, "balances" "public"."balance_info"[]) TO "service_role";

GRANT ALL ON FUNCTION "algo"."post_expense"("group_id_input" bigint) TO "anon";
GRANT ALL ON FUNCTION "algo"."post_expense"("group_id_input" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "algo"."post_expense"("group_id_input" bigint) TO "service_role";

GRANT ALL ON FUNCTION "algo"."recalculate_total_balance"("group_id_input" bigint) TO "anon";
GRANT ALL ON FUNCTION "algo"."recalculate_total_balance"("group_id_input" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "algo"."recalculate_total_balance"("group_id_input" bigint) TO "service_role";

GRANT ALL ON FUNCTION "algo"."recalculate_total_expense"("group_id_input" bigint) TO "anon";
GRANT ALL ON FUNCTION "algo"."recalculate_total_expense"("group_id_input" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "algo"."recalculate_total_expense"("group_id_input" bigint) TO "service_role";

GRANT ALL ON FUNCTION "algo"."remove_selection_from_balances"("_balances" "public"."balance_info"[], "_selection" "public"."balance_info"[]) TO "anon";
GRANT ALL ON FUNCTION "algo"."remove_selection_from_balances"("_balances" "public"."balance_info"[], "_selection" "public"."balance_info"[]) TO "authenticated";
GRANT ALL ON FUNCTION "algo"."remove_selection_from_balances"("_balances" "public"."balance_info"[], "_selection" "public"."balance_info"[]) TO "service_role";

GRANT ALL ON FUNCTION "algo"."update_group_settled_status"("_group_id_input" bigint) TO "anon";
GRANT ALL ON FUNCTION "algo"."update_group_settled_status"("_group_id_input" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "algo"."update_group_settled_status"("_group_id_input" bigint) TO "service_role";

GRANT ALL ON FUNCTION "algo"."update_profile_balance"("group_id_input" bigint) TO "anon";
GRANT ALL ON FUNCTION "algo"."update_profile_balance"("group_id_input" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "algo"."update_profile_balance"("group_id_input" bigint) TO "service_role";

GRANT ALL ON FUNCTION "public"."accept_friend_request"("sender_uid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."accept_friend_request"("sender_uid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."accept_friend_request"("sender_uid" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."accept_group_invite"("_profile_id" "uuid", "_group_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."accept_group_invite"("_profile_id" "uuid", "_group_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."accept_group_invite"("_profile_id" "uuid", "_group_id" bigint) TO "service_role";

GRANT ALL ON FUNCTION "public"."assign_new_member"("_profile_id" "uuid", "_member_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."assign_new_member"("_profile_id" "uuid", "_member_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."assign_new_member"("_profile_id" "uuid", "_member_id" bigint) TO "service_role";

GRANT ALL ON FUNCTION "public"."create_expense"("group_id_input" integer, "title_input" "text", "description_input" "text", "amount_input" real, "currency_input" "text", "date_input" timestamp without time zone, "proof_input" "text", "payers_input" integer[], "participants_input" integer[]) TO "anon";
GRANT ALL ON FUNCTION "public"."create_expense"("group_id_input" integer, "title_input" "text", "description_input" "text", "amount_input" real, "currency_input" "text", "date_input" timestamp without time zone, "proof_input" "text", "payers_input" integer[], "participants_input" integer[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_expense"("group_id_input" integer, "title_input" "text", "description_input" "text", "amount_input" real, "currency_input" "text", "date_input" timestamp without time zone, "proof_input" "text", "payers_input" integer[], "participants_input" integer[]) TO "service_role";

GRANT ALL ON FUNCTION "public"."create_group"("title_input" "text", "member_names_input" "text"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."create_group"("title_input" "text", "member_names_input" "text"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_group"("title_input" "text", "member_names_input" "text"[]) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_groups_summary"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_groups_summary"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_groups_summary"() TO "service_role";

GRANT ALL ON FUNCTION "public"."search_friends"("keyword_input" "text", "profile_id_input" "uuid", "limit_input" integer, "offset_input" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."search_friends"("keyword_input" "text", "profile_id_input" "uuid", "limit_input" integer, "offset_input" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_friends"("keyword_input" "text", "profile_id_input" "uuid", "limit_input" integer, "offset_input" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."settle_expense"("expense_id" bigint, "_group_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."settle_expense"("expense_id" bigint, "_group_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."settle_expense"("expense_id" bigint, "_group_id" bigint) TO "service_role";

GRANT ALL ON FUNCTION "public"."settle_group"("_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."settle_group"("_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."settle_group"("_id" bigint) TO "service_role";

GRANT ALL ON FUNCTION "public"."update_expense"("expense_id" integer, "title_input" "text", "description_input" "text", "amount_input" real, "date_input" timestamp without time zone, "currency_input" "text", "proof_input" "text", "payers_input" integer[], "participants_input" integer[]) TO "anon";
GRANT ALL ON FUNCTION "public"."update_expense"("expense_id" integer, "title_input" "text", "description_input" "text", "amount_input" real, "date_input" timestamp without time zone, "currency_input" "text", "proof_input" "text", "payers_input" integer[], "participants_input" integer[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_expense"("expense_id" integer, "title_input" "text", "description_input" "text", "amount_input" real, "date_input" timestamp without time zone, "currency_input" "text", "proof_input" "text", "payers_input" integer[], "participants_input" integer[]) TO "service_role";

GRANT ALL ON FUNCTION "public"."update_group"("group_id_input" integer, "title_input" "text", "description_input" "text", "member_names_input" "text"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."update_group"("group_id_input" integer, "title_input" "text", "description_input" "text", "member_names_input" "text"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_group"("group_id_input" integer, "title_input" "text", "description_input" "text", "member_names_input" "text"[]) TO "service_role";

GRANT ALL ON FUNCTION "public"."use_expense"("expense_id_input" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."use_expense"("expense_id_input" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."use_expense"("expense_id_input" bigint) TO "service_role";

GRANT ALL ON FUNCTION "trigger_functions"."expense_deleted"() TO "anon";
GRANT ALL ON FUNCTION "trigger_functions"."expense_deleted"() TO "authenticated";
GRANT ALL ON FUNCTION "trigger_functions"."expense_deleted"() TO "service_role";

GRANT ALL ON FUNCTION "trigger_functions"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "trigger_functions"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "trigger_functions"."handle_new_user"() TO "service_role";

GRANT ALL ON FUNCTION "trigger_functions"."log_activity"() TO "anon";
GRANT ALL ON FUNCTION "trigger_functions"."log_activity"() TO "authenticated";
GRANT ALL ON FUNCTION "trigger_functions"."log_activity"() TO "service_role";

GRANT ALL ON FUNCTION "utils"."get_member_id"("_person_id" "uuid", "_group_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "utils"."get_member_id"("_person_id" "uuid", "_group_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "utils"."get_member_id"("_person_id" "uuid", "_group_id" bigint) TO "service_role";

GRANT ALL ON FUNCTION "utils"."is_group_owner"("_person_id" "uuid", "_group_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "utils"."is_group_owner"("_person_id" "uuid", "_group_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "utils"."is_group_owner"("_person_id" "uuid", "_group_id" bigint) TO "service_role";

GRANT ALL ON FUNCTION "utils"."is_member_of"("_person_id" "uuid", "_group_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "utils"."is_member_of"("_person_id" "uuid", "_group_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "utils"."is_member_of"("_person_id" "uuid", "_group_id" bigint) TO "service_role";

GRANT ALL ON FUNCTION "utils"."is_person_invited"("_person_id" "uuid", "_group_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "utils"."is_person_invited"("_person_id" "uuid", "_group_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "utils"."is_person_invited"("_person_id" "uuid", "_group_id" bigint) TO "service_role";

GRANT ALL ON TABLE "public"."balances" TO "anon";
GRANT ALL ON TABLE "public"."balances" TO "authenticated";
GRANT ALL ON TABLE "public"."balances" TO "service_role";

GRANT ALL ON SEQUENCE "public"."Balance_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."Balance_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."Balance_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."debts" TO "anon";
GRANT ALL ON TABLE "public"."debts" TO "authenticated";
GRANT ALL ON TABLE "public"."debts" TO "service_role";

GRANT ALL ON SEQUENCE "public"."Debt_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."Debt_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."Debt_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."expenses" TO "anon";
GRANT ALL ON TABLE "public"."expenses" TO "authenticated";
GRANT ALL ON TABLE "public"."expenses" TO "service_role";

GRANT ALL ON SEQUENCE "public"."Expense_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."Expense_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."Expense_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."groups" TO "anon";
GRANT ALL ON TABLE "public"."groups" TO "authenticated";
GRANT ALL ON TABLE "public"."groups" TO "service_role";

GRANT ALL ON SEQUENCE "public"."Group_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."Group_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."Group_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."members" TO "anon";
GRANT ALL ON TABLE "public"."members" TO "authenticated";
GRANT ALL ON TABLE "public"."members" TO "service_role";

GRANT ALL ON SEQUENCE "public"."Member_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."Member_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."Member_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."activity_logs" TO "anon";
GRANT ALL ON TABLE "public"."activity_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."activity_logs" TO "service_role";

GRANT ALL ON SEQUENCE "public"."activity_logs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."activity_logs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."activity_logs_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."expense_categories" TO "anon";
GRANT ALL ON TABLE "public"."expense_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."expense_categories" TO "service_role";

GRANT ALL ON SEQUENCE "public"."expense_categories_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."expense_categories_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."expense_categories_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."expense_participants" TO "anon";
GRANT ALL ON TABLE "public"."expense_participants" TO "authenticated";
GRANT ALL ON TABLE "public"."expense_participants" TO "service_role";

GRANT ALL ON SEQUENCE "public"."expense_participants_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."expense_participants_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."expense_participants_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."expense_payers" TO "anon";
GRANT ALL ON TABLE "public"."expense_payers" TO "authenticated";
GRANT ALL ON TABLE "public"."expense_payers" TO "service_role";

GRANT ALL ON SEQUENCE "public"."expense_payer_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."expense_payer_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."expense_payer_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."friend_requests" TO "anon";
GRANT ALL ON TABLE "public"."friend_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."friend_requests" TO "service_role";

GRANT ALL ON SEQUENCE "public"."friend_requests_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."friend_requests_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."friend_requests_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."friends" TO "anon";
GRANT ALL ON TABLE "public"."friends" TO "authenticated";
GRANT ALL ON TABLE "public"."friends" TO "service_role";

GRANT ALL ON SEQUENCE "public"."friends_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."friends_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."friends_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."group_invitations" TO "anon";
GRANT ALL ON TABLE "public"."group_invitations" TO "authenticated";
GRANT ALL ON TABLE "public"."group_invitations" TO "service_role";

GRANT ALL ON SEQUENCE "public"."group_invitations_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."group_invitations_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."group_invitations_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";

GRANT ALL ON TABLE "public"."transfers" TO "anon";
GRANT ALL ON TABLE "public"."transfers" TO "authenticated";
GRANT ALL ON TABLE "public"."transfers" TO "service_role";

GRANT ALL ON SEQUENCE "public"."transfers_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."transfers_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."transfers_id_seq" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";

RESET ALL;
