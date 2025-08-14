drop policy "sender can insert" on "public"."group_invitations";

drop policy "sender or receiver can access" on "public"."group_invitations";

drop policy "sender or receiver can delete" on "public"."group_invitations";

drop policy "select_groups_policy" on "public"."groups";

revoke delete on table "public"."group_invitations" from "anon";

revoke insert on table "public"."group_invitations" from "anon";

revoke references on table "public"."group_invitations" from "anon";

revoke select on table "public"."group_invitations" from "anon";

revoke trigger on table "public"."group_invitations" from "anon";

revoke truncate on table "public"."group_invitations" from "anon";

revoke update on table "public"."group_invitations" from "anon";

revoke delete on table "public"."group_invitations" from "authenticated";

revoke insert on table "public"."group_invitations" from "authenticated";

revoke references on table "public"."group_invitations" from "authenticated";

revoke select on table "public"."group_invitations" from "authenticated";

revoke trigger on table "public"."group_invitations" from "authenticated";

revoke truncate on table "public"."group_invitations" from "authenticated";

revoke update on table "public"."group_invitations" from "authenticated";

revoke delete on table "public"."group_invitations" from "service_role";

revoke insert on table "public"."group_invitations" from "service_role";

revoke references on table "public"."group_invitations" from "service_role";

revoke select on table "public"."group_invitations" from "service_role";

revoke trigger on table "public"."group_invitations" from "service_role";

revoke truncate on table "public"."group_invitations" from "service_role";

revoke update on table "public"."group_invitations" from "service_role";

alter table "public"."group_invitations" drop constraint "group_invitations_group_id_fkey";

alter table "public"."group_invitations" drop constraint "group_invitations_receiver_fkey";

alter table "public"."group_invitations" drop constraint "group_invitations_sender_fkey";

alter table "public"."group_invitations" drop constraint "group_invitations_pkey";

drop index if exists "public"."group_invitations_pkey";

drop table "public"."group_invitations";

alter table "public"."invite_tokens" enable row level security;

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

create policy "authAndAnonAccessInvites"
on "public"."invite_tokens"
as permissive
for all
to authenticated, anon
using (true)
with check (true);



drop function if exists "utils"."is_person_invited"(_person_id uuid, _group_id bigint);
