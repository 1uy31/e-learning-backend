-- Verify e-learning-backend:4_diary on pg

BEGIN;

SELECT * FROM e_learning_schema.diary WHERE FALSE;
SELECT to_regproc('e_learning_schema.diary_auto_updated_at') IS NOT NULL;

ROLLBACK;
