create table "public"."invite_tokens" (
    "id" uuid not null default gen_random_uuid(),
    "group_id" bigint not null,
    "token" text not null,
    "created_at" timestamp with time zone default now(),
    "used" boolean default false,
    "expires_at" timestamp with time zone
);


CREATE UNIQUE INDEX invite_tokens_pkey ON public.invite_tokens USING btree (id);

CREATE UNIQUE INDEX invite_tokens_token_key ON public.invite_tokens USING btree (token);

alter table "public"."invite_tokens" add constraint "invite_tokens_pkey" PRIMARY KEY using index "invite_tokens_pkey";

alter table "public"."invite_tokens" add constraint "invite_tokens_group_id_fkey" FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE not valid;

alter table "public"."invite_tokens" validate constraint "invite_tokens_group_id_fkey";

alter table "public"."invite_tokens" add constraint "invite_tokens_token_key" UNIQUE using index "invite_tokens_token_key";

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

grant delete on table "public"."invite_tokens" to "anon";

grant insert on table "public"."invite_tokens" to "anon";

grant references on table "public"."invite_tokens" to "anon";

grant select on table "public"."invite_tokens" to "anon";

grant trigger on table "public"."invite_tokens" to "anon";

grant truncate on table "public"."invite_tokens" to "anon";

grant update on table "public"."invite_tokens" to "anon";

grant delete on table "public"."invite_tokens" to "authenticated";

grant insert on table "public"."invite_tokens" to "authenticated";

grant references on table "public"."invite_tokens" to "authenticated";

grant select on table "public"."invite_tokens" to "authenticated";

grant trigger on table "public"."invite_tokens" to "authenticated";

grant truncate on table "public"."invite_tokens" to "authenticated";

grant update on table "public"."invite_tokens" to "authenticated";

grant delete on table "public"."invite_tokens" to "service_role";

grant insert on table "public"."invite_tokens" to "service_role";

grant references on table "public"."invite_tokens" to "service_role";

grant select on table "public"."invite_tokens" to "service_role";

grant trigger on table "public"."invite_tokens" to "service_role";

grant truncate on table "public"."invite_tokens" to "service_role";

grant update on table "public"."invite_tokens" to "service_role";


