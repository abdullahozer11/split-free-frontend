drop policy "auth and anon users can fetch expense categories" on "public"."expense_categories";

alter table "public"."expense_categories" alter column "embedding" set data type vector(384) using "embedding"::vector(384);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_category_with_embedding(query_embedding vector)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
  _name text;
BEGIN
  -- get the closest category
  SELECT name INTO _name
  FROM expense_categories
  ORDER BY expense_categories.embedding <=> query_embedding
  LIMIT 1;

  RETURN _name;
END;
$function$
;

create policy "public can fetch"
on "public"."expense_categories"
as permissive
for select
to public
using (true);



