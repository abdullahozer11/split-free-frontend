alter table "public"."profiles" add column "created_at" timestamp with time zone default now();


set check_function_bodies = off;

CREATE OR REPLACE FUNCTION trigger_functions.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$DECLARE
  fullName TEXT;
BEGIN
  -- Extracting the full name from email
  fullName := SUBSTRING(NEW.email FROM '^[^@]+');

  -- Inserting into the profiles table
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, fullName, NEW.email);

  return new;
end;$function$
;


