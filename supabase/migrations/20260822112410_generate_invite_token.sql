-- Mint invite tokens in Postgres (issue #96).
-- Token value and expiry are assigned here, not trusted from the client.
-- SECURITY DEFINER so authenticated callers do not need INSERT on invite_tokens.
-- Membership is checked in the function body (definer bypasses RLS).

CREATE INDEX IF NOT EXISTS invite_tokens_group_id_idx
  ON public.invite_tokens (group_id);

ALTER TABLE public.invite_tokens ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'invite_tokens'
      AND policyname = 'members can select invite tokens'
  ) THEN
    CREATE POLICY "members can select invite tokens"
      ON public.invite_tokens
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.members m
          WHERE m.group_id = invite_tokens.group_id
            AND m.profile = (SELECT auth.uid())
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'invite_tokens'
      AND policyname = 'members can insert invite tokens'
  ) THEN
    CREATE POLICY "members can insert invite tokens"
      ON public.invite_tokens
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.members m
          WHERE m.group_id = invite_tokens.group_id
            AND m.profile = (SELECT auth.uid())
        )
      );
  END IF;
END $$;

-- Direct inserts would let the client choose token and expires_at.
REVOKE ALL ON TABLE public.invite_tokens FROM anon;
REVOKE ALL ON TABLE public.invite_tokens FROM authenticated;

CREATE OR REPLACE FUNCTION public.generate_invite_token(group_id_input bigint)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_token text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.members m
    WHERE m.group_id = group_id_input
      AND m.profile = v_uid
  ) THEN
    RAISE EXCEPTION 'Not a member of this group.';
  END IF;

  v_token := gen_random_uuid()::text;

  INSERT INTO public.invite_tokens (group_id, token, expires_at)
  VALUES (group_id_input, v_token, timezone('utc', now()) + interval '7 days');

  RETURN v_token;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_invite_group_id(p_token text)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_invite record;
BEGIN
  SELECT * INTO v_invite
  FROM public.invite_tokens
  WHERE token = p_token;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid invite link.';
  END IF;

  IF v_invite.used OR (v_invite.expires_at IS NOT NULL AND v_invite.expires_at < now()) THEN
    RAISE EXCEPTION 'This invite has already been used or expired.';
  END IF;

  RETURN v_invite.group_id;
END;
$function$;

REVOKE ALL ON FUNCTION public.generate_invite_token(bigint) FROM PUBLIC;
GRANT ALL ON FUNCTION public.generate_invite_token(bigint) TO authenticated;
GRANT ALL ON FUNCTION public.generate_invite_token(bigint) TO service_role;

REVOKE ALL ON FUNCTION public.get_invite_group_id(text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.get_invite_group_id(text) TO authenticated;
GRANT ALL ON FUNCTION public.get_invite_group_id(text) TO service_role;

NOTIFY pgrst, 'reload schema';
