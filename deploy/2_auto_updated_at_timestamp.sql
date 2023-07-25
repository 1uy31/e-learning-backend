-- Deploy e-learning-backend:2_auto_updated_at_timestamp to pg
-- requires: 1_appschema

BEGIN;

CREATE  FUNCTION e_learning_schema.auto_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

COMMIT;
