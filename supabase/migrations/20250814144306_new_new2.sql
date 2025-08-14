set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.join_group_with_token(p_token text, p_member_id integer DEFAULT NULL::integer, p_new_name text DEFAULT NULL::text)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_invite   record;
    v_user_id  uuid := auth.uid();
    v_group_id integer;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated.';
    END IF;

    -- Validate token
    SELECT *
    INTO v_invite
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
    PERFORM 1
    FROM members
    WHERE group_id = v_group_id
      AND profile = v_user_id; -- No cast needed since profile is uuid
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
        SET profile = v_user_id
        WHERE id = p_member_id
          AND group_id = v_group_id
          AND profile IS NULL;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Invalid member ID or already bound.';
        END IF;
    ELSE
        -- Create new member
        INSERT INTO members (name, group_id, profile, role)
        VALUES (p_new_name, v_group_id, v_user_id, 'member');
    END IF;

    -- Mark token as used
    UPDATE invite_tokens
    SET used = true
    WHERE token = p_token;

    RETURN v_group_id;
END;
$function$
;


set check_function_bodies = off;

CREATE OR REPLACE FUNCTION utils.is_member_of(_person_id uuid, _group_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$DECLARE
    _is_member BOOLEAN;
BEGIN
    -- Check if the person is a member of the group
    SELECT EXISTS (
        SELECT 1
        FROM members mb
        WHERE mb.group_id = _group_id
          AND mb.profile = _person_id
    ) INTO _is_member;

    
    RETURN _is_member;
END;$function$
;


