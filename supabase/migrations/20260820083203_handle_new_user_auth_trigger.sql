-- The function existed in the dumped schema, but no trigger attached it to
-- auth.users. Without this, sign-up never inserts public.profiles and
-- create_group fails on public_groups_owner_fkey.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_functions.handle_new_user();
