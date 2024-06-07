CREATE OR REPLACE FUNCTION recalculate_total_balance(_group_id_input BIGINT)
RETURNS VOID AS $$
BEGIN
  -- Calculate the total balance for all the members inside the group with the specified group_id_input
  UPDATE members
  SET total_balance = (
    SELECT COALESCE(SUM(amount), 0)
    FROM balances
    WHERE owner = members.id
  )
  WHERE group_id = group_id_input;
END;
$$ LANGUAGE plpgsql;
