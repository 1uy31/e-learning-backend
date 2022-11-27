-- Verify e-learning-backend:note on pg

BEGIN;

SELECT * FROM e_learning_schema.note WHERE FALSE;
SELECT to_regproc('e_learning_schema.note_auto_updated_at') IS NOT NULL;

ROLLBACK;
