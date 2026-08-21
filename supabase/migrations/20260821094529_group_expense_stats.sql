-- Group statistics aggregates (issue #76).
-- SECURITY INVOKER so expenses / payers / participants RLS still applies.
-- Composite indexes cover the stats scans: filter group_id + date, then
-- personal slices via member on the join tables.

CREATE INDEX IF NOT EXISTS expenses_group_id_date_idx
  ON public.expenses (group_id, date DESC)
  INCLUDE (amount, category, title, settled, created_at);

CREATE INDEX IF NOT EXISTS expense_payers_group_member_idx
  ON public.expense_payers (group_id, member)
  INCLUDE (expense);

CREATE INDEX IF NOT EXISTS expense_participants_group_member_idx
  ON public.expense_participants (group_id, member)
  INCLUDE (expense);

CREATE OR REPLACE FUNCTION public.get_group_expense_stats(
  group_id_input bigint,
  month_start date DEFAULT (date_trunc('month', timezone('utc', now())))::date
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path TO 'public', 'utils'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_result jsonb;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated.';
  END IF;

  IF NOT utils.is_member_of(v_uid, group_id_input) THEN
    RAISE EXCEPTION 'Not a member of this group.';
  END IF;

  WITH payers AS (
    SELECT DISTINCT py.expense
    FROM public.expense_payers py
    JOIN public.members m ON m.id = py.member
    WHERE py.group_id = group_id_input
      AND m.profile = v_uid
  ),
  participants AS (
    SELECT DISTINCT pt.expense
    FROM public.expense_participants pt
    JOIN public.members m ON m.id = pt.member
    WHERE pt.group_id = group_id_input
      AND m.profile = v_uid
  ),
  base AS MATERIALIZED (
    SELECT
      e.id,
      e.group_id,
      e.title,
      e.amount,
      e.category,
      e.settled,
      e.created_at,
      (
        e.date >= month_start::timestamp
        AND e.date < (month_start + interval '1 month')
      ) AS in_month,
      (py.expense IS NOT NULL) AS is_payer,
      (pt.expense IS NOT NULL) AS is_participant
    FROM public.expenses e
    LEFT JOIN payers py ON py.expense = e.id
    LEFT JOIN participants pt ON pt.expense = e.id
    WHERE e.group_id = group_id_input
  ),
  group_all_cats AS (
    SELECT
      coalesce(nullif(b.category, ''), 'Other') AS category,
      sum(b.amount)::double precision AS total
    FROM base b
    GROUP BY 1
  ),
  group_month_cats AS (
    SELECT
      coalesce(nullif(b.category, ''), 'Other') AS category,
      sum(b.amount)::double precision AS total
    FROM base b
    WHERE b.in_month
    GROUP BY 1
  ),
  personal_all_cats AS (
    SELECT
      coalesce(nullif(b.category, ''), 'Other') AS category,
      sum(b.amount)::double precision AS total
    FROM base b
    WHERE b.is_payer OR b.is_participant
    GROUP BY 1
  ),
  personal_month_cats AS (
    SELECT
      coalesce(nullif(b.category, ''), 'Other') AS category,
      sum(b.amount)::double precision AS total
    FROM base b
    WHERE b.in_month AND (b.is_payer OR b.is_participant)
    GROUP BY 1
  )
  SELECT jsonb_build_object(
    'group_all', jsonb_build_object(
      'total', (SELECT coalesce(sum(amount), 0)::double precision FROM base),
      'categories', (
        SELECT coalesce(
          jsonb_agg(
            jsonb_build_object('category', category, 'total', total)
            ORDER BY total DESC
          ),
          '[]'::jsonb
        )
        FROM group_all_cats
      ),
      'largest', (
        SELECT to_jsonb(s)
        FROM (
          SELECT id, group_id, title, amount, category, settled
          FROM base
          ORDER BY amount DESC NULLS LAST, created_at DESC, id DESC
          LIMIT 1
        ) s
      )
    ),
    'group_month', jsonb_build_object(
      'total', (
        SELECT coalesce(sum(amount), 0)::double precision
        FROM base
        WHERE in_month
      ),
      'categories', (
        SELECT coalesce(
          jsonb_agg(
            jsonb_build_object('category', category, 'total', total)
            ORDER BY total DESC
          ),
          '[]'::jsonb
        )
        FROM group_month_cats
      ),
      'largest', (
        SELECT to_jsonb(s)
        FROM (
          SELECT id, group_id, title, amount, category, settled
          FROM base
          WHERE in_month
          ORDER BY amount DESC NULLS LAST, created_at DESC, id DESC
          LIMIT 1
        ) s
      )
    ),
    'personal_all', jsonb_build_object(
      'total', (
        SELECT coalesce(sum(amount), 0)::double precision
        FROM base
        WHERE is_payer OR is_participant
      ),
      'categories', (
        SELECT coalesce(
          jsonb_agg(
            jsonb_build_object('category', category, 'total', total)
            ORDER BY total DESC
          ),
          '[]'::jsonb
        )
        FROM personal_all_cats
      ),
      'largest', (
        SELECT to_jsonb(s)
        FROM (
          SELECT id, group_id, title, amount, category, settled
          FROM base
          WHERE is_payer OR is_participant
          ORDER BY amount DESC NULLS LAST, created_at DESC, id DESC
          LIMIT 1
        ) s
      )
    ),
    'personal_month', jsonb_build_object(
      'total', (
        SELECT coalesce(sum(amount), 0)::double precision
        FROM base
        WHERE in_month AND (is_payer OR is_participant)
      ),
      'categories', (
        SELECT coalesce(
          jsonb_agg(
            jsonb_build_object('category', category, 'total', total)
            ORDER BY total DESC
          ),
          '[]'::jsonb
        )
        FROM personal_month_cats
      ),
      'largest', (
        SELECT to_jsonb(s)
        FROM (
          SELECT id, group_id, title, amount, category, settled
          FROM base
          WHERE in_month AND (is_payer OR is_participant)
          ORDER BY amount DESC NULLS LAST, created_at DESC, id DESC
          LIMIT 1
        ) s
      )
    ),
    'paid_all', (
      SELECT coalesce(sum(amount), 0)::double precision
      FROM base
      WHERE is_payer
    ),
    'paid_month', (
      SELECT coalesce(sum(amount), 0)::double precision
      FROM base
      WHERE is_payer AND in_month
    )
  )
  INTO v_result;

  RETURN v_result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sum_group_expenses(
  group_id_input bigint,
  start_date timestamp,
  end_date timestamp
)
RETURNS real
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public', 'utils'
AS $function$
  SELECT coalesce(sum(e.amount), 0)::real
  FROM public.expenses e
  WHERE e.group_id = group_id_input
    AND e.date >= start_date
    AND e.date < end_date
    AND utils.is_member_of(auth.uid(), group_id_input);
$function$;

REVOKE ALL ON FUNCTION public.get_group_expense_stats(bigint, date) FROM PUBLIC;
GRANT ALL ON FUNCTION public.get_group_expense_stats(bigint, date) TO authenticated;
GRANT ALL ON FUNCTION public.get_group_expense_stats(bigint, date) TO service_role;

REVOKE ALL ON FUNCTION public.sum_group_expenses(bigint, timestamp, timestamp) FROM PUBLIC;
GRANT ALL ON FUNCTION public.sum_group_expenses(bigint, timestamp, timestamp) TO authenticated;
GRANT ALL ON FUNCTION public.sum_group_expenses(bigint, timestamp, timestamp) TO service_role;

NOTIFY pgrst, 'reload schema';
