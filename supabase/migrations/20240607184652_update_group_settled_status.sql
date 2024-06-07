CREATE OR REPLACE FUNCTION update_group_settled_status(_group_id_input BIGINT)
RETURNS VOID AS $$
BEGIN
  -- Check if there are any debts associated with the provided group ID
  IF EXISTS (SELECT 1 FROM debts WHERE group_id = _group_id_input) THEN
    -- If debts exist, set the group's settled status to FALSE
    UPDATE groups
    SET settled = FALSE
    WHERE id = _group_id_input;
  ELSE
    -- If no debts exist, set the group's settled status to TRUE
    UPDATE groups
    SET settled = TRUE
    WHERE id = _group_id_input;
  END IF;
END;
$$ LANGUAGE plpgsql;
