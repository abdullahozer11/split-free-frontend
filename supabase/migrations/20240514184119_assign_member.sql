CREATE OR REPLACE FUNCTION assign_new_member (_profile_id uuid, _member_id bigint) RETURNS void AS $$
BEGIN
  UPDATE members
  SET profile = _profile_id
  WHERE id = _member_id;

  DELETE FROM members
  WHERE profile = _profile_id AND visible = false;
END;
$$ LANGUAGE plpgsql;
