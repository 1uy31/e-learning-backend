-- Revert e-learning-backend:4_diary from pg

BEGIN;

DROP TRIGGER IF EXISTS diary_auto_updated_at ON diary CASCADE;
DROP TABLE e_learning_schema.diary;

COMMIT;
