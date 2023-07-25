-- Revert e-learning-backend:5_note from pg

BEGIN;

DROP TRIGGER IF EXISTS note_auto_updated_at ON note CASCADE;
DROP TABLE e_learning_schema.note;

COMMIT;

