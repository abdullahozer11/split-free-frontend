-- Create the audit log table
CREATE TABLE activity_logs(
    id SERIAL PRIMARY KEY,
    table_name TEXT,
    operation TEXT,
    group_id BIGINT,
    old_data JSONB,
    new_data JSONB,
    changed_by TEXT,
    changed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create the trigger function
CREATE OR REPLACE FUNCTION log_activity() RETURNS TRIGGER AS $$
  DECLARE
    _group_id text;
BEGIN
    -- get group_id
    IF TG_TABLE_NAME = 'groups' THEN
      _group_id = COALESCE(NEW.id, OLD.id);
    ELSE THEN
      _group_id = COALESCE(NEW.group_id, OLD.group_id);
    end if;

    -- create activity log
    IF TG_OP = 'INSERT' THEN
        INSERT INTO activity_log (table_name, group_id, operation, new_data, changed_by)
        VALUES (TG_TABLE_NAME, _group_id, NEW.group_id, TG_OP, row_to_json(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO activity_log (table_name, group_id, operation, old_data, new_data, changed_by)
        VALUES (TG_TABLE_NAME, _group_id, NEW.group_id, TG_OP, row_to_json(OLD), row_to_json(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO activity_log (table_name, group_id, operation, old_data, changed_by)
        VALUES (TG_TABLE_NAME, _group_id, NEW.group_id, TG_OP, row_to_json(OLD), auth.uid());
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Attach the trigger to a table
CREATE TRIGGER before_insert_update_delete_on_groups
BEFORE INSERT OR UPDATE OR DELETE ON groups
FOR EACH ROW EXECUTE FUNCTION log_activity();

-- Attach the trigger to a table
CREATE TRIGGER before_insert_update_delete_on_members
BEFORE INSERT OR UPDATE OR DELETE ON members
FOR EACH ROW EXECUTE FUNCTION log_activity();

-- Attach the trigger to a table
CREATE TRIGGER before_insert_update_delete_on_expenses
BEFORE INSERT OR UPDATE OR DELETE ON expenses
FOR EACH ROW EXECUTE FUNCTION log_activity();
