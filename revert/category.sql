-- Revert e-learning-backend:category from pg

BEGIN;

DROP TRIGGER IF EXISTS category_auto_updated_at ON category CASCADE;
DROP TABLE e_learning_schema.category;

COMMIT;
