-- Deploy e-learning-backend:auto-updated-at-timestamp to pg
-- requires: appschema

BEGIN;

CREATE  FUNCTION e_learning_schema.auto_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

COMMIT;
