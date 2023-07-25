-- Verify e-learning-backend:3_category on pg

BEGIN;

SELECT * FROM e_learning_schema.category WHERE FALSE;
SELECT to_regproc('e_learning_schema.category_auto_updated_at') IS NOT NULL;

ROLLBACK;
