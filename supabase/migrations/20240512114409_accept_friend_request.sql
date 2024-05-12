CREATE OR REPLACE FUNCTION accept_friend_request(sender_uid UUID) RETURNS VOID AS $$
BEGIN
  -- create friendship for both ways
  INSERT INTO friends (profile, friend) VALUES (sender_uid, auth.uid());
  INSERT INTO friends (profile, friend) VALUES (auth.uid(), sender_uid);

  -- remove friend request to finalize
  DELETE FROM friend_requests WHERE sender = sender_uid;
END;
$$ LANGUAGE plpgsql;
