-- Revert e-learning-backend:diary_parent from pg

BEGIN;

ALTER TABLE e_learning_schema.diary DROP CONSTRAINT diary_parent_diary_id_fkey;
ALTER TABLE e_learning_schema.diary DROP COLUMN parent_diary_id;

COMMIT;
