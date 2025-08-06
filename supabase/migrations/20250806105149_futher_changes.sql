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


