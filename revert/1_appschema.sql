-- Revert e-learning-backend:appschema from pg

BEGIN;

DROP SCHEMA e_learning_schema;

COMMIT;
