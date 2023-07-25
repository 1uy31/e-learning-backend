-- Revert e-learning-backend:2_auto_updated_at_timestamp from pg

BEGIN;

DROP FUNCTION IF EXISTS e_learning_schema.auto_updated_at_timestamp();

COMMIT;
