-- Verify e-learning-backend:auto-updated-at-timestamp on pg

BEGIN;

SELECT to_regproc('e_learning_schema.auto_updated_at_timestamp') IS NOT NULL;

ROLLBACK;
