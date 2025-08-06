set check_function_bodies = off;

CREATE OR REPLACE FUNCTION algo.post_expense(group_id_input bigint, expense_id_input bigint DEFAULT NULL::bigint)
 RETURNS void
 LANGUAGE plpgsql
AS $function$DECLARE
    affected_members integer[];
BEGIN
    -- Capture affected members from calculate_debts_per_expenses
    SELECT ARRAY(SELECT * FROM algo.calculate_debts_per_expenses(group_id_input, expense_id_input)) INTO affected_members;

    PERFORM algo.calculate_group_member_debts(group_id_input, affected_members);
    PERFORM algo.reconcile_debts(group_id_input, affected_members);
    PERFORM algo.calculate_group_member_balances(group_id_input, affected_members);
    PERFORM algo.calculate_group_total_expense(group_id_input);
    PERFORM algo.update_group_settled_status(group_id_input);
END;$function$
;


set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_unbound_members_for_token(p_token text)
 RETURNS TABLE(id integer, name text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_invite record;
BEGIN
  -- Validate token
  SELECT * INTO v_invite
  FROM invite_tokens
  WHERE token = p_token;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid invite link.';
  END IF;

  IF v_invite.used OR (v_invite.expires_at IS NOT NULL AND v_invite.expires_at < NOW()) THEN
    RAISE EXCEPTION 'This invite has already been used or expired.';
  END IF;

  -- Return unbound members
  RETURN QUERY
  SELECT m.id::integer, m.name::text
  FROM members m
  WHERE m.group_id = v_invite.group_id
  AND m.profile IS NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.join_group_with_token(p_token text, p_member_id integer DEFAULT NULL::integer, p_new_name text DEFAULT NULL::text)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_invite record;
  v_user_id uuid := auth.uid();
  v_group_id integer;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated.';
  END IF;

  -- Validate token
  SELECT * INTO v_invite
  FROM invite_tokens
  WHERE token = p_token;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid invite link.';
  END IF;

  IF v_invite.used OR (v_invite.expires_at IS NOT NULL AND v_invite.expires_at < NOW()) THEN
    RAISE EXCEPTION 'This invite has already been used or expired.';
  END IF;

  v_group_id := v_invite.group_id;

  -- Check if already a member
  PERFORM 1 FROM members
  WHERE group_id = v_group_id AND profile = v_user_id::text;  -- Cast uuid to text since profile is string
  IF FOUND THEN
    RAISE EXCEPTION 'You are already a member of this group.';
  END IF;

  IF p_member_id IS NOT NULL AND p_new_name IS NOT NULL THEN
    RAISE EXCEPTION 'Provide either member_id or new_name, not both.';
  END IF;

  IF p_member_id IS NULL AND p_new_name IS NULL THEN
    RAISE EXCEPTION 'Provide member_id or new_name.';
  END IF;

  IF p_member_id IS NOT NULL THEN
    -- Bind to existing member
    UPDATE members
    SET profile = v_user_id::text  -- Cast uuid to text
    WHERE id = p_member_id
    AND group_id = v_group_id
    AND profile IS NULL;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Invalid member ID or already bound.';
    END IF;
  ELSE
    -- Create new member
    INSERT INTO members (name, group_id, profile, role)
    VALUES (p_new_name, v_group_id, v_user_id::text, 'member');  -- Cast uuid to text
  END IF;

  -- Mark token as used
  UPDATE invite_tokens
  SET used = true
  WHERE token = p_token;

  RETURN v_group_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.settle_expense(expense_id bigint, _group_id bigint)
 RETURNS void
 LANGUAGE plpgsql
AS $function$DECLARE
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
    PERFORM algo.post_expense(_group_id, expense_id);

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
AS $function$DECLARE
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

    -- Update only unsettled expenses
    UPDATE expenses
    SET settled = TRUE
    WHERE group_id = _id AND settled IS DISTINCT FROM TRUE;

    -- Update group only if not already settled
    UPDATE groups
    SET settled = TRUE
    WHERE id = _id AND settled IS DISTINCT FROM TRUE;

    -- Reset total_balance for all members in the group
    UPDATE members
    SET total_balance = 0
    WHERE group_id = _id AND total_balance IS DISTINCT FROM 0;

    -- Delete old debt records
    DELETE FROM debts WHERE group_id = _id;
    DELETE FROM debt_per_expense WHERE group_id = _id;
END;$function$
;


set check_function_bodies = off;

CREATE OR REPLACE FUNCTION trigger_functions.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$DECLARE
  fullName TEXT;
BEGIN
  IF NEW.email IS NOT NULL THEN
    -- Extracting the full name from email for non-anon users
    fullName := SUBSTRING(NEW.email FROM '^[^@]+');
  ELSE
    -- Default for anonymous users
    fullName := 'Anonymous';
  END IF;

  -- Inserting into the profiles table (email can be NULL for anon)
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, fullName, NEW.email);

  RETURN NEW;
END;$function$
;


