-- Revert e-learning-backend:auto-updated-at-timestamp from pg

BEGIN;

DROP FUNCTION IF EXISTS e_learning_schema.auto_updated_at_timestamp();

COMMIT;
