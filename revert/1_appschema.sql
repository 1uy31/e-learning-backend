-- Revert e-learning-backend:1_appschema from pg

BEGIN;

DROP SCHEMA e_learning_schema;

COMMIT;
