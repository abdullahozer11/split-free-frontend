drop trigger if exists "before_insert_update_delete_on_expenses" on "public"."expenses";

drop trigger if exists "before_insert_update_delete_on_groups" on "public"."groups";

drop trigger if exists "before_insert_update_delete_on_members" on "public"."members";

drop trigger if exists "before_insert_update_delete_on_transfers" on "public"."transfers";

drop policy "users can see their own groups activity log" on "public"."activity_logs";

drop policy "user can create a member for his groups" on "public"."members";

revoke delete on table "public"."activity_logs" from "anon";

revoke insert on table "public"."activity_logs" from "anon";

revoke references on table "public"."activity_logs" from "anon";

revoke select on table "public"."activity_logs" from "anon";

revoke trigger on table "public"."activity_logs" from "anon";

revoke truncate on table "public"."activity_logs" from "anon";

revoke update on table "public"."activity_logs" from "anon";

revoke delete on table "public"."activity_logs" from "authenticated";

revoke insert on table "public"."activity_logs" from "authenticated";

revoke references on table "public"."activity_logs" from "authenticated";

revoke select on table "public"."activity_logs" from "authenticated";

revoke trigger on table "public"."activity_logs" from "authenticated";

revoke truncate on table "public"."activity_logs" from "authenticated";

revoke update on table "public"."activity_logs" from "authenticated";

revoke delete on table "public"."activity_logs" from "service_role";

revoke insert on table "public"."activity_logs" from "service_role";

revoke references on table "public"."activity_logs" from "service_role";

revoke select on table "public"."activity_logs" from "service_role";

revoke trigger on table "public"."activity_logs" from "service_role";

revoke truncate on table "public"."activity_logs" from "service_role";

revoke update on table "public"."activity_logs" from "service_role";

drop function if exists "public"."create_expense"(group_id_input integer, title_input text, description_input text, amount_input real, currency_input text, date_input timestamp without time zone, proof_input text, payers_input integer[], participants_input integer[]);

drop function if exists "public"."update_expense"(expense_id integer, title_input text, description_input text, amount_input real, date_input timestamp without time zone, currency_input text, proof_input text, payers_input integer[], participants_input integer[]);

drop function if exists "public"."use_expense"(expense_id_input bigint);

alter table "public"."activity_logs" drop constraint "activity_logs_pkey";

drop index if exists "public"."activity_logs_pkey";

drop table "public"."activity_logs";

alter table "public"."members" add column "visible" boolean not null default true;

drop sequence if exists "public"."activity_logs_id_seq";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_expense(group_id_input integer, title_input text, description_input text, category_input text, amount_input real, currency_input text, date_input timestamp without time zone, proof_input text, payers_input integer[], participants_input integer[])
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

CREATE OR REPLACE FUNCTION public.exit_group(_profile_id uuid, _group_id bigint)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
    _invited BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM group_invitations
        WHERE receiver = _profile_id
          AND group_id = _group_id
    ) INTO _invited;

    IF _invited THEN
        DELETE FROM group_invitations
        WHERE receiver = _profile_id
          AND group_id = _group_id;
    ELSE
        DELETE FROM members
        WHERE profile = _profile_id
          AND group_id = _group_id;
    END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_expense(expense_id integer, title_input text, description_input text, category_input text, amount_input real, date_input timestamp without time zone, currency_input text, proof_input text, payers_input integer[], participants_input integer[])
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

CREATE OR REPLACE FUNCTION public.get_groups_summary()
 RETURNS TABLE(id bigint, settled boolean, title text, expense_count bigint, member_count bigint)
 LANGUAGE plpgsql
AS $function$BEGIN
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
        members m ON g.id = m.group_id
    LEFT JOIN
        expenses e ON g.id = e.group_id
    GROUP BY
        g.id, g.settled, g.title
    ORDER BY
        g.id ASC;
END;$function$
;

CREATE OR REPLACE FUNCTION public.search_friends(keyword_input text, profile_id_input uuid, limit_input integer DEFAULT 10, offset_input integer DEFAULT 0)
 RETURNS TABLE(id uuid, email text, avatar_url text, friend_status text)
 LANGUAGE plpgsql
AS $function$BEGIN
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
    ORDER BY p.email
    LIMIT limit_input
    OFFSET offset_input;
END;$function$
;

CREATE OR REPLACE FUNCTION public.use_expense(expense_id_input bigint)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN (
        SELECT
            jsonb_build_object(
                'amount', expenses.amount,
                'id', expenses.id,
                'title', expenses.title,
                'settled', expenses.settled,
                'currency', expenses.currency,
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
            expenses.currency,
            expenses.description,
            expenses.date,
            expenses.last_modified,
            expenses.group_id,
            expenses.category
    );
END;
$function$
;

create policy "user can create a member for his groups"
on "public"."members"
as permissive
for insert
to authenticated, anon
with check (utils.is_member_of(auth.uid(), group_id));



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


